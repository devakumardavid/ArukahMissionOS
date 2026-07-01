CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" "StaffRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RolePermission_role_permission_key" ON "RolePermission"("role", "permission");
CREATE INDEX "RolePermission_role_idx" ON "RolePermission"("role");
CREATE INDEX "RolePermission_permission_idx" ON "RolePermission"("permission");

INSERT INTO "RolePermission" ("role", "permission", "enabled")
VALUES
  ('SUPER_ADMIN', 'software.manage', true),
  ('SUPER_ADMIN', 'access.manage', true),
  ('SUPER_ADMIN', 'directory.manage', true),
  ('SUPER_ADMIN', 'beneficiaries.manage', true),
  ('SUPER_ADMIN', 'cases.submit', true),
  ('SUPER_ADMIN', 'cases.update', true),
  ('SUPER_ADMIN', 'cases.close', true),
  ('SUPER_ADMIN', 'verification.submit', true),
  ('SUPER_ADMIN', 'payments.approve', true),
  ('SUPER_ADMIN', 'payments.reconcile', true),
  ('SUPER_ADMIN', 'reports.view', true),

  ('GENERAL_ADMIN', 'software.manage', false),
  ('GENERAL_ADMIN', 'access.manage', false),
  ('GENERAL_ADMIN', 'directory.manage', true),
  ('GENERAL_ADMIN', 'beneficiaries.manage', false),
  ('GENERAL_ADMIN', 'cases.submit', false),
  ('GENERAL_ADMIN', 'cases.update', false),
  ('GENERAL_ADMIN', 'cases.close', false),
  ('GENERAL_ADMIN', 'verification.submit', false),
  ('GENERAL_ADMIN', 'payments.approve', false),
  ('GENERAL_ADMIN', 'payments.reconcile', false),
  ('GENERAL_ADMIN', 'reports.view', true),

  ('CASE_MANAGER', 'software.manage', false),
  ('CASE_MANAGER', 'access.manage', false),
  ('CASE_MANAGER', 'directory.manage', false),
  ('CASE_MANAGER', 'beneficiaries.manage', true),
  ('CASE_MANAGER', 'cases.submit', true),
  ('CASE_MANAGER', 'cases.update', true),
  ('CASE_MANAGER', 'cases.close', true),
  ('CASE_MANAGER', 'verification.submit', false),
  ('CASE_MANAGER', 'payments.approve', false),
  ('CASE_MANAGER', 'payments.reconcile', false),
  ('CASE_MANAGER', 'reports.view', true),

  ('MISSION_VERIFIER', 'software.manage', false),
  ('MISSION_VERIFIER', 'access.manage', false),
  ('MISSION_VERIFIER', 'directory.manage', false),
  ('MISSION_VERIFIER', 'beneficiaries.manage', false),
  ('MISSION_VERIFIER', 'cases.submit', false),
  ('MISSION_VERIFIER', 'cases.update', false),
  ('MISSION_VERIFIER', 'cases.close', false),
  ('MISSION_VERIFIER', 'verification.submit', true),
  ('MISSION_VERIFIER', 'payments.approve', false),
  ('MISSION_VERIFIER', 'payments.reconcile', false),
  ('MISSION_VERIFIER', 'reports.view', true),

  ('FINANCE_MANAGER', 'software.manage', false),
  ('FINANCE_MANAGER', 'access.manage', false),
  ('FINANCE_MANAGER', 'directory.manage', false),
  ('FINANCE_MANAGER', 'beneficiaries.manage', false),
  ('FINANCE_MANAGER', 'cases.submit', false),
  ('FINANCE_MANAGER', 'cases.update', false),
  ('FINANCE_MANAGER', 'cases.close', false),
  ('FINANCE_MANAGER', 'verification.submit', false),
  ('FINANCE_MANAGER', 'payments.approve', true),
  ('FINANCE_MANAGER', 'payments.reconcile', true),
  ('FINANCE_MANAGER', 'reports.view', true)
ON CONFLICT ("role", "permission") DO NOTHING;
