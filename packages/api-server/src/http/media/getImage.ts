import { mediaCacheHeaders } from "../middleware/cache";

export function getPublicMedia(mediaId: string) {
  return {
    status: 200,
    headers: mediaCacheHeaders(),
    body: {
      id: mediaId,
      public_url: `/public/media/${mediaId}`,
      content_type: "image/webp",
      size_bytes: 1024,
      purpose: "GALLERY",
      created_at: new Date().toISOString(),
    },
  };
}
