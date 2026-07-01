import { apiUrl, type AuthSession, type StaffRole } from "./auth";

export type AccessPermission = {
  key: string;
  label: string;
  description: string;
};

export type AccessRole = {
  key: StaffRole;
  label: string;
};

export type AccessManagementMatrix = {
  roles: AccessRole[];
  permissions: AccessPermission[];
  matrix: Record<StaffRole, Record<string, boolean>>;
};

async function accessRequest<T>(
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

export function getAccessManagementMatrix(
  session: AuthSession
): Promise<AccessManagementMatrix> {
  return accessRequest("/access-management", session);
}

export function updateRolePermissions(
  session: AuthSession,
  role: StaffRole,
  permissions: Record<string, boolean>
): Promise<AccessManagementMatrix> {
  return accessRequest(`/access-management/roles/${role}`, session, {
    method: "PATCH",
    body: JSON.stringify({ permissions })
  });
}
