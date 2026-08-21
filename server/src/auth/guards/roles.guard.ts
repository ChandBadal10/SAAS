import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/generated/prisma/enums';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    // Get required roles from route
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(
        'roles',
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // If no roles are specified,
    // allow authenticated user
    if (!requiredRoles) {
      return true;
    }

    // Get authenticated user
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    // No authenticated user
    if (!user) {
      throw new ForbiddenException(
        'Access denied',
      );
    }

    // Check user's role
    const hasRole = requiredRoles.includes(
      user.role,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}