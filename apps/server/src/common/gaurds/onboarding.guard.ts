import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OnboardingGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('OnboardingGuard: canActivate called with user:', user);

    if (!user?.id) {
      throw new UnauthorizedException({
        message: 'Authentication required',
        error_code: 'INVALID_TOKEN',
      },{cause: "",description: ""});
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { organizations: true },
    });

    if (!dbUser) {
      throw new UnauthorizedException({
        message: 'User not found',
        error_code: 'USER_NOT_FOUND',
      });
    }

    if (!dbUser.firstName || !dbUser.lastName || !dbUser.profile) {
      throw new UnauthorizedException({
        message: 'User onboarding is required',
        error_code: 'USER_ONBOARDING_REQUIRED',
      });
    }

    if (dbUser.organizations.length === 0) {
      throw new UnauthorizedException({
        message: 'Organization onboarding is required',
        error_code: 'ORGANIZATION_ONBOARDING_REQUIRED',
      });
    }

    return true;
  }
}
