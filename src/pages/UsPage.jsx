import Button from "../components/Button.jsx";
import "./UsPage.css";
import { useState, useEffect } from "react";
import { loadTasks } from "../services/taskService.js";
import InviteCard from "../components/InviteCard/InviteCard.jsx";
import StatsCard from "../components/StatsCard/StatsCard.jsx";
import WeekBar from "../components/WeekBar/WeekBar.jsx";
import AvatarPair from "../components/AvatarPair.jsx";

export default function UsPage({
  household,
  userId,
  onLogout,
  onHouseholdChange,
}) {
  // the person who is not me: for the owner it's the partner, for the partner it's the owner
  const other =
    household.owner.id === userId ? household.partner : household.owner;
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState(null);
  const [tasksError, setTasksError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setTasks(await loadTasks(household));
        setTasksError(null);
      } catch (error) {
        setTasksError(error.message);
      }
    }
    load();
    // polling the server every 10 sec to reload the tasks -- consider making this custom hook
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [household]);

  // early returns if there is an error in loading the tasks
  if (tasksError)
    return (
      <p className="stats-card__error" role="alert">
        {tasksError}
      </p>
    );
  if (!tasks) return <p>Loading…</p>;

  return (
    <>
      <p className="t-overline">{household.name}</p>
      <div className="us-page__header">
        <h1 className="t-screen-title">Us</h1>
        <AvatarPair household={household} />
      </div>
      {!other ? (
        <InviteCard
          household={household}
          onHouseholdChange={onHouseholdChange}
        />
      ) : (
        <>
          <WeekBar weekOffset={weekOffset} onChange={setWeekOffset} />
          <div className="stats-row">
            <StatsCard
              tasks={tasks}
              weekOffset={weekOffset}
              userId={userId}
              title="You"
              variant="a"
            />
            <StatsCard
              tasks={tasks}
              weekOffset={weekOffset}
              userId={other.id}
              title={other.username}
              variant="b"
            />
          </div>
          <p className="us-page__note">
            Organised = tasks you added, planned or proposed.
          </p>
        </>
      )}
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
