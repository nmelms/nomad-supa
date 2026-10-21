"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { signInWithEmail } from "@/app/auth/actions";

type SignInFormProps = {
  arrowIcon: ReactNode;
  onSignUp: () => void;
};

export default function SignInForm({ arrowIcon, onSignUp }: SignInFormProps) {
  const [message, setMessage] = useState("");

  return (
    <>
      <h2 id="auth-title">Welcome back.</h2>
      <p>Sign in to share campsites and keep your favorite places close.</p>
      <form action={signInWithEmail} method="POST">
        <label htmlFor="auth-email">Email address</label>
        <input
          id="auth-email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
        />
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="Your password"
        />
        <button type="submit">Sign in {arrowIcon}</button>
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
