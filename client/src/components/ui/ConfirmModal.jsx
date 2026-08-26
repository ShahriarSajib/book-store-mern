/**
 * components/ui/ConfirmModal.jsx — reusable confirmation dialog.
 */
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  message = "Are you sure? This cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
