# Donor Portal Prototype

The donor layer is a separate experience from internal case management. It is available by selecting the Donor role in the local prototype.

## Included features

### Donor Portal

- Annual mission budget summary
- Funds allocated
- Causes supported
- Completed impact count
- Recommended causes

### Mission Creation

- Mission name and goal
- Annual budget
- Geography
- Multiple focus categories
- Remaining-budget tracking

### Mission Budgeting

- Allocation totals per mission
- Remaining budget
- Budget utilization percentage
- Contribution count
- Prevention of over-allocation

### Cause Marketplace

- Only verified, explicitly published causes
- Privacy-safe titles and summaries
- Category and general location
- Verified amount, funding progress, and outcome goal
- No beneficiary identity, documents, medical details, or precise address

### Recommendations

The prototype uses an explainable rules engine rather than a generative AI model:

- Verification baseline: 30%
- Category match: 35%
- Geography match: 20%
- Urgency: 10%
- Remaining-budget fit: 5%

Each recommendation displays its match reasons. A later AI service can improve ranking, but it must preserve explanations and human governance.

### Impact Reports

- Contribution linked to its donor mission
- Cause outcome goal
- Contribution amount
- Internal source-case progress
- Completed-impact ratio

## Data boundary

`publishedCauses` is separate from private `missions`/case records. The donor experience never renders beneficiary names, household details, private notes, documents, invoices, medical information, or precise addresses.

## Prototype limitations

- Browser-local data only
- No real payment gateway
- No actual donor authentication
- No public publishing approval screen yet
- No email receipts or tax documentation
- No production AI model

