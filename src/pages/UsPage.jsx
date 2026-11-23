import Button from "../components/shared/Button.jsx";
import "./UsPage.css";
import { useState, useEffect } from "react";
import { loadTasks } from "../services/taskService.js";
import { loadAllRequests } from "../services/requestService.js";
import {
  loadThanks,
  markThanksSeen,
  sendThanks,
} from "../services/thanksService.js";
import InviteCard from "../components/us/InviteCard.jsx";
import StatsCard from "../components/us/StatsCard.jsx";
import WeekSwitch from "../components/shared/WeekSwitch.jsx";
import ThankCard from "../components/us/ThankCard.jsx";
import ThanksNotification from "../components/us/ThanksNotification.jsx";
import AvatarPair from "../components/shared/AvatarPair.jsx";
import { otherPerson, personSlot } from "../services/householdService.js";

export default function UsPage({
  household,
  userId,
  onLogout,
  onHouseholdChange,
}) {
  const other = otherPerson(household, userId);
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState(null);
  const [tasksError, setTasksError] = useState(null);
  const [thanks, setThanks] = useState(null);
  const [requests, setRequests] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // three independent queries, sent at the same time
        const [householdTasks, householdThanks, householdRequests] =
          await Promise.all([
            loadTasks(household),
            loadThanks(household),
            loadAllRequests(household),
          ]);
        setThanks(householdThanks);
        setRequests(householdRequests);
        setTasks(householdTasks);
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

  async function handleThank(task) {
    try {
      setActionError("");
      const newThanks = await sendThanks(household, task, other);
      setThanks((prevThanks) => [...(prevThanks ?? []), newThanks]);
    } catch (error) {
      setActionError(`Could not send the thank-you: ${error.message}`);
    }
  }

  async function handleDismiss(id) {
    try {
      setActionError("");
      await markThanksSeen([id]);
      setThanks((prev) =>
        prev.map((th) => (th.id === id ? { ...th, seen: true } : th)),
      );
    } catch (error) {
      setActionError(`Could not hide the message: ${error.message}`);
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
          <WeekSwitch
            offset={weekOffset}
            onChange={setWeekOffset}
            canGoForward={weekOffset < 0}
          />
          <div className="stats-row">
            <StatsCard
              tasks={tasks}
              thanks={thanks}
              requests={requests}
              weekOffset={weekOffset}
              userId={userId}
              title="You"
              variant={personSlot(household, userId)}
            />
            <StatsCard
              tasks={tasks}
              thanks={thanks}
              requests={requests}
              weekOffset={weekOffset}
              userId={other.id}
              title={other.username}
              variant={personSlot(household, other.id)}
            />
          </div>
          <p className="us-page__note">
            Organised = tasks you added, planned or proposed.
          </p>
          {actionError && (
            <p className="us-page__error" role="alert">
              {actionError}
            </p>
          )}
          <ThankCard
            tasks={tasksToThank}
            onThank={handleThank}
            partnerName={other.username}
            partnerSlot={personSlot(household, other.id)}
          />
        </>
      )}
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
