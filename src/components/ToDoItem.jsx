export default function ToDoItem({ elem, onDelete, onChange }) {
  return (
    <li>
      <input
        type="checkbox"
        checked={elem.done}
        disabled={!elem.canWrite}
        onChange={() => onChange(elem.id)}
      />
      {elem.text}
      {elem.canWrite && (
        <button
          type="button"
          onClick={() => {
            onDelete(elem.id);
          }}
        >
          Delete
        </button>
      )}
    </li>
  );
}
