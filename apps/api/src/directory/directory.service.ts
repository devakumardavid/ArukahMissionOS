import { Prisma } from "@arukah/database";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { PasswordService } from "../auth/password.service";
import { DatabaseService } from "../database/database.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";
import { VerifySupplierDto } from "./dto/verify-supplier.dto";

const teamSelect = {
  id: true,
  displayName: true,
  email: true,
  phone: true,
  staffType: true,
  title: true,
  organization: true,
  role: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

export type TeamMemberResponse = Prisma.UserGetPayload<{ select: typeof teamSelect }>;
export type SupplierResponse = Prisma.SupplierGetPayload<Record<string, never>>;

@Injectable()
export class DirectoryService {
  constructor(
    private readonly database: DatabaseService,
    private readonly passwords: PasswordService
  ) {}

  listTeam(): Promise<TeamMemberResponse[]> {
    return this.database.prisma.user.findMany({
      orderBy: [{ active: "desc" }, { displayName: "asc" }],
      select: teamSelect
    });
  }

  async createTeamMember(
    input: CreateTeamMemberDto,
    actorUserId: string
  ): Promise<TeamMemberResponse> {
    await this.ensureCanManageTeamRole(actorUserId, input.role);

    const email = input.email.trim().toLowerCase();
    const existing = await this.database.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existing) {
      throw new ConflictException("A team member with this email already exists");
    }

    const passwordHash = input.password
      ? await this.passwords.hash(input.password)
      : null;

    const created = await this.database.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          active: true,
          authSubject: `local:${email}`,
          displayName: input.displayName.trim(),
          email,
          organization: input.organization?.trim() || null,
          passwordHash,
          phone: input.phone?.trim() || null,
          role: input.role,
          staffType: input.staffType,
          title: input.title?.trim() || null
        },
        select: teamSelect
      });

      await transaction.auditEvent.create({
        data: {
          action: "CREATED",
          actorUserId,
          entityId: user.id,
          entityType: "User",
          summary: {
            role: user.role,
            staffType: user.staffType
          }
        }
      });

      return user;
    });

    return created;
  }

  async updateTeamMember(
    id: string,
    input: UpdateTeamMemberDto,
    actorUserId: string
  ): Promise<TeamMemberResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one team member field must be provided");
    }

    const existing = await this.database.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!existing) {
      throw new NotFoundException("Team member not found");
    }

    await this.ensureCanManageTeamRole(actorUserId, input.role ?? existing.role);

    const email = input.email?.trim().toLowerCase();
    const passwordHash = input.password
      ? await this.passwords.hash(input.password)
      : undefined;

    return this.database.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.update({
        where: { id },
        data: {
          authSubject: email ? `local:${email}` : undefined,
          displayName: input.displayName?.trim(),
          email,
          organization:
            input.organization === undefined ? undefined : input.organization.trim() || null,
          passwordHash,
          phone: input.phone === undefined ? undefined : input.phone.trim() || null,
          role: input.role,
          staffType: input.staffType,
          title: input.title === undefined ? undefined : input.title.trim() || null
        },
        select: teamSelect
      });

      await transaction.auditEvent.create({
        data: {
          action: "UPDATED",
          actorUserId,
          entityId: id,
          entityType: "User",
          summary: { changedFields: Object.keys(input) }
        }
      });

      return user;
    });
  }

  async setTeamMemberActive(id: string, active: boolean, actorUserId: string) {
    const existing = await this.database.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!existing) {
      throw new NotFoundException("Team member not found");
    }

    await this.ensureCanManageTeamRole(actorUserId, existing.role);

    await this.database.prisma.$transaction([
      this.database.prisma.user.update({ where: { id }, data: { active } }),
      this.database.prisma.auditEvent.create({
        data: {
          action: active ? "UPDATED" : "DELETED",
          actorUserId,
          entityId: id,
          entityType: "User",
          summary: { active }
        }
      })
    ]);
  }

  listSuppliers(): Promise<SupplierResponse[]> {
    return this.database.prisma.supplier.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }]
    });
  }

  createSupplier(
    input: CreateSupplierDto,
    actorUserId: string
  ): Promise<SupplierResponse> {
    return this.database.prisma.$transaction(async (transaction) => {
      const supplier = await transaction.supplier.create({
        data: this.toSupplierCreateData(input)
      });

      await transaction.auditEvent.create({
        data: {
          action: "CREATED",
          actorUserId,
          entityId: supplier.id,
          entityType: "Supplier",
          summary: {
            name: supplier.name,
            serviceType: supplier.serviceType
          }
        }
      });

      return supplier;
    });
  }

  async updateSupplier(
    id: string,
    input: UpdateSupplierDto,
    actorUserId: string
  ): Promise<SupplierResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one supplier field must be provided");
    }

    const existing = await this.database.prisma.supplier.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      throw new NotFoundException("Supplier not found");
    }

    return this.database.prisma.$transaction(async (transaction) => {
      const supplier = await transaction.supplier.update({
        where: { id },
        data: {
          ...this.toSupplierUpdateData(input),
          verificationNotes: "Supplier details changed; verification should be refreshed.",
          verificationStatus: "PENDING",
          verifiedAt: null,
          verifiedById: null
        }
      });

      await transaction.auditEvent.create({
        data: {
          action: "UPDATED",
          actorUserId,
          entityId: id,
          entityType: "Supplier",
          summary: { changedFields: Object.keys(input) }
        }
      });

      return supplier;
    });
  }

  async setSupplierActive(id: string, active: boolean, actorUserId: string) {
    const existing = await this.database.prisma.supplier.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      throw new NotFoundException("Supplier not found");
    }

    await this.database.prisma.$transaction([
      this.database.prisma.supplier.update({ where: { id }, data: { active } }),
      this.database.prisma.auditEvent.create({
        data: {
          action: active ? "UPDATED" : "DELETED",
          actorUserId,
          entityId: id,
          entityType: "Supplier",
          summary: { active }
        }
      })
    ]);
  }

  async verifySupplier(
    id: string,
    input: VerifySupplierDto,
    actorUserId: string
  ): Promise<SupplierResponse> {
    const existing = await this.database.prisma.supplier.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!existing) {
      throw new NotFoundException("Supplier not found");
    }

    const notes = input.notes?.trim() || null;

    return this.database.prisma.$transaction(async (transaction) => {
      const supplier = await transaction.supplier.update({
        where: { id },
        data: {
          verificationNotes: notes,
          verificationStatus: input.status,
          verifiedAt: new Date(),
          verifiedById: actorUserId
        }
      });

      await transaction.auditEvent.create({
        data: {
          action: input.status === "VERIFIED" ? "APPROVED" : "REJECTED",
          actorUserId,
          entityId: id,
          entityType: "Supplier",
          summary: {
            name: existing.name,
            notes,
            verificationStatus: input.status
          }
        }
      });

      return supplier;
    });
  }

  private toSupplierCreateData(input: CreateSupplierDto) {
    return {
      city: input.city.trim(),
      contactName: input.contactName?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      name: input.name.trim(),
      notes: input.notes?.trim() || null,
      phone: input.phone?.trim() || null,
      region: input.region.trim(),
      serviceType: input.serviceType.trim()
    };
  }

  private toSupplierUpdateData(input: UpdateSupplierDto) {
    return {
      city: input.city?.trim(),
      contactName:
        input.contactName === undefined ? undefined : input.contactName.trim() || null,
      email: input.email === undefined ? undefined : input.email.trim().toLowerCase() || null,
      name: input.name?.trim(),
      notes: input.notes === undefined ? undefined : input.notes.trim() || null,
      phone: input.phone === undefined ? undefined : input.phone.trim() || null,
      region: input.region?.trim(),
      serviceType: input.serviceType?.trim()
    };
  }

  private async ensureCanManageTeamRole(actorUserId: string, targetRole: string) {
    const actor = await this.database.prisma.user.findUnique({
      where: { id: actorUserId },
      select: { role: true }
    });

    if (!actor) {
      throw new ForbiddenException("Unable to verify directory permissions");
    }

    if (targetRole === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
      throw new ForbiddenException("Only Super Admin can manage Super Admin accounts");
    }
  }
}
