// auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // @CurrentUser('email') → returns just the email
    // @CurrentUser()        → returns full user object
    return data ? user?.[data] : user;
  },
);