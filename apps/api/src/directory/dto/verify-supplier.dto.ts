import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class VerifySupplierDto {
  @IsIn(["VERIFIED", "REJECTED"])
  status!: "VERIFIED" | "REJECTED";

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
