import { useState } from "react";
import { AdminInlineEditor } from "../../components/AdminInlineEditor";
import { CtaCard } from "../../components/CtaCard";

export interface BookingPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function BookingPage({ t, isAdmin }: BookingPageProps) {
  const [bookingUrl, setBookingUrl] = useState("https://smartstore.naver.com");
  const [hintKey, setHintKey] = useState("msg.bookingHint");
  const [saved, setSaved] = useState(false);

  return (
    <main>
      <CtaCard
        title={t("nav.booking")}
        hint={t(hintKey)}
        href={bookingUrl}
        actionLabel={t("action.openNaverBooking")}
      />
      <p>{t("msg.externalLinkHint")}</p>
      {isAdmin ? (
        <AdminInlineEditor
          t={t}
          title={hintKey}
          subtitle={bookingUrl}
          onSave={(next) => {
            setHintKey(next.title);
            setBookingUrl(next.subtitle);
            setSaved(true);
          }}
        />
      ) : null}
      {saved ? <p>{t("msg.changesSaved")}</p> : null}
    </main>
  );
}
