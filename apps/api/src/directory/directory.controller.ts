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
  ApiNoContentResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { DirectoryService } from "./directory.service";
import type { SupplierResponse, TeamMemberResponse } from "./directory.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";

@ApiTags("directory")
@ApiBearerAuth()
@Controller("directory")
export class DirectoryController {
  constructor(private readonly directory: DirectoryService) {}

  @Get("team")
  @ApiOperation({ summary: "List employees, associates, and staff users" })
  listTeam(): Promise<TeamMemberResponse[]> {
    return this.directory.listTeam();
  }

  @Post("team")
  @Roles("SUPER_ADMIN")
  @ApiOperation({ summary: "Register a team member" })
  @ApiCreatedResponse({ description: "Team member registered" })
  createTeamMember(
    @Body() input: CreateTeamMemberDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TeamMemberResponse> {
    return this.directory.createTeamMember(input, user.id);
  }

  @Patch("team/:id")
  @Roles("SUPER_ADMIN")
  @ApiOperation({ summary: "Update a team member" })
  updateTeamMember(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: UpdateTeamMemberDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TeamMemberResponse> {
    return this.directory.updateTeamMember(id, input, user.id);
  }

  @Delete("team/:id")
  @Roles("SUPER_ADMIN")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: "Team member deactivated" })
  async deactivateTeamMember(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.directory.setTeamMemberActive(id, false, user.id);
  }

  @Get("suppliers")
  @ApiOperation({ summary: "List suppliers and service providers" })
  listSuppliers(): Promise<SupplierResponse[]> {
    return this.directory.listSuppliers();
  }

  @Post("suppliers")
  @Roles("SUPER_ADMIN", "FINANCE_MANAGER", "CASE_MANAGER")
  @ApiOperation({ summary: "Register a supplier or service provider" })
  @ApiCreatedResponse({ description: "Supplier registered" })
  createSupplier(
    @Body() input: CreateSupplierDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SupplierResponse> {
    return this.directory.createSupplier(input, user.id);
  }

  @Patch("suppliers/:id")
  @Roles("SUPER_ADMIN", "FINANCE_MANAGER", "CASE_MANAGER")
  @ApiOperation({ summary: "Update a supplier or service provider" })
  updateSupplier(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() input: UpdateSupplierDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SupplierResponse> {
    return this.directory.updateSupplier(id, input, user.id);
  }

  @Delete("suppliers/:id")
  @Roles("SUPER_ADMIN", "FINANCE_MANAGER", "CASE_MANAGER")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: "Supplier archived" })
  async archiveSupplier(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.directory.setSupplierActive(id, false, user.id);
  }
}
