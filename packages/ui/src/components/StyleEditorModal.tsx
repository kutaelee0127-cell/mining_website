import { useState } from "react";

export interface StyleEditorModalProps {
  t: (key: string) => string;
  onAdd: (input: { name: string; price: number; imageUrl: string; description: string }) => Promise<void>;
}

export function StyleEditorModal({ t, onAdd }: StyleEditorModalProps) {
  const [name, setName] = useState("style");
  const [price, setPrice] = useState(10000);
  const [imageUrl, setImageUrl] = useState("/public/media/style");
  const [description, setDescription] = useState("desc");

  return (
    <section>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <input value={price} onChange={(event) => setPrice(Number(event.target.value))} />
      <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
      <input value={description} onChange={(event) => setDescription(event.target.value)} />
      <button type="button" onClick={() => onAdd({ name, price, imageUrl, description })}>
        {t("action.add")}
      </button>
      <button type="button">{t("action.save")}</button>
    </section>
  );
}
