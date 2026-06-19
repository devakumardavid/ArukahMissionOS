export const tenantRoles = [
  "SUPER_ADMIN",
  "CASE_MANAGER",
  "VERIFIER",
  "FINANCE_MANAGER",
  "DONOR"
] as const;

export type TenantRole = (typeof tenantRoles)[number];

export const caseStages = [
  "SUBMITTED",
  "VERIFICATION",
  "APPROVED",
  "PROVIDER_SELECTION",
  "PAYMENT",
  "IMPACT",
  "CLOSED",
  "REJECTED",
  "ON_HOLD"
] as const;

export type CaseStage = (typeof caseStages)[number];
