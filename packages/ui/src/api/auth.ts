export interface AdminIdentity {
  id: string;
  username: string;
  role: "ADMIN";
}

let session: AdminIdentity | null = null;

export async function login(username: string, password: string): Promise<boolean> {
  if (username === "admin" && password === "admin1234!") {
    session = { id: "admin-1", username: "admin", role: "ADMIN" };
    return true;
  }

  return false;
}

export async function logout(): Promise<void> {
  session = null;
}

export async function me(): Promise<AdminIdentity | null> {
  return session;
}
