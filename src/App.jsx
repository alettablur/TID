import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import GroceriesPage from "./pages/GroceriesPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import UsPage from "./pages/UsPage.jsx";
import { currentUser, logOut } from "./services/authService.js";
import { loadHousehold } from "./services/householdService.js";

function App() {
  const [user, setUser] = useState(currentUser());
  const [household, setHousehold] = useState(null);
  const [householdError, setHouseholdError] = useState("");

  useEffect(() => {
    // nobody logged in yet: nothing to load
    if (!user) return;

    async function load() {
      try {
        setHousehold(await loadHousehold());
      } catch (error) {
        setHouseholdError(error.message);
      }
    }

    load();
  }, [user]); // load again whenever somebody else logs in

  async function handleLogout() {
    try {
      await logOut();
      setUser(null);
      setHousehold(null);
      setHouseholdError("");
    } catch (error) {
      alert(error);
    }
  }

  function handleAuthenticated(loggedInUser) {
    setUser(loggedInUser);
  }

  // logged out: the login page, whatever the address
  if (!user) {
    return (
      <Routes>
        <Route
          path="*"
          element={<AuthPage onAuthenticated={handleAuthenticated} />}
        />
      </Routes>
    );
  }

  // every page needs the household, so nothing renders before it is here
  if (householdError) {
    return (
      <p className="app__status">
        Could not load your household: {householdError}
      </p>
    );
  }
  if (!household) {
    return <p className="app__status">Loading…</p>;
  }

  // logged in: every page inside the Layout, which draws the tab bar
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:taskId" element={<TasksPage />} />
        <Route path="groceries" element={<GroceriesPage />} />
        <Route path="us" element={<UsPage household={household} onLogout={handleLogout} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
