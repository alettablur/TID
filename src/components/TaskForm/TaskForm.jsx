import { useState } from "react";
import Button from "../Button.jsx";
import {
  addTask,
  deleteTask,
  updateTask,
} from "../../services/taskService.js";
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

// the form in the + sheet: a new task (FR3). With a task, the same form
// edits that task in the task sheet, and every field starts from it.
export default function TaskForm({ household, userId, task, onSaved }) {
  const [title, setTitle] = useState(task ? task.title : "");
  const [error, setError] = useState("");
  // FR6: "me" or "either" (up for grabs); asking the partner comes with requests
  const [who, setWho] = useState(
    task && task.assignedTo === null ? "either" : "me",
  );
  // a Date, or null for "No date"
  const [day, setDay] = useState(task ? task.day : null);
  // "Any time" or "Set time"; time is "HH:mm", as the data model stores it
  // ("" = any time, so a task with a time starts on "Set time")
  const [hasTime, setHasTime] = useState(task ? task.time !== "" : false);
  const [time, setTime] = useState(task ? task.time : "");
  // FR15
  const [repeatsWeekly, setRepeatsWeekly] = useState(
    task ? task.repeatsWeekly : false,
  );
  // true while addTask waits for Back4App: a second tap must not save the task twice
  const [saving, setSaving] = useState(false);

  const days = nextSevenDays();
  // false for a late task or one more than a week away: no button shows its day
  const dayInStrip =
    day !== null && days.some((date) => date.getTime() === day.getTime());

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
    setSaving(true);

    try {
      // nobody assigned = up for grabs; a task already done was done by me
      const assignedTo = done || who === "me" ? userId : null;
      // a time and a repeat only count with a day; "" = any time
      const taskTime = day && hasTime ? time : "";
      const taskRepeats = day !== null && repeatsWeekly;

      if (task) {
        // editing: change the task that is already there, do not add a new one
        await updateTask(task.id, {
          title,
          assignedTo,
          day,
          time: taskTime,
          repeatsWeekly: taskRepeats,
        });
      } else {
        await addTask(household, {
          title,
          assignedTo,
          day,
          time: taskTime,
          done,
          repeatsWeekly: taskRepeats,
        });
      }
      // no setSaving(false) here: the sheet closes and the form is gone
      onSaved();
    } catch (saveError) {
      setError(saveError.message);
      setSaving(false); // let the user try again
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

  // only in the task sheet; onSaved closes the sheet and reloads, as after a save
  async function handleDelete() {
    setSaving(true);
    try {
      await deleteTask(task.id);
      onSaved();
    } catch (deleteError) {
      setError(deleteError.message);
      setSaving(false);
    }
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

      {/* our decision: say the day in words instead of adding a button for it;
          it stays the day unless another day is tapped */}
      {day !== null && !dayInStrip && (
        <p className="task-form__hint t-meta">
          Planned for{" "}
          {day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
        </p>
      )}

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
      {task ? (
        // editing (screens.md): Delete task | Save
        <div className="task-form__actions">
          <Button variant="brick" block disabled={saving} onClick={handleDelete}>
            Delete task
          </Button>
          <Button type="submit" block disabled={saving || !title.trim()}>
            Save
          </Button>
        </div>
      ) : (
        <div className="task-form__actions">
          <Button
            variant="secondary"
            block
            disabled={saving || !title.trim()}
            onClick={handleMarkDone}
          >
            Mark as done
          </Button>
          <Button type="submit" block disabled={saving || !title.trim()}>
            Add task
          </Button>
        </div>
      )}
    </form>
  );
}
