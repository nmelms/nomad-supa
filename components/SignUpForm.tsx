"use client";

import { signup } from "@/app/auth/actions";
import { useActionState, type ReactNode } from "react";

type SignUpFormProps = {
  arrowIcon: ReactNode;
  onSignIn: () => void;
};

export default function SignUpForm({ arrowIcon, onSignIn }: SignUpFormProps) {
  const [state, signupAction, pending] = useActionState(signup, { error: null });

  return (
    <>
      <h2 id="auth-title">Join the collective.</h2>
      <p>Create an account to share your discoveries with the community.</p>
      <form action={signupAction}>
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
          placeholder="Create a password"
        />
        <button type="submit" disabled={pending}>
          {pending ? "Creating account…" : "Create account"} {arrowIcon}
        </button>
      </form>
      <button className="auth-switch" type="button" onClick={onSignIn}>
        Already have an account? Sign in
      </button>
      {state.error && (
        <p className="auth-message" role="alert">
          {state.error}
        </p>
      )}
    </>
  );
}
