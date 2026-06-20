import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Check API availability" })
  getHealth() {
    return this.health.getLiveness();
  }

  @Get("ready")
  @ApiOperation({ summary: "Check API dependencies" })
  async getReadiness() {
    const readiness = await this.health.getReadiness();

    if (readiness.status !== "ready") {
      throw new ServiceUnavailableException(readiness);
    }

    return readiness;
  }
}
