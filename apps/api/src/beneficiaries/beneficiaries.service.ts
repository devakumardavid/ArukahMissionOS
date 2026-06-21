import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
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
};

@Injectable()
export class BeneficiariesService {
  constructor(private readonly database: DatabaseService) {}

  async create(
    input: CreateBeneficiaryDto,
    actorUserId: string
  ): Promise<BeneficiaryResponse> {
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
    return this.database.prisma.beneficiary.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: [{ preferredName: "asc" }, { createdAt: "desc" }]
    });
  }

  private generateReferenceCode(): string {
    const year = new Date().getUTCFullYear();
    return `BEN-${year}-${randomUUID().slice(0, 6).toUpperCase()}`;
  }
}
