import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CaseCategoriesService,
  type CaseCategoryResponse
} from "./case-categories.service";

@ApiTags("case categories")
@ApiBearerAuth()
@Controller("case-categories")
export class CaseCategoriesController {
  constructor(private readonly categories: CaseCategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List active case categories" })
  findAll(): Promise<CaseCategoryResponse[]> {
    return this.categories.findAll();
  }
}
