import { MediaRepository, type MediaAssetRecord } from "./MediaRepository";

export interface UploadMediaInput {
  filename: string;
  contentType: string;
  sizeBytes: number;
  purpose: MediaAssetRecord["purpose"];
  sha256?: string;
}

export interface UploadMediaResult {
  status: 200 | 201 | 400;
  asset?: MediaAssetRecord;
  errorCode?: "VALIDATION_ERROR";
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const maxBytes = 10 * 1024 * 1024;

export class MediaService {
  constructor(private readonly repository: MediaRepository) {}

  upload(input: UploadMediaInput): UploadMediaResult {
    if (!allowedTypes.has(input.contentType) || input.sizeBytes <= 0 || input.sizeBytes > maxBytes) {
      return { status: 400, errorCode: "VALIDATION_ERROR" };
    }

    if (input.sha256) {
      const existing = this.repository.findByHash(input.sha256);
      if (existing) {
        return { status: 200, asset: existing };
      }
    }

    const mediaId = `media-${Date.now()}`;

    const asset: MediaAssetRecord = {
      id: mediaId,
      publicUrl: `/public/media/${mediaId}`,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      purpose: input.purpose,
      createdAt: new Date().toISOString(),
      sha256: input.sha256,
    };

    return { status: 201, asset: this.repository.save(asset) };
  }
}
