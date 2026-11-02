import { Link } from "react-router-dom";

// a list somebody shared with me: its name, its owner, and a way out
export default function SharedListRow({ membership, onLeave }) {
  const list = membership.get("list");

  return (
    <p>
      <Link to={`/lists/${list.id}`}>{list.get("name")}</Link>{" "}
      {/* include() leaves the owner out if I may not read that user's row */}
      shared by {list.get("owner")?.get("username") ?? "someone"}{" "}
      <button onClick={() => onLeave(membership)}>Leave</button>
    </p>
  );
}
