import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import Button from "../Button.jsx";
import {
  addTask,
  deleteTask,
  loadTasks,
  setDone,
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

// "18:30" → 1110 minutes after midnight, so two times can be subtracted
function toMinutes(time) {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

// 7 → "07": the data model stores times as "HH:mm"
function twoDigits(number) {
  return String(number).padStart(2, "0");
}

// the choices in the two time dropdowns: every hour, and the quarters
const HOURS = [];
for (let hour = 0; hour < 24; hour++) {
  HOURS.push(twoDigits(hour));
}
const QUARTERS = ["00", "15", "30", "45"];

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
  // a new task: always true. Editing: false until the day or time is changed,
  // so opening a task does not warn about a time that was chosen long ago
  const [whenChanged, setWhenChanged] = useState(!task);
  // the household's tasks, to warn about a clash; null until they are loaded
  const [householdTasks, setHouseholdTasks] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setHouseholdTasks(await loadTasks(household));
      } catch {
        // the clash notice is only a help: without the tasks the form still works
      }
    }

    load();
  }, [household]);

  const days = nextSevenDays();
  // false for a late task or one more than a week away: no button shows its day
  const dayInStrip =
    day !== null && days.some((date) => date.getTime() === day.getTime());

  // screens.md: a clash = a task of the person who will do it (Me → mine,
  // Either → both of ours) on the same day, at most 1 hour away. Only a warning.
  function findClash() {
    if (!whenChanged || !householdTasks || !day || !hasTime || !time) {
      return undefined;
    }

    return householdTasks.find(
      (other) =>
        !other.done &&
        other.id !== task?.id && // when editing, not the task itself
        (who === "me"
          ? other.assignedTo === userId
          : other.assignedTo !== null) &&
        other.day &&
        other.day.getTime() === day.getTime() &&
        other.time !== "" &&
        Math.abs(toMinutes(other.time) - toMinutes(time)) <= 60,
    );
  }

  const clash = findClash();

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
    setWhenChanged(true);
    // start the dropdowns on the next full hour, so they never show an empty time
    if (time === "") {
      const nextHour = (new Date().getHours() + 1) % 24;
      setTime(`${twoDigits(nextHour)}:00`);
    }
  }

  // the time is one "HH:mm" text; the dropdowns show and change its two halves
  const [hour, minute] = time === "" ? ["", ""] : time.split(":");

  function handleHourChange(event) {
    setTime(`${event.target.value}:${minute}`);
    setWhenChanged(true);
  }

  function handleMinuteChange(event) {
    setTime(`${hour}:${event.target.value}`);
    setWhenChanged(true);
  }

  // a task saved earlier with e.g. 18:10 keeps its minute as an extra choice
  const minuteChoices = QUARTERS.includes(minute)
    ? QUARTERS
    : [...QUARTERS, minute];

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
        // always added as not done; addTask returns the new task
        const newTask = await addTask(household, {
          title,
          assignedTo,
          day,
          time: taskTime,
          repeatsWeekly: taskRepeats,
        });
        // "Mark as done": tick it off like the circle does, so a weekly
        // task also gets next week's copy (addTask alone makes none)
        if (done) {
          await setDone(household, newTask, true);
        }
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
      <div
        className="task-form__choices"
        role="group"
        aria-labelledby="task-form-who"
      >
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
      <div
        className="task-form__days"
        role="group"
        aria-labelledby="task-form-day"
      >
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
            setWhenChanged(true);
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
          {day.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
          })}
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
          <div
            className="task-form__choices"
            role="group"
            aria-labelledby="task-form-time"
          >
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

          {/* two native dropdowns instead of <input type="time">: they work with
              screen readers and the keyboard, open the phone's own big picker
              (one hand), and cannot be left half-filled (our decision) */}
          {hasTime && (
            <div className="task-form__time">
              <select
                className="task-form__input task-form__select t-body"
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
                className="task-form__input task-form__select t-body"
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
          )}

          {clash && (
            // our decision after testing: a calm icon and colours instead of the
            // ⚠ Clash chip, which felt like an error; still icon + words (NFR6)
            <p className="task-form__clash t-meta">
              <CalendarClock
                className="task-form__clash-icon"
                size={16}
                aria-hidden="true"
              />
              <span>
                <strong>Close in time</strong>{" "}
                {who === "me" ? "to one of your tasks" : "to a planned task"}
                {" · "}
                {clash.title} ·{" "}
                {clash.day.getTime() === days[0].getTime()
                  ? "today"
                  : clash.day.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                    })}{" "}
                {clash.time}
              </span>
            </p>
          )}

          {/* the label around the checkbox: tapping the text ticks it too */}
          <label className="task-form__repeat">
            <span className="task-form__repeat-text">
              <span className="t-body-strong">Repeat every week</span>
              <span className="t-meta">
                A new copy appears when this one is done
              </span>
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
          <Button
            variant="brick"
            block
            disabled={saving}
            onClick={handleDelete}
          >
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
