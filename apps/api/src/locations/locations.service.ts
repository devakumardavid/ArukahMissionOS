import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

export type IndiaStateResponse = {
  id: string;
  code: string;
  name: string;
  kind: string;
  active: boolean;
  sortOrder: number;
};

export type IndiaCityResponse = {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  state: {
    id: string;
    code: string;
    name: string;
  };
};

@Injectable()
export class LocationsService {
  constructor(private readonly database: DatabaseService) {}

  findStates(): Promise<IndiaStateResponse[]> {
    return this.database.prisma.indiaState.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        kind: true,
        active: true,
        sortOrder: true
      }
    });
  }

  findCities(stateCode?: string): Promise<IndiaCityResponse[]> {
    return this.database.prisma.indiaCity.findMany({
      where: {
        active: true,
        state: {
          active: true,
          code: stateCode?.trim().toUpperCase()
        }
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        active: true,
        sortOrder: true,
        state: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });
  }
}
