export interface RequestLike {
  headers: Record<string, string | undefined>;
}

export interface AuthContext {
  isAdmin: boolean;
}

export function requireAdmin(request: RequestLike): AuthContext {
  const token = request.headers["authorization"] ?? "";
  if (!token.startsWith("Bearer token-admin-1")) {
    throw new Error("AUTH_REQUIRED");
  }

  return { isAdmin: true };
}

export function isAdminRequest(request: RequestLike): boolean {
  const token = request.headers["authorization"] ?? "";
  return token.startsWith("Bearer token-admin-1");
}
