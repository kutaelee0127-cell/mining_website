import { ReviewService } from "../../../../domain/src/review/ReviewService";
import { isAdminRequest, type RequestLike } from "../middleware/auth";

const service = new ReviewService();

function unauthorized() {
  return {
    status: 401,
    body: {
      code: "AUTH_REQUIRED",
      message: "Not authenticated",
    },
  };
}

export function getAdminReviewItems(request: RequestLike) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return { status: 200, body: { items: service.list() } };
}

export function postAdminReviewItem(request: RequestLike, body: { rating: number; text: string; author: string; source: string }) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return { status: 201, body: service.create(body) };
}

export function patchAdminReviewItem(request: RequestLike, id: string, body: { rating?: number; text?: string; author?: string; source?: string }) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  const updated = service.update(id, body);
  if (!updated) {
    return { status: 404, body: { code: "NOT_FOUND", message: "Not found" } };
  }
  return { status: 200, body: updated };
}

export function deleteAdminReviewItem(request: RequestLike, id: string) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return service.remove(id)
    ? { status: 204, body: null }
    : { status: 404, body: { code: "NOT_FOUND", message: "Not found" } };
}
