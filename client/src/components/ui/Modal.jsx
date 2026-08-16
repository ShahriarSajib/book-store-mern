/**
 * components/ui/Modal.jsx — accessible modal with backdrop, ESC, focus trap.
 * Usage:
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
 *     <p>Are you sure?</p>
 *     <div className="modal__footer">
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </div>
 *   </Modal>
 */
import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({ open, onClose, title, children, labelledBy }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus first focusable
    const t = window.setTimeout(() => {
      const el = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = labelledBy || (title ? "modal-title" : undefined);

  return (
    <>
      <div
        className="modal-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-container"
      >
        {title && (
          <header className="modal__header">
            <h2 id={titleId} className="modal__title">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="modal__close"
              aria-label="Close dialog"
            >
              <FaTimes />
            </button>
          </header>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </>
  );
}