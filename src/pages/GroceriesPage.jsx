import {useState,useEffect} from "react";
import {useOutletContext} from "react-router-dom";
import SectionHeader from "../components/SectionHeader.jsx";
import Button from "../components/Button.jsx";
import Sheet from "../components/Sheet.jsx";
import {loadGroceries, setBought, updateGrocery, deleteGrocery} from "../services/groceryService.js";
import GroceryForm from "../components/GroceryForm/GroceryForm.jsx";
import "./GroceriesPage.css"


function formatBoughtAt(date) {
  const minutes = (new Date() - date) / 60000;
  if (minutes < 5) return "just now";
  if (date.toDateString() === new Date().toDateString()) return "today";
  if (minutes < 48 * 60) return "yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

export default function GroceriesPage({ household, userId }) {
  console.log("household:", household, "userId:", userId); // Can be deleted after confirming values are correct
  const [groceries, setGroceries] = useState(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const groceryListVersion = useOutletContext();

  useEffect(() => {
    loadGroceries(household).then(setGroceries).catch((err) => {
      console.error(err);
      setError(err.message);
    });
  }, [household, groceryListVersion]);


  if (!groceries) return <p className="t-body">{error || "Loading…"}</p>;

  const other = userId === household.owner.id ? household.partner : household.owner;
  const nameOf = (id) => (id === userId ? "you" : other?.username);

  const selectedGrocery = groceries.find((g) => g.id === selectedId);


  async function run(action) {
    try {
      setError("");
      await action();
      setGroceries(await loadGroceries(household));
    } catch (err) {
      setError(err.message);
    }
  }

  const toggle = (g, isBought) => run(() => setBought(g.id, isBought));

  function closeSheet() {
      setSelectedId(null);
    }

  async function handleSaved() {
    closeSheet();
    try {
      setGroceries(await loadGroceries(household));
    } catch (err) {
      setError(err.message);
    }
  }

 function renderGrocery(g) {
    const meta = g.bought
      ? `bought by ${nameOf(g.boughtBy)}, ${formatBoughtAt(g.boughtAt)}`
      : `added by ${nameOf(g.addedBy)}`;

    return (
          <li key={g.id} className="grocery-page__item">
        <button type="button" className="grocery-page__check" aria-pressed={g.bought} aria-label={g.name}
          onClick={() => toggle(g, !g.bought)}>
          {g.bought && "✓"}
        </button>
        <button type="button" className="grocery-page__open" onClick={() => setSelectedId(g.id)}>
          {/* a span, not a div: a button may only hold inline content */}
          <span className="grocery-page__text">
            <span className={`t-body-strong ${g.bought ? "grocery-page__name--bought" : ""}`}>{g.name}</span>
            <span className="t-meta">{meta}</span>
          </span>
          {<span className="grocery-page__amount t-chip">×{g.amount}</span>}
        </button>
      </li>
    );
  }
  
  function renderSection(title, list) {
    if (list.length === 0) return null;
    return (
      <section className="grocery-page__section">
        <SectionHeader title={title} count={list.length} />
        <ul className="grocery-page__list">{list.map(renderGrocery)}</ul>
      </section>
    );
  }

  return (
    <>
      <h1 className="t-screen-title">Groceries</h1>
      {error && <p className="grocery-page__error t-meta">{error}</p>}
      {groceries.length === 0 && <p className="t-body">Nothing on the list yet. Tap + to add a grocery.</p>}
 
      {renderSection("To buy", groceries.filter((g) => !g.bought))}
      {/* last bought first */}
      {renderSection("Bought", groceries.filter((g) => g.bought).sort((a, b) => b.boughtAt - a.boughtAt))}
 
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