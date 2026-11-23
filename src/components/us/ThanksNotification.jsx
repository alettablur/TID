import "./ThanksNotification.css";
import Button from "../shared/Button.jsx";

export default function ThanksNotification({
  receivedThanks,
  onDismiss,
  partnerName,
}) {
  if (receivedThanks.length === 0) return null;

  return (
    <ul className="thanks-notification__list" role="status">
      {receivedThanks.map((th) => (
        <div className="thanks-notification-card" key={th.id}>
          <span className="thanks-notification__heart" aria-hidden="true">
            ♡
          </span>
          <p className="font-text">
            <strong>
              {partnerName} thanked you for "{th.taskTitle}"
            </strong>
          </p>
          <button
            className="thanks-notification-dismiss"
            onClick={() => onDismiss(th.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </ul>
  );
}
