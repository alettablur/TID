import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import TaskCard from "../components/TaskCard/TaskCard.jsx";
import Toast from "../components/Toast.jsx";
import { loadTasks, setDone, undoDone } from "../services/taskService.js";
import { addDays } from "../utilities/dates.js";
import "./TasksPage.css";

// for sort(): a negative number puts a first, a positive number puts b first
function compareTasks(a, b) {
  // a task with no day goes after the ones with a day
  if (a.day && !b.day) return -1;
  if (!a.day && b.day) return 1;

  // two different days: the earlier day first
  if (a.day && b.day && a.day.getTime() !== b.day.getTime()) {
    return a.day - b.day;
  }

  // the same day: by time, "HH:mm" sorts like text; "any time" ("") goes last
  return (a.time || "24:00").localeCompare(b.time || "24:00");
}

// "Sat 10"
function formatDay(date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

// "08:15"
function formatTime(date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Monday at 00:00: the week runs Monday to Sunday, as in the Us overview (data-model.md)
function startOfWeek(today) {
  // getDay() is 0 for Sunday, 1 for Monday … 6 for Saturday
  const daysSinceMonday = (today.getDay() + 6) % 7;
  return addDays(today, -daysSinceMonday);
}

// also the page behind /tasks/:taskId, where the task sheet will open
export default function TasksPage({ household, userId }) {
  const [tasks, setTasks] = useState(null);
  const [tasksError, setTasksError] = useState("");
  const [filter, setFilter] = useState("everyone"); // "everyone", "mine" or "partner"
  const [doneError, setDoneError] = useState(""); // a tick that could not be saved
  const [showDone, setShowDone] = useState(false); // "Done this week" starts folded
  // the task just ticked off, while its Undo is shown: { task, copyId } or null
  const [lastDone, setLastDone] = useState(null);

  // Layout raises this number when the + form has added a task
  const tasksVersion = useOutletContext();

  useEffect(() => {
    async function load() {
      try {
        setTasks(await loadTasks(household));
      } catch (error) {
        setTasksError(error.message);
      }
    }

    load();
  }, [household, tasksVersion]); // load again after a new task

  // NFR5: the Undo stays for 5 seconds after a tick
  useEffect(() => {
    if (!lastDone) return;

    function hideUndo() {
      setLastDone(null);
    }

    const timer = setTimeout(hideUndo, 5000);
    // a new tick (or Undo) before the 5 s are up: stop the old timer first
    return () => clearTimeout(timer);
  }, [lastDone]);

  if (tasksError) {
    return (
      <p className="app__status">Could not load the tasks: {tasksError}</p>
    );
  }
  if (!tasks) {
    return <p className="app__status">Loading…</p>;
  }

  // today at 00:00: a task planned for any time today counts as today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = addDays(today, 1);

  // the other person: the partner if I am the owner, otherwise the owner
  const other =
    userId === household.owner.id ? household.partner : household.owner;

  function showEveryone() {
    setFilter("everyone");
  }

  function showMine() {
    setFilter("mine");
  }

  function showPartner() {
    setFilter("partner");
  }

  async function handleToggle(task) {
    try {
      setDoneError(""); // a new try: the old message goes away
      // setDone returns next week's copy of a weekly task, or null
      const copy = await setDone(household, task, true);
      setLastDone({ task, copyId: copy ? copy.id : null });
      // load again: the done task leaves the list, a weekly task's new copy appears
      setTasks(await loadTasks(household));
    } catch (error) {
      setDoneError(error.message);
    }
  }

  async function handleUndo() {
    const { task, copyId } = lastDone;
    setLastDone(null); // the toast goes away at once
    try {
      setDoneError("");
      // not done again, and next week's copy is deleted
      await undoDone(task.id, copyId);
      setTasks(await loadTasks(household));
    } catch (error) {
      setDoneError(error.message);
    }
  }

  // "Mine" and the partner's filter show only tasks someone has taken (our decision)
  function isVisible(task) {
    if (filter === "everyone") return true;
    if (filter === "mine") return task.assignedTo === userId;
    return task.assignedTo === other.id;
  }

  function toggleShowDone() {
    setShowDone(!showDone);
  }

  // done tasks have their own folded row ("Done this week")
  // sorted once here: the filters below keep this order
  const notDone = tasks
    .filter((task) => !task.done)
    .filter(isVisible)
    .sort(compareTasks);

  // assignedTo null = nobody has taken the task yet
  const openTasks = notDone.filter((task) => task.assignedTo === null);
  const assignedTasks = notDone.filter((task) => task.assignedTo !== null);

  // a late task stays in Today until it is done
  const todayTasks = assignedTasks.filter(
    (task) => task.day && task.day < tomorrow,
  );
  // no day yet counts as later
  const upcomingTasks = assignedTasks.filter(
    (task) => !task.day || task.day >= tomorrow,
  );

  // like Bought on Groceries: the last one done comes first
  const monday = startOfWeek(today);
  const doneThisWeek = tasks
    .filter((task) => task.done && task.doneAt && task.doneAt >= monday)
    .filter(isVisible)
    .sort((a, b) => b.doneAt - a.doneAt);

  // the grey line under the title: when, and for an open task who added it
  function metaOf(task) {
    // like "bought by Sam, just now" on Groceries: who did it and when (FR8)
    if (task.done) {
      const doneBy = task.assignedTo === userId ? "you" : other.username;
      return `done by ${doneBy} · ${formatDay(task.doneAt)}, ${formatTime(task.doneAt)}`;
    }

    if (task.assignedTo === null) {
      const deadline = task.day ? `by ${formatDay(task.day)}` : "No date";
      const addedBy = task.addedBy === userId ? "you" : other.username;
      return `${deadline} · added by ${addedBy}`;
    }

    if (!task.day) return "No date";

    const isToday = task.day >= today && task.day < tomorrow;
    const day = isToday ? "Today" : formatDay(task.day);
    const time = task.time || "Any time";
    // a late task stays in Today, so it says it is late (our decision)
    const late = task.day < today ? " · late" : "";
    return `${day} · ${time}${late}`;
  }

  // one card; the same for all three sections
  function renderTask(task) {
    // up for grabs: nobody's colour yet, and the card shows "Take it"
    if (task.assignedTo === null) {
      return (
        <TaskCard
          key={task.id}
          title={task.title}
          meta={metaOf(task)}
          status="open"
          person={null}
        />
      );
    }

    // the owner is always brick ("a"), the partner petrol ("b"), on both phones
    const isOwner = task.assignedTo === household.owner.id;

    // the card calls onToggle() without saying which task, so each card gets its own
    function toggle() {
      handleToggle(task);
    }

    return (
      <TaskCard
        key={task.id}
        title={task.title}
        meta={metaOf(task)}
        status="planned"
        person={isOwner ? "a" : "b"}
        name={isOwner ? household.owner.username : household.partner.username}
        repeatsWeekly={task.repeatsWeekly}
        done={task.done}
        // un-ticking a done task comes with the 5-second undo (NFR5)
        onToggle={task.done ? undefined : toggle}
      />
    );
  }

  return (
    <>
      <h1 className="t-screen-title">Tasks</h1>

      {/* without a partner there is nobody to filter by */}
      {other && (
        <div
          className="tasks-page__filters"
          role="group"
          aria-label="Whose tasks"
        >
          <button
            type="button"
            className="tasks-page__filter t-body-strong"
            aria-pressed={filter === "everyone"}
            onClick={showEveryone}
          >
            Everyone
          </button>
          <button
            type="button"
            className="tasks-page__filter t-body-strong"
            aria-pressed={filter === "mine"}
            onClick={showMine}
          >
            Mine
          </button>
          <button
            type="button"
            className="tasks-page__filter t-body-strong"
            aria-pressed={filter === "partner"}
            onClick={showPartner}
          >
            {other.username}'s
          </button>
        </div>
      )}

      {doneError && <p className="tasks-page__error t-meta">{doneError}</p>}

      {/* no "Add" button here: the + in the tab bar is the only way to add */}
      {tasks.length === 0 && (
        <p className="t-body">No tasks yet. Tap + to add your first task.</p>
      )}

      {/* an empty section is left out, not shown as a heading with nothing under it */}
      {todayTasks.length > 0 && (
        <section className="tasks-page__section">
          <SectionHeader title="Today" count={todayTasks.length} />
          <div className="tasks-page__list">{todayTasks.map(renderTask)}</div>
        </section>
      )}

      {upcomingTasks.length > 0 && (
        <section className="tasks-page__section">
          <SectionHeader title="Upcoming" count={upcomingTasks.length} />
          <div className="tasks-page__list">
            {upcomingTasks.map(renderTask)}
          </div>
        </section>
      )}

      {openTasks.length > 0 && (
        <section className="tasks-page__section">
          <SectionHeader title="Up for grabs" count={openTasks.length} />
          <div className="tasks-page__list">{openTasks.map(renderTask)}</div>
        </section>
      )}

      {/* folded at first: done work is visible, but does not push the open tasks away */}
      {doneThisWeek.length > 0 && (
        <section className="tasks-page__section">
          <button
            type="button"
            className="tasks-page__done-toggle"
            aria-expanded={showDone}
            onClick={toggleShowDone}
          >
            <span className="t-section-title">Done this week</span>
            <span className="tasks-page__done-count t-chip">
              {doneThisWeek.length}
            </span>
            {showDone ? (
              <ChevronDown size={20} aria-hidden="true" />
            ) : (
              <ChevronRight size={20} aria-hidden="true" />
            )}
          </button>

          {showDone && (
            <div className="tasks-page__list">
              {doneThisWeek.map(renderTask)}
            </div>
          )}
        </section>
      )}

      {/* last in the page, so it sits at the bottom, just above the tab bar */}
      {lastDone && (
        <Toast message={`${lastDone.task.title} · done`} onUndo={handleUndo} />
      )}
    </>
  );
}
