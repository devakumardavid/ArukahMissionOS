import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "admin@arukahmissions.org" })
  @IsEmail()
  email!: string;

  @ApiProperty({ format: "password" })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
