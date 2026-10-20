"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { camps, type Camp, type CampFilter } from "@/lib/camps";
import "mapbox-gl/dist/mapbox-gl.css";

const START_CENTER: [number, number] = [-108.03, 38.06];
const START_ZOOM = 6.3;
const SAVED_KEY = "nomad-saved-camps";
type MapStatus = "loading" | "ready" | "error";
type ViewMode = "explore" | "saved";
type MapStyle = "outdoors" | "satellite";

function Icon({ name, size = 18 }: { name: "search" | "pin" | "heart" | "layers" | "locate" | "close" | "filter" | "arrow" | "mountain" | "menu"; size?: number }) {
  const paths: Record<typeof name, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/></>,
    heart: <path d="M20.8 8.6c0 4.7-8.8 10.4-8.8 10.4S3.2 13.3 3.2 8.6a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z"/>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    locate: <><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></>,
    close: <path d="M5 5 19 19M19 5 5 19"/>,
    filter: <><path d="M3 7h18M6 12h12M9 17h6"/><circle cx="8" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/></>,
    arrow: <><path d="M4 12h16m-7-7 7 7-7 7"/></>,
    mountain: <><path d="m2 19 6-11 4 6 3-4 7 9H2Z"/><path d="m6 12 2 2 2-2"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ResultCard({ camp, active, saved, onOpen, onSave }: { camp: Camp; active: boolean; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return <div className={`result-card ${active ? "result-card-active" : ""}`}>
    <button className="result-main" onClick={onOpen} aria-label={`View ${camp.name} on the map`}>
      <span className="result-region">{camp.region}</span>
      <strong>{camp.name}</strong>
      <span className="result-description">{camp.shortDescription}</span>
      <span className="result-tags">{camp.features.slice(0, 2).map(feature => <span key={feature}>{feature}</span>)}</span>
    </button>
    <button className={`heart-button ${saved ? "saved" : ""}`} onClick={onSave} aria-label={saved ? `Remove ${camp.name} from saved places` : `Save ${camp.name}`} title={saved ? "Remove saved place" : "Save place"}><Icon name="heart" size={17}/></button>
  </div>;
}

export default function ExploreApp() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapboxRef = useRef<typeof mapboxgl | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapStatus, setMapStatus] = useState<MapStatus>("loading");
  const [mapError, setMapError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CampFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("explore");
  const [style, setStyle] = useState<MapStyle>("outdoors");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [areaBounds, setAreaBounds] = useState<[number, number, number, number] | null>(null);
  const [showAreaButton, setShowAreaButton] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    try { setSavedIds(JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]")); } catch { setSavedIds([]); }
  }, []);

  const filteredCamps = useMemo(() => camps.filter(camp => {
    const text = query.trim().toLowerCase();
    const matchesText = !text || [camp.name, camp.region, camp.state, camp.shortDescription, ...camp.features].join(" ").toLowerCase().includes(text);
    const matchesFilter = activeFilter === "all" || camp.filters.includes(activeFilter);
    const matchesSaved = viewMode === "explore" || savedIds.includes(camp.id);
    const [lng, lat] = camp.coordinates;
    const matchesArea = !areaBounds || (lng >= areaBounds[0] && lng <= areaBounds[2] && lat >= areaBounds[1] && lat <= areaBounds[3]);
    return matchesText && matchesFilter && matchesSaved && matchesArea;
  }), [query, activeFilter, viewMode, savedIds, areaBounds]);

  const selected = camps.find(camp => camp.id === selectedId) || null;

  useEffect(() => {
    if (selectedId && !filteredCamps.some(camp => camp.id === selectedId)) setSelectedId(null);
  }, [filteredCamps, selectedId]);

  const openCamp = useCallback((camp: Camp, fly = true) => {
    setSelectedId(camp.id);
    setMobilePanelOpen(false);
    if (fly && mapRef.current) mapRef.current.flyTo({ center: camp.coordinates, zoom: Math.max(mapRef.current.getZoom(), 10.5), duration: 900, essential: true });
  }, []);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
    if (!token) { setMapError("Add your Mapbox public token to .env.local as NEXT_PUBLIC_MAPBOX_TOKEN, then restart the app."); setMapStatus("error"); return; }
    if (!mapElement.current) return;
    let cancelled = false;
    let ownedMap: mapboxgl.Map | null = null;
    void import("mapbox-gl").then(({ default: mapbox }) => {
      if (cancelled || !mapElement.current) return;
      mapboxRef.current = mapbox;
      mapbox.accessToken = token;
      try {
        const map = new mapbox.Map({ container: mapElement.current, style: "mapbox://styles/mapbox/outdoors-v12", center: START_CENTER, zoom: START_ZOOM, minZoom: 3, maxZoom: 17, attributionControl: false });
        ownedMap = map;
        mapRef.current = map;
        map.addControl(new mapbox.NavigationControl({ showCompass: false }), "bottom-left");
        map.addControl(new mapbox.AttributionControl({ compact: true }), "bottom-left");
        map.on("load", () => { if (!cancelled) setMapStatus("ready"); });
        map.on("moveend", () => { if (!cancelled) setShowAreaButton(true); });
        map.on("error", event => {
          if (cancelled || map.loaded()) return;
          const message = event.error?.message || "Map tiles could not load.";
          setMapError(/401|403|unauthorized|forbidden|token/i.test(message) ? "Mapbox rejected this token. Check its URL restrictions and map access." : message);
          setMapStatus("error");
        });
      } catch (error) { setMapError(error instanceof Error ? error.message : "Unable to start Mapbox."); setMapStatus("error"); }
    }).catch(() => { if (!cancelled) { setMapError("Mapbox could not load in this browser."); setMapStatus("error"); } });
    return () => { cancelled = true; markersRef.current.forEach(marker => marker.remove()); markersRef.current = []; ownedMap?.remove(); if (mapRef.current === ownedMap) mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = mapboxRef.current;
    if (!map || !mapbox || mapStatus !== "ready") return;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = filteredCamps.map(camp => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `camp-marker ${camp.id === selectedId ? "camp-marker-selected" : ""}`;
      element.setAttribute("aria-label", `Open ${camp.name}`);
      element.title = camp.name;
      element.innerHTML = '<span class="marker-dot"></span>';
      element.addEventListener("click", event => { event.stopPropagation(); openCamp(camp, false); });
      return new mapbox.Marker({ element, anchor: "bottom" }).setLngLat(camp.coordinates).addTo(map);
    });
    return () => { markersRef.current.forEach(marker => marker.remove()); markersRef.current = []; };
  }, [filteredCamps, selectedId, mapStatus, openCamp]);

  useEffect(() => {
    if (mapStatus === "ready") mapRef.current?.setStyle(style === "outdoors" ? "mapbox://styles/mapbox/outdoors-v12" : "mapbox://styles/mapbox/satellite-streets-v12");
  }, [style, mapStatus]);

  function toggleSaved(id: string) {
    setSavedIds(current => {
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }

  function searchArea() {
    const bounds = mapRef.current?.getBounds();
    if (!bounds) return;
    setAreaBounds([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
    setShowAreaButton(false);
    setSelectedId(null);
  }

  function resetArea() {
    setAreaBounds(null);
    setShowAreaButton(false);
    mapRef.current?.flyTo({ center: START_CENTER, zoom: START_ZOOM, essential: true });
  }

  function locateMe() {
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("Your browser does not support location sharing."); return; }
    navigator.geolocation.getCurrentPosition(
      position => mapRef.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 10, essential: true }),
      () => setLocationError("Location unavailable. Check your browser permission and try again."),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function authSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage(authMode === "signin" ? "Connect this form to Supabase Auth to sign in. Saved places currently live on this device." : "Connect this form to Supabase Auth to create an account. Saved places currently live on this device.");
  }

  return <main className="app-shell">
    <aside className={`side-panel ${mobilePanelOpen ? "side-panel-open" : ""}`}>
      <div className="brand-row"><div className="brand-mark"><Icon name="mountain" size={22}/></div><div className="brand-name">NOMAD<span>COLLECTIVE</span></div><button className="mobile-panel-close icon-button" onClick={() => setMobilePanelOpen(false)} aria-label="Close places panel"><Icon name="close"/></button></div>
      <div className="panel-intro"><span className="eyebrow">FIND YOUR WAY OUT</span><h1>Go a little<br/><em>further.</em></h1><p>Quiet places, shared by people who care for them.</p></div>
      <div className="panel-tools"><label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search places or regions" aria-label="Search places or regions"/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={15}/></button>}</label>
        <div className="view-tabs" role="tablist" aria-label="Places view"><button role="tab" aria-selected={viewMode === "explore"} className={viewMode === "explore" ? "active" : ""} onClick={() => setViewMode("explore")}>Explore</button><button role="tab" aria-selected={viewMode === "saved"} className={viewMode === "saved" ? "active" : ""} onClick={() => setViewMode("saved")}>Saved <span>{savedIds.length}</span></button></div>
        <div className="filter-row" aria-label="Filter campsites">{(["all", "easy-access", "tent", "pets", "water"] as CampFilter[]).map(filter => <button key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>{filter === "all" ? "All spots" : filter === "easy-access" ? "Easy access" : filter === "tent" ? "Tent friendly" : filter === "pets" ? "Pets" : "Near water"}</button>)}</div>
      </div>
      <div className="results-heading"><div><strong>{filteredCamps.length} {filteredCamps.length === 1 ? "place" : "places"}</strong><span>{areaBounds ? " in this map area" : viewMode === "saved" ? " saved on this device" : " to explore"}</span></div><Icon name="filter" size={17}/></div>
      <div className="results-list">{filteredCamps.length ? filteredCamps.map(camp => <ResultCard key={camp.id} camp={camp} active={selectedId === camp.id} saved={savedIds.includes(camp.id)} onOpen={() => openCamp(camp)} onSave={() => toggleSaved(camp.id)}/>) : <div className="empty-results"><Icon name="pin" size={24}/><strong>No places found here</strong><p>Try another search, remove a filter, or move the map.</p>{areaBounds && <button onClick={resetArea}>Show all places</button>}</div>}</div>
      <div className="panel-footer"><span className="footer-symbol">✳</span><p>Leave every place better<br/>than you found it.</p><span>01 / EXPLORE</span></div>
    </aside>

    <section className="map-section" aria-label="Dispersed campsite map">
      <div ref={mapElement} className="map-canvas" aria-label="Interactive Mapbox map"/>
      {mapStatus !== "ready" && <div className="map-overlay"><div className="map-setup-card"><div className="setup-icon"><Icon name="mountain" size={28}/></div><span className="eyebrow">{mapStatus === "loading" ? "LOADING MAP" : "MAP UNAVAILABLE"}</span><h2>{mapStatus === "loading" ? "Getting the terrain ready" : "Map could not load"}</h2><p>{mapStatus === "loading" ? "Mapbox is loading the map and places." : mapError}</p></div></div>}
      <div className="mobile-topbar"><button onClick={() => setMobilePanelOpen(true)} aria-label="Open places panel"><Icon name="menu"/></button><span>Nomad Collective</span></div>
      <div className="map-topbar"><div className="map-context"><span className="context-dot"/> EXPLORE THE OUTDOORS <span className="context-divider">/</span> COLORADO + UTAH</div><button className="account-button" onClick={() => { setAuthMode("signin"); setAuthMessage(""); setAuthOpen(true); }}>Sign in <Icon name="arrow" size={15}/></button></div>
      <div className="map-actions"><button onClick={() => setStyle(current => current === "outdoors" ? "satellite" : "outdoors")} disabled={mapStatus !== "ready"} title="Toggle map style"><Icon name="layers"/><span>{style === "outdoors" ? "Satellite" : "Terrain"}</span></button><button onClick={locateMe} disabled={mapStatus !== "ready"} title="Go to my location"><Icon name="locate"/><span>My location</span></button></div>
      {showAreaButton && mapStatus === "ready" && <button className="search-area-button" onClick={searchArea}><Icon name="search" size={16}/> Search this area</button>}
      {areaBounds && <button className="reset-area-button" onClick={resetArea}>Clear map area <Icon name="close" size={14}/></button>}
      {locationError && <div className="location-error" role="status">{locationError}<button onClick={() => setLocationError("")} aria-label="Dismiss location error"><Icon name="close" size={15}/></button></div>}
      <div className="map-caption"><span className="caption-line"/> DRAG TO EXPLORE · CLICK A PIN FOR DETAILS</div>
      {selected && <article className="detail-card" aria-label={`${selected.name} details`}><button className="detail-close" onClick={() => setSelectedId(null)} aria-label="Close campsite details"><Icon name="close" size={18}/></button><div className="detail-kicker"><span className="detail-kicker-dot"/> FIELD NOTE <span>·</span> {selected.state.toUpperCase()}</div><h2>{selected.name}</h2><p className="detail-region"><Icon name="pin" size={15}/>{selected.region}</p><p className="detail-copy">{selected.description}</p><div className="detail-features">{selected.features.map(feature => <span key={feature}>{feature}</span>)}</div><div className="detail-facts"><div><span>ACCESS</span><strong>{selected.access}</strong></div><div><span>CELL SERVICE</span><strong>{selected.cell}</strong></div><div><span>BEST FOR</span><strong>{selected.bestFor}</strong></div></div><div className="detail-actions"><a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.coordinates[1]},${selected.coordinates[0]}`} target="_blank" rel="noopener noreferrer">Get directions <Icon name="arrow" size={16}/></a><button className={savedIds.includes(selected.id) ? "saved" : ""} onClick={() => toggleSaved(selected.id)} aria-label={savedIds.includes(selected.id) ? "Remove saved place" : "Save place"}><Icon name="heart" size={18}/></button></div><p className="sample-note">Sample listing · verify access and local rules before you go.</p></article>}
    </section>

    {authOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setAuthOpen(false); }}><div className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Close account form"><Icon name="close"/></button><div className="brand-mark"><Icon name="mountain" size={22}/></div><span className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</span><h2 id="auth-title">{authMode === "signin" ? "Welcome back." : "Join the collective."}</h2><p>{authMode === "signin" ? "Sign in to share campsites and keep your favorite places close." : "Create an account to share your discoveries with the community."}</p><form onSubmit={authSubmit}><label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" required placeholder="you@example.com"/><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" required minLength={6} placeholder={authMode === "signin" ? "Your password" : "Create a password"}/><button type="submit">{authMode === "signin" ? "Sign in" : "Create account"} <Icon name="arrow" size={17}/></button></form><button className="auth-switch" onClick={() => { setAuthMode(current => current === "signin" ? "signup" : "signin"); setAuthMessage(""); }}>{authMode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}</button>{authMessage && <p className="auth-message" role="status">{authMessage}</p>}<div className="auth-footnote">Account creation and login require your Supabase connection.</div></div></div>}
  </main>;
}
