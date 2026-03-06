import { StyleService } from "../../../../domain/src/style/StyleService";
import { isAdminRequest, type RequestLike } from "../middleware/auth";

const service = new StyleService();

function unauthorized() {
  return {
    status: 401,
    body: {
      code: "AUTH_REQUIRED",
      message: "Not authenticated",
    },
  };
}

export function getAdminStyleItems(request: RequestLike) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return { status: 200, body: { items: service.list() } };
}

export function postAdminStyleItem(request: RequestLike, body: { name: string; price: number; imageUrl: string; description: string }) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return { status: 201, body: service.create(body) };
}

export function patchAdminStyleItem(request: RequestLike, id: string, body: { name?: string; price?: number; imageUrl?: string; description?: string }) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  const updated = service.update(id, body);
  if (!updated) {
    return { status: 404, body: { code: "NOT_FOUND", message: "Not found" } };
  }
  return { status: 200, body: updated };
}

export function deleteAdminStyleItem(request: RequestLike, id: string) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return service.remove(id)
    ? { status: 204, body: null }
    : { status: 404, body: { code: "NOT_FOUND", message: "Not found" } };
}
