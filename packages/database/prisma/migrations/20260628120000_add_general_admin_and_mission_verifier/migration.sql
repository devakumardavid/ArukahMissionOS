-- Add the two role values needed for the five-role Arukah operating model.
ALTER TYPE "StaffRole" ADD VALUE IF NOT EXISTS 'GENERAL_ADMIN';
ALTER TYPE "StaffRole" ADD VALUE IF NOT EXISTS 'MISSION_VERIFIER';
