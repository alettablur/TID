import { useState } from "react";
import Button from "../components/shared/Button.jsx";
import { signUp, logIn } from "../services/authService.js";
import "./AuthPage.css";

export default function AuthPage({ onAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  // Enter in the form logs in; signing up needs its own button
  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    try {
      onAuthenticated(await logIn(username, password));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSignUp() {
    setError("");
    try {
      onAuthenticated(await signUp(username, password));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <h1 className="t-screen-title">Log in</h1>

      <form className="auth-page__form" onSubmit={handleLogin}>
        <label className="t-body-strong" htmlFor="auth-username">
          Username
        </label>
        <input
          id="auth-username"
          className="auth-page__input"
          type="text"
          autoComplete="username"
          value={username}
          onChange={handleUsernameChange}
        />

        <label className="t-body-strong" htmlFor="auth-password">
          Password
        </label>
        <input
          id="auth-password"
          className="auth-page__input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={handlePasswordChange}
        />

        {error && (
          <p className="auth-page__error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" block>
          Log in
        </Button>
        <Button variant="secondary" block onClick={handleSignUp}>
          Sign up
        </Button>
      </form>
    </main>
  );
}
