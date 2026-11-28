import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatShortDate, weekRange } from "../../utilities/dates.js";
import "./WeekSwitch.css";

// ‹ 23 Nov – 29 Nov ›. offset: 0 = this week, -1 = last week, 1 = next week
export default function WeekSwitch({ offset, onChange, canGoForward = true }) {
  const [start, end] = weekRange(offset);

  function showPreviousWeek() {
    onChange(offset - 1);
  }

  function showNextWeek() {
    onChange(offset + 1);
  }

  return (
    <div className="week-switch">
      <button
        type="button"
        className="week-switch__arrow"
        onClick={showPreviousWeek}
        aria-label="Previous week"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <span className="t-body-strong">
        {formatShortDate(start)} – {formatShortDate(addDays(end, -1))}
      </span>
      <button
        type="button"
        className="week-switch__arrow"
        onClick={showNextWeek}
        disabled={!canGoForward}
        aria-label="Next week"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
