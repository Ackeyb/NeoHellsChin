import { labels } from "@/lib/game/labels";
import MessageDialog from "./MessageDialog";
import type { ReactNode } from "react";

type ErrorDialogProps = {
  open: boolean;
  title?: string;
  message: ReactNode;
  onClose: () => void;
};

export default function ErrorDialog({
  open,
  title = labels.messages.errorTitle,
  message,
  onClose,
}: ErrorDialogProps) {
  return (
    <MessageDialog
      open={open}
      title={title}
      message={message}
      confirmLabel={labels.actions.close}
      onConfirm={onClose}
    />
  );
}
