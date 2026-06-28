import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

export type CaseCategoryResponse = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
};

@Injectable()
export class CaseCategoriesService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(): Promise<CaseCategoryResponse[]> {
    return this.database.prisma.caseCategory.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        active: true,
        sortOrder: true
      }
    });
  }
}
