CREATE TABLE "SupportingDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "label" TEXT,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportingDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupportingDocument_entityType_entityId_idx" ON "SupportingDocument"("entityType", "entityId");
CREATE INDEX "SupportingDocument_uploadedById_idx" ON "SupportingDocument"("uploadedById");

ALTER TABLE "SupportingDocument"
ADD CONSTRAINT "SupportingDocument_uploadedById_fkey"
FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
