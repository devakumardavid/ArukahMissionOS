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
  Post,
  Query
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  type CaseListResponse,
  type CaseResponse,
  CasesService
} from "./cases.service";
import { CreateCaseDto } from "./dto/create-case.dto";
import { ListCasesQueryDto } from "./dto/list-cases-query.dto";
import { SubmitPaymentDto } from "./dto/submit-payment.dto";
import { SubmitVerificationDto } from "./dto/submit-verification.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";

@ApiTags("cases")
@ApiBearerAuth()
@Controller("cases")
export class CasesController {
  constructor(private readonly cases: CasesService) {}

  @Post()
  @ApiOperation({ summary: "Create a case" })
  @ApiCreatedResponse({ description: "Case created" })
  @ApiUnprocessableEntityResponse({ description: "Invalid beneficiary or assignee" })
  @Roles("GENERAL_ADMIN", "CASE_MANAGER")
  create(
    @Body() input: CreateCaseDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CaseResponse> {
    return this.cases.create(input, user.id);
  }

  @Get()
  @ApiOperation({ summary: "List and filter cases" })
  findAll(@Query() query: ListCasesQueryDto): Promise<CaseListResponse> {
    return this.cases.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a case by ID" })
  @ApiNotFoundResponse({ description: "Case not found" })
  findOne(@Param("id", new ParseUUIDPipe()) id: string): Promise<CaseResponse> {
    return this.cases.findOne(id);
  }

  @Patch(":id")
  @Roles("SUPER_ADMIN", "GENERAL_ADMIN", "CASE_MANAGER")
  @ApiOperation({ summary: "Update case intake details or assignments" })
  @ApiNotFoundResponse({ description: "Case not found" })
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: UpdateCaseDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CaseResponse> {
    return this.cases.update(id, input, user.id);
  }

  @Post(":id/verification")
  @Roles("GENERAL_ADMIN", "MISSION_VERIFIER")
  @ApiOperation({ summary: "Submit a verification recommendation" })
  @ApiNotFoundResponse({ description: "Case not found" })
  @ApiUnprocessableEntityResponse({ description: "Invalid verification recommendation" })
  submitVerification(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: SubmitVerificationDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CaseResponse> {
    return this.cases.submitVerification(id, input, user.id);
  }

  @Post(":id/payment")
  @Roles("GENERAL_ADMIN", "FINANCE_MANAGER")
  @ApiOperation({ summary: "Record a payment and move the case to impact follow-up" })
  @ApiNotFoundResponse({ description: "Case not found" })
  @ApiUnprocessableEntityResponse({ description: "Invalid payment record" })
  submitPayment(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: SubmitPaymentDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CaseResponse> {
    return this.cases.submitPayment(id, input, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a newly submitted case without workflow history" })
  @ApiNoContentResponse({ description: "Case deleted" })
  @ApiNotFoundResponse({ description: "Case not found" })
  @Roles("GENERAL_ADMIN", "CASE_MANAGER")
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    await this.cases.remove(id, user.id);
  }
}
