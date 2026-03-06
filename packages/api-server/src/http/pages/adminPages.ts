import { PageService } from "../../../../domain/src/page/PageService";
import { RevisionService } from "../../../../domain/src/revision/RevisionService";
import { requireAdmin, type RequestLike } from "../middleware/auth";

const revisionService = new RevisionService();
const pageService = new PageService(revisionService);

export function patchAdminHome(
  request: RequestLike,
  body: { heroTitle?: string; heroSubtitle?: string },
) {
  try {
    requireAdmin(request);
  } catch {
    return {
      status: 401,
      body: {
        code: "AUTH_REQUIRED",
        message: "Not authenticated",
      },
    };
  }

  return {
    status: 200,
    body: pageService.updateHome(body),
  };
}

export function patchAdminAbout(
  request: RequestLike,
  body: { designerTitle?: string; instagramUrl?: string; naverMapUrl?: string },
) {
  try {
    requireAdmin(request);
  } catch {
    return {
      status: 401,
      body: {
        code: "AUTH_REQUIRED",
        message: "Not authenticated",
      },
    };
  }

  return {
    status: 200,
    body: pageService.updateAbout(body),
  };
}

export function patchAdminBooking(
  request: RequestLike,
  body: { bookingUrl?: string; hintKey?: string },
) {
  try {
    requireAdmin(request);
  } catch {
    return {
      status: 401,
      body: {
        code: "AUTH_REQUIRED",
        message: "Not authenticated",
      },
    };
  }

  return {
    status: 200,
    body: pageService.updateBooking(body),
  };
}
