import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post
} from "@nestjs/common";
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
import { UpdateBeneficiaryDto } from "./dto/update-beneficiary.dto";

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

  @Get(":id")
  @ApiOperation({ summary: "Get a beneficiary by ID" })
  findOne(
    @Param("id", new ParseUUIDPipe()) id: string
  ): Promise<BeneficiaryResponse> {
    return this.beneficiaries.findOne(id);
  }

  @Patch(":id")
  @Roles("SUPER_ADMIN", "CASE_MANAGER")
  @ApiOperation({ summary: "Update beneficiary details" })
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: UpdateBeneficiaryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<BeneficiaryResponse> {
    return this.beneficiaries.update(id, input, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles("SUPER_ADMIN", "CASE_MANAGER")
  @ApiOperation({ summary: "Archive a beneficiary" })
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    await this.beneficiaries.archive(id, user.id);
  }
}
