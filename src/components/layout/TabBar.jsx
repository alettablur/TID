import { Heart, House, ListChecks, Plus, ShoppingCart } from "lucide-react";
import TabBarLink from "./TabBarLink.jsx";
import "./TabBar.css";

// the + opens the add form for the current page: a grocery on Groceries, a task elsewhere
export default function TabBar({ page, onAdd }) {
  function handleAddClick() {
    onAdd(page);
  }

  return (
    <nav className="tab-bar" aria-label="Main">
      <TabBarLink to="/" label="Home" icon={House} />
      <TabBarLink to="/tasks" label="Tasks" icon={ListChecks} />

      <button
        type="button"
        className="tab-bar__add"
        aria-label={page === "groceries" ? "Add a grocery" : "Add a task"}
        onClick={handleAddClick}
      >
        <Plus size={26} strokeWidth={2.25} aria-hidden="true" />
      </button>

      <TabBarLink to="/groceries" label="Groceries" icon={ShoppingCart} />
      <TabBarLink to="/us" label="Us" icon={Heart} />
    </nav>
  );
}
