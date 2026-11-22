import "./WeekBar.css";
import { weekBoundsFromOffset } from "../../utilities/dateUtils.js";

const fmt = (d) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function WeekBar({ weekOffset, onChange }) {
  const [start, end] = weekBoundsFromOffset(weekOffset);

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
        {fmt(start)} - {fmt(end)}
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
