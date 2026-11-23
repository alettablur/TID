import { useState } from "react";
import Button from "./Button.jsx";
import "./ConfirmDelete.css";

// Deleting cannot be undone and removes the row for both partners, so the
// first tap only asks (NFR5, error prevention). children: the button shown
// next to Delete, e.g. Save.
export default function ConfirmDelete({
  label,
  question,
  disabled,
  onDelete,
  children,
}) {
  const [asking, setAsking] = useState(false);

  function ask() {
    setAsking(true);
  }

  function cancel() {
    setAsking(false);
  }

  if (asking) {
    return (
      <>
        <p className="confirm-delete__question t-body-strong">{question}</p>
        <div className="confirm-delete__actions">
          <Button variant="secondary" block onClick={cancel}>
            Keep it
          </Button>
          <Button variant="brick" block disabled={disabled} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="confirm-delete__actions">
      <Button variant="brick" block disabled={disabled} onClick={ask}>
        {label}
      </Button>
      {children}
    </div>
  );
}
