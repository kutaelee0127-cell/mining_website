export interface RevertConfirmDialogProps {
  t: (key: string) => string;
  onConfirm: () => Promise<{ ok: boolean }>;
}

export function RevertConfirmDialog({ t, onConfirm }: RevertConfirmDialogProps) {
  return (
    <section>
      <button type="button" onClick={() => { void onConfirm(); }}>
        {t("action.restore")}
      </button>
    </section>
  );
}
