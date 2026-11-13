import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sheet from "../Sheet.jsx";
import TaskForm from "../TaskForm/TaskForm.jsx";
import TabBar from "./TabBar.jsx";
import "./Layout.css";

// which tab an address belongs to: /tasks/:taskId is still Tasks
function pageOf(pathname) {
  if (pathname.startsWith("/tasks")) return "tasks";
  if (pathname.startsWith("/groceries")) return "groceries";
  if (pathname.startsWith("/us")) return "us";
  return "home";
}

// every page of a logged-in user: the page itself, then the tab bar
export default function Layout({ household, userId }) {
  const { pathname } = useLocation();
  const page = pageOf(pathname);

  // a sheet is component state, not a route: null, "task" or "grocery"
  const [addForm, setAddForm] = useState(null);

  // goes up by 1 for every new task; the page reloads its tasks when it changes
  const [tasksVersion, setTasksVersion] = useState(0);

  function handleAdd(currentPage) {
    setAddForm(currentPage === "groceries" ? "grocery" : "task");
  }

  function handleCloseAddForm() {
    setAddForm(null);
  }

  function handleTaskAdded() {
    setAddForm(null);
    setTasksVersion(tasksVersion + 1);
  }

  return (
    <div className="layout app-glow">
      <main className="layout__main">
        {/* the page and the form are siblings: the page reads this with useOutletContext */}
        <Outlet context={tasksVersion} />
      </main>

      <TabBar page={page} onAdd={handleAdd} />

      {addForm && (
        <Sheet
          title={addForm === "grocery" ? "New grocery" : "New task"}
          onClose={handleCloseAddForm}
        >
          {addForm === "task" ? (
            <TaskForm
              household={household}
              userId={userId}
              onAdded={handleTaskAdded}
            />
          ) : (
            <p className="layout__placeholder t-body">
              The {addForm} form comes with its slice.
            </p>
          )}
        </Sheet>
      )}
    </div>
  );
}
