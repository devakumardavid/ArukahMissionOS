import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { CreateCaseDto } from "./create-case.dto";

export class UpdateCaseDto extends PartialType(CreateCaseDto) {
  @ApiPropertyOptional({
    enum: [
      "SUBMITTED",
      "VERIFICATION",
      "APPROVED",
      "PROVIDER_SELECTION",
      "PAYMENT",
      "IMPACT",
      "CLOSED",
      "REJECTED",
      "ON_HOLD"
    ]
  })
  @IsOptional()
  @IsIn([
    "SUBMITTED",
    "VERIFICATION",
    "APPROVED",
    "PROVIDER_SELECTION",
    "PAYMENT",
    "IMPACT",
    "CLOSED",
    "REJECTED",
    "ON_HOLD"
  ])
  stage?:
    | "SUBMITTED"
    | "VERIFICATION"
    | "APPROVED"
    | "PROVIDER_SELECTION"
    | "PAYMENT"
    | "IMPACT"
    | "CLOSED"
    | "REJECTED"
    | "ON_HOLD";
}
