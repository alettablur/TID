import { X } from "lucide-react";
import "./Sheet.css";

// a panel that slides up from the bottom; a tap on the dark area around it closes it
export default function Sheet({ title, onClose, children }) {
  // a tap inside the sheet must not reach the scrim behind it
  function handleSheetClick(event) {
    event.stopPropagation();
  }

  return (
    <div className="sheet__scrim" onClick={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={handleSheetClick}
      >
        <span className="sheet__handle" aria-hidden="true" />
        <header className="sheet__header">
          <h2 className="t-section-title">{title}</h2>
          <button
            type="button"
            className="sheet__close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
