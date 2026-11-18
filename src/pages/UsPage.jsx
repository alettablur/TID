import Button from "../components/Button.jsx";
import "./UsPage.css";
import InviteCard from "../components/InviteCard/InviteCard.jsx";

// until the Us slice: which household this is, and the logout button
export default function UsPage({
  household,
  userId,
  onLogout,
  onHouseholdChange,
}) {
  // the person who is not me: for the owner it's the partner, for the partner it's the owner
  const otherPerson =
    household.owner.id === userId ? household.partner : household.owner;
  return (
    <>
      <h1 className="t-screen-title">Us</h1>
      <p className="us-page__household t-body">
        {household.name} ·{" "}
        {household.partner
          ? `Shared with ${household.partner.username}`
          : "No partner yet"}
      </p>
      {otherPerson === null ? (
        <InviteCard
          household={household}
          onHouseholdChange={onHouseholdChange}
        />
      ) : (
        <p>You share the list with {otherPerson.username}</p>
      )}
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
