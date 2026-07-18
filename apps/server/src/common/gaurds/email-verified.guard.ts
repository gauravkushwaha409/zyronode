import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException({
        message: 'Authentication required',
        error_code: 'INVALID_TOKEN',
      });
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { isEmailVerified: true },
    });

    if (!dbUser) {
      throw new UnauthorizedException({
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }

    if (!dbUser.isEmailVerified) {
      throw new UnauthorizedException({
        message: 'Email verification is required',
        error_code: 'EMAIL_UNVERIFIED',
      });
    }

    return true;
  }
}
