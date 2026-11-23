import { useEffect, useState } from "react";
import Button from "../shared/Button.jsx";
import {
  addGrocery,
  loadGroceries,
  updateGrocery,
  deleteGrocery,
} from "../../services/groceryService.js";
import "./GroceryForm.css";

export default function GroceryForm({
  household,
  userId,
  grocery,
  onAdded,
  onDone,
  onSaved,
}) {
  const [name, setName] = useState(grocery ? grocery.name : "");
  const [amount, setAmount] = useState(grocery ? grocery.amount : 1);
  const [groceries, setGroceries] = useState([]); // the list, to spot a duplicate
  const [justAdded, setJustAdded] = useState([]); // added since the sheet opened
  const [saving, setSaving] = useState(false); // a second tap must not save twice
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    loadGroceries(household)
      .then(setGroceries)
      .catch(() => {});
  }, [household]);

  const partner =
    userId === household.owner.id ? household.partner : household.owner;
  // the same name still to buy, whatever the capitals
  const duplicate = groceries.find(
    (g) =>
      !g.bought &&
      g.id !== grocery?.id &&
      g.name.toLowerCase() === name.trim().toLowerCase(),
  );

  // every save: empty the form, tell the page to reload, refresh the list for the notice
  async function run(action) {
    setSaving(true);
    try {
      setError("");
      await action();
      setName("");
      setAmount(1);
      onAdded();
      setGroceries(await loadGroceries(household));
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  function handleSubmit(event) {
    event.preventDefault(); // a form would otherwise reload the page
    if (grocery) {
      handleEdit(() => updateGrocery(grocery.id, { name, amount }));
    } else {
      run(async () => {
        const added = await addGrocery(household, { name, amount });
        setJustAdded((list) => [added, ...list]); // the newest on top
      });
    }
  }

  // "Set to 2": add the amount to the one already on the list, instead of a second row
  function addToDuplicate() {
    run(() =>
      updateGrocery(duplicate.id, {
        name: duplicate.name,
        amount: duplicate.amount + amount,
      }),
    );
  }

  async function handleEdit(action) {
    setSaving(true);
    try {
      setError("");
      await action();
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false); // let the user try again
    }
  }

  return (
    <form className="grocery-form" onSubmit={handleSubmit}>
      <div className="grocery-form__field">
        <input
          className="grocery-form__input t-body-strong"
          type="text"
          placeholder="e.g. Coffee"
          aria-label="What to buy"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          variant="soft"
          small
          disabled={amount === 1}
          onClick={() => setAmount(amount - 1)}
        >
          −
        </Button>
        <span className="t-body-strong" aria-live="polite">
          {amount}
        </span>
        <Button variant="soft" small onClick={() => setAmount(amount + 1)}>
          +
        </Button>
      </div>

      {duplicate && (
        <div className="grocery-form__notice t-meta">
          <span>
            <strong>Already on the list</strong> · added by{" "}
            {duplicate.addedBy === userId ? "you" : partner?.username}
          </span>
          {/* merging only when adding; when editing it is just a warning */}
          {!grocery && (
            <Button
              variant="secondary"
              small
              disabled={saving}
              onClick={addToDuplicate}
            >
              Set to {duplicate.amount + amount}
            </Button>
          )}
        </div>
      )}

      {justAdded.length > 0 && (
        <>
          <p className="grocery-form__label t-overline">Just added</p>
          <ul className="grocery-form__added">
            {justAdded.map((g) => (
              <li key={g.id} className="grocery-form__added-item">
                <span className="grocery-form__tick" aria-hidden="true">
                  ✓
                </span>
                <span className="t-body-strong">{g.name}</span>
                <span className="t-meta">just now</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {error && <p className="grocery-form__error t-meta">{error}</p>}

      {grocery ? (
        // editing: Delete item | Save, or the question after the first tap
        confirmingDelete ? (
          <>
            <p className="grocery-form__confirm t-body-strong">
              Delete {grocery.name} for both of you? This cannot be undone.
            </p>
            <div className="grocery-form__actions">
              <Button
                variant="secondary"
                block
                onClick={() => setConfirmingDelete(false)}
              >
                Keep it
              </Button>
              <Button
                variant="brick"
                block
                disabled={saving}
                onClick={() => handleEdit(() => deleteGrocery(grocery.id))}
              >
                Delete
              </Button>
            </div>
          </>
        ) : (
          <div className="grocery-form__actions">
            <Button
              variant="brick"
              block
              disabled={saving}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete item
            </Button>
            <Button type="submit" block disabled={saving || !name.trim()}>
              Save
            </Button>
          </div>
        )
      ) : (
        <div className="grocery-form__actions">
          <Button variant="secondary" block onClick={onDone}>
            Done
          </Button>
          <Button type="submit" block disabled={saving || !name.trim()}>
            Add
          </Button>
        </div>
      )}
    </form>
  );
}
