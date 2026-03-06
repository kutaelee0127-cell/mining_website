export interface AdminBarProps {
  t: (key: string) => string;
  onLogout: () => void;
}

export function AdminBar({ t, onLogout }: AdminBarProps) {
  return (
    <aside>
      <span>{t("action.enterEditMode")}</span>
      <a href="/__admin/revisions">{t("nav.rollback")}</a>
      <button type="button" onClick={onLogout}>
        {t("action.logout")}
      </button>
    </aside>
  );
}
