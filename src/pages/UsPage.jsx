import Button from "../components/Button.jsx";
import "./UsPage.css";

// until the Us slice: which household this is, and the logout button
export default function UsPage({ household, onLogout }) {
  return (
    <>
      <h1 className="t-screen-title">Us</h1>
      <p className="us-page__household t-body">
        {household.name} ·{" "}
        {household.partner
          ? `Shared with ${household.partner.username}`
          : "No partner yet"}
      </p>
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
