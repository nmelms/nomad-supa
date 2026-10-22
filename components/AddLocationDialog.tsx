"use client";

import { useState, type FormEvent } from "react";

export type NewLocation = {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
};

type AddLocationDialogProps = {
  onClose: () => void;
  onAdd: (location: NewLocation) => void;
};

function DialogIcon({ name }: { name: "close" | "pin" | "arrow" }) {
  const paths = {
    close: <path d="M5 5 19 19M19 5 5 19" />,
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.3" />
      </>
    ),
    arrow: <path d="M4 12h16m-7-7 7 7-7 7" />,
  };

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function AddLocationDialog({
  onClose,
  onAdd,
}: AddLocationDialogProps) {
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const state = String(data.get("state") || "").trim();
    const latitude = Number(data.get("latitude"));
    const longitude = Number(data.get("longitude"));

    if (!name || !state || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Enter a name, state, latitude, and longitude.");
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError("Latitude must be between -90 and 90; longitude between -180 and 180.");
      return;
    }

    onAdd({ name, state, latitude, longitude });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="location-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-location-title"
      >
        <button className="auth-close" onClick={onClose} aria-label="Close add location form">
          <DialogIcon name="close" />
        </button>
        <div className="brand-mark"><DialogIcon name="pin" /></div>
        <span className="eyebrow">SHARE A PLACE</span>
        <h2 id="add-location-title">Add a location</h2>
        <p>Keep it simple for now: just the basics to place a pin on the map.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="location-name">Location name</label>
          <input id="location-name" name="name" required autoFocus />
          <label htmlFor="location-state">State</label>
          <input id="location-state" name="state" required />
          <div className="coordinate-fields">
            <div>
              <label htmlFor="location-latitude">Latitude</label>
              <input id="location-latitude" name="latitude" type="number" step="any" min="-90" max="90" required />
            </div>
            <div>
              <label htmlFor="location-longitude">Longitude</label>
              <input id="location-longitude" name="longitude" type="number" step="any" min="-180" max="180" required />
            </div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit">Add to map <DialogIcon name="arrow" /></button>
        </form>
        <div className="auth-footnote">Locations are saved in this browser for now.</div>
      </div>
    </div>
  );
}
