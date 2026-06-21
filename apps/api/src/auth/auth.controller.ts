import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import type { AuthenticatedUser, AuthResponse } from "./auth.types";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Public } from "./decorators/public.decorator";
import { BootstrapAdminDto } from "./dto/bootstrap-admin.dto";
import { LoginDto } from "./dto/login.dto";

@ApiTags("authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("bootstrap")
  @ApiOperation({ summary: "Create the first Super Admin account" })
  @ApiCreatedResponse({ description: "First administrator created" })
  @ApiConflictResponse({ description: "A staff account already exists" })
  bootstrap(@Body() input: BootstrapAdminDto): Promise<AuthResponse> {
    return this.auth.bootstrap(input);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign in with staff email and password" })
  @ApiUnauthorizedResponse({ description: "Email or password is invalid" })
  login(@Body() input: LoginDto): Promise<AuthResponse> {
    return this.auth.login(input);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated staff account" })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
