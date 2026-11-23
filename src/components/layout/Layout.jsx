import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Segmented from "../shared/Segmented.jsx";
import Sheet from "../shared/Sheet.jsx";
import TaskForm from "../tasks/TaskForm.jsx";
import GroceryForm from "../groceries/GroceryForm.jsx";
import TabBar from "./TabBar.jsx";
import "./Layout.css";

// which tab an address belongs to: /tasks/:taskId is still Tasks
function pageOf(pathname) {
  if (pathname.startsWith("/tasks")) return "tasks";
  if (pathname.startsWith("/groceries")) return "groceries";
  if (pathname.startsWith("/us")) return "us";
  return "home";
}

const ADD_CHOICES = [
  { value: "task", label: "Task" },
  { value: "grocery", label: "Grocery" },
];

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
    setTasksVersion((version) => version + 1);
  }

  function handleGroceryAdded() {
    setTasksVersion((version) => version + 1);
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
          <Segmented
            label="What to add"
            options={ADD_CHOICES}
            value={addForm}
            onChange={setAddForm}
          />

          {addForm === "task" ? (
            <TaskForm
              household={household}
              userId={userId}
              onSaved={handleTaskAdded}
            />
          ) : (
            <GroceryForm
              household={household}
              userId={userId}
              onAdded={handleGroceryAdded}
              onDone={handleCloseAddForm}
            />
          )}
        </Sheet>
      )}
    </div>
  );
}
