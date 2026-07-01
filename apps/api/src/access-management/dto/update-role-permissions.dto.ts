import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class UpdateRolePermissionsDto {
  @ApiProperty({
    additionalProperties: { type: "boolean" },
    description: "Permission key to enabled/disabled checkbox state"
  })
  @IsObject()
  permissions!: Record<string, boolean>;
}
