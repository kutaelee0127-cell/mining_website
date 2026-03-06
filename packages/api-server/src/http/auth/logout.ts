import { AuthService } from "../../../../domain/src/auth/AuthService";
import { UserRepository } from "../../../../domain/src/user/UserRepository";

const service = new AuthService(new UserRepository());

export function postAuthLogout() {
  const result = service.logout();
  return {
    status: result.status,
    body: null,
  };
}
