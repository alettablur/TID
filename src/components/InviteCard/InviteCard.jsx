import "./InviteCard.css";
import Button from "../Button.jsx";
import { useState } from "react";
import { invitePartner } from "../../services/householdService.js";

export default function InviteCard({ household, onHouseholdChange }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="invite-card">
      <h2>Invite your partner</h2>
      <form className="invite-card__form" onSubmit={handleSubmit}>
        <label htmlFor="invite-username">
          Type your partner's username to add them to your list.
        </label>
        <input
          id="invite-username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
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
