import "./Segmented.css";

// a row of buttons where exactly one is chosen, e.g. Me | Sam | Either of us.
// options: [{ value, label }]. Name the group with label (read aloud only) or
// with labelledBy, the id of a visible heading.
export default function Segmented({
  options,
  value,
  onChange,
  label,
  labelledBy,
}) {
  return (
    <div
      className="segmented"
      role="group"
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {options.map(function renderOption(option) {
        function choose() {
          onChange(option.value);
        }

        return (
          <button
            key={option.label}
            type="button"
            className="segmented__option t-body-strong"
            aria-pressed={option.value === value}
            onClick={choose}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
