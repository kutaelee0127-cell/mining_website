import { isAdminRequest, type RequestLike } from "../middleware/auth";
import { MediaRepository } from "../../../../domain/src/media/MediaRepository";
import { MediaService } from "../../../../domain/src/media/MediaService";

const service = new MediaService(new MediaRepository());

export interface UploadImageBody {
  filename: string;
  contentType: string;
  sizeBytes: number;
  purpose: "HERO" | "GALLERY" | "STYLE" | "PROFILE" | "MISC";
  sha256?: string;
}

export function postAdminMediaUpload(request: RequestLike, body: UploadImageBody) {
  if (!isAdminRequest(request)) {
    return {
      status: 401,
      body: {
        code: "AUTH_REQUIRED",
        message: "Not authenticated",
      },
    };
  }

  const result = service.upload(body);
  if (result.status === 400) {
    return {
      status: 400,
      body: {
        code: "VALIDATION_ERROR",
        message: "Invalid media input",
      },
    };
  }

  return {
    status: result.status,
    body: {
      id: result.asset?.id,
      public_url: result.asset?.publicUrl,
      content_type: result.asset?.contentType,
      size_bytes: result.asset?.sizeBytes,
      purpose: result.asset?.purpose,
      created_at: result.asset?.createdAt,
      sha256: result.asset?.sha256,
    },
  };
}
