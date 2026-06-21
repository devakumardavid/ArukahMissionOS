import { z } from "zod";

export const createBeneficiarySchema = z.object({
  preferredName: z.string().trim().min(2).max(120),
  legalName: z.string().trim().min(2).max(160),
  email: z.string().email().optional(),
  phone: z.string().trim().min(8).max(30).optional(),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().min(2).max(100),
  country: z.string().trim().length(2).default("IN")
});

export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>;

export const createCaseSchema = z.object({
  beneficiaryId: z.string().uuid(),
  title: z.string().trim().min(4).max(180),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(5000),
  requestedAmountMinor: z.number().int().positive(),
  currency: z.string().trim().length(3).default("INR"),
  urgency: z.enum(["NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  caseManagerId: z.string().uuid().nullable().optional(),
  verifierId: z.string().uuid().nullable().optional()
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;

export const updateCaseSchema = createCaseSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  "At least one case field must be provided"
);

export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
