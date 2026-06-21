import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("AUTH_JWT_SECRET"),
        signOptions: {
          expiresIn: Number(config.get<string>("AUTH_JWT_EXPIRES_SECONDS") ?? "28800")
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService]
})
export class AuthModule {}
