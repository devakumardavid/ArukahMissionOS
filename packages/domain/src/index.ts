export const staffRoles = [
  "SUPER_ADMIN",
  "CASE_MANAGER",
  "VERIFIER",
  "FINANCE_MANAGER"
] as const;

export type StaffRole = (typeof staffRoles)[number];

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
