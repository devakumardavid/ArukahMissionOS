import { apiUrl, type AuthSession } from "./auth";

export type Beneficiary = {
  id: string;
  referenceCode: string;
  preferredName: string;
  legalName: string;
  city: string;
  region: string;
};

export type CreatedCase = {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  requestedAmountMinor: string;
  currency: string;
  urgency: "NORMAL" | "HIGH" | "URGENT";
  stage: string;
  beneficiary: Beneficiary;
};

type BeneficiaryInput = {
  preferredName: string;
  legalName: string;
  email?: string;
  phone?: string;
  city: string;
  region: string;
  country: string;
};

type CaseInput = {
  beneficiaryId: string;
  title: string;
  category: string;
  description: string;
  requestedAmountMinor: number;
  currency: string;
  urgency: "NORMAL" | "HIGH" | "URGENT";
  caseManagerId: string;
};

async function authenticatedRequest<T>(
  path: string,
  session: AuthSession,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...options?.headers
    }
  });
  const body = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const message = (body as { message?: string | string[] } | null)?.message;
    throw new Error(
      Array.isArray(message) ? message[0] : message ?? "Request failed"
    );
  }

  return body as T;
}

export function listBeneficiaries(
  session: AuthSession
): Promise<Beneficiary[]> {
  return authenticatedRequest("/beneficiaries", session);
}

export function createBeneficiary(
  session: AuthSession,
  input: BeneficiaryInput
): Promise<Beneficiary> {
  return authenticatedRequest("/beneficiaries", session, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function createCase(
  session: AuthSession,
  input: CaseInput
): Promise<CreatedCase> {
  return authenticatedRequest("/cases", session, {
    method: "POST",
    body: JSON.stringify(input)
  });
}
