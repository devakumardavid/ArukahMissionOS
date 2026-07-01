export const staffRoles = [
  "SUPER_ADMIN",
  "GENERAL_ADMIN",
  "CASE_MANAGER",
  "MISSION_VERIFIER",
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
