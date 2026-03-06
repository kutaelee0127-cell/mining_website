import { ResponsiveImage } from "./ResponsiveImage";

export interface ImageGridProps {
  items: Array<{ id: string; url: string; alt: string }>;
}

export function ImageGrid({ items }: ImageGridProps) {
  return (
    <section>
      {items.map((item) => (
        <ResponsiveImage key={item.id} alt={item.alt} baseUrl={item.url} />
      ))}
    </section>
  );
}
