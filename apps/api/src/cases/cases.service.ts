import { randomUUID } from "node:crypto";
import { Prisma } from "@arukah/database";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateCaseDto } from "./dto/create-case.dto";
import { ListCasesQueryDto } from "./dto/list-cases-query.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";

const caseInclude = {
  beneficiary: {
    select: {
      id: true,
      referenceCode: true,
      preferredName: true,
      city: true,
      region: true,
      status: true
    }
  },
  caseManager: {
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true
    }
  },
  verifier: {
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true
    }
  },
  _count: {
    select: {
      transitions: true
    }
  }
} satisfies Prisma.CaseInclude;

type CaseRecord = Prisma.CaseGetPayload<{ include: typeof caseInclude }>;
type StaffRole = "SUPER_ADMIN" | "CASE_MANAGER" | "VERIFIER" | "FINANCE_MANAGER";
type CaseStage =
  | "SUBMITTED"
  | "VERIFICATION"
  | "APPROVED"
  | "PROVIDER_SELECTION"
  | "PAYMENT"
  | "IMPACT"
  | "CLOSED"
  | "REJECTED"
  | "ON_HOLD";
type Urgency = "NORMAL" | "HIGH" | "URGENT";
type BeneficiaryStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type CaseResponse = {
  id: string;
  beneficiaryId: string;
  caseNumber: string;
  title: string;
  category: string;
  description: string;
  requestedAmountMinor: string;
  approvedAmountMinor: string | null;
  currency: string;
  urgency: Urgency;
  stage: CaseStage;
  caseManagerId: string | null;
  verifierId: string | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
  beneficiary: {
    id: string;
    referenceCode: string;
    preferredName: string;
    city: string;
    region: string;
    status: BeneficiaryStatus;
  };
  caseManager: {
    id: string;
    displayName: string;
    email: string;
    role: StaffRole;
  } | null;
  verifier: {
    id: string;
    displayName: string;
    email: string;
    role: StaffRole;
  } | null;
  transitionCount: number;
};

export type CaseListResponse = {
  data: CaseResponse[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

@Injectable()
export class CasesService {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateCaseDto, actorUserId: string): Promise<CaseResponse> {
    await this.validateReferences(input);
    const caseNumber = this.generateCaseNumber();

    const created = await this.database.prisma.$transaction(async (transaction) => {
      const caseRecord = await transaction.case.create({
        data: {
          beneficiaryId: input.beneficiaryId,
          caseNumber,
          title: input.title.trim(),
          category: input.category.trim(),
          description: input.description.trim(),
          requestedAmountMinor: BigInt(input.requestedAmountMinor),
          currency: (input.currency ?? "INR").trim().toUpperCase(),
          urgency: input.urgency ?? "NORMAL",
          caseManagerId: input.caseManagerId ?? null,
          verifierId: input.verifierId ?? null
        },
        include: caseInclude
      });

      await transaction.auditEvent.create({
        data: {
          action: "CREATED",
          actorUserId,
          entityType: "Case",
          entityId: caseRecord.id,
          summary: {
            caseNumber,
            beneficiaryId: input.beneficiaryId,
            stage: caseRecord.stage
          }
        }
      });

      return caseRecord;
    });

    return this.toResponse(created);
  }

  async findAll(query: ListCasesQueryDto): Promise<CaseListResponse> {
    const limit = query.limit ?? 25;
    const offset = query.offset ?? 0;
    const search = query.search?.trim();
    const where: Prisma.CaseWhereInput = {
      stage: query.stage,
      urgency: query.urgency,
      beneficiaryId: query.beneficiaryId,
      ...(search
        ? {
            OR: [
              { caseNumber: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { beneficiary: { preferredName: { contains: search, mode: "insensitive" } } },
              { beneficiary: { legalName: { contains: search, mode: "insensitive" } } }
            ]
          }
        : {})
    };

    const [records, total] = await this.database.prisma.$transaction([
      this.database.prisma.case.findMany({
        where,
        include: caseInclude,
        orderBy: [{ urgency: "desc" }, { updatedAt: "desc" }],
        take: limit,
        skip: offset
      }),
      this.database.prisma.case.count({ where })
    ]);

    return {
      data: records.map((record) => this.toResponse(record)),
      meta: {
        total,
        limit,
        offset
      }
    };
  }

  async findOne(id: string): Promise<CaseResponse> {
    const record = await this.database.prisma.case.findUnique({
      where: { id },
      include: caseInclude
    });

    if (!record) {
      throw new NotFoundException("Case not found");
    }

    return this.toResponse(record);
  }

  async update(
    id: string,
    input: UpdateCaseDto,
    actorUserId: string
  ): Promise<CaseResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException("At least one case field must be provided");
    }

    const existing = await this.database.prisma.case.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException("Case not found");
    }

    await this.validateReferences(input);
    const updated = await this.database.prisma.$transaction(async (transaction) => {
      const caseRecord = await transaction.case.update({
        where: { id },
        data: {
          beneficiaryId: input.beneficiaryId,
          title: input.title?.trim(),
          category: input.category?.trim(),
          description: input.description?.trim(),
          requestedAmountMinor:
            input.requestedAmountMinor === undefined
              ? undefined
              : BigInt(input.requestedAmountMinor),
          currency: input.currency?.trim().toUpperCase(),
          urgency: input.urgency,
          caseManagerId: input.caseManagerId,
          verifierId: input.verifierId
        },
        include: caseInclude
      });

      await transaction.auditEvent.create({
        data: {
          action: "UPDATED",
          actorUserId,
          entityType: "Case",
          entityId: id,
          summary: {
            changedFields: Object.keys(input),
            caseNumber: existing.caseNumber
          }
        }
      });

      return caseRecord;
    });

    return this.toResponse(updated);
  }

  async remove(id: string, actorUserId: string) {
    const existing = await this.database.prisma.case.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transitions: true
          }
        }
      }
    });

    if (!existing) {
      throw new NotFoundException("Case not found");
    }

    if (existing.stage !== "SUBMITTED" || existing._count.transitions > 0) {
      throw new ConflictException(
        "Only submitted cases without transition history can be deleted"
      );
    }

    await this.database.prisma.$transaction(async (transaction) => {
      await transaction.case.delete({ where: { id } });
      await transaction.auditEvent.create({
        data: {
          action: "DELETED",
          actorUserId,
          entityType: "Case",
          entityId: id,
          summary: {
            caseNumber: existing.caseNumber
          }
        }
      });
    });
  }

  private async validateReferences(input: {
    beneficiaryId?: string;
    caseManagerId?: string | null;
    verifierId?: string | null;
  }) {
    if (input.beneficiaryId) {
      const beneficiary = await this.database.prisma.beneficiary.findUnique({
        where: { id: input.beneficiaryId },
        select: { status: true }
      });

      if (!beneficiary) {
        throw new UnprocessableEntityException("Beneficiary does not exist");
      }

      if (beneficiary.status === "ARCHIVED") {
        throw new UnprocessableEntityException("Archived beneficiary cannot receive a new case");
      }
    }

    await Promise.all([
      this.validateAssignee(input.caseManagerId, ["CASE_MANAGER", "SUPER_ADMIN"], "case manager"),
      this.validateAssignee(input.verifierId, ["VERIFIER", "SUPER_ADMIN"], "verifier")
    ]);
  }

  private async validateAssignee(
    userId: string | null | undefined,
    allowedRoles: StaffRole[],
    label: string
  ) {
    if (!userId) {
      return;
    }

    const user = await this.database.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, active: true }
    });

    if (!user || !user.active || !allowedRoles.includes(user.role)) {
      throw new UnprocessableEntityException(`Invalid ${label}`);
    }
  }

  private generateCaseNumber() {
    const year = new Date().getUTCFullYear();
    return `AR-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  private toResponse(record: CaseRecord): CaseResponse {
    return {
      id: record.id,
      beneficiaryId: record.beneficiaryId,
      caseNumber: record.caseNumber,
      title: record.title,
      category: record.category,
      description: record.description,
      requestedAmountMinor: record.requestedAmountMinor.toString(),
      approvedAmountMinor: record.approvedAmountMinor?.toString() ?? null,
      currency: record.currency,
      urgency: record.urgency,
      stage: record.stage,
      caseManagerId: record.caseManagerId,
      verifierId: record.verifierId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      closedAt: record.closedAt,
      beneficiary: record.beneficiary,
      caseManager: record.caseManager,
      verifier: record.verifier,
      transitionCount: record._count.transitions
    };
  }
}
