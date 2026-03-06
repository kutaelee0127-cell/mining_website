import { useEffect, useState } from "react";
import { listRevisions, type RevisionDto } from "../../api/revisions";
import { RevisionList } from "../../components/RevisionList";

export interface HistoryPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function HistoryPage({ t, isAdmin }: HistoryPageProps) {
  const [items, setItems] = useState<RevisionDto[]>([]);

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
    </main>
  );
}
