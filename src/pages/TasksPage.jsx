import { useState, useEffect } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import TaskCard from "../components/TaskCard/TaskCard.jsx";
import { loadTasks } from "../services/taskService.js";
import { addDays } from "../utilities/dates.js";

// also the page behind /tasks/:taskId, where the task sheet will open
export default function TasksPage({ household }) {
  const [tasks, setTasks] = useState(null);
  const [tasksError, setTasksError] = useState("");

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

  // done tasks get their own row later ("Done this week")
  const notDone = tasks.filter((task) => !task.done);

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

  // one card; the same for all three sections
  function renderTask(task) {
    // up for grabs: nobody's colour yet, and the card shows "Take it"
    if (task.assignedTo === null) {
      return (
        <TaskCard key={task.id} title={task.title} status="open" person={null} />
      );
    }

    // the owner is always brick ("a"), the partner petrol ("b"), on both phones
    const isOwner = task.assignedTo === household.owner.id;

    return (
      <TaskCard
        key={task.id}
        title={task.title}
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

      {/* no "Add" button here: the + in the tab bar is the only way to add */}
      {tasks.length === 0 && (
        <p className="t-body">No tasks yet. Tap + to add your first task.</p>
      )}

      {/* an empty section is left out, not shown as a heading with nothing under it */}
      {todayTasks.length > 0 && (
        <section>
          <SectionHeader title="Today" count={todayTasks.length} />
          <div>{todayTasks.map(renderTask)}</div>
        </section>
      )}

      {upcomingTasks.length > 0 && (
        <section>
          <SectionHeader title="Upcoming" count={upcomingTasks.length} />
          <div>{upcomingTasks.map(renderTask)}</div>
        </section>
      )}

      {openTasks.length > 0 && (
        <section>
          <SectionHeader title="Up for grabs" count={openTasks.length} />
          <div>{openTasks.map(renderTask)}</div>
        </section>
      )}
    </>
  );
}
