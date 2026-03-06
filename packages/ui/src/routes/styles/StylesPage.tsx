import { ImageGrid } from "../../components/ImageGrid";

export function StylesPage() {
  return (
    <ImageGrid
      items={[
        { id: "s-1", url: "/public/media/s-1", alt: "style image 1" },
        { id: "s-2", url: "/public/media/s-2", alt: "style image 2" },
      ]}
    />
  );
}
