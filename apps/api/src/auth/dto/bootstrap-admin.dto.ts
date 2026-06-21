import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

export class BootstrapAdminDto {
  @ApiProperty({ example: "David" })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({ example: "admin@arukahmissions.org" })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 12, format: "password" })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ format: "password" })
  @IsString()
  @MinLength(16)
  bootstrapKey!: string;
}
