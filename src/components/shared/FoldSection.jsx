import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import "./FoldSection.css";

// a section whose heading folds its cards open and closed; each section
// remembers its own state, so the page does not need one state per section
export default function FoldSection({
  title,
  count,
  startOpen = false,
  children,
}) {
  const [open, setOpen] = useState(startOpen);

  function toggleOpen() {
    setOpen(!open);
  }

  return (
    <section className="fold-section">
      {/* the button inside the heading: still a heading for screen readers */}
      <h2 className="fold-section__heading">
        <button
          type="button"
          className="fold-section__toggle"
          aria-expanded={open}
          onClick={toggleOpen}
        >
          <span className="t-section-title">{title}</span>
          <span className="fold-section__count t-chip">{count}</span>
          {open ? (
            <ChevronDown size={20} aria-hidden="true" />
          ) : (
            <ChevronRight size={20} aria-hidden="true" />
          )}
        </button>
      </h2>

      {open && <div className="fold-section__list">{children}</div>}
    </section>
  );
}
