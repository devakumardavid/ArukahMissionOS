import { Module } from "@nestjs/common";
import { SupportingDocumentsController } from "./supporting-documents.controller";
import { SupportingDocumentsService } from "./supporting-documents.service";

@Module({
  controllers: [SupportingDocumentsController],
  providers: [SupportingDocumentsService]
})
export class SupportingDocumentsModule {}
