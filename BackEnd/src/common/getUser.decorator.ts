import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Extract the request object from the execution context
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If you pass a specific property name (e.g., @GetUser('role')), return just that property
    if (data && user) {
      return user[data];
    }

    // Otherwise, return the entire user object
    return user;
  },
);