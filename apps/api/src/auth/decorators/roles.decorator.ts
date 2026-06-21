import { SetMetadata } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth.types";

export const rolesKey = "roles";
export const Roles = (...roles: AuthenticatedUser["role"][]) =>
  SetMetadata(rolesKey, roles);
