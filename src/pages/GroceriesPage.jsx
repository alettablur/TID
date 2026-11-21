import {useState,useEffect} from "react";
import {useOutletContext} from "react-router-dom";
import SectionHeader from "../components/SectionHeader.jsx";
import Toast from "../components/Toast.jsx";
import Button from "../components/Button.jsx";
import {loadGroceries, setBought, updateGrocery, deleteGrocery} from "../services/groceryService.js";
import "./GroceriesPage.css"


function formatBoughtAt(date) {
  const minutes = (new Date() - date) / 60000;
  if (minutes < 5) return "just now";
  if (date.toDateString() === new Date().toDateString()) return "today";
  if (minutes < 48 * 60) return "yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

export default function GroceriesPage({ household, userId }) {
  console.log("household:", household, "userId:", userId);
  const [groceries, setGroceries] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [draft, setDraft] = useState(null);
  const groceryListVersion = useOutletContext();

  useEffect(() => {
    loadGroceries(household).then(setGroceries).catch((err) => {
      console.error(err);
      setError(err.message);
    });
  }, [household, groceryListVersion]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!groceries) return <p className="t-body">{error || "Loading…"}</p>;

  const other = userId === household.owner.id ? household.partner : household.owner;
  const nameOf = (id) => (id === userId ? "you" : other?.username);


async function run(action, newToast = null) {
    try {
      setError("");
      await action();
      setToast(newToast);
      setGroceries(await loadGroceries(household));
    } catch (err) {
      setError(err.message);
    }
  }

  // only buying gets an Undo
  const toggle = (g, isBought) =>
    run(() => setBought(g.id, isBought), isBought ? { message: `${g.name} bought`, grocery: g } : null);

  function saveDraft(event) {
    event.preventDefault(); // a form would otherwise reload the page
    run(() => updateGrocery(draft.id, { name: draft.name, amount: draft.amount }));
    setDraft(null);
  }

  function renderDraft() {
    const changeAmount = (by) => setDraft({ ...draft, amount: draft.amount + by });
    return (
      <li key={draft.id} className="grocery-page__item">
        <form className="grocery-page__edit" onSubmit={saveDraft}>
          <input className="grocery-page__input t-body" value={draft.name} autoFocus aria-label="Grocery name"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Button variant="soft" small disabled={draft.amount === 1} onClick={() => changeAmount(-1)}>−</Button>
          <span className="t-body-strong">{draft.amount}</span>
          <Button variant="soft" small onClick={() => changeAmount(1)}>+</Button>
          <Button type="submit" small>Save</Button>
          <Button variant="secondary" small onClick={() => setDraft(null)}>Cancel</Button>
        </form>
      </li>
    );
  }

 function renderGrocery(g) {
    if (draft?.id === g.id) return renderDraft();

    const meta = g.bought
      ? `bought by ${nameOf(g.boughtBy)}, ${formatBoughtAt(g.boughtAt)}`
      : `added by ${nameOf(g.addedBy)}`;

    return (
      <li key={g.id} className="grocery-page__item">
        <button type="button" className="grocery-page__check" aria-pressed={g.bought} aria-label={g.name}
          onClick={() => toggle(g, !g.bought)}>
          {g.bought && "✓"}
        </button>
        <div className="grocery-page__text">
          <span className={`t-body-strong ${g.bought ? "grocery-page__name--bought" : ""}`}>{g.name}</span>
          <span className="t-meta">{meta}</span>
        </div>
        {g.amount > 1 && <span className="grocery-page__amount t-chip">×{g.amount}</span>}
        <Button variant="soft" small onClick={() => setDraft({ id: g.id, name: g.name, amount: g.amount })}>
          Edit
        </Button>
        <Button variant="brick" small onClick={() => {
          setGroceries(grocieries.filter((item) => item.id !== g.id));
          run(() => deleteGrocery(g.id));
        }}>
          Delete
        </Button>
      </li>
    );
  }
 

  // one section; an empty one is left out
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

      {toast && (
        <Toast message={toast.message} onUndo={toast.grocery ? () => toggle(toast.grocery, false) : undefined} />
      )}
    </>
  );
}
