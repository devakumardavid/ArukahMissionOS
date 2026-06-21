"use client";

import { type FormEvent, useState } from "react";
import { login, type AuthSession } from "../lib/auth";

type LoginScreenProps = {
  onAuthenticated: (session: AuthSession) => void;
};

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      onAuthenticated(await login(email.trim(), password));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="About Arukah MissionOS">
        <div className="login-brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>Arukah</strong>
            <span>MissionOS</span>
          </div>
        </div>

        <div className="login-story-copy">
          <span className="login-kicker">Internal case management</span>
          <h1>Care, coordinated with clarity.</h1>
          <p>
            A secure workspace for Arukah&apos;s team to move every request from
            intake to accountable support and lasting impact.
          </p>
        </div>

        <div className="login-principles">
          <div><i>01</i><span>One accountable case record</span></div>
          <div><i>02</i><span>Clear decisions and audit history</span></div>
          <div><i>03</i><span>Dignity at every step</span></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to MissionOS</h2>
          <p className="login-intro">
            Use your Arukah staff credentials to continue.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                autoComplete="email"
                autoFocus
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@arukah.org"
                required
                type="email"
                value={email}
              />
            </label>

            <label>
              Password
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </label>

            {error ? (
              <div className="login-error" role="alert">
                <span>!</span>
                {error}
              </div>
            ) : null}

            <button className="login-submit" disabled={submitting} type="submit">
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting ? <span aria-hidden="true">→</span> : null}
            </button>
          </form>

          <p className="login-help">
            Access is limited to authorized Arukah team members.
          </p>
        </div>
      </section>
    </main>
  );
}
