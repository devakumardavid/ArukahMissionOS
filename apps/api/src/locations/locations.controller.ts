import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  type IndiaCityResponse,
  type IndiaStateResponse,
  LocationsService
} from "./locations.service";

@ApiTags("locations")
@ApiBearerAuth()
@Controller("locations")
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get("states")
  @ApiOperation({ summary: "List active Indian states and union territories" })
  findStates(): Promise<IndiaStateResponse[]> {
    return this.locations.findStates();
  }

  @Get("cities")
  @ApiOperation({ summary: "List active cities, optionally filtered by state code" })
  @ApiQuery({ name: "stateCode", required: false, example: "TN" })
  findCities(@Query("stateCode") stateCode?: string): Promise<IndiaCityResponse[]> {
    return this.locations.findCities(stateCode);
  }
}
