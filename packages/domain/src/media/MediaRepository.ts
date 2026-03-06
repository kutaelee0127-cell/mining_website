export interface MediaAssetRecord {
  id: string;
  publicUrl: string;
  contentType: string;
  sizeBytes: number;
  purpose: "HERO" | "GALLERY" | "STYLE" | "PROFILE" | "MISC";
  createdAt: string;
  sha256?: string;
}

export class MediaRepository {
  private readonly byId = new Map<string, MediaAssetRecord>();
  private readonly byHash = new Map<string, MediaAssetRecord>();

  findByHash(sha256: string): MediaAssetRecord | null {
    return this.byHash.get(sha256) ?? null;
  }

  save(asset: MediaAssetRecord): MediaAssetRecord {
    this.byId.set(asset.id, asset);
    if (asset.sha256) {
      this.byHash.set(asset.sha256, asset);
    }
    return asset;
  }
}
