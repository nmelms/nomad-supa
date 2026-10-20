"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type SignInFormProps = {
  arrowIcon: ReactNode;
  onSignUp: () => void;
};

export default function SignInForm({ arrowIcon, onSignUp }: SignInFormProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Connect this form to Supabase Auth to sign in. Saved places currently live on this device.",
    );
  }

  return (
    <>
      <h2 id="auth-title">Welcome back.</h2>
      <p>Sign in to share campsites and keep your favorite places close.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="auth-email">Email address</label>
        <input
          id="auth-email"
          type="email"
          required
          placeholder="you@example.com"
        />
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          required
          minLength={6}
          placeholder="Your password"
        />
        <button type="submit">
          Sign in {arrowIcon}
        </button>
      </form>
      <button className="auth-switch" type="button" onClick={onSignUp}>
        New here? Create an account
      </button>
      {message && (
        <p className="auth-message" role="status">
          {message}
        </p>
      )}
    </>
  );
}
