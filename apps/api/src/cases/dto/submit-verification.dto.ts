import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class SubmitVerificationDto {
  @ApiProperty({ enum: ["APPROVE", "REJECT", "HOLD"] })
  @IsIn(["APPROVE", "REJECT", "HOLD"])
  outcome!: "APPROVE" | "REJECT" | "HOLD";

  @ApiProperty({
    description: "Mission verifier recommendation notes",
    minLength: 10,
    maxLength: 2000
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  notes!: string;

  @ApiPropertyOptional({
    description: "Approved amount in the currency's smallest unit"
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  approvedAmountMinor?: number;
}
