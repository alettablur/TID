import "./StatsCard.css";
import { weekRange } from "../../utilities/dates.js";
import Avatar from "../shared/Avatar.jsx";

export default function StatsCard({
  tasks,
  thanks,
  weekOffset,
  userId,
  title,
  variant = "a",
}) {
  // filtering for the chosen week
  const [start, end] = weekRange(weekOffset);
  const tasksThisWeek = tasks.filter(
    (t) => t.doneAt && t.doneAt >= start && t.doneAt < end,
  );
  const thanksThisWeek = thanks.filter(
    (th) => th.createdAt && th.createdAt >= start && th.createdAt < end,
  );

  // counting the stats
  const addedCount = tasksThisWeek.filter((t) => t.addedBy === userId).length;
  const doneCount = tasksThisWeek.filter(
    (t) => t.done && t.assignedTo === userId,
  ).length;
  // FR14: thank-yous a person received from Monday to Sunday
  const thanksCount = thanksThisWeek.filter((th) => th.to === userId).length;

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
        <span className="t-body">Thanks received</span>
        <span className="t-number">{thanksCount}</span>
      </p>
    </section>
  );
}
