import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { AccessManagementModule } from "./access-management/access-management.module";
import { AuthModule } from "./auth/auth.module";
import { AuthGuard } from "./auth/guards/auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { BeneficiariesModule } from "./beneficiaries/beneficiaries.module";
import { CaseCategoriesModule } from "./case-categories/case-categories.module";
import { CasesModule } from "./cases/cases.module";
import { validateEnvironment } from "./config/environment";
import { DatabaseModule } from "./database/database.module";
import { DirectoryModule } from "./directory/directory.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { LocationsModule } from "./locations/locations.module";
import { SupportingDocumentsModule } from "./supporting-documents/supporting-documents.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", "../../.env"],
      isGlobal: true,
      validate: validateEnvironment
    }),
    DatabaseModule,
    AccessManagementModule,
    AuthModule,
    BeneficiariesModule,
    CaseCategoriesModule,
    LocationsModule,
    DirectoryModule,
    SupportingDocumentsModule,
    CasesModule
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
