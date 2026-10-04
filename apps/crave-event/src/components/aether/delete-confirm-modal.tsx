import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface DeleteConfirmModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Title shown in the modal header, e.g. "Hapus Playlist?" */
  title?: string;
  /** Subtitle shown below the title */
  subtitle?: string;
  /** Main body content — can include highlighted item name */
  description: ReactNode;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Called when user clicks confirm */
  onConfirm: () => void;
  /** Called when user clicks cancel or backdrop */
  onCancel: () => void;
}

export function DeleteConfirmModal({
  open,
  title = "Hapus Item?",
  subtitle = "Tindakan ini tidak dapat dibatalkan.",
  description,
  confirmLabel = "Hapus",
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dcm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[#f0f0f0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-4">
          {/* Warning icon circle */}
          <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-red-100">
            <AlertTriangle className="size-5 text-red-500" strokeWidth={2.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 id="dcm-title" className="text-[17px] font-bold text-gray-900 leading-tight">
              {title}
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300/60 mx-6" />

        {/* Body */}
        <div className="px-6 py-4 text-[14px] text-gray-700 leading-relaxed">
          {description}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-300/60 mx-6" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-full text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 shadow-sm transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-all"
          >
            <Trash2 className="size-3.5" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
