import { useEffect, useState } from "react";
import { getPublicAbout, patchAdminAbout } from "../../api/pages";
import { AdminInlineEditor } from "../../components/AdminInlineEditor";
import { ExternalLinkCard } from "../../components/ExternalLinkCard";

export interface AboutPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
  locale: "ko-KR" | "en-US";
}

export function AboutPage({ t, isAdmin, locale }: AboutPageProps) {
  const [designerText, setDesignerText] = useState("");
  const [designerIntroLocalized, setDesignerIntroLocalized] = useState<Record<string, string>>({});
  const [addressLocalized, setAddressLocalized] = useState<Record<string, string>>({});
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com");
  const [naverMapUrl, setNaverMapUrl] = useState("https://map.naver.com");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const about = await getPublicAbout();
        setDesignerIntroLocalized(about.designer_intro);
        setAddressLocalized(about.location_block.address);
        setDesignerText(about.designer_intro[locale] ?? about.designer_intro["ko-KR"] ?? "");
        setInstagramUrl("https://instagram.com");
        setNaverMapUrl(about.location_block.naver_map_url);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setDesignerText(designerIntroLocalized[locale] ?? designerIntroLocalized["ko-KR"] ?? "");
  }, [locale, designerIntroLocalized]);

  if (loading) {
    return <p>{t("status.loading")}</p>;
  }

  return (
    <main>
      <h1>{t("nav.about")}</h1>
      <p>{designerText}</p>
      <p>{addressLocalized[locale] ?? addressLocalized["ko-KR"] ?? ""}</p>
      <ExternalLinkCard
        title={t("about.designer.title")}
        label={t("about.designer.instagram")}
        href={instagramUrl}
      />
      <ExternalLinkCard
        title={t("about.location.title")}
        label={t("action.openNaverMap")}
        href={naverMapUrl}
      />
      {isAdmin ? (
        <AdminInlineEditor
          t={t}
          title={designerText}
          subtitle={naverMapUrl}
          onSave={async (next) => {
            const updated = await patchAdminAbout({
              designer_intro: {
                ...designerIntroLocalized,
                [locale]: next.title,
              },
              location_block: {
                naver_map_url: next.subtitle,
              },
            });
            setDesignerIntroLocalized(updated.designer_intro);
            setAddressLocalized(updated.location_block.address);
            setDesignerText(updated.designer_intro[locale] ?? updated.designer_intro["ko-KR"] ?? "");
            setNaverMapUrl(updated.location_block.naver_map_url);
            setSaved(true);
          }}
        />
      ) : null}
      {saved ? <p>{t("msg.changesSaved")}</p> : null}
    </main>
  );
}
