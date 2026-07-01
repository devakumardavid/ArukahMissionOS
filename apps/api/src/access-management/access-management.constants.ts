import type { AuthenticatedUser } from "../auth/auth.types";

export const accessRoles = [
  "SUPER_ADMIN",
  "GENERAL_ADMIN",
  "CASE_MANAGER",
  "MISSION_VERIFIER",
  "FINANCE_MANAGER"
] as const satisfies AuthenticatedUser["role"][];

export const accessPermissionCatalog = [
  {
    key: "software.manage",
    label: "Manage software",
    description: "Configure application-level settings and Super Admin access."
  },
  {
    key: "access.manage",
    label: "Manage access",
    description: "Change role permission checkboxes in Access Management."
  },
  {
    key: "accounts.manage",
    label: "Create staff accounts",
    description: "Create, edit, deactivate, and protect staff login accounts."
  },
  {
    key: "workflow.override",
    label: "Override workflow status",
    description: "Move a case directly from one status to another when an exception requires it."
  },
  {
    key: "directory.manage",
    label: "Manage directory",
    description: "Create, edit, and delete employees, associates, suppliers, and providers."
  },
  {
    key: "beneficiaries.manage",
    label: "Manage beneficiaries",
    description: "Create, edit, and archive beneficiary records."
  },
  {
    key: "cases.submit",
    label: "Submit cases",
    description: "Create new cases for beneficiaries."
  },
  {
    key: "cases.update",
    label: "Update cases",
    description: "Edit intake details, assignments, and operational case data."
  },
  {
    key: "cases.close",
    label: "Close cases",
    description: "Complete case closure after delivery and impact evidence."
  },
  {
    key: "verification.submit",
    label: "Submit verification",
    description: "Verify beneficiary authenticity and need, then submit a recommendation."
  },
  {
    key: "payments.approve",
    label: "Approve payments",
    description: "Approve payment readiness and record payment completion."
  },
  {
    key: "payments.reconcile",
    label: "Reconcile payments",
    description: "Match payments to invoice/reference details and flag discrepancies."
  },
  {
    key: "reports.view",
    label: "View reports",
    description: "View operational, verification, payment, and impact reports."
  }
] as const;

export type AccessPermissionKey = (typeof accessPermissionCatalog)[number]["key"];
