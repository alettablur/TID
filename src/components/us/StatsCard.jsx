import Avatar from "../shared/Avatar.jsx";
import { weekRange } from "../../utilities/dates.js";
import "./StatsCard.css";

export default function StatsCard({
  tasks,
  thanks,
  requests,
  weekOffset,
  userId,
  title,
  variant = "a",
}) {
  const [start, end] = weekRange(weekOffset);

  function inWeek(date) {
    return date && date >= start && date < end;
  }

  // FR14, counted from Monday to Sunday
  const doneCount = tasks.filter(
    (t) => t.done && t.assignedTo === userId && inWeek(t.doneAt),
  ).length;
  // the planning work: tasks this person added plus the requests they made
  const organisedCount =
    tasks.filter((t) => t.addedBy === userId && inWeek(t.createdAt)).length +
    requests.filter((r) => r.askedBy === userId && inWeek(r.createdAt)).length;
  const thanksCount = thanks.filter(
    (th) => th.to === userId && inWeek(th.createdAt),
  ).length;

  return (
    <section className={`stats-card stats-card--${variant}`}>
      <header className="stats-card__header">
        <Avatar name={title} person={variant} />
        <h2 className="stats-card__title t-card-title">{title}</h2>
      </header>
      <p className="stats-card__stat">
        <span className="t-body">Done</span>
        <span className="t-number">{doneCount}</span>
      </p>
      <p className="stats-card__stat">
        <span className="t-body">Organised</span>
        <span className="t-number">{organisedCount}</span>
      </p>
      <p className="stats-card__stat">
        <span className="t-body">Thanks received</span>
        <span className="t-number">{thanksCount}</span>
      </p>
    </section>
  );
}
