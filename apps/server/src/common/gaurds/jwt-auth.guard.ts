// auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        console.log('JwtAuthGuard canActivate called')  // IGNORE
        return super.canActivate(context)
    }

    handleRequest(err, user, info) {
        console.log('JwtAuthGuard handleRequest called with user:', user, 'err:', err, 'info:', info)  // IGNORE
        if (err || !user) throw new UnauthorizedException()
        return user
    }
}