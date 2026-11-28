import "./TextField.css";

// a label above a text box, for every place where the user types.
// overline: the label in small capitals, as in the + sheet; otherwise
// a sentence in soft grey
export default function TextField({
  id,
  label,
  overline = false,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled = false,
}) {
  const labelClassName = overline ? "t-overline" : "text-field__label t-body";

  return (
    <div className="text-field">
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="text-field__input t-body"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
      />
    </div>
  );
}
