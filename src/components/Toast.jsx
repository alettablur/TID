import Button from "./Button.jsx";
import "./Toast.css";

// a short message at the bottom, with an Undo if onUndo is given (NFR5);
// the page decides when it goes away
export default function Toast({ message, onUndo }) {
  return (
    // role="status": a screen reader reads the message out when it appears
    <div className="toast" role="status">
      <span className="toast__message t-body-strong">{message}</span>
      {onUndo && (
        <Button variant="soft" small onClick={onUndo}>
          Undo
        </Button>
      )}
    </div>
  );
}
