import { useState } from "react";
import { AdminInlineEditor } from "../../components/AdminInlineEditor";

export interface HomePageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function HomePage({ t, isAdmin }: HomePageProps) {
  const [heroTitle, setHeroTitle] = useState("msg.welcome");
  const [heroSubtitle, setHeroSubtitle] = useState("app.brandName");
  const [saved, setSaved] = useState(false);

  return (
    <main>
      <h1>{t(heroTitle)}</h1>
      <p>{t(heroSubtitle)}</p>
      <a href="/booking">{t("action.bookNow")}</a>
      {isAdmin ? (
        <AdminInlineEditor
          t={t}
          title={heroTitle}
          subtitle={heroSubtitle}
          onSave={(next) => {
            setHeroTitle(next.title);
            setHeroSubtitle(next.subtitle);
            setSaved(true);
          }}
        />
      ) : null}
      {saved ? <p>{t("msg.changesSaved")}</p> : null}
    </main>
  );
}
