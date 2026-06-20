import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnvironment } from "./config/environment";
import { DatabaseModule } from "./database/database.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", "../../.env"],
      isGlobal: true,
      validate: validateEnvironment
    }),
    DatabaseModule
  ],
  controllers: [HealthController],
  providers: [HealthService]
})
export class AppModule {}
