export interface MediaAsset {
  id: string;
  public_url: string;
  content_type: string;
  size_bytes: number;
  purpose: "HERO" | "GALLERY" | "STYLE" | "PROFILE" | "MISC";
  created_at: string;
  sha256?: string;
}

let lastUploaded: MediaAsset | null = null;

export async function uploadImage(input: {
  filename: string;
  contentType: string;
  sizeBytes: number;
  purpose: MediaAsset["purpose"];
  sha256?: string;
}): Promise<MediaAsset> {
  const now = new Date().toISOString();
  const id = `media-ui-${Date.now()}`;

  const asset: MediaAsset = {
    id,
    public_url: `/public/media/${id}`,
    content_type: input.contentType,
    size_bytes: input.sizeBytes,
    purpose: input.purpose,
    created_at: now,
    sha256: input.sha256,
  };

  if (lastUploaded && input.sha256 && lastUploaded.sha256 === input.sha256) {
    return lastUploaded;
  }

  lastUploaded = asset;
  return asset;
}
