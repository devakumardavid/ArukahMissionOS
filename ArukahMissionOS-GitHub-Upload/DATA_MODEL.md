# Core Domain Model

## Primary entities

### User

Internal authenticated staff member.

Key fields:

- id
- name
- email
- phone
- role
- account status
- MFA status
- last login
- created at

### Beneficiary

Person receiving or requesting support.

Key fields:

- id
- display/reference number
- legal and preferred name
- date of birth
- gender, where required
- phone and email
- address and geography
- income and household summary
- vulnerability notes
- verification status
- duplicate-review status

### Household Member

- beneficiary id
- name
- relationship
- age
- occupation or education status
- dependency notes

### Case

Private operational record for one assistance request.

Key fields:

- id and case number
- beneficiary id
- category
- title and description
- requested amount
- approved amount
- urgency and priority score
- current stage and status
- case manager id
- verifier id
- target dates
- rejection or closure reason
- created and closed timestamps

### Case Transition

Immutable lifecycle history.

Key fields:

- case id
- from stage
- to stage
- actor id
- reason
- timestamp

### Document

- id
- case, beneficiary, provider, or payment owner
- document type
- storage reference
- version
- verification status
- uploaded by
- reviewed by
- review notes
- timestamps

### Verification

- case id
- assigned verifier
- checklist result
- identity result
- income result
- need result
- provider result
- field visit required/completed
- risk level
- risk flags
- duplicate result
- recommendation
- rationale
- completion timestamp

### Provider

- id
- legal and display name
- provider type
- contact details
- address and service area
- verification status
- banking-data secure reference
- service catalogue
- notes

### Provider Quote

- case id
- provider id
- quoted amount
- service description
- quote/invoice document
- validity period
- selection status and rationale

### Approval

- case id
- decision
- approved amount
- approver id
- authority level
- conditions
- reason
- timestamp

### Payment

- case id
- provider id
- quote/invoice id
- amount
- method
- payment date
- UTR/reference
- approval status
- reconciliation status
- recorded and reconciled by
- timestamps

### Impact Record

- case id
- delivery status and date
- outcome summary
- beneficiary acknowledgement
- follow-up required
- evidence documents
- recorded by
- timestamp

### Audit Event

- actor id
- action
- entity type and id
- before/after summary
- IP or session reference where appropriate
- timestamp

## Later-phase entities

These should not drive the Phase 1 database design, but the model should leave room for them:

- Volunteer and assignment
- Donor and giving preference
- Cause publication
- Donation and funding allocation
- Mission and contributor
- Organization/tenant
- Notification and message
- AI assessment and human disposition

## Privacy boundary

The public or donor-facing `Cause` must be generated from approved case information through an explicit publication step. It must not expose private beneficiary, household, document, financial, medical, or precise-location data by default.

