import { useState } from "react";
import Button from "../components/shared/Button.jsx";
import TextField from "../components/shared/TextField.jsx";
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

      <form className="auth-page__form card" onSubmit={handleLogin}>
        <TextField
          id="auth-username"
          label="Username"
          autoComplete="username"
          value={username}
          onChange={handleUsernameChange}
        />
        <TextField
          id="auth-password"
          label="Password"
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
      </form>

      <Button variant="secondary" block onClick={handleSignUp}>
        Sign up
      </Button>
    </main>
  );
}
