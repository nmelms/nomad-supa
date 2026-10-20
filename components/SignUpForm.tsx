"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type SignUpFormProps = {
  arrowIcon: ReactNode;
  onSignIn: () => void;
};

export default function SignUpForm({ arrowIcon, onSignIn }: SignUpFormProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Connect this form to Supabase Auth to create an account. Saved places currently live on this device.",
    );
  }

  return (
    <>
      <h2 id="auth-title">Join the collective.</h2>
      <p>Create an account to share your discoveries with the community.</p>
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
          placeholder="Create a password"
        />
        <button type="submit">
          Create account {arrowIcon}
        </button>
      </form>
      <button className="auth-switch" onClick={onSignIn}>
        Already have an account? Sign in
      </button>
      {message && (
        <p className="auth-message" role="status">
          {message}
        </p>
      )}
    </>
  );
}
