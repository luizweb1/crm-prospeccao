"use client";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/[0.04] p-5 shadow-2xl">
        <p className="text-base font-semibold text-white">{title}</p>
        {description && <p className="mt-2 text-sm text-white/50">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={danger ? "btn-danger" : "btn-primary"}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
