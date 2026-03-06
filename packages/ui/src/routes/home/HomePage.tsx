import { useEffect, useState } from "react";
import { getPublicHome, patchAdminHome } from "../../api/home";
import { AdminInlineEditor } from "../../components/AdminInlineEditor";

export interface HomePageProps {
  t: (key: string) => string;
  isAdmin: boolean;
  locale: "ko-KR" | "en-US";
}

function pickLocalized(text: Record<string, string>, locale: "ko-KR" | "en-US"): string {
  return text[locale] ?? text["ko-KR"] ?? "";
}

export function HomePage({ t, isAdmin, locale }: HomePageProps) {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroTitleText, setHeroTitleText] = useState<Record<string, string>>({});
  const [heroSubtitleText, setHeroSubtitleText] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const home = await getPublicHome();
      setHeroTitleText(home.hero_title);
      setHeroSubtitleText(home.hero_subtitle);
      setHeroTitle(pickLocalized(home.hero_title, locale));
      setHeroSubtitle(pickLocalized(home.hero_subtitle, locale));
    } catch {
      setError(t("err.network"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    setHeroTitle(pickLocalized(heroTitleText, locale));
    setHeroSubtitle(pickLocalized(heroSubtitleText, locale));
  }, [locale, heroTitleText, heroSubtitleText]);

  if (loading) {
    return <main><p>{t("status.loading")}</p></main>;
  }

  if (error) {
    return <main><p>{error}</p></main>;
  }

  return (
    <main>
      <h1>{heroTitle}</h1>
      <p>{heroSubtitle}</p>
      <a href="/booking">{t("action.bookNow")}</a>
      {isAdmin ? (
        <AdminInlineEditor
          t={t}
          title={heroTitle}
          subtitle={heroSubtitle}
          onSave={async (next) => {
            const updated = await patchAdminHome({
              hero_title: {
                ...heroTitleText,
                [locale]: next.title,
              },
              hero_subtitle: {
                ...heroSubtitleText,
                [locale]: next.subtitle,
              },
            });
            setHeroTitleText(updated.hero_title);
            setHeroSubtitleText(updated.hero_subtitle);
            setHeroTitle(pickLocalized(updated.hero_title, locale));
            setHeroSubtitle(pickLocalized(updated.hero_subtitle, locale));
            setSaved(true);
          }}
        />
      ) : null}
      {saved ? <p>{t("msg.changesSaved")}</p> : null}
    </main>
  );
}
