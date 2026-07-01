import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  AccessManagementService,
  type AccessManagementResponse
} from "./access-management.service";
import { UpdateRolePermissionsDto } from "./dto/update-role-permissions.dto";

@ApiTags("access-management")
@ApiBearerAuth()
@Controller("access-management")
export class AccessManagementController {
  constructor(private readonly accessManagement: AccessManagementService) {}

  @Get()
  @Roles("SUPER_ADMIN")
  @ApiOperation({ summary: "Get role permission checkbox matrix" })
  getMatrix(): Promise<AccessManagementResponse> {
    return this.accessManagement.getMatrix();
  }

  @Patch("roles/:role")
  @Roles("SUPER_ADMIN")
  @ApiOperation({ summary: "Update permission checkboxes for one role" })
  updateRolePermissions(
    @Param("role") role: AuthenticatedUser["role"],
    @Body() input: UpdateRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<AccessManagementResponse> {
    return this.accessManagement.updateRolePermissions(role, input.permissions, user.id);
  }
}
