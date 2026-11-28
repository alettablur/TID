import { Heart } from "lucide-react";
import Avatar from "../shared/Avatar.jsx";
import Button from "../shared/Button.jsx";
import { formatAgo, formatTime } from "../../utilities/dates.js";
import "./ThankRow.css";

// US3: a task the partner did, with one tap to thank them (FR12)
export default function ThankRow({ task, partnerName, partnerSlot, onThank }) {
  function thank() {
    onThank(task);
  }

  return (
    <li className="thank-row card">
      <Avatar name={partnerName} person={partnerSlot} />
      <span className="thank-row__text">
        <span className="t-task-title">{task.title}</span>
        <span className="t-meta">
          Done by {partnerName} · {formatAgo(task.doneAt)},{" "}
          {formatTime(task.doneAt)}
        </span>
      </span>
      <Button variant="thank" small onClick={thank}>
        <Heart size={16} aria-hidden="true" /> Thank
      </Button>
    </li>
  );
}
