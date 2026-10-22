"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "./avatar";

type Claims = { sub: string; email?: string; [key: string]: unknown };

export default function AccountForm({ claims }: { claims: Claims | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      if (!claims?.sub) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url, email`)
        .eq("id", claims.sub)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
        setEmail(data.email);
      }
    } catch (error) {
      alert("Error loading user data!");
    } finally {
      setLoading(false);
    }
  }, [claims, supabase]);

  useEffect(() => {
    getProfile();
  }, [claims, getProfile]);

  async function updateProfile({
    username,
    website,
    avatar_url,
    newPassword,
  }: {
    username: string | null;
    fullname: string | null;
    website: string | null;
    avatar_url: string | null;
    newPassword: string | null;
  }) {
    try {
      if (newPassword) {
        await supabase.auth.updateUser({ password: newPassword });
      }
      if (!claims?.sub) {
        alert("You must be logged in to update your profile");
        return;
      }

      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: claims.sub,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      alert("Error updating the data!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="account-page">
      <header className="account-topbar">
        <a
          className="account-brand"
          href="/"
          aria-label="Nomad Collective home"
        >
          <span className="account-brand-mark" aria-hidden="true">
            ✳
          </span>
          <span>
            NOMAD<span>COLLECTIVE</span>
          </span>
        </a>
        <a className="account-back-link" href="/">
          ← Back to the map
        </a>
      </header>

      <main className="account-content">
        <div className="account-intro">
          <p className="account-eyebrow">
            <span /> YOUR SPACE / 01
          </p>
          <h1>
            Make yourself <em>at home.</em>
          </h1>
          <p>
            Keep your details current and make your place in the collective your
            own.
          </p>
        </div>

        <div className="account-grid">
          <aside className="account-member-card">
            <div className="account-card-topline">
              <span>THE COLLECTIVE</span>
              <span>MEMBER PROFILE</span>
            </div>
            <div className="account-avatar-wrap">
              <Avatar
                uid={claims?.sub ?? null}
                url={avatar_url}
                size={150}
                onUpload={(url) => {
                  setAvatarUrl(url);
                  updateProfile({
                    fullname,
                    username,
                    website,
                    avatar_url: url,
                    newPassword,
                  });
                }}
              />
            </div>
            <p className="account-member-label">YOUR ACCOUNT</p>
            <h2>Welcome {fullname}</h2>
            <p className="account-member-copy">
              A home base for your profile and the places you love to explore.
            </p>
            <div className="account-member-footer">
              <span className="account-status-dot" /> MEMBER OF THE COLLECTIVE
            </div>
            <form
              action="/auth/signout"
              method="post"
              className="account-signout"
            >
              <button className="button block" type="submit">
                Sign out <span aria-hidden="true">↗</span>
              </button>
            </form>
          </aside>

          <section
            className="account-form-card"
            aria-labelledby="account-form-heading"
          >
            <div className="account-form-heading">
              <div>
                <p className="account-eyebrow">ACCOUNT DETAILS</p>
                <h2 id="account-form-heading">The basics.</h2>
              </div>
              <span className="account-form-index">01 / 01</span>
            </div>
            <p className="account-form-description">
              This is how you’ll appear around the collective.
            </p>

            <div className="account-fields">
              <div className="account-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="text"
                  value={claims?.email ?? ""}
                  disabled
                />
                <small>
                  Your sign-in email is managed through your account.
                </small>
              </div>
              <div className="account-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullname || ""}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div className="account-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username || ""}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="account-field">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="url"
                  value={website || ""}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="account-field">
                <label htmlFor="website">Update Password</label>
                <input
                  id="newPassword"
                  type="url"
                  value={newPassword || ""}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="account-form-actions">
              <span>YOUR PROFILE, YOUR WAY</span>
              <button
                className="button primary block"
                onClick={() =>
                  updateProfile({
                    fullname,
                    username,
                    website,
                    avatar_url,
                    newPassword,
                  })
                }
                disabled={loading || !claims?.sub}
              >
                {loading ? "Loading ..." : "Update profile"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        </div>
        <p className="account-bottom-note">
          GOOD PLACES ARE MEANT TO BE SHARED <span>✳</span> NOMAD COLLECTIVE
        </p>
      </main>
    </div>
  );
}
