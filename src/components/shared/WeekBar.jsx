import "./WeekBar.css";
import { addDays, formatShortDate, weekRange } from "../../utilities/dates.js";

export default function WeekBar({ weekOffset, onChange }) {
  const [start, end] = weekRange(weekOffset);

  return (
    <div className="week-bar">
      <button
        className="week-bar__arrow"
        onClick={() => onChange(weekOffset - 1)}
        aria-label="Previous week"
      >
        ❮
      </button>
      <span>
        {formatShortDate(start)} – {formatShortDate(addDays(end, -1))}
      </span>
      <button
        className="week-bar__arrow"
        onClick={() => onChange(weekOffset + 1)}
        disabled={weekOffset === 0}
        aria-label="Next week"
      >
        ❯
      </button>
    </div>
  );
}
