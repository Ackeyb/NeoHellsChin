import { labels } from "@/lib/game/labels";
import type { ReactNode } from "react";

type MessageDialogProps = {
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function MessageDialog({
  open,
  title,
  message,
  confirmLabel = labels.actions.confirm,
  cancelLabel = labels.actions.cancel,
  onConfirm,
  onCancel,
}: MessageDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        {title && <div className="dialog-title">{title}</div>}
        <div className="dialog-message">{message}</div>
        <div className="dialog-actions">
          {onCancel && (
            <button className="secondary-button" onClick={onCancel} type="button">
              {cancelLabel}
            </button>
          )}
          <button className="primary-button" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
