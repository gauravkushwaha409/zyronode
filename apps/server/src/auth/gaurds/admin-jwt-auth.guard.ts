import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard("admin-jwt") {
	handleRequest(err, user) {
		if (err || !user) {
			throw new UnauthorizedException({
				message: "Admin token is invalid or expired",
				error_code: "UNAUTHENTICATED",
			});
		}
		return user;
	}
}
