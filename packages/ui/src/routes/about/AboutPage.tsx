import { useState } from "react";
import { AdminInlineEditor } from "../../components/AdminInlineEditor";
import { ExternalLinkCard } from "../../components/ExternalLinkCard";

export interface AboutPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function AboutPage({ t, isAdmin }: AboutPageProps) {
  const [designerText, setDesignerText] = useState("about.designer.title");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com");
  const [naverMapUrl, setNaverMapUrl] = useState("https://map.naver.com");
  const [saved, setSaved] = useState(false);

  return (
    <main>
      <h1>{t("nav.about")}</h1>
      <p>{t(designerText)}</p>
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
          subtitle={instagramUrl}
          onSave={(next) => {
            setDesignerText(next.title);
            setInstagramUrl(next.subtitle);
            setNaverMapUrl(next.subtitle);
            setSaved(true);
          }}
        />
      ) : null}
      {saved ? <p>{t("msg.changesSaved")}</p> : null}
    </main>
  );
}
