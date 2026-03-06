export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: "ADMIN";
}

const defaultAdmin: AdminUser = {
  id: "admin-1",
  username: "admin",
  password: "admin1234!",
  role: "ADMIN",
};

export class UserRepository {
  private readonly users = new Map<string, AdminUser>([[defaultAdmin.username, defaultAdmin]]);

  findByUsername(username: string): AdminUser | null {
    return this.users.get(username) ?? null;
  }
}
