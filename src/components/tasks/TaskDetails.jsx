import Avatar from "../shared/Avatar.jsx";
import { personName, personSlot } from "../../services/householdService.js";
import { formatDay, formatTime, startOfToday } from "../../utilities/dates.js";
import "./TaskDetails.css";

// "Done Sat 14, 08:15", "Today · 18:00" or "Fri 20 · Any time · late"
function whenOf(task) {
  if (task.done) {
    return `Done ${formatDay(task.doneAt)}, ${formatTime(task.doneAt)}`;
  }
  if (!task.day) return "No date";

  const today = startOfToday();
  const day =
    task.day.getTime() === today.getTime() ? "Today" : formatDay(task.day);
  const late = task.day < today ? " · late" : "";
  return `${day} · ${task.time || "Any time"}${late}`;
}

// the partner's task in the sheet: the details only, nothing to change.
// <dl> is HTML's list of label (<dt>) + value (<dd>) pairs
export default function TaskDetails({ task, household, userId }) {
  const name = personName(household, task.assignedTo);

  return (
    <dl className="task-details">
      <div className="task-details__row">
        <dt className="t-overline">Who</dt>
        <dd className="task-details__who t-body-strong">
          <Avatar name={name} person={personSlot(household, task.assignedTo)} />
          {name}
        </dd>
      </div>

      <div className="task-details__row">
        <dt className="t-overline">When</dt>
        <dd className="t-body">{whenOf(task)}</dd>
      </div>

      {task.repeatsWeekly && (
        <div className="task-details__row">
          <dt className="t-overline">Repeats</dt>
          <dd className="t-body">Every week</dd>
        </div>
      )}

      <div className="task-details__row">
        <dt className="t-overline">Added by</dt>
        <dd className="t-body">
          {task.addedBy === userId
            ? "You"
            : personName(household, task.addedBy)}
        </dd>
      </div>
    </dl>
  );
}
