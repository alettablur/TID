import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import GroceriesPage from "./pages/GroceriesPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import UsPage from "./pages/UsPage.jsx";
import { currentUser, logOut } from "./services/authService.js";

function App() {
  const [user, setUser] = useState(currentUser());

  async function handleLogout() {
    try {
      await logOut();
      setUser(null);
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

  // logged in: every page inside the Layout, which draws the tab bar
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:taskId" element={<TasksPage />} />
        <Route path="groceries" element={<GroceriesPage />} />
        <Route path="us" element={<UsPage onLogout={handleLogout} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
