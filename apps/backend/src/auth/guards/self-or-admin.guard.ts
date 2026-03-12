import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SELF_OR_ADMIN_KEY } from '../decorators/self-or-admin.decorator';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramName = this.reflector.getAllAndOverride<string>(SELF_OR_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Pas de @SelfOrAdmin() sur cette route → on laisse passer
    if (!paramName) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params[paramName];

    if (user.role === 'admin' || user.sub === resourceId) {
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}