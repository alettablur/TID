import Button from "../components/Button.jsx";
import "./UsPage.css";
import { useState, useEffect } from "react";
import { loadTasks } from "../services/taskService.js";
import {
  loadThanks,
  markThanksSeen,
  sendThanks,
} from "../services/thanksService.js";
import InviteCard from "../components/InviteCard/InviteCard.jsx";
import StatsCard from "../components/StatsCard/StatsCard.jsx";
import WeekBar from "../components/WeekBar/WeekBar.jsx";
import ThankCard from "../components/ThankCard/ThankCard.jsx";
import ThanksNotification from "../components/ThanksNotification/ThanksNotification.jsx";
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
  const [thanks, setThanks] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // loading tasks and thanks at the same time as they are not depending on eachother
        const [householdTasks, householdThanks] = await Promise.all([
          loadTasks(household),
          loadThanks(household),
        ]);
        setTasks(householdTasks);
        setTasksError(null);
        setThanks(householdThanks);
      } catch (error) {
        setTasksError(error.message);
      }
    }
    load();
    // polling the server every 10 sec to reload the tasks -- consider making this custom hook
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [household]);

  async function handleThank(task) {
    try {
      const newThanks = await sendThanks(task, other);
      setThanks((prevThanks) => [...(prevThanks ?? []), newThanks]);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDismiss(id) {
    try {
      await markThanksSeen([id]);
      setThanks((prev) =>
        prev.map((th) => (th.id === id ? { ...th, seen: true } : th)),
      );
    } catch (error) {
      console.error(error);
    }
  }

  // early returns if there is an error in loading the tasks
  if (tasksError)
    return (
      <p className="stats-card__error" role="alert">
        {tasksError}
      </p>
    );
  if (!tasks) return <p>Loading…</p>;

  // dates of yesterday for the notification of a task done by the partner
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const thankedTaskIds = new Set(
    thanks.filter((t) => t.createdAt >= yesterday).map((t) => t.taskId),
  );
  const tasksToThank = tasks.filter(
    (task) =>
      other && // make sure that unassigned tasks before the partner joins are not shown
      task.done &&
      task.doneAt >= yesterday &&
      task.assignedTo === other.id &&
      !thankedTaskIds.has(task.id),
  );

  const receivedThanks = thanks.filter(
    (thank) => thank.to === userId && !thank.seen,
  );
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
          <ThanksNotification
            receivedThanks={receivedThanks}
            onDismiss={handleDismiss}
            partnerName={other.username}
          ></ThanksNotification>
          <WeekBar weekOffset={weekOffset} onChange={setWeekOffset} />
          <div className="stats-row">
            <StatsCard
              tasks={tasks}
              thanks={thanks}
              weekOffset={weekOffset}
              userId={userId}
              title="You"
              variant="a"
            />
            <StatsCard
              tasks={tasks}
              thanks={thanks}
              weekOffset={weekOffset}
              userId={other.id}
              title={other.username}
              variant="b"
            />
          </div>
          <p className="us-page__note">
            Organised = tasks you added, planned or proposed.
          </p>
          <ThankCard
            tasks={tasksToThank}
            onThank={handleThank}
            partnerName={other.username}
          />
        </>
      )}
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
