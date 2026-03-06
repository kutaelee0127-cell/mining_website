import { ImageGrid } from "../../components/ImageGrid";

export function GalleryPage() {
  return (
    <ImageGrid
      items={[
        { id: "g-1", url: "/public/media/g-1", alt: "gallery image 1" },
        { id: "g-2", url: "/public/media/g-2", alt: "gallery image 2" },
      ]}
    />
  );
}
