export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  role:
    | "SUPER_ADMIN"
    | "GENERAL_ADMIN"
    | "CASE_MANAGER"
    | "MISSION_VERIFIER"
    | "FINANCE_MANAGER";
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: AuthenticatedUser["role"];
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: AuthenticatedUser;
};
