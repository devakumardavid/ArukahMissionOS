-- Enable UUID helper used for backfilled categories.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "CaseCategory" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseCategory_code_key" ON "CaseCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CaseCategory_name_key" ON "CaseCategory"("name");

-- CreateIndex
CREATE INDEX "CaseCategory_active_sortOrder_idx" ON "CaseCategory"("active", "sortOrder");

-- Seed starter lookup values.
INSERT INTO "CaseCategory" ("id", "code", "name", "description", "sortOrder")
VALUES
  ('2a28d734-8196-4d65-9aa7-6c91bb58e601', 'HEALTHCARE', 'Healthcare', 'Medical care, procedures, medication, and recovery support.', 10),
  ('b4c3ee1b-8737-46e0-806e-9d50912957fe', 'EDUCATION', 'Education', 'School fees, supplies, tuition, and educational continuity.', 20),
  ('f54db574-0242-4be6-88f5-091694c4a9bf', 'EMERGENCY_RELIEF', 'Emergency relief', 'Urgent food, shelter, transport, or crisis stabilization.', 30),
  ('f65bc9c2-a3ec-4cda-9463-c22ae62c5d23', 'LIVELIHOOD', 'Livelihood', 'Work tools, small business support, and income restoration.', 40),
  ('e6119a1d-faf9-4ff3-9b69-df202cb38e94', 'HOUSING', 'Housing', 'Rent, relocation, repairs, or safe accommodation needs.', 50),
  ('964ed5ec-2d4d-44a6-9b26-a27cb78ad82f', 'SPECIAL_NEEDS', 'Special needs', 'Assistive devices, disability support, and specialized care.', 60),
  ('326b0580-80a2-4df1-aaf6-9c2a1fb792cc', 'ELDER_CARE', 'Elder care', 'Support for senior care, safety, and essential needs.', 70),
  ('235bd426-3702-4df0-bdb7-78d80c55e8a8', 'OTHER', 'Other', 'Approved assistance that does not fit another category.', 999)
ON CONFLICT ("code") DO NOTHING;

-- Preserve any existing free-text categories already entered during local testing.
INSERT INTO "CaseCategory" ("id", "code", "name", "description", "sortOrder")
SELECT
  gen_random_uuid(),
  upper(regexp_replace(trim("category"), '[^a-zA-Z0-9]+', '_', 'g')),
  trim("category"),
  'Category backfilled from existing cases.',
  500
FROM "Case"
WHERE trim("category") <> ''
ON CONFLICT ("name") DO NOTHING;
