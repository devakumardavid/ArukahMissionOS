# Multi-Tenant Architecture

## Objective

MissionOS should support multiple organizations on one governed platform while keeping each organization’s users, beneficiaries, cases, documents, providers, payments, programs, donors, and reports isolated.

The local prototype now demonstrates:

- Organization switching
- Tenant-scoped cases, causes, missions, programs, and members
- Church, NGO, Family Foundation, and CSR-specific portals
- Organization terminology and approval configuration
- White-label colors, name, tagline, and logo initials

## Tenant types

### Church Management

- Benevolence and member-care requests
- Community outreach programs
- Pastoral, committee, and trustee approvals
- Restricted-fund stewardship
- Volunteer and church-partner coordination

### NGO Management

- Beneficiary and program management
- Field-team assignments
- Grant and budget tracking
- Implementing partners and providers
- Monitoring, evaluation, and outcome reporting

### Family Foundation Portal

- Family giving missions
- Grant-request review
- Trustee decisions
- Annual and multi-year budgets
- Family legacy and impact history

### CSR Portal

- Annual CSR initiatives and themes
- CSR committee approvals
- NGO/implementing-partner due diligence
- Disbursement and utilization tracking
- Outcome and compliance reporting

## Core tenant entity

Every organization has:

- Tenant ID
- Organization type
- Legal and display names
- Status
- Branding configuration
- Terminology configuration
- Operating geography
- Approval thresholds
- Workflow settings
- Data-retention policy

Every governed business record must include `tenant_id`, including:

- Users and memberships
- Beneficiaries and households
- Cases
- Documents and verification
- Providers, quotes, and invoices
- Payments
- Impact records
- Published causes
- Donor missions and allocations
- Programs and reports
- Audit events

## Recommended production isolation

### Shared application and database

Use one application and one PostgreSQL database for the initial SaaS version, with:

- Mandatory `tenant_id` foreign keys
- PostgreSQL Row Level Security
- Tenant-aware storage paths and policies
- Tenant membership checked on every request
- Server-side authorization
- Unique indexes scoped by tenant
- Tenant ID captured in every audit event

This approach is operationally simpler while the platform is young.

### Dedicated isolation option

Large or regulated tenants may later receive:

- Dedicated database
- Dedicated storage bucket
- Dedicated encryption keys
- Dedicated deployment or region

The application domain layer should not assume all tenants share the same physical database.

## Tenant resolution

Production tenant context may be resolved through:

- Custom domain, such as `care.gracechurch.org`
- MissionOS subdomain, such as `grace.missionos.org`
- Explicit organization selector for users with multiple memberships

The server must derive authorized tenant context from the authenticated session. It must never trust a tenant ID supplied only by the browser.

## Membership model

A user may belong to multiple tenants through a `tenant_membership` record:

- user ID
- tenant ID
- tenant-specific role
- status
- invitation and activation timestamps

A user’s role is tenant-specific. Being an administrator in one organization grants no access to another organization.

## White labeling

Configurable per tenant:

- Organization name and short name
- Logo and favicon
- Primary and accent colors
- Tagline
- Custom domain
- Email sender identity and templates
- Case and mission terminology
- Geography
- Approval threshold
- Enabled modules

Not configurable:

- Security controls
- Audit requirements
- Privacy boundaries
- Mandatory financial controls
- Core data-integrity rules

## Workflow configuration

Organizations may configure:

- Terminology
- Categories
- Approval thresholds
- Required documents
- Checklist templates
- Trustee or committee approval for large cases
- Notification recipients
- Closure checklist

Workflow configuration should be versioned. Existing cases remain linked to the workflow version under which they were created.

## Tenant-safe reporting

- All queries include authorized tenant context.
- Cross-tenant analytics are restricted to MissionOS platform administrators.
- Tenant exports contain only that tenant’s records.
- Public or donor cause content requires explicit publication.
- Aggregate platform analytics must suppress identifiable tenant or beneficiary information.

## Audit requirements

Every audit event stores:

- tenant ID
- actor and membership
- action
- entity type and ID
- timestamp
- relevant before/after values
- session or request reference

Tenant switches, role changes, white-label changes, workflow changes, and exports are audited.

## Local prototype limitations

- Tenant isolation is simulated with browser-local records.
- The role and tenant selector is a development preview tool.
- Branding uses configurable CSS variables.
- No real domains, authentication, RLS, storage policies, or encryption exist yet.
- Tenant-specific data is not suitable for production until server-side controls are built.

