import { NavLink } from "react-router-dom";
import "./TabBarLink.css";

// NavLink sets aria-current="page" on the tab of the current address;
// "end" keeps Home from matching every address that starts with "/"
export default function TabBarLink({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} end={to === "/"} className="tab-bar-link">
      <Icon size={24} strokeWidth={2} aria-hidden="true" />
      <span className="tab-bar-link__label t-tab">{label}</span>
    </NavLink>
  );
}
