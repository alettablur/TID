import Button from "../components/Button.jsx";
import "./UsPage.css";
import InviteCard from "../components/InviteCard/InviteCard.jsx";
import AvatarPair from "../components/AvatarPair.jsx";

// until the Us slice: which household this is, and the logout button
export default function UsPage({
  household,
  userId,
  onLogout,
  onHouseholdChange,
}) {
  // the person who is not me: for the owner it's the partner, for the partner it's the owner
  const other =
    household.owner.id === userId ? household.partner : household.owner;

  return (
    <>
      <p className="t-overline">{household.name}</p>
      <div className="us-page__header">
        <h1 className="t-screen-title">Us</h1>
        <AvatarPair household={household} />
      </div>
      <p className="us-page__household t-body">
        {household.name} ·{" "}
        {household.partner
          ? `Shared with ${household.partner.username}`
          : "No partner yet"}
      </p>
      {other === null ? (
        <InviteCard
          household={household}
          onHouseholdChange={onHouseholdChange}
        />
      ) : (
        <p>You share the list with {other.username}</p>
      )}
      <Button variant="secondary" onClick={onLogout}>
        Log out
      </Button>
    </>
  );
}
