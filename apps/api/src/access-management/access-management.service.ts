import { BadRequestException, Injectable } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types";
import { DatabaseService } from "../database/database.service";
import {
  accessPermissionCatalog,
  accessRoles,
  type AccessPermissionKey
} from "./access-management.constants";

type AccessRole = AuthenticatedUser["role"];

export type AccessPermission = {
  key: AccessPermissionKey;
  label: string;
  description: string;
};

export type AccessManagementResponse = {
  roles: Array<{ key: AccessRole; label: string }>;
  permissions: AccessPermission[];
  matrix: Record<AccessRole, Record<AccessPermissionKey, boolean>>;
};

const roleLabels: Record<AccessRole, string> = {
  SUPER_ADMIN: "Super Admin",
  GENERAL_ADMIN: "General Admin",
  CASE_MANAGER: "Case Manager",
  MISSION_VERIFIER: "Mission Verifier",
  FINANCE_MANAGER: "Finance Manager"
};

@Injectable()
export class AccessManagementService {
  constructor(private readonly database: DatabaseService) {}

  async getMatrix(): Promise<AccessManagementResponse> {
    await this.ensureDefaults();

    const records = await this.database.prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { permission: "asc" }]
    });

    const matrix = this.emptyMatrix();

    for (const record of records) {
      if (this.isAccessRole(record.role) && this.isPermissionKey(record.permission)) {
        matrix[record.role][record.permission] = record.enabled;
      }
    }

    return {
      roles: accessRoles.map((role) => ({ key: role, label: roleLabels[role] })),
      permissions: accessPermissionCatalog.map((permission) => ({ ...permission })),
      matrix
    };
  }

  async updateRolePermissions(
    role: AccessRole,
    permissions: Record<string, boolean>,
    actorUserId: string
  ): Promise<AccessManagementResponse> {
    if (!this.isAccessRole(role)) {
      throw new BadRequestException("Unknown staff role");
    }

    const allowedKeys = new Set(accessPermissionCatalog.map((permission) => permission.key));
    const updates = Object.entries(permissions).filter(([key]) => allowedKeys.has(key as AccessPermissionKey));

    if (!updates.length) {
      throw new BadRequestException("Select at least one valid permission");
    }

    await this.database.prisma.$transaction(async (transaction) => {
      for (const [permission, enabled] of updates) {
        await transaction.rolePermission.upsert({
          where: {
            role_permission: {
              role,
              permission
            }
          },
          create: {
            role,
            permission,
            enabled: Boolean(enabled)
          },
          update: {
            enabled: Boolean(enabled)
          }
        });
      }

      await transaction.auditEvent.create({
        data: {
          action: "UPDATED",
          actorUserId,
          entityId: role,
          entityType: "RolePermission",
          summary: {
            changedPermissions: updates.map(([permission]) => permission)
          }
        }
      });
    });

    return this.getMatrix();
  }

  private async ensureDefaults() {
    const existingCount = await this.database.prisma.rolePermission.count();

    if (existingCount > 0) return;

    await this.database.prisma.rolePermission.createMany({
      data: accessRoles.flatMap((role) =>
        accessPermissionCatalog.map((permission) => ({
          role,
          permission: permission.key,
          enabled: this.defaultEnabled(role, permission.key)
        }))
      ),
      skipDuplicates: true
    });
  }

  private defaultEnabled(role: AccessRole, permission: AccessPermissionKey) {
    if (role === "SUPER_ADMIN") {
      return [
        "software.manage",
        "access.manage",
        "accounts.manage",
        "workflow.override",
        "reports.view"
      ].includes(permission);
    }
    if (role === "GENERAL_ADMIN") {
      return [
        "directory.manage",
        "beneficiaries.manage",
        "cases.submit",
        "cases.update",
        "cases.close",
        "verification.submit",
        "payments.approve",
        "payments.reconcile",
        "reports.view"
      ].includes(permission);
    }
    if (role === "CASE_MANAGER") {
      return ["beneficiaries.manage", "cases.submit", "cases.update", "cases.close", "reports.view"].includes(permission);
    }
    if (role === "MISSION_VERIFIER") return ["verification.submit", "reports.view"].includes(permission);
    return ["payments.approve", "payments.reconcile", "reports.view"].includes(permission);
  }

  private emptyMatrix() {
    const matrix = {} as Record<AccessRole, Record<AccessPermissionKey, boolean>>;

    for (const role of accessRoles) {
      matrix[role] = {} as Record<AccessPermissionKey, boolean>;

      for (const permission of accessPermissionCatalog) {
        matrix[role][permission.key] = false;
      }
    }

    return matrix;
  }

  private isAccessRole(value: string): value is AccessRole {
    return accessRoles.includes(value as AccessRole);
  }

  private isPermissionKey(value: string): value is AccessPermissionKey {
    return accessPermissionCatalog.some((permission) => permission.key === value);
  }
}
