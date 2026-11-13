import { useState, useEffect } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import TaskCard from "../components/TaskCard/TaskCard.jsx";
import { loadTasks } from "../services/taskService.js";
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

// also the page behind /tasks/:taskId, where the task sheet will open
export default function TasksPage({ household, userId }) {
  const [tasks, setTasks] = useState(null);
  const [tasksError, setTasksError] = useState("");
  const [filter, setFilter] = useState("everyone"); // "everyone", "mine" or "partner"

  useEffect(() => {
    async function load() {
      try {
        setTasks(await loadTasks(household));
      } catch (error) {
        setTasksError(error.message);
      }
    }

    load();
  }, [household]);

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

  // "Mine" and the partner's filter show only tasks someone has taken (our decision)
  function isVisible(task) {
    if (filter === "everyone") return true;
    if (filter === "mine") return task.assignedTo === userId;
    return task.assignedTo === other.id;
  }

  // done tasks get their own row later ("Done this week")
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

  // the grey line under the title: when, and for an open task who added it
  function metaOf(task) {
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

    return (
      <TaskCard
        key={task.id}
        title={task.title}
        meta={metaOf(task)}
        status="planned"
        person={isOwner ? "a" : "b"}
        name={isOwner ? household.owner.username : household.partner.username}
        repeatsWeekly={task.repeatsWeekly}
      />
    );
  }

  return (
    <>
      <h1 className="t-screen-title">Tasks</h1>

      {/* without a partner there is nobody to filter by */}
      {other && (
        <div className="tasks-page__filters" role="group" aria-label="Whose tasks">
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
    </>
  );
}
