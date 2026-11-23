import "./Button.css";

// variant: "primary" (warm black), "secondary", "soft", "brick" or "thank".
// label: the name a screen reader says, for a button that shows only an icon
export default function Button({
  variant = "primary",
  block = false,
  small = false,
  type = "button",
  disabled = false,
  label,
  onClick,
  children,
}) {
  const classNames = ["button", `button--${variant}`, "t-button"];
  if (block) classNames.push("button--block");
  if (small) classNames.push("button--small");

  return (
    <button
      type={type}
      className={classNames.join(" ")}
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
