// takes what <input> takes, a value and a way to report a change,
// but reports the new text rather than the DOM event
export default function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
