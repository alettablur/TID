import { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";
import AvatarPair from "../components/shared/AvatarPair.jsx";
import Button from "../components/shared/Button.jsx";
import SectionHeader from "../components/shared/SectionHeader.jsx";
import WeekSwitch from "../components/shared/WeekSwitch.jsx";
import InviteCard from "../components/us/InviteCard.jsx";
import StatsCard from "../components/us/StatsCard.jsx";
import ThankRow from "../components/us/ThankRow.jsx";
import { loadTasks } from "../services/taskService.js";
import { loadAllRequests } from "../services/requestService.js";
import {
  loadThanks,
  markThanksSeen,
  sendThanks,
} from "../services/thanksService.js";
import { otherPerson, personSlot } from "../services/householdService.js";
import { addDays } from "../utilities/dates.js";
import "./UsPage.css";

export default function UsPage({
  household,
  userId,
  onLogout,
  onHouseholdChange,
}) {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week
  const [tasks, setTasks] = useState(null);
  const [thanks, setThanks] = useState(null);
  const [requests, setRequests] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState(""); // a thank-you that could not be saved

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
        setLoadError("");
      } catch (error) {
        setLoadError(error.message);
      }
    }

    load();
    // load again every 10 seconds, so the partner's ticks and thank-yous
    // appear while the page is open
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [household]);

  const other = otherPerson(household, userId);

  async function handleThank(task) {
    try {
      setActionError("");
      const newThanks = await sendThanks(household, task, other);
      setThanks((oldThanks) => [...oldThanks, newThanks]);
    } catch (error) {
      setActionError(`Could not send the thank-you: ${error.message}`);
    }
  }

  async function handleDismiss(id) {
    try {
      setActionError("");
      await markThanksSeen([id]);
      setThanks((oldThanks) =>
        oldThanks.map((thank) =>
          thank.id === id ? { ...thank, seen: true } : thank,
        ),
      );
    } catch (error) {
      setActionError(`Could not hide the message: ${error.message}`);
    }
  }

  if (loadError) {
    return (
      <p className="us-page__status t-body">
        Could not load your week: {loadError}
      </p>
    );
  }
  if (!tasks) {
    return <p className="us-page__status t-body">Loading…</p>;
  }

  // what the partner did in the last 24 hours and I have not thanked for yet
  const since = addDays(new Date(), -1);
  const thankedTaskIds = new Set(
    thanks
      .filter((thank) => thank.createdAt >= since)
      .map((thank) => thank.taskId),
  );
  // no partner yet: nobody to thank
  const tasksToThank = other
    ? tasks.filter(
        (task) =>
          task.done &&
          task.doneAt >= since &&
          task.assignedTo === other.id &&
          !thankedTaskIds.has(task.id),
      )
    : [];

  // FR13: the thank-yous I received and have not closed yet
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
          {receivedThanks.length > 0 && (
            <ul className="us-page__notices" role="status">
              {receivedThanks.map(function renderNotice(thank) {
                function dismiss() {
                  handleDismiss(thank.id);
                }

                return (
                  <li key={thank.id} className="us-page__notice">
                    <Heart size={20} aria-hidden="true" />
                    <p className="us-page__notice-text t-body-strong">
                      {other.username} thanked you for “{thank.taskTitle}”
                    </p>
                    <button
                      type="button"
                      className="us-page__dismiss"
                      aria-label="Dismiss"
                      onClick={dismiss}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <WeekSwitch
            offset={weekOffset}
            onChange={setWeekOffset}
            canGoForward={weekOffset < 0}
          />
          <div className="us-page__stats">
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
          <p className="us-page__note t-meta">
            Organised = tasks you added, planned or proposed.
          </p>

          {actionError && (
            <p className="us-page__error t-meta" role="alert">
              {actionError}
            </p>
          )}

          {tasksToThank.length > 0 && (
            <section className="us-page__section">
              <SectionHeader title="Give thanks" count={tasksToThank.length} />
              <ul className="us-page__thanks">
                {tasksToThank.map((task) => (
                  <ThankRow
                    key={task.id}
                    task={task}
                    partnerName={other.username}
                    partnerSlot={personSlot(household, other.id)}
                    onThank={handleThank}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
