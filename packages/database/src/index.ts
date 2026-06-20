import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

export { Prisma, PrismaClient } from "../generated/prisma/client";

export function createPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}
