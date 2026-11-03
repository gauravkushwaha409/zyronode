import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Checks the live platform role from the database on every request, so
 * revoking admin access takes effect immediately instead of when the JWT
 * expires.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
	constructor(private prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user?.id) {
			throw new UnauthorizedException({
				message: "Authentication required",
				error_code: "UNAUTHENTICATED",
			});
		}

		const dbUser = await this.prisma.user.findUnique({
			where: { id: user.id },
			select: { platformRole: true },
		});

		if (!dbUser || dbUser.platformRole === "NONE") {
			throw new ForbiddenException({
				message: "Platform admin access is required",
				error_code: "FORBIDDEN",
			});
		}

		request.user = { ...user, platformRole: dbUser.platformRole };
		return true;
	}
}
