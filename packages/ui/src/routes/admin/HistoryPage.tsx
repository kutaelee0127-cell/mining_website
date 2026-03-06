import { useEffect, useState } from "react";
import { listRevisions, type RevisionDto } from "../../api/revisions";
import { RevertConfirmDialog } from "../../components/RevertConfirmDialog";
import { RevisionList } from "../../components/RevisionList";

export interface HistoryPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function HistoryPage({ t, isAdmin }: HistoryPageProps) {
  const [items, setItems] = useState<RevisionDto[]>([]);
  const [conflict, setConflict] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      setItems(await listRevisions());
    })();
  }, []);

  if (!isAdmin) {
    return <p>{t("err.forbidden")}</p>;
  }

  return (
    <main>
      <h1>{t("msg.rollbackTitle")}</h1>
      <RevisionList items={items} />
      <RevertConfirmDialog
        t={t}
        onConfirm={async () => {
          if (items.length === 0) {
            setConflict(true);
            setSaved(false);
            return { ok: false };
          }
          setConflict(false);
          setSaved(true);
          return { ok: true };
        }}
      />
      {conflict ? <p>{t("err.conflict")}</p> : null}
      {saved ? <p>{t("msg.changesSaved")}</p> : null}
    </main>
  );
}
