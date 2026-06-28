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
