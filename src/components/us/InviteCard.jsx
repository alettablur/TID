import { useState } from "react";
import Button from "../shared/Button.jsx";
import TextField from "../shared/TextField.jsx";
import { invitePartner } from "../../services/householdService.js";
import "./InviteCard.css";

export default function InviteCard({ household, onHouseholdChange }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  // FR2: the partner joins by username
  async function handleSubmit(event) {
    event.preventDefault();

    const name = username.trim();
    if (!name) {
      setError("Enter a username");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const updated = await invitePartner(household, name);
      onHouseholdChange(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="invite-card card">
      <h2 className="invite-card__title t-card-title">Invite your partner</h2>
      <form className="invite-card__form" onSubmit={handleSubmit}>
        <TextField
          id="invite-username"
          label="Type your partner's username to add them to your list."
          value={username}
          onChange={handleUsernameChange}
          disabled={submitting}
        />
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Inviting…" : "Send invite"}
        </Button>
      </form>
      {error && (
        <p className="invite-card__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
