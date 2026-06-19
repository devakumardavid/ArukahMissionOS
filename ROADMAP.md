# Implementation Roadmap

## Milestone 0 — Product foundation

Status: in progress

- Product vision and scope
- Case lifecycle
- Role and permission model
- Core data model
- Local interactive prototype

Exit condition: stakeholders agree on the Phase 1 workflow and terminology.

## Milestone 1 — Application foundation

- Convert the prototype into a structured web application
- Development environment and migrations
- PostgreSQL database
- Staff authentication
- Server-side RBAC
- Seed data and test accounts
- Base layout and navigation

Exit condition: each internal role can sign in and sees only authorized routes and actions.

## Milestone 2 — Intake and beneficiary records

- Beneficiary profiles and households
- Case creation
- Category, urgency, amount, and assignment
- Secure document upload
- Case list, filters, search, and detail workspace
- Duplicate-review marker

Exit condition: a case manager can capture a real submitted need without relying on a parallel spreadsheet.

## Milestone 3 — Verification and approval

- Verification assignments
- Configurable checklist
- Document review
- Field-visit report
- Risk and duplicate flags
- Recommendation
- Approval/rejection with reason
- Transition audit history

Exit condition: one case can move from submission to a fully auditable approval decision.

## Milestone 4 — Provider and payment

- Provider registry and verification
- Quotes and invoices
- Provider selection rationale
- Payment approval
- Payment and UTR recording
- Invoice match and reconciliation
- Financial report

Exit condition: an approved case can be paid directly to a provider and reconciled.

## Milestone 5 — Impact and closure

- Delivery confirmation
- Impact evidence
- Outcome and follow-up
- Closure checklist and validation
- Locked closed-case state
- Case summary report

Exit condition: the complete seven-stage workflow works end to end.

## Milestone 6 — Pilot operations

- Operational dashboard
- Overdue and exception queues
- Time-in-stage metrics
- Category and geography reporting
- Audit export
- Data backup and recovery procedure
- Security and privacy review
- Staff onboarding guide

Exit condition: Arukah can safely process the first live pilot cohort.

## Milestone 7 — 50–100 case review

- Analyze stage times and bottlenecks
- Review rejection, duplication, and fraud patterns
- Review provider performance
- Review payment exceptions
- Validate required documents and checklist design
- Document standard operating procedures
- Decide which participant portal should be built next

Exit condition: evidence supports investment in Phase 2.

## Build order

The next implementation slice should be:

**Staff authentication → database-backed beneficiary → database-backed case → audit event**

This creates the security and data foundation required by every later module.

