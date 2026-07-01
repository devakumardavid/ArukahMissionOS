export type StaffRole =
  | "SUPER_ADMIN"
  | "GENERAL_ADMIN"
  | "CASE_MANAGER"
  | "MISSION_VERIFIER"
  | "FINANCE_MANAGER";

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  role: StaffRole;
};

export type AuthSession = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: AuthenticatedUser;
};

const storageKey = "arukah.auth.session";

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function readSession(): AuthSession | null {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(storageKey);
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const body = (await response.json()) as AuthSession & {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(body.message)
      ? body.message[0]
      : body.message;
    throw new Error(message ?? "Unable to sign in");
  }

  return body;
}

export async function getCurrentUser(
  accessToken: string
): Promise<AuthenticatedUser> {
  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error("Your session has expired");
  }

  return response.json() as Promise<AuthenticatedUser>;
}
