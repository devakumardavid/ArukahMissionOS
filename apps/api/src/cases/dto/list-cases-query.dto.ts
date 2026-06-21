import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

const stages = [
  "SUBMITTED",
  "VERIFICATION",
  "APPROVED",
  "PROVIDER_SELECTION",
  "PAYMENT",
  "IMPACT",
  "CLOSED",
  "REJECTED",
  "ON_HOLD"
] as const;

export class ListCasesQueryDto {
  @ApiPropertyOptional({ description: "Search case number, title, category, or beneficiary name" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: stages })
  @IsOptional()
  @IsIn(stages)
  stage?: (typeof stages)[number];

  @ApiPropertyOptional({ enum: ["NORMAL", "HIGH", "URGENT"] })
  @IsOptional()
  @IsIn(["NORMAL", "HIGH", "URGENT"])
  urgency?: "NORMAL" | "HIGH" | "URGENT";

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  beneficiaryId?: string;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
