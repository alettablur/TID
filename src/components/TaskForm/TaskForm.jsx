import { useState } from "react";
import Button from "../Button.jsx";
import { addTask } from "../../services/taskService.js";
import "./TaskForm.css";

// the form in the + sheet: a new task (FR3). For now every new task is mine, with no day.
export default function TaskForm({ household, userId, onAdded }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleTitleChange(event) {
    setTitle(event.target.value);
  }

  async function handleSubmit(event) {
    // a form would otherwise reload the whole page
    event.preventDefault();

    try {
      await addTask(household, { title, assignedTo: userId });
      onAdded();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="task-form__label t-overline" htmlFor="task-form-title">
        What needs doing?
      </label>
      <input
        id="task-form-title"
        className="task-form__input t-body"
        type="text"
        placeholder="e.g. Empty the dishwasher"
        value={title}
        onChange={handleTitleChange}
      />

      {error && <p className="task-form__error t-meta">{error}</p>}

      {/* NFR5: a task cannot be saved without a title */}
      <Button type="submit" block disabled={!title.trim()}>
        Add task
      </Button>
    </form>
  );
}
