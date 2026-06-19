# Prototype-to-Production Migration Plan

## Current state

The repository contains a browser-local prototype:

- Public website
- Internal case-management experience
- Donor portal
- Multi-tenant organization previews
- White-label configuration

Its data is stored in browser `localStorage`. It is useful for product validation but not suitable for real beneficiary, payment, or identity data.

## Migration approach

Preserve the current prototype under `prototype/` as the visual and workflow reference. Build the production application in parallel rather than attempting to transform the static JavaScript file in place.

## Milestone 1 — Monorepo and local platform

- Initialize workspace package management
- Create Next.js web application
- Create NestJS API
- Create shared packages
- Add PostgreSQL through Docker Compose
- Add Prisma schema and migrations
- Add development seed data
- Add linting, formatting, tests, and environment validation

## Milestone 2 — Authentication and tenant foundation

- Configure Auth0 development tenant
- Implement login, logout, callback, and session handling
- Create users, tenants, and memberships
- Implement roles and permissions
- Add tenant selector for multi-membership users
- Enforce server-side tenant context
- Create audit events for authentication and tenant changes

## Milestone 3 — Beneficiary and case vertical slice

- Beneficiary and household records
- Case creation and assignment
- Case list and detail pages
- Lifecycle transition service
- Audit history
- Role-aware dashboard

## Milestone 4 — Secure documents and verification

- S3 private bucket
- Presigned upload flow
- Malware scan
- Document metadata
- Verification checklists and recommendations
- Textract OCR job pipeline

## Milestone 5 — Provider, payment, and impact

- Provider directory and due diligence
- Quotes and invoices
- Payment approvals and UTR tracking
- Reconciliation
- Impact evidence and closure gates
- Operational and financial reports

## Milestone 6 — Durable workflows and notifications

- Temporal workflows for deadlines and handoffs
- SES email
- SMS/WhatsApp integration
- n8n for approved external integrations
- Retry, escalation, and reconciliation processes

## Milestone 7 — Donor and organization portals

- Published-cause privacy boundary
- Donor missions and budgets
- Cause allocations
- Impact reports
- Church, NGO, Foundation, and CSR configurations
- White-label domains and templates

## Milestone 8 — AI governance

- AI gateway
- OCR extraction review
- Duplicate candidate matching
- Document-completeness checks
- Explainable risk signals
- Recommendation ranking
- Human disposition and model audit records

## First production vertical slice

The first slice to implement is:

**Auth0 login → tenant membership → beneficiary creation → case creation → audit event**

It should be fully tested before adding documents, payments, AI, or workflow engines.

