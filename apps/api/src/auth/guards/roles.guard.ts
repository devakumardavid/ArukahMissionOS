import {
  CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { AuthenticatedUser } from "../auth.types";
import { rolesKey } from "../decorators/roles.decorator";

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<
      AuthenticatedUser["role"][]
    >(rolesKey, [context.getHandler(), context.getClass()]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user || !requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException("Your staff role cannot perform this action");
    }

    return true;
  }
}
