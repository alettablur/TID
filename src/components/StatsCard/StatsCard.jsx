import "./StatsCard.css";
import { weekBoundsFromOffset } from "../../utilities/dateUtils.js";
import Avatar from "../Avatar.jsx";

export default function StatsCard({
  tasks,
  weekOffset,
  userId,
  title,
  variant = "a",
}) {
  const [start, end] = weekBoundsFromOffset(weekOffset);
  const thisWeek = tasks.filter((t) => t.day && t.day >= start && t.day < end);

  const addedCount = thisWeek.filter((t) => t.addedBy === userId).length;
  const doneCount = thisWeek.filter(
    (t) => t.done && t.assignedTo === userId,
  ).length;
  const thanksCount = 0; // change this as thanks service is set up

  return (
    <section className={`stats-card stats-card--${variant}`}>
      <header className="stats-card__header">
        <Avatar name={title} person={variant} />
        <h2>{title}</h2>
      </header>
      <p className="stats-card__stat">
        <span className="t-body">Done</span>
        <span className="t-number">{doneCount}</span>
      </p>
      <p className="stats-card__stat">
        <span className="t-body">Organised</span>
        <span className="t-number">{addedCount}</span>
      </p>
      <p className="stats-card__stat">
        <span className="t-body">Thanks</span>
        <span className="t-number">{thanksCount}</span>
      </p>
    </section>
  );
}
