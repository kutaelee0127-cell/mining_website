import { useEffect, useState } from "react";
import { listRevisions, restoreRevision, type RevisionDto } from "../../api/revisions";
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
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const revisions = await listRevisions();
        setItems(revisions);
        if (revisions[0]) {
          setSelectedId(revisions[0].id);
        }
      } catch {
        setItems([]);
      }
    })();
  }, [isAdmin]);

  if (!isAdmin) {
    return <p>{t("err.forbidden")}</p>;
  }

  return (
    <main>
      <h1>{t("msg.rollbackTitle")}</h1>
      <label>
        {t("action.viewDetails")}
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.id}</option>
          ))}
        </select>
      </label>
      <RevisionList items={items} />
      <RevertConfirmDialog
        t={t}
        onConfirm={async () => {
          if (!selectedId) {
            setConflict(true);
            setSaved(false);
            return { ok: false };
          }
          const result = await restoreRevision(selectedId);
          if (!result.ok) {
            setConflict(true);
            setSaved(false);
            return { ok: false };
          }
          const revisions = await listRevisions();
          setItems(revisions);
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
