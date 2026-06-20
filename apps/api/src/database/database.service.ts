import { createPrismaClient } from "@arukah/database";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type MissionOsPrismaClient = ReturnType<typeof createPrismaClient>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly client: MissionOsPrismaClient | undefined;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>("DATABASE_URL");

    if (!connectionString) {
      this.logger.warn("DATABASE_URL is not configured; database readiness will fail");
      return;
    }

    this.client = createPrismaClient(connectionString);
  }

  get prisma(): MissionOsPrismaClient {
    if (!this.client) {
      throw new Error("Database is not configured");
    }

    return this.client;
  }

  get isConfigured() {
    return Boolean(this.client);
  }

  async ping() {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error("Database readiness check failed", error);
      return false;
    }
  }

  async onModuleDestroy() {
    await this.client?.$disconnect();
  }
}
