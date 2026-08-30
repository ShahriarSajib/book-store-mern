/**
 * components/ui/Modal.jsx — accessible modal with backdrop, ESC, focus trap.
 * Rendered into a portal on document.body so fixed positioning stays relative
 * to the viewport (ancestors with transform/filter/backdrop-filter would
 * otherwise hijack the containing block and shove the dialog off-center).
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
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

export default function Modal({ open, onClose, title, children, labelledBy }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
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
  }, [open]);

  if (!open) return null;

  const titleId = labelledBy || (title ? "modal-title" : undefined);

  return createPortal(
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
    </>,
    document.body
  );
}