# Phase 1 Module Contract

This document defines the seven modules of the internal Arukah Case Management pilot.

## Terminology rule

The internal record is a **Case**. A **Cause** is a privacy-safe, approved representation that may later be made eligible for donor funding. During Phase 1, the Cause Management module primarily operates on private cases.

## Module 1 — User & Access Management

### Capabilities

- Staff invitation and registration
- Login and logout
- Role assignment and removal
- Permission enforcement
- Staff profile management
- Account activation, suspension, and verification
- Session and security-event history

### Primary role

- Super Admin

Super Admin is reserved for software administration: creating staff accounts,
managing access, and overriding workflow status when an exception requires it.
General Admin handles regular operational administration across directory,
beneficiary, case, verification, payment, reconciliation, and reporting work.

### MVP permission groups

- User administration
- Case intake and management
- Verification
- Approval
- Provider selection
- Payment and reconciliation
- Impact and closure
- Reporting and export

### Acceptance criteria

- An invited staff member can activate an account and sign in.
- A Super Admin can assign one internal role.
- Suspended accounts cannot access the application.
- Routes and server actions enforce permissions independently of the UI.
- Profile and role changes generate audit events.

## Module 2 — Cause Management

### Capabilities

- Submit case/cause
- Review completeness
- Assign case manager and mission verifier
- Approve, reject, or request more information
- Track lifecycle state
- Close case
- Generate a privacy-safe cause record later

### Primary role

- Case Manager

### Acceptance criteria

- A case has a unique case number, beneficiary, category, amount, urgency, and owner.
- Assignment history is retained.
- Approval and rejection require a reason and actor.
- A case cannot skip required workflow stages.
- A case cannot close before payment and impact requirements are complete.

## Module 3 — Verification

### Capabilities

- Verification checklist
- Secure document upload and review
- Verification notes
- Identity, income, need, amount, and provider checks
- Field-verification report
- Duplicate and risk flags
- Risk rating
- Approval, rejection, or more-information recommendation

### Primary role

- Mission Verifier

### Acceptance criteria

- Required checklist items are visible and attributable.
- Each document has a review status and reviewer.
- Risk rating and recommendation require rationale.
- A mission verifier cannot make the final approval decision.
- Completed verification is timestamped and immutable except through a documented reopening action.

## Module 4 — Provider Management

### Capabilities

- Provider directory
- Provider onboarding and verification
- Provider type and service catalogue
- Quotes and estimates
- Invoice management
- Banking-data secure reference
- Provider selection and rationale
- Delivery confirmation

### Primary roles

- Case Manager
- Super Admin

### Acceptance criteria

- A selected provider has a verification status.
- A case records the selected quote or invoice.
- Selection rationale is retained when multiple providers are considered.
- Sensitive banking details are encrypted or stored through a secure provider.
- Delivery confirmation can be linked to impact evidence.

## Module 5 — Payment Tracking

### Capabilities

- Payment request
- Payment approval workflow
- Direct provider payment record
- UTR/payment-reference tracking
- Invoice matching
- Partial and full payment support where authorized
- Reconciliation and exception status
- Financial report export

### Primary role

- Finance Manager

### Acceptance criteria

- Payment cannot be recorded without an approved case and selected provider.
- Amount, date, payee, method, and UTR/reference are required.
- Payment is matched to an invoice or an exception reason.
- Reconciliation records an actor and timestamp.
- Payment changes appear in the audit history.

## Module 6 — Impact Tracking

### Capabilities

- Photos
- Documents
- Testimonials
- Delivery confirmation
- Outcome notes and reports
- Beneficiary acknowledgement
- Follow-up actions
- Closure checklist

### Primary role

- Case Manager

### Acceptance criteria

- Evidence is access-controlled and linked to a case.
- Consent and privacy suitability are recorded for photos or testimonials.
- Outcome report records what was delivered and the observed result.
- Follow-up requirements remain visible until resolved.
- Case closure is blocked until required impact and financial evidence are complete.

## Module 7 — Dashboard & Reports

### Capabilities

- Active cases
- Pending verification
- Funds utilized
- Impact metrics
- Cases by stage, category, geography, urgency, and owner
- Average verification, payment, fulfillment, and closure times
- Overdue and exception queues
- Financial reconciliation report
- Pilot progress toward 50–100 closed cases

### Primary roles

- Super Admin: organization-wide metrics
- General Admin: directory completeness and operational setup
- Case Manager: assigned caseload and operational queues
- Mission Verifier: assigned verification queue
- Finance Manager: payment and reconciliation queue

### Acceptance criteria

- Dashboard data comes from transactional records rather than manual totals.
- Metrics respect role access and privacy boundaries.
- Every total can be traced to its underlying cases.
- Reports can be filtered by date and exported.
- Pilot progress counts responsibly closed cases, not merely submitted cases.

## Cross-module requirements

- Every material create, update, decision, transition, upload, and payment action generates an audit event.
- Personally identifiable, medical, financial, and banking information is access-controlled.
- Soft deletion or archival is used for governed records; closed cases are not silently removed.
- Dates are stored in UTC and displayed in the user’s local timezone.
- Workflow validation is enforced on the server.
- Notifications are triggered by handoffs, missing information, overdue work, approval, payment, and closure.
