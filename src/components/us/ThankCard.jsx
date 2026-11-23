import "./ThankCard.css";
import Avatar from "../shared/Avatar.jsx";
import Button from "../shared/Button.jsx";
import { formatAgo, formatTime } from "../../utilities/dates.js";

export default function ThankCard({ tasks, onThank, partnerName }) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <h2 className="thank-card__header t-section-title">
        Give thanks
        <span className="thank-card__count t-chip">{tasks.length}</span>
      </h2>
      <ul className="thank-card__list">
        {tasks.map((task) => (
          <div className="thank-card" key={task.id}>
            <Avatar name={partnerName} person="b" />
            <div className="thank-card__text">
              <p className="t-task-title">{task.title}</p>
              <p className="thank-card__meta">
                Done by {partnerName} · {formatAgo(task.doneAt)},{" "}
                {formatTime(task.doneAt)}
              </p>
            </div>
            <Button variant="thank" onClick={() => onThank(task)}>
              <span aria-hidden="true">♡</span> Thank
            </Button>
          </div>
        ))}
      </ul>
    </div>
  );
}
