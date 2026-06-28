import { apiUrl, type AuthSession } from "./auth";

export type Beneficiary = {
  id: string;
  referenceCode: string;
  preferredName: string;
  legalName: string;
  email: string | null;
  phone: string | null;
  city: string;
  region: string;
  country: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  activeCaseCount?: number;
};

export type CreatedCase = {
  id: string;
  beneficiaryId: string;
  caseNumber: string;
  title: string;
  category: string;
  description: string;
  requestedAmountMinor: string;
  approvedAmountMinor: string | null;
  currency: string;
  urgency: "NORMAL" | "HIGH" | "URGENT";
  stage:
    | "SUBMITTED"
    | "VERIFICATION"
    | "APPROVED"
    | "PROVIDER_SELECTION"
    | "PAYMENT"
    | "IMPACT"
    | "CLOSED"
    | "REJECTED"
    | "ON_HOLD";
  caseManagerId: string | null;
  verifierId: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  beneficiary: Beneficiary;
  caseManager: {
    id: string;
    displayName: string;
    email: string;
    role: string;
  } | null;
  verifier: {
    id: string;
    displayName: string;
    email: string;
    role: string;
  } | null;
  transitionCount: number;
};

export type CaseListResponse = {
  data: CreatedCase[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type CaseCategory = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
};

export type IndiaState = {
  id: string;
  code: string;
  name: string;
  kind: string;
  active: boolean;
  sortOrder: number;
};

export type IndiaCity = {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  state: {
    id: string;
    code: string;
    name: string;
  };
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

export type UpdateBeneficiaryInput = Partial<BeneficiaryInput>;

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

export type UpdateCaseInput = Partial<CaseInput> & {
  stage?: CreatedCase["stage"];
};

export type VerificationInput = {
  outcome: "APPROVE" | "REJECT" | "HOLD";
  notes: string;
  approvedAmountMinor?: number;
};

export type PaymentInput = {
  paidAmountMinor?: number;
  paidOn?: string;
  payeeName: string;
  paymentReference: string;
  notes: string;
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

export function updateBeneficiary(
  session: AuthSession,
  id: string,
  input: UpdateBeneficiaryInput
): Promise<Beneficiary> {
  return authenticatedRequest(`/beneficiaries/${id}`, session, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function archiveBeneficiary(
  session: AuthSession,
  id: string
): Promise<void> {
  return authenticatedRequest(`/beneficiaries/${id}`, session, {
    method: "DELETE"
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

export function listCases(session: AuthSession): Promise<CaseListResponse> {
  return authenticatedRequest("/cases?limit=100", session);
}

export function listCaseCategories(session: AuthSession): Promise<CaseCategory[]> {
  return authenticatedRequest("/case-categories", session);
}

export function listIndiaStates(session: AuthSession): Promise<IndiaState[]> {
  return authenticatedRequest("/locations/states", session);
}

export function listIndiaCities(
  session: AuthSession,
  stateCode?: string
): Promise<IndiaCity[]> {
  const query = stateCode ? `?stateCode=${encodeURIComponent(stateCode)}` : "";
  return authenticatedRequest(`/locations/cities${query}`, session);
}

export function updateCase(
  session: AuthSession,
  id: string,
  input: UpdateCaseInput
): Promise<CreatedCase> {
  return authenticatedRequest(`/cases/${id}`, session, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteCase(session: AuthSession, id: string): Promise<void> {
  return authenticatedRequest(`/cases/${id}`, session, {
    method: "DELETE"
  });
}

export function submitVerification(
  session: AuthSession,
  id: string,
  input: VerificationInput
): Promise<CreatedCase> {
  return authenticatedRequest(`/cases/${id}/verification`, session, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function submitPayment(
  session: AuthSession,
  id: string,
  input: PaymentInput
): Promise<CreatedCase> {
  return authenticatedRequest(`/cases/${id}/payment`, session, {
    method: "POST",
    body: JSON.stringify(input)
  });
}
