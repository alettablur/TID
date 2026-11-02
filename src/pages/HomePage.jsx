import AddForm from "../components/AddForm.jsx";
import MyListRow from "../components/MyListRow.jsx";
import SharedListRow from "../components/SharedListRow.jsx";

// the home page: every list, by name, each one a link to its own page
export default function HomePage({
  lists,
  memberships,
  onAddList,
  onShare,
  onLeave,
  onLogout,
}) {
  return (
    <>
      <h2>My lists</h2>
      {lists.map((list) => (
        <MyListRow key={list.id} list={list} onShare={onShare} />
      ))}

      {memberships.length > 0 && <h2>Shared with me</h2>}
      {memberships.map((membership) => (
        <SharedListRow
          key={membership.id}
          membership={membership}
          onLeave={onLeave}
        />
      ))}

      <br />
      <br />
      <h3>List Manager</h3>
      <AddForm onAdd={onAddList} buttonLabel="New list" />
      <h3>Account</h3>
      <button onClick={onLogout}>Logout</button>
    </>
  );
}
