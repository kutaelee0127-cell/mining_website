import { GalleryService } from "../../../../domain/src/gallery/GalleryService";
import { isAdminRequest, type RequestLike } from "../middleware/auth";

const service = new GalleryService();

function unauthorized() {
  return {
    status: 401,
    body: {
      code: "AUTH_REQUIRED",
      message: "Not authenticated",
    },
  };
}

export function getAdminGalleryItems(request: RequestLike) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return { status: 200, body: { items: service.list() } };
}

export function postAdminGalleryItem(request: RequestLike, body: { imageUrl: string; title: string }) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return { status: 201, body: service.create(body.imageUrl, body.title) };
}

export function patchAdminGalleryItem(request: RequestLike, id: string, body: { imageUrl?: string; title?: string }) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  const updated = service.update(id, body);
  if (!updated) {
    return { status: 404, body: { code: "NOT_FOUND", message: "Not found" } };
  }
  return { status: 200, body: updated };
}

export function deleteAdminGalleryItem(request: RequestLike, id: string) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  const ok = service.remove(id);
  return ok ? { status: 204, body: null } : { status: 404, body: { code: "NOT_FOUND", message: "Not found" } };
}

export function postAdminGalleryReorder(request: RequestLike, ids: string[]) {
  if (!isAdminRequest(request)) {
    return unauthorized();
  }
  return { status: 200, body: { items: service.reorder(ids) } };
}
