CREATE TYPE "SupplierVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

ALTER TABLE "Supplier"
ADD COLUMN "verificationStatus" "SupplierVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "verificationNotes" TEXT,
ADD COLUMN "verifiedAt" TIMESTAMP(3),
ADD COLUMN "verifiedById" UUID;

ALTER TABLE "Supplier"
ADD CONSTRAINT "Supplier_verifiedById_fkey"
FOREIGN KEY ("verifiedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Supplier_verificationStatus_idx" ON "Supplier"("verificationStatus");
CREATE INDEX "Supplier_verifiedById_idx" ON "Supplier"("verifiedById");
