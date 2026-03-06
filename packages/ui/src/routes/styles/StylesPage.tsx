import { useEffect, useMemo, useState } from "react";
import { addStyle, deleteStyle, listStyles, saveStyle, type StyleItemDto } from "../../api/styles";
import { StyleEditorModal } from "../../components/StyleEditorModal";

export interface StylesPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
  locale: "ko-KR" | "en-US";
}

export function StylesPage({ t, isAdmin, locale }: StylesPageProps) {
  const [items, setItems] = useState<StyleItemDto[]>([]);

  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "KRW", maximumFractionDigits: 0 }),
    [locale],
  );

  const reload = async () => {
    setItems(await listStyles(isAdmin));
  };

  useEffect(() => {
    void reload();
  }, [isAdmin]);

  return (
    <main>
      <h1>{t("nav.styles")}</h1>
      {items.length === 0 ? <p>{t("msg.stylesEmpty")}</p> : null}
      {items.map((item) => (
        <article key={item.id}>
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <p>{t("field.price")}: {formatter.format(item.price)}</p>
        </article>
      ))}
      {isAdmin ? (
        <>
          <StyleEditorModal
            t={t}
            onAdd={async (input) => {
              await addStyle(input);
              await reload();
            }}
          />
          <button type="button" onClick={async () => {
            if (items[0]) {
              await saveStyle(items[0].id, { name: `${items[0].name}*` });
              await reload();
            }
          }}>{t("action.edit")}</button>
          <button type="button" onClick={async () => {
            if (items[0]) {
              await deleteStyle(items[0].id);
              await reload();
            }
          }}>{t("action.delete")}</button>
        </>
      ) : null}
    </main>
  );
}
