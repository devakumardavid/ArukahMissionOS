-- Add lightweight staff profile fields for the operations directory.
ALTER TABLE "User"
ADD COLUMN "staffType" TEXT NOT NULL DEFAULT 'EMPLOYEE',
ADD COLUMN "title" TEXT,
ADD COLUMN "organization" TEXT;

-- Create supplier/provider registry for the operations directory.
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");
CREATE INDEX "Supplier_serviceType_idx" ON "Supplier"("serviceType");
CREATE INDEX "Supplier_active_idx" ON "Supplier"("active");
