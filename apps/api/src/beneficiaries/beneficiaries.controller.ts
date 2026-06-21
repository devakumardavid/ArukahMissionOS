import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  BeneficiariesService,
  type BeneficiaryResponse
} from "./beneficiaries.service";
import { CreateBeneficiaryDto } from "./dto/create-beneficiary.dto";

@ApiTags("beneficiaries")
@ApiBearerAuth()
@Controller("beneficiaries")
export class BeneficiariesController {
  constructor(private readonly beneficiaries: BeneficiariesService) {}

  @Post()
  @Roles("SUPER_ADMIN", "CASE_MANAGER")
  @ApiOperation({ summary: "Create a beneficiary" })
  @ApiCreatedResponse({ description: "Beneficiary created" })
  create(
    @Body() input: CreateBeneficiaryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<BeneficiaryResponse> {
    return this.beneficiaries.create(input, user.id);
  }

  @Get()
  @ApiOperation({ summary: "List active beneficiaries" })
  findAll(): Promise<BeneficiaryResponse[]> {
    return this.beneficiaries.findAll();
  }
}
