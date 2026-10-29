import HomePage from "./pages/HomePage.jsx";
import ListPage from "./pages/ListPage.jsx";
import { Link, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import AuthPage from "./pages/AuthPage.jsx";
import { currentUser, logOut } from "./services/authService.js";
import {
  loadMyLists,
  loadSharedWithMe,
  addList,
  shareList,
  leaveList,
} from "./services/listService.js";

function App() {
  const [user, setUser] = useState(currentUser());
  const [lists, setLists] = useState([]);
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    // nobody logged in yet: nothing to load
    if (!user) return;

    async function loadLists() {
      setLists(await loadMyLists());
      setMemberships(await loadSharedWithMe());
    }

    loadLists();
  }, [user]); // load again whenever somebody else logs in

  async function handleAddList(name) {
    try {
      const savedList = await addList(name);
      setLists([...lists, savedList]);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleShare(list, username) {
    try {
      await shareList(list, username);
      alert(`Shared ${list.get("name")} with ${username}`);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleLeave(membership) {
    try {
      await leaveList(membership);
      setMemberships(memberships.filter((each) => each.id !== membership.id));
    } catch (error) {
      alert(error.message);
    }
  }

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

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            lists={lists}
            memberships={memberships}
            onAddList={handleAddList}
            onShare={handleShare}
            onLeave={handleLeave}
            onLogout={handleLogout}
          />
        }
      />
      <Route path="/lists/:listId" element={<ListPage />} />
      <Route path="*" element={<Link to="/">No such page</Link>} />
    </Routes>
  );
}

export default App;
