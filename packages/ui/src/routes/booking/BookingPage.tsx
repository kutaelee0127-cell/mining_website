import { useEffect, useState } from "react";
import { getPublicBooking, patchAdminBooking } from "../../api/pages";
import { AdminInlineEditor } from "../../components/AdminInlineEditor";
import { CtaCard } from "../../components/CtaCard";

export interface BookingPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
  locale: "ko-KR" | "en-US";
}

export function BookingPage({ t, isAdmin, locale }: BookingPageProps) {
  const [bookingUrl, setBookingUrl] = useState("https://smartstore.naver.com");
  const [note, setNote] = useState("");
  const [noteLocalized, setNoteLocalized] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const booking = await getPublicBooking();
        setBookingUrl(booking.booking_url);
        setNoteLocalized(booking.note);
        setNote(booking.note[locale] ?? booking.note["ko-KR"] ?? "");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setNote(noteLocalized[locale] ?? noteLocalized["ko-KR"] ?? "");
  }, [locale, noteLocalized]);

  if (loading) {
    return <p>{t("status.loading")}</p>;
  }

  return (
    <main>
      <CtaCard
        title={t("nav.booking")}
        hint={note}
        href={bookingUrl}
        actionLabel={t("action.openNaverBooking")}
      />
      <p>{t("msg.externalLinkHint")}</p>
      {isAdmin ? (
        <AdminInlineEditor
          t={t}
          title={note}
          subtitle={bookingUrl}
          onSave={async (next) => {
            const updated = await patchAdminBooking({
              booking_url: next.subtitle,
              note: {
                ...noteLocalized,
                [locale]: next.title,
              },
            });
            setBookingUrl(updated.booking_url);
            setNoteLocalized(updated.note);
            setNote(updated.note[locale] ?? updated.note["ko-KR"] ?? "");
            setSaved(true);
          }}
        />
      ) : null}
      {saved ? <p>{t("msg.changesSaved")}</p> : null}
    </main>
  );
}
