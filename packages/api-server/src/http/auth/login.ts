import { AuthService } from "../../../../domain/src/auth/AuthService";
import { UserRepository } from "../../../../domain/src/user/UserRepository";

const service = new AuthService(new UserRepository());

export function postAuthLogin(body: { username: string; password: string }) {
  const result = service.login(body);
  if (!result.ok) {
    return {
      status: 401,
      body: {
        code: "AUTH_INVALID_CREDENTIALS",
        message: "Invalid credentials",
      },
    };
  }

  return {
    status: 200,
    body: {
      user: result.user,
      session: {
        access_token: result.accessToken,
      },
    },
  };
}
