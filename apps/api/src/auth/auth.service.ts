import { JwtService } from "@nestjs/jwt";
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../database/database.service";
import type { AuthenticatedUser, AuthResponse } from "./auth.types";
import { BootstrapAdminDto } from "./dto/bootstrap-admin.dto";
import { LoginDto } from "./dto/login.dto";
import { PasswordService } from "./password.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly passwords: PasswordService
  ) {}

  async bootstrap(input: BootstrapAdminDto): Promise<AuthResponse> {
    const expectedKey = this.config.getOrThrow<string>("AUTH_BOOTSTRAP_KEY");

    if (input.bootstrapKey !== expectedKey) {
      throw new ForbiddenException("Bootstrap key is invalid");
    }

    const userCount = await this.database.prisma.user.count();

    if (userCount > 0) {
      throw new ConflictException("The first staff account has already been created");
    }

    const email = input.email.trim().toLowerCase();
    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.database.prisma.$transaction(async (transaction) => {
      const created = await transaction.user.create({
        data: {
          authSubject: `local:${email}`,
          email,
          displayName: input.displayName.trim(),
          passwordHash,
          role: "SUPER_ADMIN",
          active: true
        }
      });

      await transaction.auditEvent.create({
        data: {
          actorUserId: created.id,
          action: "CREATED",
          entityType: "User",
          entityId: created.id,
          summary: {
            role: created.role,
            bootstrap: true
          }
        }
      });

      return created;
    });

    return this.issueToken(user);
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await this.database.prisma.user.findUnique({
      where: { email }
    });

    if (
      !user?.active ||
      !user.passwordHash ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("Email or password is invalid");
    }

    await this.database.prisma.$transaction([
      this.database.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      }),
      this.database.prisma.auditEvent.create({
        data: {
          actorUserId: user.id,
          action: "LOGIN",
          entityType: "User",
          entityId: user.id
        }
      })
    ]);

    return this.issueToken(user);
  }

  private async issueToken(user: {
    id: string;
    email: string;
    displayName: string;
    role: AuthenticatedUser["role"];
  }): Promise<AuthResponse> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresInSeconds: Number(
        this.config.get<string>("AUTH_JWT_EXPIRES_SECONDS") ?? "28800"
      ),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    };
  }
}
