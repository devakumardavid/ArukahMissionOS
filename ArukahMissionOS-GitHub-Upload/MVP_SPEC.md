# Phase 1 MVP Specification

## Scope

Phase 1 is an internal-use case-management platform. It is not a donor marketplace, public cause directory, multi-tenant SaaS product, or mobile application.

## Internal roles

### Super Admin

- Manage staff accounts and roles
- Configure categories, thresholds, and workflow settings
- View all cases and reports
- Review audit activity
- Intervene in exceptional cases

### Case Manager

- Create and update beneficiary records
- Create cases and request documents
- Assign verification work
- Review verification recommendations
- Approve or reject within authority limits
- Select providers
- Track delivery and impact
- Close cases

### Verifier

- View assigned cases
- Review identity and supporting documents
- Complete verification checklist
- Perform or record field verification
- Validate provider and quoted amount
- Record risks and duplicate concerns
- Recommend approval, rejection, or more information

### Finance Manager

- View approved cases with selected providers
- Review invoice and approval information
- Record direct provider payment
- Store UTR/payment reference
- Match payment to invoice
- Reconcile or flag discrepancies
- Produce financial reports

## Case lifecycle

1. **Need submitted**
   - Beneficiary and contact details captured
   - Need category, description, amount, urgency, and location captured
   - Required documents identified

2. **Verification**
   - Verifier assigned
   - Identity, income, need, amount, and provider evidence reviewed
   - Duplicate and risk checks recorded
   - Recommendation submitted

3. **Approval**
   - Authorized case manager or trustee reviews recommendation
   - Decision, approved amount, conditions, and reason recorded
   - Rejected cases retain their audit history

4. **Provider selection**
   - Verified provider selected
   - Quote or invoice attached
   - Service, amount, delivery expectation, and bank details confirmed

5. **Payment**
   - Payment approval recorded
   - Direct provider payment recorded
   - UTR/reference, date, amount, invoice match, and reconciliation status stored

6. **Impact tracking**
   - Delivery confirmation received
   - Photos, documents, outcome notes, or testimonials stored as appropriate
   - Exceptions and follow-up actions recorded

7. **Case closure**
   - Required evidence complete
   - Financial record reconciled
   - Closure summary and outcome recorded
   - Case locked against routine edits

## MVP modules

The detailed requirements and acceptance criteria for these areas are maintained in [MODULES.md](MODULES.md).

### Authentication & staff access

- Email/password or OTP login
- Staff invitation
- Role assignment
- Account active/suspended status
- Session management
- Server-side permission enforcement

### Beneficiaries

- Individual and family profile
- Contact and location details
- Income and vulnerability notes
- Identity references
- Support and case history
- Duplicate-review flag

### Cases

- Case number
- Category and urgency
- Requested and approved amounts
- Current lifecycle state
- Assigned case manager and verifier
- Target dates
- Internal notes and tasks
- Complete transition history

### Documents

- Secure upload
- Document type and owner
- Version and verification status
- Reviewer, review date, and notes
- Access logging

### Verification

- Configurable checklist
- Evidence status
- Field visit report
- Risk level and flags
- Recommendation and rationale

### Providers

- Provider profile and type
- Contact and location
- Verification status
- Banking-data reference
- Quotes, invoices, and delivery records
- Previous case history

### Payments

- Approved amount
- Payee/provider
- Invoice reference
- Payment date and method
- UTR/payment reference
- Reconciliation status
- Finance notes

### Impact & closure

- Delivery confirmation
- Outcome description
- Evidence files
- Beneficiary acknowledgement
- Closure checklist
- Closure date and actor

### Audit & reporting

- Immutable activity log
- Case funnel by stage
- Average time per stage
- Cases by category, geography, and urgency
- Approved, rejected, paid, and closed totals
- Payment reconciliation report
- Missing-document and overdue-case reports

## MVP acceptance criteria

A real case can be considered fully supported when:

- Staff can create it and assign responsible users.
- Required documents can be uploaded and reviewed securely.
- A verifier can complete a checklist and recommendation.
- An authorized user can approve or reject with a reason.
- A validated provider and invoice can be selected.
- Finance can record and reconcile direct payment.
- Staff can upload delivery and outcome evidence.
- The case cannot close while required financial or impact evidence is missing.
- Every action appears in an audit history.
- Reports reflect the case without manual spreadsheet duplication.

## Explicitly deferred

- Public registration
- Donor accounts and cause discovery
- Donations and payment-gateway collection
- Mission subscriptions
- Public success stories
- Volunteer marketplace
- Provider bidding marketplace
- Native mobile applications
- Multi-tenant and white-label support
- Automated AI decisions
