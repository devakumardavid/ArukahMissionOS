import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException
} from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types";
import { DatabaseService } from "../database/database.service";

type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

type SupportedEntityType = "CASE" | "BENEFICIARY" | "TEAM_MEMBER" | "SUPPLIER";

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const maxFileBytes = 10 * 1024 * 1024;

export type SupportingDocumentResponse = {
  id: string;
  entityType: string;
  entityId: string;
  label: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

@Injectable()
export class SupportingDocumentsService {
  constructor(private readonly database: DatabaseService) {}

  async upload(
    entityType: SupportedEntityType,
    entityId: string,
    label: string | undefined,
    file: UploadedFile | undefined,
    user: AuthenticatedUser
  ): Promise<SupportingDocumentResponse> {
    if (!file) {
      throw new BadRequestException("Select an image or PDF to upload");
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException("Only PDF, JPEG, PNG, and WebP files are supported");
    }

    if (file.size > maxFileBytes) {
      throw new PayloadTooLargeException("Supporting document must be 10 MB or smaller");
    }

    await this.ensureEntityExists(entityType, entityId);

    const uploadDir = process.env.SUPPORTING_DOCUMENT_UPLOAD_DIR ?? join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    const extension = this.safeExtension(file.originalname, file.mimetype);
    const storedName = `${entityType.toLowerCase()}-${entityId}-${randomUUID()}${extension}`;
    const storagePath = join(uploadDir, storedName);

    await writeFile(storagePath, file.buffer);

    const created = await this.database.prisma.supportingDocument.create({
      data: {
        entityId,
        entityType,
        label: label?.trim() || null,
        mimeType: file.mimetype,
        originalName: file.originalname,
        sizeBytes: file.size,
        storagePath,
        storedName,
        uploadedById: user.id
      }
    });

    return this.toResponse(created);
  }

  async list(
    entityType: SupportedEntityType,
    entityId: string
  ): Promise<SupportingDocumentResponse[]> {
    await this.ensureEntityExists(entityType, entityId);

    const documents = await this.database.prisma.supportingDocument.findMany({
      where: { entityId, entityType },
      orderBy: { createdAt: "desc" }
    });

    return documents.map((document) => this.toResponse(document));
  }

  private async ensureEntityExists(entityType: SupportedEntityType, entityId: string) {
    if (entityType === "CASE") {
      const record = await this.database.prisma.case.findUnique({ where: { id: entityId }, select: { id: true } });
      if (!record) throw new NotFoundException("Case not found");
      return;
    }

    if (entityType === "BENEFICIARY") {
      const record = await this.database.prisma.beneficiary.findUnique({ where: { id: entityId }, select: { id: true } });
      if (!record) throw new NotFoundException("Beneficiary not found");
      return;
    }

    if (entityType === "TEAM_MEMBER") {
      const record = await this.database.prisma.user.findUnique({ where: { id: entityId }, select: { id: true } });
      if (!record) throw new NotFoundException("Team member not found");
      return;
    }

    const record = await this.database.prisma.supplier.findUnique({ where: { id: entityId }, select: { id: true } });
    if (!record) throw new NotFoundException("Supplier not found");
  }

  private safeExtension(originalName: string, mimeType: string) {
    const originalExtension = extname(originalName).toLowerCase();

    if ([".pdf", ".jpg", ".jpeg", ".png", ".webp"].includes(originalExtension)) {
      return originalExtension;
    }

    if (mimeType === "application/pdf") return ".pdf";
    if (mimeType === "image/png") return ".png";
    if (mimeType === "image/webp") return ".webp";
    return ".jpg";
  }

  private toResponse(document: {
    id: string;
    entityType: string;
    entityId: string;
    label: string | null;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
  }): SupportingDocumentResponse {
    return {
      id: document.id,
      entityId: document.entityId,
      entityType: document.entityType,
      label: document.label,
      originalName: document.originalName,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      createdAt: document.createdAt
    };
  }
}
