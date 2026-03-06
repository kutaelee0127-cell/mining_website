import { useState } from "react";

export interface AdminInlineEditorProps {
  t: (key: string) => string;
  title: string;
  subtitle: string;
  onSave: (next: { title: string; subtitle: string }) => Promise<void> | void;
}

export function AdminInlineEditor({ t, title, subtitle, onSave }: AdminInlineEditorProps) {
  const [nextTitle, setNextTitle] = useState(title);
  const [nextSubtitle, setNextSubtitle] = useState(subtitle);

  return (
    <section>
      <label>
        {t("field.title")}
        <input value={nextTitle} onChange={(event) => setNextTitle(event.target.value)} />
      </label>
      <label>
        {t("field.subtitle")}
        <input value={nextSubtitle} onChange={(event) => setNextSubtitle(event.target.value)} />
      </label>
      <button type="button" onClick={async () => {
        await onSave({ title: nextTitle, subtitle: nextSubtitle });
      }}>
        {t("action.save")}
      </button>
    </section>
  );
}
