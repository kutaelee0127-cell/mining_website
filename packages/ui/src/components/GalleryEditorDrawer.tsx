import { useState } from "react";

export interface GalleryEditorDrawerProps {
  t: (key: string) => string;
  onAdd: (imageUrl: string, title: string) => Promise<void>;
  onSaveOrder: () => Promise<void>;
}

export function GalleryEditorDrawer({ t, onAdd, onSaveOrder }: GalleryEditorDrawerProps) {
  const [imageUrl, setImageUrl] = useState("/public/media/new");
  const [title, setTitle] = useState("gallery");

  return (
    <aside>
      <button type="button" onClick={() => onAdd(imageUrl, title)}>
        {t("action.add")}
      </button>
      <button type="button" onClick={() => onSaveOrder()}>
        {t("action.save")}
      </button>
      <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
      <input value={title} onChange={(event) => setTitle(event.target.value)} />
    </aside>
  );
}
