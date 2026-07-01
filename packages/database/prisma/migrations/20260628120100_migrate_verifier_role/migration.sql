-- Preserve existing verifier users by moving them to the new canonical role name.
UPDATE "User"
SET "role" = 'MISSION_VERIFIER'
WHERE "role" = 'VERIFIER';
