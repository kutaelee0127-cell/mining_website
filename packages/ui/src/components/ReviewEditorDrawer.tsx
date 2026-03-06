import { useState } from "react";

export interface ReviewEditorDrawerProps {
  t: (key: string) => string;
  onAdd: (input: { rating: number; text: string; author: string; source: string }) => Promise<void>;
}

export function ReviewEditorDrawer({ t, onAdd }: ReviewEditorDrawerProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("great");
  const [author, setAuthor] = useState("guest");
  const [source, setSource] = useState("naver");

  return (
    <aside>
      <input value={rating} onChange={(event) => setRating(Number(event.target.value))} aria-label={t("field.rating")} />
      <input value={text} onChange={(event) => setText(event.target.value)} />
      <input value={author} onChange={(event) => setAuthor(event.target.value)} />
      <input value={source} onChange={(event) => setSource(event.target.value)} />
      <button type="button" onClick={() => onAdd({ rating, text, author, source })}>{t("action.add")}</button>
    </aside>
  );
}
