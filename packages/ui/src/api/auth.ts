export interface AdminIdentity {
  id: string;
  username: string;
  role: "ADMIN";
}

const TOKEN_KEY = "mining_admin_access_token";

let session: AdminIdentity | null = null;

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

function writeAccessToken(token: string | null): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  if (token) {
    storage.setItem(TOKEN_KEY, token);
    return;
  }
  storage.removeItem(TOKEN_KEY);
}

export function readAccessToken(): string {
  const storage = getStorage();
  if (!storage) {
    return "";
  }
  return storage.getItem(TOKEN_KEY) ?? "";
}

export async function login(username: string, password: string): Promise<boolean> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    writeAccessToken(null);
    session = null;
    return false;
  }

  const data = (await response.json()) as { access_token: string; user: AdminIdentity };
  if (typeof data.access_token === "string" && data.user) {
    writeAccessToken(data.access_token);
    session = data.user;
    return true;
  }

  return false;
}

export async function logout(): Promise<void> {
  const token = readAccessToken();
  if (token) {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  writeAccessToken(null);
  session = null;
}

export async function me(): Promise<AdminIdentity | null> {
  if (session) {
    return session;
  }

  const token = readAccessToken();
  if (!token) {
    return null;
  }

  const response = await fetch("/api/admin/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    writeAccessToken(null);
    return null;
  }

  const identity = (await response.json()) as AdminIdentity;
  session = identity;
  return identity;
}
