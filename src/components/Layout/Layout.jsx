import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sheet from "../Sheet.jsx";
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
export default function Layout() {
  const { pathname } = useLocation();
  const page = pageOf(pathname);

  // a sheet is component state, not a route: null, "task" or "grocery"
  const [addForm, setAddForm] = useState(null);

  function handleAdd(currentPage) {
    setAddForm(currentPage === "groceries" ? "grocery" : "task");
  }

  function handleCloseAddForm() {
    setAddForm(null);
  }

  return (
    <div className="layout app-glow">
      <main className="layout__main">
        <Outlet />
      </main>

      <TabBar page={page} onAdd={handleAdd} />

      {addForm && (
        <Sheet
          title={addForm === "grocery" ? "New grocery" : "New task"}
          onClose={handleCloseAddForm}
        >
          <p className="layout__placeholder t-body">
            The {addForm} form comes with its slice.
          </p>
        </Sheet>
      )}
    </div>
  );
}
