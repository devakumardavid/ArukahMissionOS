-- Add explicit permissions for the revised Super Admin responsibility split.
INSERT INTO "RolePermission" ("role", "permission", "enabled")
SELECT role_value, permission_value, false
FROM (
  VALUES
    ('SUPER_ADMIN'::"StaffRole"),
    ('GENERAL_ADMIN'::"StaffRole"),
    ('CASE_MANAGER'::"StaffRole"),
    ('MISSION_VERIFIER'::"StaffRole"),
    ('FINANCE_MANAGER'::"StaffRole")
) roles(role_value)
CROSS JOIN (
  VALUES
    ('accounts.manage'),
    ('workflow.override')
) permissions(permission_value)
ON CONFLICT ("role", "permission") DO NOTHING;

-- Super Admin is system ownership: accounts, access, software, and exceptional workflow override.
UPDATE "RolePermission"
SET "enabled" = ("permission" IN (
  'software.manage',
  'access.manage',
  'accounts.manage',
  'workflow.override',
  'reports.view'
))
WHERE "role" = 'SUPER_ADMIN';

-- General Admin owns regular operations.
UPDATE "RolePermission"
SET "enabled" = ("permission" IN (
  'directory.manage',
  'beneficiaries.manage',
  'cases.submit',
  'cases.update',
  'cases.close',
  'verification.submit',
  'payments.approve',
  'payments.reconcile',
  'reports.view'
))
WHERE "role" = 'GENERAL_ADMIN';

-- Focused role defaults remain narrow.
UPDATE "RolePermission"
SET "enabled" = ("permission" IN (
  'beneficiaries.manage',
  'cases.submit',
  'cases.update',
  'cases.close',
  'reports.view'
))
WHERE "role" = 'CASE_MANAGER';

UPDATE "RolePermission"
SET "enabled" = ("permission" IN (
  'verification.submit',
  'reports.view'
))
WHERE "role" = 'MISSION_VERIFIER';

UPDATE "RolePermission"
SET "enabled" = ("permission" IN (
  'payments.approve',
  'payments.reconcile',
  'reports.view'
))
WHERE "role" = 'FINANCE_MANAGER';
