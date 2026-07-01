import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength
} from "class-validator";

export class CreateTeamMemberDto {
  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ minLength: 8, maxLength: 30 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ enum: ["EMPLOYEE", "ASSOCIATE"] })
  @IsIn(["EMPLOYEE", "ASSOCIATE"])
  staffType!: "EMPLOYEE" | "ASSOCIATE";

  @ApiProperty({
    enum: [
      "SUPER_ADMIN",
      "GENERAL_ADMIN",
      "CASE_MANAGER",
      "MISSION_VERIFIER",
      "FINANCE_MANAGER"
    ]
  })
  @IsIn([
    "SUPER_ADMIN",
    "GENERAL_ADMIN",
    "CASE_MANAGER",
    "MISSION_VERIFIER",
    "FINANCE_MANAGER"
  ])
  role!:
    | "SUPER_ADMIN"
    | "GENERAL_ADMIN"
    | "CASE_MANAGER"
    | "MISSION_VERIFIER"
    | "FINANCE_MANAGER";

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;

  @ApiPropertyOptional({ minLength: 8, maxLength: 128 })
  @IsOptional()
  @IsString()
  @Length(8, 128)
  password?: string;
}
