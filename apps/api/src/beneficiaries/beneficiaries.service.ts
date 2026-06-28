import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateBeneficiaryDto } from "./dto/create-beneficiary.dto";

export type BeneficiaryResponse = {
  id: string;
  referenceCode: string;
  preferredName: string;
  legalName: string;
  email: string | null;
  phone: string | null;
  city: string;
  region: string;
  country: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
  activeCaseCount?: number;
};

@Injectable()
export class BeneficiariesService {
  constructor(private readonly database: DatabaseService) {}

  async create(
    input: CreateBeneficiaryDto,
    actorUserId: string
  ): Promise<BeneficiaryResponse> {
    await this.validateLocation(input);
    const referenceCode = this.generateReferenceCode();

    return this.database.prisma.$transaction(async (transaction) => {
      const beneficiary = await transaction.beneficiary.create({
        data: {
          referenceCode,
          preferredName: input.preferredName.trim(),
          legalName: input.legalName.trim(),
          email: input.email?.trim().toLowerCase() || null,
          phone: input.phone?.trim() || null,
          city: input.city.trim(),
          region: input.region.trim(),
          country: (input.country ?? "IN").trim().toUpperCase()
        }
      });

      await transaction.auditEvent.create({
        data: {
          action: "CREATED",
          actorUserId,
          entityType: "Beneficiary",
          entityId: beneficiary.id,
          summary: { referenceCode }
        }
      });

      return beneficiary;
    });
  }

  async findAll(): Promise<BeneficiaryResponse[]> {
    const records = await this.database.prisma.beneficiary.findMany({
      where: { status: { not: "ARCHIVED" } },
      include: {
        _count: {
          select: {
            cases: {
              where: { stage: { notIn: ["CLOSED", "REJECTED"] } }
            }
          }
        }
      },
      orderBy: [{ preferredName: "asc" }, { createdAt: "desc" }]
    });

    return records.map(({ _count, ...beneficiary }) => ({
      ...beneficiary,
      activeCaseCount: _count.cases
    }));
  }

  async findOne(id: string): Promise<BeneficiaryResponse> {
    const record = await this.database.prisma.beneficiary.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cases: {
              where: { stage: { notIn: ["CLOSED", "REJECTED"] } }
            }
          }
        }
      }
    });

    if (!record || record.status === "ARCHIVED") {
      throw new NotFoundException("Beneficiary not found");
    }

    const { _count, ...beneficiary } = record;
    return {
      ...beneficiary,
      activeCaseCount: _count.cases
    };
  }

  async update(
    id: string,
    input: Partial<CreateBeneficiaryDto>,
    actorUserId: string
  ): Promise<BeneficiaryResponse> {
    const existing = await this.database.prisma.beneficiary.findUnique({
      where: { id },
      select: { id: true, status: true }
    });

    if (!existing || existing.status === "ARCHIVED") {
      throw new NotFoundException("Beneficiary not found");
    }

    if (input.city || input.region || input.country) {
      const current = await this.database.prisma.beneficiary.findUniqueOrThrow({
        where: { id },
        select: { city: true, region: true, country: true }
      });
      await this.validateLocation({
        preferredName: input.preferredName ?? "Placeholder",
        legalName: input.legalName ?? "Placeholder",
        city: input.city ?? current.city,
        region: input.region ?? current.region,
        country: input.country ?? current.country
      });
    }

    const updated = await this.database.prisma.$transaction(async (transaction) => {
      const beneficiary = await transaction.beneficiary.update({
        where: { id },
        data: {
          preferredName: input.preferredName?.trim(),
          legalName: input.legalName?.trim(),
          email: input.email === undefined ? undefined : input.email?.trim().toLowerCase() || null,
          phone: input.phone === undefined ? undefined : input.phone?.trim() || null,
          city: input.city?.trim(),
          region: input.region?.trim(),
          country: input.country?.trim().toUpperCase()
        }
      });

      await transaction.auditEvent.create({
        data: {
          action: "UPDATED",
          actorUserId,
          entityType: "Beneficiary",
          entityId: id,
          summary: { changedFields: Object.keys(input) }
        }
      });

      return beneficiary;
    });

    return updated;
  }

  async archive(id: string, actorUserId: string): Promise<void> {
    const existing = await this.database.prisma.beneficiary.findUnique({
      where: { id },
      select: { id: true, referenceCode: true, status: true }
    });

    if (!existing || existing.status === "ARCHIVED") {
      throw new NotFoundException("Beneficiary not found");
    }

    await this.database.prisma.$transaction(async (transaction) => {
      await transaction.beneficiary.update({
        where: { id },
        data: { status: "ARCHIVED" }
      });

      await transaction.auditEvent.create({
        data: {
          action: "DELETED",
          actorUserId,
          entityType: "Beneficiary",
          entityId: id,
          summary: { referenceCode: existing.referenceCode, softDelete: true }
        }
      });
    });
  }

  private generateReferenceCode(): string {
    const year = new Date().getUTCFullYear();
    return `BEN-${year}-${randomUUID().slice(0, 6).toUpperCase()}`;
  }

  private async validateLocation(input: CreateBeneficiaryDto) {
    const country = (input.country ?? "IN").trim().toUpperCase();
    const region = input.region.trim();
    const city = input.city.trim();

    if (country !== "IN") {
      throw new UnprocessableEntityException("Only India locations are supported in this MVP");
    }

    const state = await this.database.prisma.indiaState.findUnique({
      where: { name: region },
      select: { id: true, code: true, active: true }
    });

    if (!state || !state.active) {
      throw new UnprocessableEntityException("Select a valid Indian state");
    }

    if (state.code === "TN") {
      const tamilNaduCity = await this.database.prisma.indiaCity.findUnique({
        where: {
          stateId_name: {
            stateId: state.id,
            name: city
          }
        },
        select: { active: true }
      });

      if (!tamilNaduCity || !tamilNaduCity.active) {
        throw new UnprocessableEntityException("Select a valid Tamil Nadu city");
      }
    }
  }
}
