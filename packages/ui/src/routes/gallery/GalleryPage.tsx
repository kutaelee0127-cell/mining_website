import { useEffect, useState } from "react";
import { addGalleryItem, deleteGalleryItem, listGallery, reorderGallery, updateGalleryItem, type GalleryItemDto } from "../../api/gallery";
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
      setItems(await listGallery(isAdmin));
      } catch {
        setError(true);
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [isAdmin]);

  if (loading) {
    return <p>{t("status.loading")}</p>;
  }

  if (error) {
    return <p>{t("err.network")}</p>;
  }

  return (
    <main>
      {items.length === 0 ? <p>{t("msg.galleryEmpty")}</p> : <ImageGrid items={items.map((item) => ({ id: item.id, url: item.imageUrl, alt: item.title }))} />}
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
              await updateGalleryItem(items[0].id, { title: `${items[0].title}*` });
              await reload();
            }
          }}>{t("action.edit")}</button>
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
