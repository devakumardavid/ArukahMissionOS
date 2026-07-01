import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  SupportingDocumentsService,
  type SupportingDocumentResponse
} from "./supporting-documents.service";

type SupportedEntityType = "CASE" | "BENEFICIARY" | "TEAM_MEMBER" | "SUPPLIER";
type UploadedFileShape = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

@ApiTags("supporting-documents")
@ApiBearerAuth()
@Controller("supporting-documents")
export class SupportingDocumentsController {
  constructor(private readonly documents: SupportingDocumentsService) {}

  @Post(":entityType/:entityId")
  @Roles("SUPER_ADMIN", "GENERAL_ADMIN", "CASE_MANAGER", "MISSION_VERIFIER", "FINANCE_MANAGER")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload an image or PDF supporting document" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        label: { type: "string" },
        file: { type: "string", format: "binary" }
      },
      required: ["file"]
    }
  })
  upload(
    @Param("entityType") entityType: SupportedEntityType,
    @Param("entityId", new ParseUUIDPipe()) entityId: string,
    @Body("label") label: string | undefined,
    @UploadedFile() file: UploadedFileShape | undefined,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SupportingDocumentResponse> {
    return this.documents.upload(entityType, entityId, label, file, user);
  }

  @Get(":entityType/:entityId")
  @Roles("SUPER_ADMIN", "GENERAL_ADMIN", "CASE_MANAGER", "MISSION_VERIFIER", "FINANCE_MANAGER")
  @ApiOperation({ summary: "List supporting document metadata for a record" })
  list(
    @Param("entityType") entityType: SupportedEntityType,
    @Param("entityId", new ParseUUIDPipe()) entityId: string
  ): Promise<SupportingDocumentResponse[]> {
    return this.documents.list(entityType, entityId);
  }
}
