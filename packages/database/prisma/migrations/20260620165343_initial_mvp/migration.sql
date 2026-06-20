-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('SUPER_ADMIN', 'CASE_MANAGER', 'VERIFIER', 'FINANCE_MANAGER');

-- CreateEnum
CREATE TYPE "BeneficiaryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CaseStage" AS ENUM ('SUBMITTED', 'VERIFICATION', 'APPROVED', 'PROVIDER_SELECTION', 'PAYMENT', 'IMPACT', 'CLOSED', 'REJECTED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'ASSIGNED', 'TRANSITIONED', 'APPROVED', 'REJECTED', 'VIEWED', 'EXPORTED', 'LOGIN', 'LOGOUT', 'TENANT_SWITCHED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "authSubject" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "StaffRole" NOT NULL DEFAULT 'CASE_MANAGER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" UUID NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "preferredName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" CHAR(2) NOT NULL DEFAULT 'IN',
    "status" "BeneficiaryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" UUID NOT NULL,
    "beneficiaryId" UUID NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestedAmountMinor" BIGINT NOT NULL,
    "approvedAmountMinor" BIGINT,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "urgency" "Urgency" NOT NULL DEFAULT 'NORMAL',
    "stage" "CaseStage" NOT NULL DEFAULT 'SUBMITTED',
    "caseManagerId" UUID,
    "verifierId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseTransition" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "fromStage" "CaseStage",
    "toStage" "CaseStage" NOT NULL,
    "actorUserId" UUID NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" JSONB,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authSubject_key" ON "User"("authSubject");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_referenceCode_key" ON "Beneficiary"("referenceCode");

-- CreateIndex
CREATE INDEX "Beneficiary_preferredName_idx" ON "Beneficiary"("preferredName");

-- CreateIndex
CREATE INDEX "Beneficiary_phone_idx" ON "Beneficiary"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_stage_idx" ON "Case"("stage");

-- CreateIndex
CREATE INDEX "Case_beneficiaryId_idx" ON "Case"("beneficiaryId");

-- CreateIndex
CREATE INDEX "Case_caseManagerId_idx" ON "Case"("caseManagerId");

-- CreateIndex
CREATE INDEX "Case_verifierId_idx" ON "Case"("verifierId");

-- CreateIndex
CREATE INDEX "CaseTransition_caseId_createdAt_idx" ON "CaseTransition"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseTransition_actorUserId_idx" ON "CaseTransition"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_caseManagerId_fkey" FOREIGN KEY ("caseManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTransition" ADD CONSTRAINT "CaseTransition_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTransition" ADD CONSTRAINT "CaseTransition_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
