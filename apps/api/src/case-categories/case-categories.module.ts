import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CaseCategoriesController } from "./case-categories.controller";
import { CaseCategoriesService } from "./case-categories.service";

@Module({
  imports: [DatabaseModule],
  controllers: [CaseCategoriesController],
  providers: [CaseCategoriesService]
})
export class CaseCategoriesModule {}
