import Avatar from "./Avatar.jsx";
import "./AvatarPair.css";

// the couple side by side; only the owner until the partner joins
export default function AvatarPair({ household }) {
  return (
    <span className="avatar-pair">
      <Avatar name={household.owner.username} person="a" large />
      {household.partner && (
        <Avatar name={household.partner.username} person="b" large />
      )}
    </span>
  );
}
