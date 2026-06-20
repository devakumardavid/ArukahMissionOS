import { Injectable } from "@nestjs/common";
import { DatabaseService } from "./database/database.service";

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  getLiveness() {
    return {
      service: "arukah-api",
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }

  async getReadiness() {
    const databaseReady = await this.database.ping();

    return {
      service: "arukah-api",
      status: databaseReady ? "ready" : "not_ready",
      checks: {
        database: databaseReady
          ? "up"
          : this.database.isConfigured
            ? "down"
            : "not_configured"
      },
      timestamp: new Date().toISOString()
    };
  }
}
