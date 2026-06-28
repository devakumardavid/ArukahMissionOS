FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY . .

ENV DATABASE_URL=postgresql://arukah:arukah@postgres:5432/arukah_missionos?schema=public

RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm db:generate
RUN pnpm --filter @arukah/api build

ENV NODE_ENV=production

EXPOSE 4000

CMD ["sh", "-c", "pnpm --filter @arukah/database exec prisma migrate deploy && pnpm --filter @arukah/api start"]
