import { useState } from "react";
import TextInput from "./TextInput.jsx";

export default function AddForm({ onAdd, buttonLabel = "Add New Task" }) {
  let [task, setTask] = useState("");

  function onButtonClick(event) {
    event.preventDefault();
    onAdd(task);
    setTask("");
  }

  return (
    <form onSubmit={onButtonClick}>
      <TextInput value={task} onChange={setTask} />
      <button type="submit" disabled={task.length === 0}>
        {buttonLabel}
      </button>
    </form>
  );
}
