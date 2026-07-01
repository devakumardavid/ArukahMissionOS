import { Module } from "@nestjs/common";
import { AccessManagementController } from "./access-management.controller";
import { AccessManagementService } from "./access-management.service";

@Module({
  controllers: [AccessManagementController],
  providers: [AccessManagementService]
})
export class AccessManagementModule {}
