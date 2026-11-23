import "./TimePicker.css";

// every hour, and the quarters; the data model stores times as "HH:mm"
const HOURS = [];
for (let hour = 0; hour < 24; hour++) {
  HOURS.push(String(hour).padStart(2, "0"));
}
const QUARTERS = ["00", "15", "30", "45"];

// two native dropdowns instead of <input type="time">: they work with screen
// readers and the keyboard, open the phone's own big picker (one hand), and
// cannot be left half-filled (our decision). value is one "HH:mm" text.
export default function TimePicker({ value, onChange }) {
  const [hour, minute] = value.split(":");

  // a task saved earlier with e.g. 18:10 keeps its minute as an extra choice
  const minuteChoices = QUARTERS.includes(minute)
    ? QUARTERS
    : [...QUARTERS, minute];

  function handleHourChange(event) {
    onChange(`${event.target.value}:${minute}`);
  }

  function handleMinuteChange(event) {
    onChange(`${hour}:${event.target.value}`);
  }

  return (
    <div className="time-picker">
      <select
        className="time-picker__select t-body"
        aria-label="Hour"
        value={hour}
        onChange={handleHourChange}
      >
        {HOURS.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
      <span className="t-body-strong" aria-hidden="true">
        :
      </span>
      <select
        className="time-picker__select t-body"
        aria-label="Minutes"
        value={minute}
        onChange={handleMinuteChange}
      >
        {minuteChoices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
    </div>
  );
}
