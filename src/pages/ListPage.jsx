import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ToDoList from "../components/ToDoList.jsx";
import { loadList } from "../services/listService.js";

export default function ListPage() {
  // the :listId part of the URL, e.g. /lists/Xk3v9QaB2c
  const { listId } = useParams();

  const [list, setList] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setList(await loadList(listId));
      } catch (err) {
        // "Object not found": no such list, or its ACL does not let me read it
        setError(err.message);
      }
    }

    load();
  }, [listId]);

  return (
    <>
      <Link to="/">← All lists</Link>

      {error ? (
        <p>{error}</p>
      ) : !list ? (
        <p>Loading…</p>
      ) : (
        <ToDoList key={list.id} list={list} />
      )}
    </>
  );
}
