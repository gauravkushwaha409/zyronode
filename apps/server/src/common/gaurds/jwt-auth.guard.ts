// auth/guards/jwt-auth.guard.ts
import {
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor() {
		super();
	}
	canActivate(context: ExecutionContext) {
		return super.canActivate(context);
	}

	handleRequest(err, user, info) {
		if (err || !user)
			throw new UnauthorizedException({
				message: "Token is invalid or expired",
				error_code: "UNAUTHENTICATED",
			},{cause: "",description: ""});
		return user;
	}

}