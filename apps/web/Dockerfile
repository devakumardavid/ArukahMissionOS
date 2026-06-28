FROM node:22-alpine

WORKDIR /app

RUN corepack enable

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ARG NEXT_PUBLIC_ARUKAH_WEBSITE_URL=http://localhost:8080

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ARUKAH_WEBSITE_URL=$NEXT_PUBLIC_ARUKAH_WEBSITE_URL

COPY . .

RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm --filter @arukah/web build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "--filter", "@arukah/web", "start"]
