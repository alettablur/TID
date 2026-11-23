import { useState } from "react";
import Button from "../shared/Button.jsx";
import {
  acceptRequest,
  declineRequest,
} from "../../services/requestService.js";
import "./RequestDetails.css";

// "Tue 17"
function formatDay(date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

// the task sheet of a task with an open request (US2). The one who is asked
// answers here (FR10); the one who asked only sees that it is waiting.
// The Home page can show the same component for its "To answer" card.
export default function RequestDetails({
  request,
  userId,
  partnerName,
  onAnswered,
}) {
  const [error, setError] = useState("");
  // true while Back4App saves the answer: a second tap must not answer twice
  const [saving, setSaving] = useState(false);

  const askedMe = request.askedTo === userId;

  async function answer(accepted) {
    setSaving(true);
    try {
      if (accepted) {
        await acceptRequest(request);
      } else {
        await declineRequest(request, "");
      }
      // no setSaving(false): the sheet closes
      onAnswered(accepted);
    } catch (answerError) {
      setError(answerError.message);
      setSaving(false);
    }
  }

  function handleAccept() {
    answer(true);
  }

  function handleDecline() {
    answer(false);
  }

  return (
    <div className="request-details">
      <dl className="request-details__rows">
        <div className="request-details__row">
          <dt className="t-overline">{askedMe ? "Asked by" : "Asked to"}</dt>
          <dd className="t-body-strong">{partnerName}</dd>
        </div>
        <div className="request-details__row">
          <dt className="t-overline">When</dt>
          <dd className="t-body">
            {formatDay(request.day)} · {request.time}
          </dd>
        </div>
        <div className="request-details__row">
          <dt className="t-overline">Reply by</dt>
          <dd className="t-body">{formatDay(request.replyBy)}</dd>
        </div>
      </dl>

      {error && <p className="request-details__error t-meta">{error}</p>}

      {askedMe ? (
        <div className="request-details__actions">
          <Button
            variant="secondary"
            block
            disabled={saving}
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button block disabled={saving} onClick={handleAccept}>
            Accept
          </Button>
        </div>
      ) : (
        <p className="request-details__note t-body">
          Waiting for {partnerName} to answer.
        </p>
      )}
    </div>
  );
}
