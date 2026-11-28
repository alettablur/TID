import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Check } from "lucide-react";
import FoldSection from "../components/shared/FoldSection.jsx";
import Sheet from "../components/shared/Sheet.jsx";
import GroceryForm from "../components/groceries/GroceryForm.jsx";
import { loadGroceries, setBought } from "../services/groceryService.js";
import { otherPerson } from "../services/householdService.js";
import { formatAgo } from "../utilities/dates.js";
import "./GroceriesPage.css";

function formatBoughtAt(date) {
  const minutes = (new Date() - date) / 60000;
  return minutes < 5 ? "just now" : formatAgo(date);
}

export default function GroceriesPage({ household, userId }) {
  const [groceries, setGroceries] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState(""); // a tick that could not be saved
  const [selectedId, setSelectedId] = useState(null);
  // Layout raises this number when the + form has added a grocery
  const groceriesVersion = useOutletContext();

  useEffect(() => {
    async function load() {
      try {
        setGroceries(await loadGroceries(household));
      } catch (error) {
        setLoadError(error.message);
      }
    }

    load();
  }, [household, groceriesVersion]);

  if (loadError) {
    return (
      <p className="groceries-page__status t-body">
        Could not load the groceries: {loadError}
      </p>
    );
  }
  if (!groceries) {
    return <p className="groceries-page__status t-body">Loading…</p>;
  }

  const other = otherPerson(household, userId);
  const toBuy = groceries.filter((grocery) => !grocery.bought);
  // the last one bought first
  const bought = groceries
    .filter((grocery) => grocery.bought)
    .sort((a, b) => b.boughtAt - a.boughtAt);
  const selectedGrocery = groceries.find(
    (grocery) => grocery.id === selectedId,
  );

  function nameOf(personId) {
    return personId === userId ? "you" : other?.username;
  }

  async function handleToggle(grocery) {
    try {
      setSaveError("");
      await setBought(grocery.id, !grocery.bought);
      setGroceries(await loadGroceries(household));
    } catch (error) {
      setSaveError(error.message);
    }
  }

  function closeSheet() {
    setSelectedId(null);
  }

  // after Save or Delete in the sheet: close it, then show the changes
  async function handleSaved() {
    closeSheet();
    try {
      setGroceries(await loadGroceries(household));
    } catch (error) {
      setLoadError(error.message);
    }
  }

  function renderGrocery(grocery) {
    const meta = grocery.bought
      ? `bought by ${nameOf(grocery.boughtBy)}, ${formatBoughtAt(grocery.boughtAt)}`
      : `added by ${nameOf(grocery.addedBy)}`;

    // each row gets its own handlers, so the buttons know their grocery
    function toggle() {
      handleToggle(grocery);
    }

    function open() {
      setSelectedId(grocery.id);
    }

    return (
      <li key={grocery.id} className="groceries-page__item">
        <button
          type="button"
          className="groceries-page__check"
          aria-pressed={grocery.bought}
          aria-label={`${grocery.name} bought`}
          onClick={toggle}
        >
          <span className="groceries-page__circle">
            {grocery.bought && <Check size={16} aria-hidden="true" />}
          </span>
        </button>
        <button type="button" className="groceries-page__edit" onClick={open}>
          {/* a span, not a div: a button may only hold inline content */}
          <span className="groceries-page__text">
            <span
              className={`t-body-strong ${grocery.bought ? "groceries-page__name--bought" : ""}`}
            >
              {grocery.name}
            </span>
            <span className="t-meta">{meta}</span>
          </span>
          <span className="groceries-page__amount t-chip">
            ×{grocery.amount}
          </span>
        </button>
      </li>
    );
  }

  // an empty section is left out, not shown as a heading with nothing under it
  function renderSection(title, list, startOpen) {
    if (list.length === 0) return null;

    return (
      <FoldSection title={title} count={list.length} startOpen={startOpen}>
        <ul className="groceries-page__list card">{list.map(renderGrocery)}</ul>
      </FoldSection>
    );
  }

  return (
    <>
      <h1 className="t-screen-title">Groceries</h1>

      {saveError && <p className="groceries-page__error t-meta">{saveError}</p>}

      {/* no "Add" button here: the + in the tab bar is the only way to add */}
      {groceries.length === 0 && (
        <p className="groceries-page__status t-body">
          Nothing on the list yet. Tap + to add a grocery.
        </p>
      )}

      {renderSection("To buy", toBuy, true)}
      {renderSection("Bought", bought, false)}

      {selectedGrocery && (
        <Sheet title={selectedGrocery.name} onClose={closeSheet}>
          {/* key: a different item mounts a fresh form, so its fields start from that item */}
          <GroceryForm
            key={selectedGrocery.id}
            household={household}
            userId={userId}
            grocery={selectedGrocery}
            onSaved={handleSaved}
          />
        </Sheet>
      )}
    </>
  );
}
