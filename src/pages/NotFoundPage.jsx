import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <>
      <h1 className="t-screen-title">No such page</h1>
      <Link to="/">Back to Home</Link>
    </>
  );
}
