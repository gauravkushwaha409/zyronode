// auth/guards/jwt-auth.guard.ts
import {
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	canActivate(context: ExecutionContext) {
		return super.canActivate(context);
	}

	handleRequest(err, user, info) {
		if (err || !user)
			throw new UnauthorizedException({
				message: "Token is invalid or expired",
				error_code: "INVALID_TOKEN",
			},{cause: "",description: ""});
		return user;
	}

}