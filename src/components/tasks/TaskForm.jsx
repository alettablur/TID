import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import Button from "../shared/Button.jsx";
import ConfirmDelete from "../shared/ConfirmDelete.jsx";
import Segmented from "../shared/Segmented.jsx";
import {
  addTask,
  deleteTask,
  loadTasks,
  setDone,
  updateTask,
} from "../../services/taskService.js";
import { askPartner } from "../../services/requestService.js";
import { otherPerson } from "../../services/householdService.js";
import {
  addDays,
  formatDay,
  formatWeekday,
  startOfToday,
} from "../../utilities/dates.js";
import "./TaskForm.css";

// the days you can pick: today and the six days after it, each at 00:00
function nextSevenDays() {
  const today = startOfToday();
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

// hasTime: false = "Any time", true = "Set time"
const TIME_MODES = [
  { value: false, label: "Any time" },
  { value: true, label: "Set time" },
];

// "19:00" when it is 18:20: where the time dropdowns start
function nextFullHour() {
  return `${twoDigits((new Date().getHours() + 1) % 24)}:00`;
}

// the form in the + sheet: a new task (FR3). With a task, the same form
// edits that task in the task sheet, and every field starts from it.
export default function TaskForm({ household, userId, task, onSaved }) {
  const [title, setTitle] = useState(task ? task.title : "");
  const [error, setError] = useState("");
  // FR6: "me", "partner" (a request, FR9) or "either" (up for grabs)
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

  const partner = otherPerson(household, userId);

  // asking the partner: only for a new task, and only with a partner
  const whoOptions = [{ value: "me", label: "Me" }];
  if (partner && !task) {
    whoOptions.push({ value: "partner", label: partner.username });
  }
  whoOptions.push({ value: "either", label: "Either of us" });

  const days = nextSevenDays();
  // a request must be answered the day before (FR9), so it cannot be for today
  // (our decision): the strip starts tomorrow
  const stripDays = who === "partner" ? days.slice(1) : days;
  // false for a late task or one more than a week away: no button shows its day
  const dayInStrip =
    day !== null && stripDays.some((date) => date.getTime() === day.getTime());

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
          : who === "partner"
            ? other.assignedTo === partner.id
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

  function handleWhoChange(value) {
    setWho(value);
    if (value === "partner") {
      prepareRequest();
    }
  }

  // a request needs a day (not today) and a time (screens.md: "needed for a request")
  function prepareRequest() {
    setWhenChanged(true);
    if (day !== null && day.getTime() === days[0].getTime()) {
      setDay(null);
    }
    setHasTime(true);
    if (time === "") {
      setTime(nextFullHour());
    }
  }

  function chooseNoDate() {
    setDay(null);
  }

  function handleTimeModeChange(value) {
    setHasTime(value);
    if (value) {
      setWhenChanged(true);
      // start the dropdowns on the next full hour, so they never show an empty time
      if (time === "") {
        setTime(nextFullHour());
      }
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
    setRepeatsWeekly(event.target.checked);
  }

  // used by both buttons; done = true is "Mark as done" (FR5)
  async function save(done) {
    setSaving(true);

    try {
      // nobody assigned = up for grabs; a task already done was done by me;
      // a requested task stays mine until the partner accepts (data-model.md)
      const assignedTo = who === "either" && !done ? null : userId;
      // a time and a repeat only count with a day; "" = any time;
      // a request does not repeat (left out of our small version)
      const taskTime = day && hasTime ? time : "";
      const taskRepeats = day !== null && repeatsWeekly && who !== "partner";

      if (task) {
        await updateTask(task.id, {
          title,
          assignedTo,
          day,
          time: taskTime,
          repeatsWeekly: taskRepeats,
        });
      } else {
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
        // FR9: the task is there, now ask the partner to do it then
        if (who === "partner") {
          await askPartner(household, newTask, partner.id, day, taskTime);
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
      <Segmented
        labelledBy="task-form-who"
        options={whoOptions}
        value={who}
        onChange={handleWhoChange}
      />

      {who === "either" && (
        <p className="task-form__notice t-meta">Goes to Up for grabs</p>
      )}

      {who === "partner" && (
        <p className="task-form__hint t-meta">
          {partner.username} can accept or decline, and must reply by the day
          before.
        </p>
      )}

      {/* for an up-for-grabs task the day is a deadline, and it may be left empty */}
      <p className="task-form__label t-overline" id="task-form-day">
        {who === "either"
          ? "By when · optional"
          : who === "partner"
            ? "When · needed for a request"
            : "Day"}
      </p>
      <div
        className="task-form__days"
        role="group"
        aria-labelledby="task-form-day"
      >
        {/* a request needs a day */}
        {who !== "partner" && (
          <button
            type="button"
            className="task-form__choice task-form__day"
            aria-pressed={day === null}
            onClick={chooseNoDate}
          >
            <span className="t-chip">No</span>
            <span className="t-body-strong">date</span>
          </button>
        )}

        {stripDays.map(function renderDay(date) {
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
                {date.getTime() === days[0].getTime()
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
      {day !== null && !dayInStrip && (
        <p className="task-form__hint t-meta">Planned for {formatDay(day)}</p>
      )}

      {/* decision after the wireframe tests: the time appears once a day is chosen */}
      {day === null ? (
        <p className="task-form__hint t-meta">Pick a day to choose a time.</p>
      ) : (
        <>
          <p className="task-form__label t-overline" id="task-form-time">
            Time
          </p>
          {/* a request always has a time, so no "Any time" choice for it */}
          {who !== "partner" && (
            <Segmented
              labelledBy="task-form-time"
              options={TIME_MODES}
              value={hasTime}
              onChange={handleTimeModeChange}
            />
          )}

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
                {who === "me"
                  ? "to one of your tasks"
                  : who === "partner"
                    ? `to one of ${partner.username}'s tasks`
                    : "to a planned task"}
                {" · "}
                {clash.title} ·{" "}
                {clash.day.getTime() === days[0].getTime()
                  ? "today"
                  : formatDay(clash.day)}{" "}
                {clash.time}
              </span>
            </p>
          )}

          {/* the label around the checkbox: tapping the text ticks it too;
              a request does not repeat (left out of our small version) */}
          {who !== "partner" && (
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
          )}
        </>
      )}

      {error && <p className="task-form__error t-meta">{error}</p>}

      {/* NFR5: a task cannot be saved without a title */}
      {task ? (
        // editing (screens.md): Delete task | Save
        <ConfirmDelete
          label="Delete task"
          question="Delete this task for both of you? This cannot be undone."
          disabled={saving}
          onDelete={handleDelete}
        >
          <Button type="submit" block disabled={saving || !title.trim()}>
            Save
          </Button>
        </ConfirmDelete>
      ) : who === "partner" ? (
        // a request: one button, and only once a day is picked
        <div className="task-form__send">
          <Button
            type="submit"
            block
            disabled={saving || !title.trim() || !day}
          >
            Send request to {partner.username}
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
