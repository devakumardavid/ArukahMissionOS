import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class CreateCaseDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  beneficiaryId!: string;

  @ApiProperty({ minLength: 4, maxLength: 180 })
  @IsString()
  @MinLength(4)
  @MaxLength(180)
  title!: string;

  @ApiProperty({ minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category!: string;

  @ApiProperty({ minLength: 20, maxLength: 5000 })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    description: "Requested amount in the currency's smallest unit",
    example: 4250000
  })
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  requestedAmountMinor!: number;

  @ApiPropertyOptional({ default: "INR", minLength: 3, maxLength: 3 })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = "INR";

  @ApiPropertyOptional({ enum: ["NORMAL", "HIGH", "URGENT"], default: "NORMAL" })
  @IsOptional()
  @IsIn(["NORMAL", "HIGH", "URGENT"])
  urgency?: "NORMAL" | "HIGH" | "URGENT" = "NORMAL";

  @ApiPropertyOptional({ format: "uuid", nullable: true })
  @IsOptional()
  @IsUUID()
  caseManagerId?: string | null;

  @ApiPropertyOptional({ format: "uuid", nullable: true })
  @IsOptional()
  @IsUUID()
  verifierId?: string | null;
}
