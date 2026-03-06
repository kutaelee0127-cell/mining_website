export interface HistoryPageProps {
  t: (key: string) => string;
  isAdmin: boolean;
}

export function HistoryPage({ t, isAdmin }: HistoryPageProps) {
  if (!isAdmin) {
    return <p>{t("err.forbidden")}</p>;
  }

  return <h1>{t("msg.rollbackTitle")}</h1>;
}
