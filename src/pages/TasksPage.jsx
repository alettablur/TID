import { useState, useEffect } from "react";
import { loadTasks } from "../services/taskService.js";

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

  // assignedTo null = nobody has taken the task yet
  const openTasks = tasks.filter((task) => task.assignedTo === null);
  const assignedTasks = tasks.filter((task) => task.assignedTo !== null);

  return (
    <>
      <h1 className="t-screen-title">Tasks</h1>

      <h2>Planned</h2>
      <ul>
        {assignedTasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>

      <h2>Up for grabs</h2>
      <ul>
        {openTasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </>
  );
}
