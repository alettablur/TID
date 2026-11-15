import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../Avatar.jsx";
import Button from "../Button.jsx";
import StatusChip from "../StatusChip.jsx";
import "./TaskCard.css";

// person: "a" or "b" does the task; null = up for grabs: nobody can tick it
// off yet, and "Take it" takes the place of the avatar
export default function TaskCard({
  title,
  meta,
  status,
  person,
  name,
  done = false,
  repeatsWeekly = false,
  onToggle,
  onTake,
  to,
}) {
  const classNames = [
    "task-card",
    person ? `task-card--${person}` : "task-card--open",
  ];
  if (done) classNames.push("task-card--done");

  // the title and the grey line; inside a link or not, see below
  const body = (
    <>
      <p className="task-card__title t-task-title">{title}</p>
      <div className="task-card__meta">
        {/* no status: no chip (a request to answer says it in words) */}
        {(done || status) && <StatusChip status={done ? "done" : status} />}
        {repeatsWeekly && <StatusChip status="repeats" />}
        {meta && <span className="t-meta">{meta}</span>}
      </div>
    </>
  );

  return (
    <article className={classNames.join(" ")}>
      {person ? (
        <button
          type="button"
          className="task-card__check"
          aria-pressed={done}
          aria-label={`Mark "${title}" as ${done ? "not done" : "done"}`}
          onClick={onToggle}
        >
          <span className="task-card__circle">
            {done && <Check size={16} strokeWidth={3} aria-hidden="true" />}
          </span>
        </button>
      ) : (
        <span className="task-card__check" aria-hidden="true">
          <span className="task-card__circle" />
        </span>
      )}

      {/* with "to", the text opens the task; only the text, because the
          circle and "Take it" are buttons and cannot sit inside a link */}
      {to ? (
        <Link className="task-card__body task-card__link" to={to}>
          {body}
        </Link>
      ) : (
        <div className="task-card__body">{body}</div>
      )}

      {person ? (
        <Avatar name={name} person={person} />
      ) : (
        <Button variant="soft" small onClick={onTake}>
          Take it
        </Button>
      )}
    </article>
  );
}
