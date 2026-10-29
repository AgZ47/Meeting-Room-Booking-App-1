import { 
    Injectable, 
    CanActivate, 
    ExecutionContext, 
    UnauthorizedException, 
    ForbiddenException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../../roles.decorator.js';

interface RequestWithUser extends Request{
  user: {role?: string, [key: string]: any}
}

@Injectable()
export class RbacAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // 1. Swap <Request> for <RequestWithUser>
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers.authorization;
    const [scheme, token] = authHeader?.split(' ') ?? [];

    if (!token || scheme !== 'Bearer') {
      throw new UnauthorizedException("Invalid authorization header");
    }

    let payload: { role?: string; [key: string]: any };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET 
      });
      
      // 2. Assign using dot notation. TypeScript now knows this is perfectly valid!
      request.user = payload; 
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    if (!payload.role || !requiredRoles.includes(payload.role)) {
      throw new ForbiddenException("Unauthorized: You do not have permission to perform this action");
    }

    return true;
  }
}