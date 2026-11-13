import { useState } from "react";
import Button from "../Button.jsx";
import { addTask } from "../../services/taskService.js";
import { addDays } from "../../utilities/dates.js";
import "./TaskForm.css";

// the days you can pick: today and the six days after it, each at 00:00
function nextSevenDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(today, i));
  }
  return days;
}

// the form in the + sheet: a new task (FR3)
export default function TaskForm({ household, userId, onAdded }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  // FR6: "me" or "either" (up for grabs); asking the partner comes with requests
  const [who, setWho] = useState("me");
  // a Date, or null for "No date"
  const [day, setDay] = useState(null);
  // "Any time" or "Set time"; time is "HH:mm", as the data model stores it
  const [hasTime, setHasTime] = useState(false);
  const [time, setTime] = useState("");
  // FR15
  const [repeatsWeekly, setRepeatsWeekly] = useState(false);

  const days = nextSevenDays();

  function handleTitleChange(event) {
    setTitle(event.target.value);
  }

  function chooseMe() {
    setWho("me");
  }

  function chooseEither() {
    setWho("either");
  }

  function chooseNoDate() {
    setDay(null);
  }

  function chooseAnyTime() {
    setHasTime(false);
  }

  function chooseSetTime() {
    setHasTime(true);
  }

  function handleTimeChange(event) {
    setTime(event.target.value);
  }

  function handleRepeatChange(event) {
    // a checkbox gives checked (true/false), not value
    setRepeatsWeekly(event.target.checked);
  }

  // used by both buttons; done = true is "Mark as done" (FR5)
  async function save(done) {
    try {
      // nobody assigned = up for grabs; a task already done was done by me
      const assignedTo = done || who === "me" ? userId : null;
      // a time and a repeat only count with a day; "" = any time
      const taskTime = day && hasTime ? time : "";
      await addTask(household, {
        title,
        assignedTo,
        day,
        time: taskTime,
        done,
        repeatsWeekly: day !== null && repeatsWeekly,
      });
      onAdded();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  function handleSubmit(event) {
    // a form would otherwise reload the whole page
    event.preventDefault();
    save(false);
  }

  function handleMarkDone() {
    save(true);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="task-form__label t-overline" htmlFor="task-form-title">
        What needs doing?
      </label>
      <input
        id="task-form-title"
        className="task-form__input t-body"
        type="text"
        placeholder="e.g. Empty the dishwasher"
        value={title}
        onChange={handleTitleChange}
      />

      <p className="task-form__label t-overline" id="task-form-who">
        Who does it
      </p>
      <div className="task-form__choices" role="group" aria-labelledby="task-form-who">
        <button
          type="button"
          className="task-form__choice t-body-strong"
          aria-pressed={who === "me"}
          onClick={chooseMe}
        >
          Me
        </button>
        <button
          type="button"
          className="task-form__choice t-body-strong"
          aria-pressed={who === "either"}
          onClick={chooseEither}
        >
          Either of us
        </button>
      </div>

      {who === "either" && (
        <p className="task-form__notice t-meta">Goes to Up for grabs</p>
      )}

      {/* for an up-for-grabs task the day is a deadline, and it may be left empty */}
      <p className="task-form__label t-overline" id="task-form-day">
        {who === "either" ? "By when · optional" : "Day"}
      </p>
      <div className="task-form__days" role="group" aria-labelledby="task-form-day">
        <button
          type="button"
          className="task-form__choice task-form__day"
          aria-pressed={day === null}
          onClick={chooseNoDate}
        >
          <span className="t-chip">No</span>
          <span className="t-body-strong">date</span>
        </button>

        {days.map(function renderDay(date, index) {
          // the button knows its own date, so one handler per button
          function chooseDay() {
            setDay(date);
          }

          return (
            <button
              key={date.getTime()}
              type="button"
              className="task-form__choice task-form__day"
              aria-pressed={day !== null && day.getTime() === date.getTime()}
              onClick={chooseDay}
            >
              <span className="t-chip">
                {index === 0
                  ? "Today"
                  : date.toLocaleDateString("en-GB", { weekday: "short" })}
              </span>
              <span className="t-body-strong">{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* decision after the wireframe tests: the time appears once a day is chosen */}
      {day === null ? (
        <p className="task-form__hint t-meta">Pick a day to choose a time.</p>
      ) : (
        <>
          <p className="task-form__label t-overline" id="task-form-time">
            Time
          </p>
          <div className="task-form__choices" role="group" aria-labelledby="task-form-time">
            <button
              type="button"
              className="task-form__choice t-body-strong"
              aria-pressed={!hasTime}
              onClick={chooseAnyTime}
            >
              Any time
            </button>
            <button
              type="button"
              className="task-form__choice t-body-strong"
              aria-pressed={hasTime}
              onClick={chooseSetTime}
            >
              Set time
            </button>
          </div>

          {hasTime && (
            <input
              className="task-form__input t-body"
              type="time"
              aria-labelledby="task-form-time"
              value={time}
              onChange={handleTimeChange}
            />
          )}

          {/* the label around the checkbox: tapping the text ticks it too */}
          <label className="task-form__repeat">
            <span className="task-form__repeat-text">
              <span className="t-body-strong">Repeat every week</span>
              <span className="t-meta">A new copy appears when this one is done</span>
            </span>
            <input
              className="task-form__checkbox"
              type="checkbox"
              checked={repeatsWeekly}
              onChange={handleRepeatChange}
            />
          </label>
        </>
      )}

      {error && <p className="task-form__error t-meta">{error}</p>}

      {/* NFR5: a task cannot be saved without a title */}
      <div className="task-form__actions">
        <Button
          variant="secondary"
          block
          disabled={!title.trim()}
          onClick={handleMarkDone}
        >
          Mark as done
        </Button>
        <Button type="submit" block disabled={!title.trim()}>
          Add task
        </Button>
      </div>
    </form>
  );
}
