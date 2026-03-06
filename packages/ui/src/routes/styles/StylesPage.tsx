import { useEffect, useMemo, useState } from "react";
import { addStyle, listStyles, type StyleItemDto } from "../../api/styles";
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
    setItems(await listStyles());
  };

  useEffect(() => {
    void reload();
  }, []);

  if (items.length === 0) {
    return <p>{t("msg.stylesEmpty")}</p>;
  }

  return (
    <main>
      <h1>{t("nav.styles")}</h1>
      {items.map((item) => (
        <article key={item.id}>
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <p>{t("field.price")}: {formatter.format(item.price)}</p>
        </article>
      ))}
      {isAdmin ? (
        <StyleEditorModal
          t={t}
          onAdd={async (input) => {
            await addStyle(input);
            await reload();
          }}
        />
      ) : null}
    </main>
  );
}
