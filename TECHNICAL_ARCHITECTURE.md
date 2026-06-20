# Arukah MissionOS Technical Architecture

## Recommended production stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React Query for server-state caching
- React Hook Form and schema validation

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM and migrations
- OpenAPI documentation

### Authentication and authorization

- Auth0
- Internal Arukah staff accounts only
- One application role per staff member
- Server-side RBAC and PostgreSQL Row Level Security
- MFA required for privileged staff

Auth0 handles authentication and MFA. MissionOS remains the authority for
staff roles, account status, and fine-grained permissions.

### Document storage

- AWS S3 private buckets
- Case-scoped object keys
- Short-lived presigned upload and download URLs
- Server-side encryption
- Malware scanning pipeline
- Document metadata and access logs stored in PostgreSQL

### AI and document intelligence

- OpenAI APIs through a dedicated AI gateway module
- AWS Textract for OCR and structured form extraction
- Rules-based duplicate and risk checks before ML-based fraud detection
- Human review required for all AI recommendations
- AI prompts, model versions, inputs, outputs, and human dispositions audited

### Workflow and automation

- Temporal as the primary durable workflow engine
- n8n for low-risk integrations and operational automations
- Camunda deferred

Temporal should manage long-running, stateful business workflows such as verification deadlines, approval escalation, payment follow-up, impact reminders, and case closure. n8n should handle integrations such as email, WhatsApp providers, spreadsheets, or CRM synchronization.

Using Temporal and Camunda together in the MVP would duplicate workflow responsibilities. Camunda may be reconsidered later if BPMN-based workflow design becomes a contractual enterprise requirement.

### Hosting

- AWS
- CloudFront and AWS WAF
- Next.js deployed through AWS-compatible container hosting
- NestJS API on ECS Fargate
- PostgreSQL on Amazon RDS
- S3 for private documents and public assets
- ElastiCache Redis for caching, queues, and rate limiting where required
- Secrets Manager
- CloudWatch logging, metrics, and alarms
- SES for transactional email
- SNS or an approved provider for SMS

## System shape

```text
Web browser
    |
CloudFront + WAF
    |
Next.js web application
    |
NestJS API
    |-- PostgreSQL / RDS
    |-- S3 private documents
    |-- Auth0
    |-- Temporal workflows
    |-- n8n integrations
    |-- AI Gateway
          |-- OpenAI APIs
          |-- AWS Textract
          |-- Risk and fraud rules
```

## Core service boundaries

Begin with a modular monolith rather than independent microservices. Each domain has an explicit NestJS module and can be extracted later if scale or team ownership requires it.

### Identity module

- Auth0 user synchronization
- Tenant membership
- Roles and permissions
- Invitations and account status
- MFA policy

### Beneficiary module

- Beneficiary profiles
- Households
- Contact and location
- Support history
- Duplicate-review candidates

### Case module

- Intake
- Assignment
- Lifecycle
- Notes and tasks
- Transitions
- Closure rules

### Verification module

- Checklists
- Document review
- Field visits
- Risk flags
- Recommendations

### Provider module

- Provider directory
- Due diligence
- Quotes
- Invoices
- Delivery confirmation

### Finance module

- Payment requests
- Approvals
- UTR references
- Invoice matching
- Reconciliation

### Impact module

- Evidence
- Outcomes
- Testimonials and consent
- Follow-up
- Closure checklist

### Audit module

- Immutable audit events
- Security activity
- Data exports
- Administrative changes

### Notification module

- Email
- SMS
- WhatsApp
- In-app notifications
- Templates and preferences

### AI gateway module

- OCR requests
- Document completeness
- Duplicate candidates
- Risk signals
- Recommendation scoring
- Prompt and model governance

## Internal security model

Every API request:

1. Validates the Auth0 access token.
2. Resolves the active Arukah staff account.
3. Checks account status and the required role or permission.
4. Executes the authorized operation.
5. Records material activity in the audit log.

Multi-organization tenancy and donor-facing services are deferred until the
internal pilot proves the workflow.

## Repository structure

```text
arukah-missionos/
  apps/
    web/                 Next.js application
    api/                 NestJS application
    worker/              Temporal workers
  packages/
    ui/                  Shared design system
    contracts/           API types and schemas
    config/              Shared TypeScript and lint configuration
    database/            Prisma schema, migrations, and seed data
    domain/              Shared domain values and permission definitions
  infrastructure/
    aws/                 Infrastructure as code
    docker/              Local and production container definitions
  docs/
  prototype/             Current static public site and platform prototype
```

## Environment strategy

- Local: Docker Compose for PostgreSQL and supporting services
- Development: shared AWS development account
- Staging: production-like environment with synthetic data
- Production: isolated AWS account with protected data

No production beneficiary or payment data should be copied into development or staging.

## API conventions

- REST API for transactional application operations
- OpenAPI specification generated by NestJS
- Idempotency keys for payments and workflow-triggering requests
- Cursor pagination for large lists
- UTC timestamps
- Structured error codes
- Optimistic concurrency for sensitive updates

## Security baseline

- TLS everywhere
- Private S3 objects
- Encryption at rest
- MFA for privileged staff
- Short session lifetime for finance and administrative roles
- Rate limiting and abuse protection
- CSRF protection where cookies are used
- Input validation at API boundaries
- Malware scanning for uploads
- Secrets stored outside source control
- Audit events for reads of highly sensitive documents
- Backup and restoration tests
- Data retention and deletion policies

## Observability

- Correlation ID across web, API, workflows, and integrations
- Structured application logs
- Error monitoring
- API latency and failure metrics
- Workflow failure and retry monitoring
- Payment and notification reconciliation dashboards
- Security alerts for suspicious login and export behavior

## Architecture principle

The database and API are the source of truth. Temporal coordinates work but does not own business data. n8n integrates external systems but does not own workflow state. AI suggests and extracts but does not make final case, payment, or compliance decisions.
