import { useState, useEffect } from "react";
import AddForm from "./AddForm.jsx";
import ToDoItem from "./ToDoItem.jsx";
import {
  loadTodos,
  addTodo,
  deleteTodo,
  setDone,
  canWrite,
} from "../services/todoService.js";

export default function ToDoList({ list }) {
  let h1Style = { color: "deeppink", backgroundColor: "white" };

  let [todos, setTodos] = useState([]);

  useEffect(() => {
    loadTodos(list)
      .then(setTodos)
      .catch((error) => alert(error.message));
  }, [list]);

  // newTaskText is a string
  async function handleAdd(newTaskText) {
    try {
      const todo = await addTodo(list, newTaskText);
      setTodos([...todos, todo]);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDelete(idToDelete) {
    try {
      // deleted on the server first; only then dropped from the screen
      await deleteTodo(idToDelete);
      setTodos(todos.filter((each) => each.id !== idToDelete));
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleToggle(id) {
    const todo = todos.find((each) => each.id === id);

    try {
      await setDone(id, !todo.done);
      setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  return (
    <>
      <h1 style={h1Style}>{list.get("name")}</h1>
      {todos.length === 0 ? (
        <>Nothing to do</>
      ) : (
        <ul>
          {todos.map((elem, index) => (
            <ToDoItem
              key={elem.id}
              elem={elem}
              onDelete={handleDelete}
              onChange={handleToggle}
            />
          ))}
        </ul>
      )}

      {canWrite(list) && <AddForm onAdd={handleAdd} />}
    </>
  );
}
