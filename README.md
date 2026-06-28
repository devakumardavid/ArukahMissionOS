# Arukah MissionOS

This repository now contains the production application foundation and the validated static prototype.

## Active MVP scope

The production application is an internal tool for the Arukah team. It supports
Super Admin, Case Manager, Verifier, and Finance Manager workflows in one
organization. Donor accounts, public marketplaces, white labeling, and
multi-organization tenancy are future phases; prototype screens for those ideas
are not part of the active backend scope.

## Production workspace

```text
apps/web                 Next.js and Tailwind frontend
apps/api                 NestJS API and Swagger documentation
packages/database        Prisma and PostgreSQL schema
packages/contracts       Shared Zod request contracts
packages/domain          Shared roles and case lifecycle values
packages/ui              Shared design tokens
prototype                Original public website and interactive platform prototype
```

### Local commands

Use Node.js 22 or later and pnpm 11.5.3.

```sh
pnpm install
pnpm db:generate
pnpm typecheck
pnpm build
pnpm dev:web
pnpm dev:api
```

- Next.js: `http://localhost:3000`
- NestJS health: `http://localhost:4000/api/health`
- NestJS readiness: `http://localhost:4000/api/health/ready`
- Swagger: `http://localhost:4000/api/docs`
- Public website prototype: `http://localhost:8080`

PostgreSQL is described in `compose.yaml`. Docker or another PostgreSQL 17 installation is required before running migrations.
Copy `.env.example` to `.env` before starting the API. The liveness endpoint remains
available without PostgreSQL; the readiness endpoint returns `503` until the database
is configured and reachable.

### Docker Compose

The Docker setup runs each production service in its own container:

| Service | Container purpose | Host URL |
| --- | --- | --- |
| `public-site` | Static public Arukah website prototype | `http://localhost:8080` |
| `web` | Next.js MissionOS frontend | `http://localhost:3000` |
| `api` | NestJS backend API | `http://localhost:4000/api` |
| `postgres` | PostgreSQL 17 database | `localhost:5432` |

For day-to-day development, you can still run only PostgreSQL in Docker and run
the apps locally with `pnpm`:

```sh
docker compose up postgres
pnpm dev
```

For a production-like local run, start the full stack:

```sh
docker compose up --build
```

The API container connects to PostgreSQL over Docker's internal network and runs
Prisma migrations before starting. The frontend container is built with
`NEXT_PUBLIC_API_URL`, which should remain a browser-reachable URL such as
`http://localhost:4000/api` for local testing.

The public site container serves the files in `prototype/` with Nginx. Its local
configuration links visitors into MissionOS at `http://localhost:3000`.

### Website and application links

- The Next.js app reads `NEXT_PUBLIC_ARUKAH_WEBSITE_URL` to link back to the
  public Arukah website.
- The static public website reads `prototype/config.js` to find the MissionOS
  application URL.
- Local defaults connect `http://localhost:8080` and `http://localhost:3000`.
  Replace both values with the deployed website and app domains in production.

### Case API

The first database-backed case module is available under `/api/cases`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/cases` | Create a submitted case |
| `GET` | `/api/cases` | List, search, filter, and paginate cases |
| `GET` | `/api/cases/:id` | Retrieve one case |
| `PATCH` | `/api/cases/:id` | Update intake details or assignments |
| `DELETE` | `/api/cases/:id` | Delete a submitted case with no transition history |

Workflow stage changes are intentionally excluded from CRUD updates. They will
be handled by a dedicated transition endpoint with role checks and transition
history.

### Basic staff authentication

The internal MVP uses email/password authentication with short-lived signed
bearer tokens:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/bootstrap` | Create the first Super Admin once |
| `POST` | `/api/auth/login` | Exchange staff credentials for a bearer token |
| `GET` | `/api/auth/me` | Return the authenticated staff identity |

Set `AUTH_JWT_SECRET` and `AUTH_BOOTSTRAP_KEY` in `.env`. Both case mutations
and reads require `Authorization: Bearer <token>`. Case creation, updates, and
deletion are limited to Super Admin and Case Manager roles.

The Next.js application at `http://localhost:3000` includes the staff login
screen. It sends credentials to `NEXT_PUBLIC_API_URL`, restores a saved session
through `/api/auth/me`, displays the authenticated staff name and role, and
clears the local session when the user signs out.

The New Case dialog can select an existing beneficiary or create one inline,
then submits the authenticated case intake to the API.

## Prototype

An internal-use prototype for proving Arukah's end-to-end assistance workflow before building a donor marketplace.

## Product documentation

- [Current technology stack](TECH_STACK.md)
- [Product vision](PRODUCT_VISION.md)
- [Phase 1 MVP specification](MVP_SPEC.md)
- [Core domain model](DATA_MODEL.md)
- [Implementation roadmap](ROADMAP.md)
- [Seven-module contract](MODULES.md)
- [Future donor portal concept](DONOR_PORTAL.md)
- [Future multi-tenant architecture](MULTI_TENANT_ARCHITECTURE.md)
- [Technical architecture](TECHNICAL_ARCHITECTURE.md)
- [Prototype-to-production migration](MIGRATION_PLAN.md)

## Run it

Open `prototype/index.html` directly, or serve the `prototype` folder with any static web server.

For example:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## What works

- Case dashboard and active pipeline
- Create, search, and filter cases
- Move a case through Need Submission → Verification → Approval → Provider Selection → Payment → Impact Tracking → Case Closure
- Record direct provider payments
- Add verification and impact notes
- Cause and provider summaries
- Impact reporting
- JSON data export
- Browser-local persistence through `localStorage`
- Four internal staff roles with role-aware queues and permissions:
  - Super Admin
  - Case Manager
  - Verifier
  - Finance Manager

Beneficiaries and providers are represented as case participants during the pilot rather than authenticated platform users. Donor marketplace access is deliberately deferred until 50–100 real cases have validated the process.

Use the role selector at the bottom of the sidebar to preview each internal workspace. This prototype enforces workflow permissions in the browser; production authentication and server-side authorization are still required before handling real beneficiary or financial data.

No account or backend is required for this prototype. Data remains in the current browser.

Select the **Donor** role in the sidebar to preview mission creation, annual budgeting, the privacy-safe cause marketplace, explainable recommendations, cause allocation, and donor impact reports.

Use the organization selector below the role selector to preview **Church Management**, **NGO Management**, the **Family Foundation Portal**, and the **CSR Portal**. Super Admin can use **Brand studio** to preview tenant-specific names, colors, terminology, geography, and approval thresholds.

## Sensible next production step

Replace browser-local storage with a hosted database and authentication, then add secure document uploads, audit logs, and server-side authorization for internal staff.
