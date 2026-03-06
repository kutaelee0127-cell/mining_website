import { UserRepository } from "../user/UserRepository";

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  ok: boolean;
  status: 200 | 401;
  accessToken?: string;
  user?: {
    id: string;
    username: string;
    role: "ADMIN";
  };
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  login(input: LoginInput): LoginResult {
    const user = this.users.findByUsername(input.username);
    if (!user || user.password !== input.password) {
      return { ok: false, status: 401 };
    }

    return {
      ok: true,
      status: 200,
      accessToken: `token-${user.id}`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  logout(): { status: 204 } {
    return { status: 204 };
  }
}
