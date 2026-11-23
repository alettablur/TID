import {
  formatDay,
  formatWeekday,
  startOfToday,
} from "../../utilities/dates.js";
import "./DayPicker.css";

// a row of day buttons; value is a Date, or null for "No date"
export default function DayPicker({
  days,
  value,
  onChange,
  allowNoDate,
  labelledBy,
}) {
  const today = startOfToday();
  // false for a late task or one more than a week away: no button shows its day
  const valueInStrip =
    value !== null && days.some((date) => date.getTime() === value.getTime());

  function chooseNoDate() {
    onChange(null);
  }

  return (
    <>
      <div className="day-picker" role="group" aria-labelledby={labelledBy}>
        {allowNoDate && (
          <button
            type="button"
            className="day-picker__day"
            aria-pressed={value === null}
            onClick={chooseNoDate}
          >
            <span className="t-chip">No</span>
            <span className="t-body-strong">date</span>
          </button>
        )}

        {days.map(function renderDay(date) {
          // the button knows its own date, so one handler per button
          function chooseDay() {
            onChange(date);
          }

          return (
            <button
              key={date.getTime()}
              type="button"
              className="day-picker__day"
              aria-pressed={
                value !== null && value.getTime() === date.getTime()
              }
              onClick={chooseDay}
            >
              <span className="t-chip">
                {date.getTime() === today.getTime()
                  ? "Today"
                  : formatWeekday(date)}
              </span>
              <span className="t-body-strong">{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* our decision: say the day in words instead of adding a button for it;
          it stays the day unless another day is tapped */}
      {value !== null && !valueInStrip && (
        <p className="day-picker__hint t-meta">
          Planned for {formatDay(value)}
        </p>
      )}
    </>
  );
}
