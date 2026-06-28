CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "IndiaState" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'STATE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndiaState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndiaCity" (
    "id" UUID NOT NULL,
    "stateId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndiaCity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndiaState_code_key" ON "IndiaState"("code");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaState_name_key" ON "IndiaState"("name");

-- CreateIndex
CREATE INDEX "IndiaState_active_sortOrder_idx" ON "IndiaState"("active", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "IndiaCity_stateId_name_key" ON "IndiaCity"("stateId", "name");

-- CreateIndex
CREATE INDEX "IndiaCity_stateId_active_sortOrder_idx" ON "IndiaCity"("stateId", "active", "sortOrder");

-- AddForeignKey
ALTER TABLE "IndiaCity" ADD CONSTRAINT "IndiaCity_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "IndiaState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed all Indian states and union territories.
INSERT INTO "IndiaState" ("id", "code", "name", "kind", "sortOrder")
VALUES
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1001', 'AP', 'Andhra Pradesh', 'STATE', 10),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1002', 'AR', 'Arunachal Pradesh', 'STATE', 20),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1003', 'AS', 'Assam', 'STATE', 30),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1004', 'BR', 'Bihar', 'STATE', 40),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1005', 'CT', 'Chhattisgarh', 'STATE', 50),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1006', 'GA', 'Goa', 'STATE', 60),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1007', 'GJ', 'Gujarat', 'STATE', 70),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1008', 'HR', 'Haryana', 'STATE', 80),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1009', 'HP', 'Himachal Pradesh', 'STATE', 90),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1010', 'JH', 'Jharkhand', 'STATE', 100),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1011', 'KA', 'Karnataka', 'STATE', 110),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1012', 'KL', 'Kerala', 'STATE', 120),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1013', 'MP', 'Madhya Pradesh', 'STATE', 130),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1014', 'MH', 'Maharashtra', 'STATE', 140),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1015', 'MN', 'Manipur', 'STATE', 150),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1016', 'ML', 'Meghalaya', 'STATE', 160),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1017', 'MZ', 'Mizoram', 'STATE', 170),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1018', 'NL', 'Nagaland', 'STATE', 180),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1019', 'OD', 'Odisha', 'STATE', 190),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1020', 'PB', 'Punjab', 'STATE', 200),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1021', 'RJ', 'Rajasthan', 'STATE', 210),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1022', 'SK', 'Sikkim', 'STATE', 220),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1023', 'TN', 'Tamil Nadu', 'STATE', 230),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1024', 'TG', 'Telangana', 'STATE', 240),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1025', 'TR', 'Tripura', 'STATE', 250),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1026', 'UP', 'Uttar Pradesh', 'STATE', 260),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1027', 'UK', 'Uttarakhand', 'STATE', 270),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1028', 'WB', 'West Bengal', 'STATE', 280),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1029', 'AN', 'Andaman and Nicobar Islands', 'UNION_TERRITORY', 290),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1030', 'CH', 'Chandigarh', 'UNION_TERRITORY', 300),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1031', 'DN', 'Dadra and Nagar Haveli and Daman and Diu', 'UNION_TERRITORY', 310),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1032', 'DL', 'Delhi', 'UNION_TERRITORY', 320),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1033', 'JK', 'Jammu and Kashmir', 'UNION_TERRITORY', 330),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1034', 'LA', 'Ladakh', 'UNION_TERRITORY', 340),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1035', 'LD', 'Lakshadweep', 'UNION_TERRITORY', 350),
  ('7a3a80f1-0f3e-4207-8cbb-9ef594ba1036', 'PY', 'Puducherry', 'UNION_TERRITORY', 360)
ON CONFLICT ("code") DO NOTHING;

-- Seed Tamil Nadu cities and common service locations.
INSERT INTO "IndiaCity" ("id", "stateId", "name", "sortOrder")
SELECT gen_random_uuid(), state."id", city."name", city."sortOrder"
FROM "IndiaState" state
CROSS JOIN (
  VALUES
    ('Chennai', 10),
    ('Coimbatore', 20),
    ('Madurai', 30),
    ('Tiruchirappalli', 40),
    ('Salem', 50),
    ('Tiruppur', 60),
    ('Erode', 70),
    ('Tirunelveli', 80),
    ('Vellore', 90),
    ('Thoothukudi', 100),
    ('Thanjavur', 110),
    ('Dindigul', 120),
    ('Hosur', 130),
    ('Nagercoil', 140),
    ('Kanchipuram', 150),
    ('Cuddalore', 160),
    ('Karur', 170),
    ('Sivakasi', 180),
    ('Kumbakonam', 190),
    ('Avadi', 200),
    ('Tambaram', 210),
    ('Ranipet', 220),
    ('Udhagamandalam', 230),
    ('Ariyalur', 240),
    ('Chengalpattu', 250),
    ('Dharmapuri', 260),
    ('Kallakurichi', 270),
    ('Krishnagiri', 280),
    ('Mayiladuthurai', 290),
    ('Nagapattinam', 300),
    ('Namakkal', 310),
    ('Perambalur', 320),
    ('Pudukkottai', 330),
    ('Ramanathapuram', 340),
    ('Tenkasi', 350),
    ('Theni', 360),
    ('Tirupathur', 370),
    ('Tiruvallur', 380),
    ('Tiruvannamalai', 390),
    ('Tiruvarur', 400),
    ('Viluppuram', 410),
    ('Virudhunagar', 420)
) AS city("name", "sortOrder")
WHERE state."code" = 'TN'
ON CONFLICT ("stateId", "name") DO NOTHING;
