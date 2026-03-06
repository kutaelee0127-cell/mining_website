import { useState } from "react";
import { uploadImage, type MediaAsset } from "../api/media";

export interface ImageUploaderProps {
  t: (key: string) => string;
  purpose: "HERO" | "GALLERY" | "STYLE" | "PROFILE" | "MISC";
}

export function ImageUploader({ t, purpose }: ImageUploaderProps) {
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(false);

  return (
    <section>
      <button
        type="button"
        onClick={async () => {
          setIsUploading(true);
          setError(false);
          try {
            const uploaded = await uploadImage({
              filename: "sample.png",
              contentType: "image/png",
              sizeBytes: 1024,
              purpose,
              sha256: "a".repeat(64),
            });
            setAsset(uploaded);
          } catch {
            setError(true);
          } finally {
            setIsUploading(false);
          }
        }}
      >
        {t("action.uploadImage")}
      </button>
      {isUploading ? <p>{t("msg.uploading")}</p> : null}
      {error ? <p>{t("err.validation")}</p> : null}
      {asset ? <img src={asset.public_url} alt="uploaded preview" /> : null}
    </section>
  );
}
