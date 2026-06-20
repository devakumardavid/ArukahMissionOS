# Arukah MissionOS Technology Stack

This document inventories the technology currently used by the production
workspace. It distinguishes installed software from technologies that are only
planned in the architecture.

## Version sources

- `package.json` files declare application dependencies.
- `pnpm-lock.yaml` is the source of truth for exact JavaScript package versions.
- `compose.yaml` defines local infrastructure versions.
- Local Node.js and Docker versions can vary between developer machines.

The versions below reflect the lockfile and local environment verified on
June 20, 2026.

## Runtime and workspace

| Technology | Version | Purpose |
| --- | --- | --- |
| Node.js | 24.14.0 locally | JavaScript runtime |
| TypeScript | 6.0.3 | Primary application language |
| pnpm | 11.5.3 | Package manager and monorepo tooling |
| Docker | 29.5.3 locally | Local container runtime |
| Docker Compose | 5.1.4 locally | Local service orchestration |
| PostgreSQL | 17 Alpine | Relational database |

The repository is a pnpm workspace containing applications under `apps/*` and
shared packages under `packages/*`.

## Frontend

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js | 16.2.9 | React application framework and App Router |
| React | 19.2.7 | User-interface library |
| React DOM | 19.2.7 | Browser rendering |
| Tailwind CSS | 4.3.1 | CSS framework |
| Tailwind PostCSS plugin | 4.3.1 | Tailwind compilation |
| PostCSS | 8.5.15 | CSS processing |
| Autoprefixer | 10.5.0 | Browser CSS prefixes |

The frontend currently uses React client components, hooks, custom responsive
CSS, inline SVG icons, and Next.js standalone production output.

## Backend

| Technology | Version | Purpose |
| --- | --- | --- |
| NestJS Common | 11.1.27 | Controllers, modules, and dependency injection |
| NestJS Core | 11.1.27 | Backend application framework |
| NestJS Express Platform | 11.1.27 | HTTP server adapter |
| NestJS Config | 4.0.4 | Environment configuration |
| NestJS Swagger | 11.4.4 | OpenAPI generation and Swagger UI |
| NestJS CLI | 11.0.23 | Development server and builds |
| NestJS Schematics | 11.1.0 | NestJS scaffolding |
| RxJS | 7.8.2 | NestJS reactive primitives |
| class-validator | 0.15.1 | Request and DTO validation |
| class-transformer | 0.5.1 | Request transformation |
| reflect-metadata | 0.2.2 | Decorator metadata |
| ESLint | 10.5.0 | Static analysis |

## Database and persistence

| Technology | Version | Purpose |
| --- | --- | --- |
| Prisma ORM and CLI | 7.8.0 | Schema management and migrations |
| Prisma Client | 7.8.0 | Type-safe database access |
| Prisma PostgreSQL adapter | 7.8.0 | Prisma driver integration |
| node-postgres (`pg`) | 8.22.0 | PostgreSQL driver |
| dotenv | 17.4.2 | Environment-file loading |

The current database schema contains:

- `User`
- `Beneficiary`
- `Case`
- `CaseTransition`
- `AuditEvent`

## Shared workspace packages

| Package | Responsibility |
| --- | --- |
| `@arukah/contracts` | Shared Zod 4.4.3 request schemas and input types |
| `@arukah/domain` | Shared staff roles and case lifecycle values |
| `@arukah/database` | Prisma client and PostgreSQL integration |
| `@arukah/ui` | Shared UI package foundation |
| `@arukah/config` | Shared configuration package foundation |

## Type definitions

| Package | Version |
| --- | --- |
| `@types/node` | 26.0.0 |
| `@types/react` | 19.2.17 |
| `@types/react-dom` | 19.2.3 |
| `@types/express` | 5.0.6 |
| `@types/pg` | 8.20.0 |

## Implemented local services

| Service | Address |
| --- | --- |
| Next.js frontend | `http://localhost:3000` |
| Frontend health page | `http://localhost:3000/health` |
| NestJS API | `http://localhost:4000/api` |
| API liveness | `http://localhost:4000/api/health` |
| API readiness | `http://localhost:4000/api/health/ready` |
| Swagger UI | `http://localhost:4000/api/docs` |
| PostgreSQL | `localhost:5432` |

## Planned technologies

The following technologies appear in the target architecture but are not
currently implemented or installed in the production workspace:

- Auth0 for staff authentication and MFA
- AWS S3 for private documents
- AWS ECS, RDS, CloudFront, WAF, and Secrets Manager
- Temporal for durable workflows
- Redis for caching, queues, and rate limiting
- OpenAI APIs through an AI gateway
- AWS Textract for document extraction
- n8n for low-risk integrations
- AWS SES and SNS for notifications

See [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) for the intended
production architecture and service boundaries.
