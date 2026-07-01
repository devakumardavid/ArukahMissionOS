import { apiUrl, type AuthSession, type StaffRole } from "./auth";

export type TeamMember = {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  staffType: "EMPLOYEE" | "ASSOCIATE";
  title: string | null;
  organization: string | null;
  role: StaffRole;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  serviceType: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string;
  region: string;
  notes: string | null;
  active: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verificationNotes: string | null;
  verifiedAt: string | null;
  verifiedById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamMemberInput = {
  displayName: string;
  email: string;
  phone?: string;
  staffType: "EMPLOYEE" | "ASSOCIATE";
  title?: string;
  organization?: string;
  role: StaffRole;
  password?: string;
};

export type TeamMemberUpdateInput = Partial<TeamMemberInput>;

export type SupplierInput = {
  name: string;
  serviceType: string;
  contactName?: string;
  email?: string;
  phone?: string;
  city: string;
  region: string;
  notes?: string;
};

export type SupplierUpdateInput = Partial<SupplierInput>;

export type SupplierVerificationInput = {
  status: "VERIFIED" | "REJECTED";
  notes?: string;
};

async function directoryRequest<T>(
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
    throw new Error(Array.isArray(message) ? message[0] : message ?? "Request failed");
  }

  return body as T;
}

export function listTeamMembers(session: AuthSession): Promise<TeamMember[]> {
  return directoryRequest("/directory/team", session);
}

export function createTeamMember(
  session: AuthSession,
  input: TeamMemberInput
): Promise<TeamMember> {
  return directoryRequest("/directory/team", session, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateTeamMember(
  session: AuthSession,
  id: string,
  input: TeamMemberUpdateInput
): Promise<TeamMember> {
  return directoryRequest(`/directory/team/${id}`, session, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteTeamMember(
  session: AuthSession,
  id: string
): Promise<void> {
  return directoryRequest(`/directory/team/${id}`, session, {
    method: "DELETE"
  });
}

export function listSuppliers(session: AuthSession): Promise<Supplier[]> {
  return directoryRequest("/directory/suppliers", session);
}

export function createSupplier(
  session: AuthSession,
  input: SupplierInput
): Promise<Supplier> {
  return directoryRequest("/directory/suppliers", session, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateSupplier(
  session: AuthSession,
  id: string,
  input: SupplierUpdateInput
): Promise<Supplier> {
  return directoryRequest(`/directory/suppliers/${id}`, session, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteSupplier(
  session: AuthSession,
  id: string
): Promise<void> {
  return directoryRequest(`/directory/suppliers/${id}`, session, {
    method: "DELETE"
  });
}

export function verifySupplier(
  session: AuthSession,
  id: string,
  input: SupplierVerificationInput
): Promise<Supplier> {
  return directoryRequest(`/directory/suppliers/${id}/verification`, session, {
    method: "POST",
    body: JSON.stringify(input)
  });
}
