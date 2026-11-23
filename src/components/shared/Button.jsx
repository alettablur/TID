import "./Button.css";

// variant: "primary" (warm black), "secondary", "soft" or "brick"
export default function Button({
  variant = "primary",
  block = false,
  small = false,
  type = "button",
  disabled = false,
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
      onClick={onClick}
    >
      {children}
    </button>
  );
}
