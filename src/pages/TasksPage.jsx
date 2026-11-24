import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import SectionHeader from "../components/shared/SectionHeader.jsx";
import Sheet from "../components/shared/Sheet.jsx";
import Toast from "../components/shared/Toast.jsx";
import WeekSwitch from "../components/shared/WeekSwitch.jsx";
import RequestDetails from "../components/tasks/RequestDetails.jsx";
import TaskCard from "../components/tasks/TaskCard.jsx";
import TaskDetails from "../components/tasks/TaskDetails.jsx";
import TaskForm from "../components/tasks/TaskForm.jsx";
import {
  loadTasks,
  setDone,
  takeTask,
  undoDone,
} from "../services/taskService.js";
import { loadRequests } from "../services/requestService.js";
import {
  otherPerson,
  personName,
  personSlot,
} from "../services/householdService.js";
import {
  addDays,
  formatDay,
  formatLongDay,
  formatTime,
  formatWeekday,
  startOfToday,
  weekRange,
} from "../utilities/dates.js";
import "./TasksPage.css";

// for sort(): a negative number puts a first, a positive number puts b first
function compareTasks(a, b) {
  // a task with no day goes after the ones with a day
  if (a.day && !b.day) return -1;
  if (!a.day && b.day) return 1;

  if (a.day && b.day && a.day.getTime() !== b.day.getTime()) {
    return a.day - b.day;
  }

  // the same day: by time, "HH:mm" sorts like text; "any time" ("") goes last
  return (a.time || "24:00").localeCompare(b.time || "24:00");
}

// the time in the left column of a day: when it was done, or when it is planned
function slotTimeOf(task) {
  if (task.done && task.doneAt) return formatTime(task.doneAt);
  return task.time; // "" = any time
}

// the week (US1: everything planned, by day), then what has no place in it.
// Also the page behind /tasks/:taskId, where the task sheet opens.
export default function TasksPage({ household, userId }) {
  const [tasks, setTasks] = useState(null);
  // the open requests (US2), loaded together with the tasks
  const [requests, setRequests] = useState([]);
  const [tasksError, setTasksError] = useState("");
  const [saveError, setSaveError] = useState(""); // a tick or a take that could not be saved
  // the message at the bottom, or null. After a tick it also has { task, copyId }
  // for the Undo; after a take it is only { message }. One toast at a time.
  const [toast, setToast] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week
  // the day picked in the strip; null = today, or the Monday of another week
  const [pickedDay, setPickedDay] = useState(null);

  // Layout raises this number when the + form has added a task
  const tasksVersion = useOutletContext();

  // on /tasks/abc123 the sheet shows task abc123; on /tasks, taskId is undefined
  const { taskId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [loadedTasks, loadedRequests] = await Promise.all([
          loadTasks(household),
          loadRequests(household),
        ]);
        // requests first: when the tasks arrive, the page draws with both
        setRequests(loadedRequests);
        setTasks(loadedTasks);
      } catch (error) {
        setTasksError(error.message);
      }
    }

    load();
  }, [household, tasksVersion]);

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
  const other = otherPerson(household, userId);

  const [monday] = weekRange(weekOffset);
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(monday, i));
  }
  const shownDay = pickedDay ?? (weekOffset === 0 ? today : monday);

  function handleWeekChange(offset) {
    setWeekOffset(offset);
    setPickedDay(null);
  }

  async function handleToggle(task) {
    try {
      setSaveError("");
      // setDone returns next week's copy of a weekly task, or null
      const copy = await setDone(household, task, true);
      setToast({
        // the whole toast is bold, so quotes mark where a long title ends
        message: `“${task.title}” · done`,
        task,
        copyId: copy ? copy.id : null,
      });
      setTasks(await loadTasks(household));
    } catch (error) {
      setSaveError(error.message);
    }
  }

  async function handleUndo() {
    const { task, copyId } = toast;
    setToast(null);
    try {
      setSaveError("");
      await undoDone(task.id, copyId);
      setTasks(await loadTasks(household));
    } catch (error) {
      setSaveError(error.message);
    }
  }

  // FR7. For now the deadline becomes the day, with no time; the
  // "When will you do it?" sheet (screens.md) is not built yet
  async function handleTake(task) {
    try {
      setSaveError("");
      await takeTask(task.id, task.day, "");
      const seenBy = other ? ` · ${other.username} can see it` : "";
      setToast({ message: `You took “${task.title}”${seenBy}` });
      setTasks(await loadTasks(household));
    } catch (error) {
      setSaveError(error.message);
    }
  }

  // back to /tasks: the address has no id any more, so the sheet closes
  function closeSheet() {
    navigate("/tasks");
  }

  // after Save or Delete in the sheet: close it, then show the changes
  async function handleTaskSaved() {
    closeSheet();
    try {
      // the requests too: an answered request leaves "To answer" / "Waiting for"
      const [loadedTasks, loadedRequests] = await Promise.all([
        loadTasks(household),
        loadRequests(household),
      ]);
      setRequests(loadedRequests);
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

  // a task with an open request is in "To answer" or "Waiting for …" only
  const asked = tasks.filter((task) => !task.done && requestFor(task));
  const toAnswer = asked.filter((task) => requestFor(task).askedTo === userId);
  const waiting = asked.filter((task) => requestFor(task).askedBy === userId);

  const notAsked = tasks.filter((task) => !requestFor(task)).sort(compareTasks);
  // assignedTo null = nobody has taken the task yet
  const upForGrabs = notAsked.filter(
    (task) => !task.done && task.assignedTo === null,
  );
  const taken = notAsked.filter((task) => task.assignedTo !== null);
  // a day already gone and still not done: without this section it would
  // only be visible by going back to its week
  const late = taken.filter(
    (task) => !task.done && task.day && task.day < today,
  );
  const noDate = taken.filter((task) => !task.done && !task.day);

  // the taken tasks planned on that day, done or not
  function tasksOn(date) {
    return taken.filter(
      (task) => task.day && task.day.getTime() === date.getTime(),
    );
  }

  // the picked day in time order; "any time" ("") goes last, as in compareTasks
  const dayTasks = tasksOn(shownDay).sort((a, b) =>
    (slotTimeOf(a) || "24:00").localeCompare(slotTimeOf(b) || "24:00"),
  );

  // the grey line under the title
  function metaOf(task) {
    // the Done chip says it, and the left column already shows when
    if (task.done) return "";

    if (task.assignedTo === null) {
      const deadline = task.day ? `by ${formatDay(task.day)}` : "No date";
      const addedBy = task.addedBy === userId ? "you" : other.username;
      return `${deadline} · added by ${addedBy}`;
    }

    // a day of the strip says the day itself; a late task needs it
    if (task.day && task.day < today) {
      return `${formatDay(task.day)} · ${task.time || "Any time"}`;
    }
    return "";
  }

  // a task with an open request: in the colour of the one who is asked,
  // and nothing to tick yet
  function renderRequest(task) {
    const request = requestFor(task);
    const askedName = personName(household, request.askedTo);
    const when = `${formatDay(request.day)} · ${request.time}`;
    const askedMe = request.askedTo === userId;
    // to answer: no "Waiting" chip, I am the one who has to act (our decision)
    const meta = askedMe
      ? `${other.username} asks you · ${when} · reply by ${formatDay(request.replyBy)}`
      : `${when} · asked ${askedName}`;

    return (
      <TaskCard
        key={task.id}
        to={`/tasks/${task.id}`}
        title={task.title}
        meta={meta}
        status={askedMe ? undefined : "waiting"}
        person={personSlot(household, request.askedTo)}
        name={askedName}
      />
    );
  }

  function renderTask(task) {
    // up for grabs: nobody's colour yet, and the card shows "Take it"
    if (task.assignedTo === null) {
      // the card calls onTake() without saying which task, so each card gets its own
      function take() {
        handleTake(task);
      }

      return (
        <TaskCard
          key={task.id}
          to={`/tasks/${task.id}`}
          title={task.title}
          meta={metaOf(task)}
          status="open"
          person={null}
          onTake={take}
        />
      );
    }

    function toggle() {
      handleToggle(task);
    }

    return (
      <TaskCard
        key={task.id}
        to={`/tasks/${task.id}`}
        title={task.title}
        meta={metaOf(task)}
        status="planned"
        person={personSlot(household, task.assignedTo)}
        name={personName(household, task.assignedTo)}
        repeatsWeekly={task.repeatsWeekly}
        done={task.done}
        // un-ticking a done task comes with the 5-second undo (NFR5)
        onToggle={task.done ? undefined : toggle}
      />
    );
  }

  // an empty section is left out, not shown as a heading with nothing under it
  function renderSection(title, sectionTasks, renderCard) {
    if (sectionTasks.length === 0) return null;

    return (
      <section className="tasks-page__section">
        <SectionHeader title={title} count={sectionTasks.length} />
        <div className="tasks-page__list">{sectionTasks.map(renderCard)}</div>
      </section>
    );
  }

  return (
    <>
      <h1 className="t-screen-title">Tasks</h1>

      <WeekSwitch offset={weekOffset} onChange={handleWeekChange} />

      {saveError && <p className="tasks-page__error t-meta">{saveError}</p>}

      <div className="tasks-page__week" role="group" aria-label="Day">
        {weekDays.map(function renderWeekDay(date) {
          // each button knows its own date
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
                    className={`tasks-page__dot tasks-page__dot--${personSlot(household, task.assignedTo)}`}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <section className="tasks-page__section">
        <SectionHeader
          title={formatLongDay(shownDay)}
          count={dayTasks.length}
        />

        {/* no "Add" button here: the + in the tab bar is the only way to add */}
        {tasks.length === 0 ? (
          <p className="tasks-page__status t-body">
            No tasks yet. Tap + to add your first task.
          </p>
        ) : (
          dayTasks.length === 0 && (
            <p className="tasks-page__status t-body">
              Nothing planned this day.
            </p>
          )
        )}

        {/* each row: the time on the left, then the card */}
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
      </section>

      {/* first what only I can move forward (FR10), then what is overdue */}
      {renderSection("To answer", toAnswer, renderRequest)}
      {renderSection("Late", late, renderTask)}
      {renderSection("Up for grabs", upForGrabs, renderTask)}
      {other &&
        renderSection(`Waiting for ${other.username}`, waiting, renderRequest)}
      {renderSection("No date", noDate, renderTask)}

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
            <TaskDetails
              task={selectedTask}
              household={household}
              userId={userId}
            />
          )}
        </Sheet>
      )}

      {/* last in the page, so it sits at the bottom, just above the tab bar;
          only a tick has something to undo */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.task ? handleUndo : undefined}
        />
      )}
    </>
  );
}
