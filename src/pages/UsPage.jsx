import Button from "../components/Button.jsx";

// the old list page had the logout button; until the Us slice, it lives here
export default function UsPage({ onLogout }) {
  return (
    <>
      <h1 className="t-screen-title">Us</h1>
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
