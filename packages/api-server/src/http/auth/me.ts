import { requireAdmin, type RequestLike } from "../middleware/auth";

export function getAdminMe(request: RequestLike) {
  try {
    requireAdmin(request);
    return {
      status: 200,
      body: {
        user: {
          id: "admin-1",
          username: "admin",
          role: "ADMIN",
        },
      },
    };
  } catch {
    return {
      status: 401,
      body: {
        code: "AUTH_REQUIRED",
        message: "Not authenticated",
      },
    };
  }
}
