import { useEffect, useState } from "react";
import { addGalleryItem, deleteGalleryItem, listGallery, reorderGallery, type GalleryItemDto } from "../../api/gallery";
import { GalleryEditorDrawer } from "../../components/GalleryEditorDrawer";
import { ImageGrid } from "../../components/ImageGrid";

export interface GalleryPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function GalleryPage({ t, isAdmin }: GalleryPageProps) {
  const [items, setItems] = useState<GalleryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError(false);
    try {
      setItems(await listGallery());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  if (loading) {
    return <p>{t("status.loading")}</p>;
  }

  if (error) {
    return <p>{t("err.network")}</p>;
  }

  if (items.length === 0) {
    return <p>{t("msg.galleryEmpty")}</p>;
  }

  return (
    <main>
      <ImageGrid items={items.map((item) => ({ id: item.id, url: item.imageUrl, alt: item.title }))} />
      {isAdmin ? (
        <>
          <GalleryEditorDrawer
            t={t}
            onAdd={async (imageUrl, title) => {
              await addGalleryItem(imageUrl, title);
              await reload();
            }}
            onSaveOrder={async () => {
              await reorderGallery(items.map((item) => item.id));
              await reload();
            }}
          />
          <button type="button" onClick={async () => {
            if (items[0]) {
              await deleteGalleryItem(items[0].id);
              await reload();
            }
          }}>{t("action.delete")}</button>
        </>
      ) : null}
    </main>
  );
}
