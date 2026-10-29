import { Link } from "react-router-dom";
import AddForm from "./AddForm.jsx";

// one of my own lists: its name, and a form to share it
export default function MyListRow({ list, onShare }) {
  return (
    <div>
      <Link to={`/lists/${list.id}`}>{list.get("name")}</Link>
      <AddForm
        onAdd={(username) => onShare(list, username)}
        buttonLabel="Share with (username)"
      />
    </div>
  );
}
