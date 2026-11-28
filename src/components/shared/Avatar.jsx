import "./Avatar.css";

// person: "a" = list owner (brick), "b" = partner (petrol), null = nobody yet
export default function Avatar({ name, person, large = false }) {
  const classNames = [
    "avatar",
    person ? `avatar--${person}` : "avatar--nobody",
  ];
  if (large) classNames.push("avatar--large");

  return (
    <span
      className={classNames.join(" ")}
      role="img"
      aria-label={name ?? "Nobody yet"}
    >
      {name ? name[0].toUpperCase() : "?"}
    </span>
  );
}
