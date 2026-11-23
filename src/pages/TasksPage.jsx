import { useState, useEffect } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { CalendarDays, ListChecks } from "lucide-react";
import FoldSection from "../components/shared/FoldSection.jsx";
import SectionHeader from "../components/shared/SectionHeader.jsx";
import Avatar from "../components/shared/Avatar.jsx";
import Sheet from "../components/shared/Sheet.jsx";
import TaskCard from "../components/tasks/TaskCard.jsx";
import TaskForm from "../components/tasks/TaskForm.jsx";
import RequestDetails from "../components/tasks/RequestDetails.jsx";
import Toast from "../components/shared/Toast.jsx";
import {
  loadTasks,
  setDone,
  takeTask,
  undoDone,
} from "../services/taskService.js";
import { loadRequests } from "../services/requestService.js";
import {
  addDays,
  formatDay,
  formatLongDay,
  formatTime,
  formatWeekday,
  startOfToday,
  startOfWeek,
} from "../utilities/dates.js";
import "./TasksPage.css";

// for sort(): a negative number puts a first, a positive number puts b first
function compareTasks(a, b) {
  // a task with no day goes after the ones with a day
  if (a.day && !b.day) return -1;
  if (!a.day && b.day) return 1;

  // two different days: the earlier day first
  if (a.day && b.day && a.day.getTime() !== b.day.getTime()) {
    return a.day - b.day;
  }

  // the same day: by time, "HH:mm" sorts like text; "any time" ("") goes last
  return (a.time || "24:00").localeCompare(b.time || "24:00");
}

// also the page behind /tasks/:taskId, where the task sheet will open
export default function TasksPage({ household, userId }) {
  const [tasks, setTasks] = useState(null);
  const [tasksError, setTasksError] = useState("");
  const [filter, setFilter] = useState("everyone"); // "everyone", "mine" or "partner"
  const [saveError, setSaveError] = useState(""); // a tick or a take that could not be saved
  // the message at the bottom, or null. After a tick it also has { task, copyId }
  // for the Undo; after a take it is only { message }. One toast at a time.
  const [toast, setToast] = useState(null);
  // the day picked in the Week view; null = today (the view opens on today)
  const [pickedDay, setPickedDay] = useState(null);
  // the open requests (US2); loaded together with the tasks
  const [requests, setRequests] = useState([]);

  // Layout raises this number when the + form has added a task
  const tasksVersion = useOutletContext();

  // on /tasks/abc123 the sheet shows task abc123; on /tasks, taskId is undefined
  const { taskId } = useParams();
  const navigate = useNavigate();

  // List or Week lives in the address (?view=week), so a reload or Back keeps it;
  // no ?view means the List (requirements: Tasks opens on the List)
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "week" ? "week" : "list";
  // added to every /tasks address of this page, so opening a task keeps the view
  const viewQuery = view === "week" ? "?view=week" : "";

  useEffect(() => {
    async function load() {
      try {
        const loadedTasks = await loadTasks(household);
        const loadedRequests = await loadRequests(household);
        // requests first: when the tasks arrive, the page draws with both
        setRequests(loadedRequests);
        setTasks(loadedTasks);
      } catch (error) {
        setTasksError(error.message);
      }
    }

    load();
  }, [household, tasksVersion]); // load again after a new task (or request)

  // every toast stays for 5 seconds (NFR5: the Undo after a tick)
  useEffect(() => {
    if (!toast) return;

    function hideToast() {
      setToast(null);
    }

    const timer = setTimeout(hideToast, 5000);
    // a new toast (or Undo) before the 5 s are up: stop the old timer first
    return () => clearTimeout(timer);
  }, [toast]);

  if (tasksError) {
    return (
      <p className="tasks-page__status t-body">
        Could not load the tasks: {tasksError}
      </p>
    );
  }
  if (!tasks) {
    return <p className="tasks-page__status t-body">Loading…</p>;
  }

  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  // the other person: the partner if I am the owner, otherwise the owner
  const other =
    userId === household.owner.id ? household.partner : household.owner;

  function showEveryone() {
    setFilter("everyone");
  }

  function showMine() {
    setFilter("mine");
  }

  function showPartner() {
    setFilter("partner");
  }

  async function handleToggle(task) {
    try {
      setSaveError(""); // a new try: the old message goes away
      // setDone returns next week's copy of a weekly task, or null
      const copy = await setDone(household, task, true);
      setToast({
        // the title in quotes: the whole toast is bold, so quotes mark where a long title ends
        message: `“${task.title}” · done`,
        task,
        copyId: copy ? copy.id : null,
      });
      // load again: the done task leaves the list, a weekly task's new copy appears
      setTasks(await loadTasks(household));
    } catch (error) {
      setSaveError(error.message);
    }
  }

  async function handleUndo() {
    const { task, copyId } = toast;
    setToast(null); // the toast goes away at once
    try {
      setSaveError("");
      // not done again, and next week's copy is deleted
      await undoDone(task.id, copyId);
      setTasks(await loadTasks(household));
    } catch (error) {
      setSaveError(error.message);
    }
  }

  // FR7. For now the deadline becomes the day, with no time; the
  // "When will you do it?" sheet (screens.md) comes later
  async function handleTake(task) {
    try {
      setSaveError("");
      await takeTask(task.id, task.day, "");
      // without a partner there is nobody who "can see it"
      const seenBy = other ? ` · ${other.username} can see it` : "";
      setToast({ message: `You took “${task.title}”${seenBy}` });
      setTasks(await loadTasks(household));
    } catch (error) {
      setSaveError(error.message);
    }
  }

  // "Mine" and the partner's filter show only tasks someone has taken (our decision)
  function isVisible(task) {
    if (filter === "everyone") return true;
    if (filter === "mine") return task.assignedTo === userId;
    return task.assignedTo === other.id;
  }

  // back to /tasks: the address has no id any more, so the sheet closes
  function closeSheet() {
    navigate(`/tasks${viewQuery}`);
  }

  function showList() {
    setSearchParams({});
  }

  function showWeek() {
    setSearchParams({ view: "week" });
  }

  // after Save or Delete in the sheet: close it, then show the changed list
  async function handleTaskSaved() {
    closeSheet();
    try {
      // the requests too: an answered request leaves "To answer" / "Waiting for"
      const loadedTasks = await loadTasks(household);
      setRequests(await loadRequests(household));
      setTasks(loadedTasks);
    } catch (error) {
      setTasksError(error.message);
    }
  }

  // after Accept or Decline in the sheet (screens.md H5: "Confirmed · …")
  function handleAnswered(accepted) {
    setToast({
      message: accepted
        ? `Confirmed · “${selectedTask.title}”`
        : `Declined · “${selectedTask.title}” is up for grabs now`,
    });
    handleTaskSaved();
  }

  // undefined if there is no id, or no task with it (deleted by the partner, say)
  const selectedTask = tasks.find((task) => task.id === taskId);
  // mine and up-for-grabs tasks can be edited; the partner's only looked at (our decision)
  const canEdit =
    selectedTask &&
    (selectedTask.assignedTo === null || selectedTask.assignedTo === userId);

  // the open request about a task, or undefined
  function requestFor(task) {
    return requests.find((request) => request.taskId === task.id);
  }

  // a task with an open request is in "To answer" or "Waiting for …" instead
  const asked = tasks.filter((task) => !task.done && requestFor(task));
  const toAnswer = asked.filter((task) => requestFor(task).askedTo === userId);
  const waiting = asked.filter((task) => requestFor(task).askedBy === userId);

  // done tasks have their own folded row ("Done this week")
  // sorted once here: the filters below keep this order
  const notDone = tasks
    .filter((task) => !task.done && !requestFor(task))
    .filter(isVisible)
    .sort(compareTasks);

  // assignedTo null = nobody has taken the task yet
  const openTasks = notDone.filter((task) => task.assignedTo === null);
  const assignedTasks = notDone.filter((task) => task.assignedTo !== null);

  // a late task stays in Today until it is done
  const todayTasks = assignedTasks.filter(
    (task) => task.day && task.day < tomorrow,
  );
  // no day yet counts as later
  const upcomingTasks = assignedTasks.filter(
    (task) => !task.day || task.day >= tomorrow,
  );

  // like Bought on Groceries: the last one done comes first
  const monday = startOfWeek(today);

  // the Week view: Monday to Sunday of this week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(monday, i));
  }
  const shownDay = pickedDay ?? today;

  // only what belongs to that day: taken tasks planned on it, done or not
  // (no up-for-grabs, no "No date": those live in the List; our decision)
  function tasksOn(date) {
    return tasks.filter(
      (task) =>
        task.assignedTo !== null &&
        task.day &&
        task.day.getTime() === date.getTime(),
    );
  }

  // the time in the left column: when it was done, or when it is planned
  function slotTimeOf(task) {
    if (task.done && task.doneAt) return formatTime(task.doneAt);
    return task.time; // "" = any time
  }

  // the picked day in time order; "any time" ("") goes last, as in compareTasks
  const dayTasks = tasksOn(shownDay).sort((a, b) =>
    (slotTimeOf(a) || "24:00").localeCompare(slotTimeOf(b) || "24:00"),
  );
  const doneThisWeek = tasks
    .filter((task) => task.done && task.doneAt && task.doneAt >= monday)
    .filter(isVisible)
    .sort((a, b) => b.doneAt - a.doneAt);

  // the grey line under the title: when, and for an open task who added it
  function metaOf(task) {
    // the Week view: the heading says the day and the left column the time,
    // so the card only says what is left ("Done 08:15", as in Figma)
    if (view === "week") {
      return task.done ? `Done ${formatTime(task.doneAt)}` : "";
    }

    // like "bought by Sam, just now" on Groceries: who did it and when (FR8)
    if (task.done) {
      const doneBy = task.assignedTo === userId ? "you" : other.username;
      return `done by ${doneBy} · ${formatDay(task.doneAt)}, ${formatTime(task.doneAt)}`;
    }

    if (task.assignedTo === null) {
      const deadline = task.day ? `by ${formatDay(task.day)}` : "No date";
      const addedBy = task.addedBy === userId ? "you" : other.username;
      return `${deadline} · added by ${addedBy}`;
    }

    // a card under the "Today" heading: only the time, the heading says the day
    const isToday = task.day && task.day >= today && task.day < tomorrow;
    if (isToday) return task.time || "Any time";

    return whenOf(task);
  }

  // the full "when", for places without a "Today" heading (the details sheet)
  function whenOf(task) {
    if (!task.day) return "No date";

    const isToday = task.day >= today && task.day < tomorrow;
    const day = isToday ? "Today" : formatDay(task.day);
    const time = task.time || "Any time";
    // a late task stays in Today, so it says it is late (our decision)
    const late = task.day < today ? " · late" : "";
    return `${day} · ${time}${late}`;
  }

  // one card; the same for all three sections
  // a task with an open request: in the colour of the one who is asked
  // (Figma: "Fix the socket · Waiting" with Sam's avatar), and nothing to tick yet
  function renderRequest(task) {
    const request = requestFor(task);
    const askedIsOwner = request.askedTo === household.owner.id;
    const askedName = askedIsOwner
      ? household.owner.username
      : household.partner.username;
    const when = `${formatDay(request.day)} · ${request.time}`;
    const askedMe = request.askedTo === userId;
    // to answer: no "Waiting" chip (I am not waiting, I have to act; our
    // decision), the words say it. Waiting: the purple chip, as in Figma.
    const meta = askedMe
      ? `${other.username} asks you · ${when} · reply by ${formatDay(request.replyBy)}`
      : `${when} · asked ${askedName}`;

    return (
      <TaskCard
        key={task.id}
        to={`/tasks/${task.id}${viewQuery}`}
        title={task.title}
        meta={meta}
        status={askedMe ? undefined : "waiting"}
        person={askedIsOwner ? "a" : "b"}
        name={askedName}
      />
    );
  }

  function renderTask(task) {
    // up for grabs: nobody's colour yet, and the card shows "Take it"
    if (task.assignedTo === null) {
      // the same closure as toggle below: the card calls onTake() without the task
      function take() {
        handleTake(task);
      }

      return (
        <TaskCard
          key={task.id}
          to={`/tasks/${task.id}${viewQuery}`}
          title={task.title}
          meta={metaOf(task)}
          status="open"
          person={null}
          onTake={take}
        />
      );
    }

    // the owner is always brick ("a"), the partner petrol ("b"), on both phones
    const isOwner = task.assignedTo === household.owner.id;

    // the card calls onToggle() without saying which task, so each card gets its own
    function toggle() {
      handleToggle(task);
    }

    return (
      <TaskCard
        key={task.id}
        to={`/tasks/${task.id}${viewQuery}`}
        title={task.title}
        meta={metaOf(task)}
        status="planned"
        person={isOwner ? "a" : "b"}
        name={isOwner ? household.owner.username : household.partner.username}
        repeatsWeekly={task.repeatsWeekly}
        done={task.done}
        // un-ticking a done task comes with the 5-second undo (NFR5)
        onToggle={task.done ? undefined : toggle}
      />
    );
  }

  return (
    <>
      <h1 className="t-screen-title">Tasks</h1>

      {/* List | Week, as in Figma: List first */}
      <div className="tasks-page__views" role="group" aria-label="View">
        <button
          type="button"
          className="tasks-page__view t-body-strong"
          aria-pressed={view === "list"}
          onClick={showList}
        >
          <ListChecks size={18} aria-hidden="true" />
          List
        </button>
        <button
          type="button"
          className="tasks-page__view t-body-strong"
          aria-pressed={view === "week"}
          onClick={showWeek}
        >
          <CalendarDays size={18} aria-hidden="true" />
          Week
        </button>
      </div>

      {saveError && <p className="tasks-page__error t-meta">{saveError}</p>}

      {view === "week" && (
        <>
          <div className="tasks-page__week" role="group" aria-label="Day">
            {weekDays.map(function renderWeekDay(date) {
              // the same closure as chooseDay in TaskForm: each button knows its date
              function pickDay() {
                setPickedDay(date);
              }

              return (
                <button
                  key={date.getTime()}
                  type="button"
                  className="tasks-page__week-day"
                  aria-pressed={date.getTime() === shownDay.getTime()}
                  onClick={pickDay}
                >
                  <span className="t-chip">{formatWeekday(date)}</span>
                  <span className="t-body-strong">{date.getDate()}</span>
                  {/* one dot per task, in the colour of whoever does it */}
                  <span className="tasks-page__dots" aria-hidden="true">
                    {tasksOn(date).map((task) => (
                      <span
                        key={task.id}
                        className={`tasks-page__dot tasks-page__dot--${
                          task.assignedTo === household.owner.id ? "a" : "b"
                        }`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <SectionHeader
            title={formatLongDay(shownDay)}
            count={dayTasks.length}
          />

          {dayTasks.length === 0 && (
            <p className="tasks-page__status t-body">
              Nothing planned this day.
            </p>
          )}

          {/* each row: the time on the left, the same card as in the List */}
          <div className="tasks-page__list">
            {dayTasks.map((task) => (
              <div key={task.id} className="tasks-page__slot">
                <span className="tasks-page__slot-time t-meta">
                  {slotTimeOf(task) || "Any time"}
                </span>
                {renderTask(task)}
              </div>
            ))}
          </div>
        </>
      )}

      {/* everything from here to "Done this week" is the List view */}
      {view === "list" && (
        <>
          {/* without a partner there is nobody to filter by */}
          {other && (
            <div
              className="tasks-page__filters"
              role="group"
              aria-label="Whose tasks"
            >
              <button
                type="button"
                className="tasks-page__filter t-body-strong"
                aria-pressed={filter === "everyone"}
                onClick={showEveryone}
              >
                Everyone
              </button>
              <button
                type="button"
                className="tasks-page__filter t-body-strong"
                aria-pressed={filter === "mine"}
                onClick={showMine}
              >
                Mine
              </button>
              <button
                type="button"
                className="tasks-page__filter t-body-strong"
                aria-pressed={filter === "partner"}
                onClick={showPartner}
              >
                {other.username}'s
              </button>
            </div>
          )}

          {/* no "Add" button here: the + in the tab bar is the only way to add */}
          {tasks.length === 0 && (
            <p className="t-body">
              No tasks yet. Tap + to add your first task.
            </p>
          )}

          {/* first: something only I can move forward (FR10) */}
          {toAnswer.length > 0 && (
            <section className="tasks-page__section">
              <SectionHeader title="To answer" count={toAnswer.length} />
              <div className="tasks-page__list">
                {toAnswer.map(renderRequest)}
              </div>
            </section>
          )}

          {/* an empty section is left out, not shown as a heading with nothing under it */}
          {/* Today and Upcoming fold, so a long list can be made shorter (our decision) */}
          {todayTasks.length > 0 && (
            <FoldSection title="Today" count={todayTasks.length} startOpen>
              {todayTasks.map(renderTask)}
            </FoldSection>
          )}

          {/* starts folded: today first, the rest when you want it (our decision) */}
          {upcomingTasks.length > 0 && (
            <FoldSection title="Upcoming" count={upcomingTasks.length}>
              {upcomingTasks.map(renderTask)}
            </FoldSection>
          )}

          {openTasks.length > 0 && (
            <section className="tasks-page__section">
              <SectionHeader title="Up for grabs" count={openTasks.length} />
              <div className="tasks-page__list">
                {openTasks.map(renderTask)}
              </div>
            </section>
          )}

          {/* the Figma list: Today, Upcoming, Up for grabs, then Waiting for … */}
          {waiting.length > 0 && (
            <section className="tasks-page__section">
              <SectionHeader
                title={`Waiting for ${other.username}`}
                count={waiting.length}
              />
              <div className="tasks-page__list">
                {waiting.map(renderRequest)}
              </div>
            </section>
          )}

          {/* folded at first: done work is visible, but does not push the open tasks away */}
          {doneThisWeek.length > 0 && (
            <FoldSection title="Done this week" count={doneThisWeek.length}>
              {doneThisWeek.map(renderTask)}
            </FoldSection>
          )}
        </>
      )}

      {selectedTask && (
        <Sheet title={selectedTask.title} onClose={closeSheet}>
          {/* a task with an open request: the request, not the task form */}
          {requestFor(selectedTask) ? (
            <RequestDetails
              request={requestFor(selectedTask)}
              userId={userId}
              partnerName={other.username}
              onAnswered={handleAnswered}
            />
          ) : canEdit ? (
            <TaskForm
              household={household}
              userId={userId}
              task={selectedTask}
              onSaved={handleTaskSaved}
            />
          ) : (
            // the partner's task: the details only, nothing to change.
            // <dl> is HTML's list of label (<dt>) + value (<dd>) pairs
            <dl className="tasks-page__details">
              <div className="tasks-page__detail">
                <dt className="t-overline">Who</dt>
                <dd className="tasks-page__who t-body-strong">
                  <Avatar
                    name={other.username}
                    person={other.id === household.owner.id ? "a" : "b"}
                  />
                  {other.username}
                </dd>
              </div>

              <div className="tasks-page__detail">
                <dt className="t-overline">When</dt>
                {/* a done task: "done by … · Sat 14, 08:15"; otherwise the full day and time */}
                <dd className="t-body">
                  {selectedTask.done
                    ? metaOf(selectedTask)
                    : whenOf(selectedTask)}
                </dd>
              </div>

              {selectedTask.repeatsWeekly && (
                <div className="tasks-page__detail">
                  <dt className="t-overline">Repeats</dt>
                  <dd className="t-body">Every week</dd>
                </div>
              )}

              <div className="tasks-page__detail">
                <dt className="t-overline">Added by</dt>
                <dd className="t-body">
                  {selectedTask.addedBy === userId ? "You" : other.username}
                </dd>
              </div>
            </dl>
          )}
        </Sheet>
      )}

      {/* last in the page, so it sits at the bottom, just above the tab bar */}
      {/* only a tick has something to undo */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.task ? handleUndo : undefined}
        />
      )}
    </>
  );
}
