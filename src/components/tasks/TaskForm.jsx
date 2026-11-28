import { useEffect, useState } from "react";
import Button from "../shared/Button.jsx";
import ConfirmDelete from "../shared/ConfirmDelete.jsx";
import Segmented from "../shared/Segmented.jsx";
import TextField from "../shared/TextField.jsx";
import ClashNotice from "./ClashNotice.jsx";
import DayPicker from "./DayPicker.jsx";
import TimePicker from "./TimePicker.jsx";
import {
  addTask,
  deleteTask,
  loadTasks,
  setDone,
  updateTask,
} from "../../services/taskService.js";
import { askPartner } from "../../services/requestService.js";
import { otherPerson } from "../../services/householdService.js";
import { addDays, nextFullHour, startOfToday } from "../../utilities/dates.js";
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

// hasTime: false = "Any time", true = "Set time"
const TIME_MODES = [
  { value: false, label: "Any time" },
  { value: true, label: "Set time" },
];

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

  // a clash = a task of the person who will do it (Me → mine,
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

  // a request needs a day (not today) and a time
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

  function handleDayChange(date) {
    setDay(date);
    setWhenChanged(true);
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

  function handleTimeChange(newTime) {
    setTime(newTime);
    setWhenChanged(true);
  }

  function handleRepeatChange(event) {
    setRepeatsWeekly(event.target.checked);
  }

  // used by both buttons; done = true is "Mark as done" (FR5)
  async function save(done) {
    setSaving(true);

    try {
      // nobody assigned = up for grabs; a task already done was done by me;
      // a requested task stays mine until the partner accepts
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
      <TextField
        id="task-form-title"
        label="What needs doing?"
        overline
        placeholder="e.g. Empty the dishwasher"
        value={title}
        onChange={handleTitleChange}
      />

      {/* alone, there is nobody to share with: the task is simply mine */}
      {partner && (
        <>
          <p className="task-form__label t-overline" id="task-form-who">
            Who does it
          </p>
          <Segmented
            labelledBy="task-form-who"
            options={whoOptions}
            value={who}
            onChange={handleWhoChange}
          />
        </>
      )}

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
      {/* a request needs a day, so no "No date" for it */}
      <DayPicker
        labelledBy="task-form-day"
        days={stripDays}
        value={day}
        onChange={handleDayChange}
        allowNoDate={who !== "partner"}
      />

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

          {hasTime && <TimePicker value={time} onChange={handleTimeChange} />}

          {clash && (
            <ClashNotice
              clash={clash}
              who={who}
              partnerName={partner?.username}
            />
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
        // editing: Delete task | Save
        <ConfirmDelete
          label="Delete task"
          question={
            partner
              ? "Delete this task for both of you? This cannot be undone."
              : "Delete this task? This cannot be undone."
          }
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
