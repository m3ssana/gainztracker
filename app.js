// GAINZ Tracker — browser controller.
// All the heavy math lives in the pure, unit-tested ./src/geo.js so this file
// only deals with the things that need a browser: sensors, the DOM, and storage.
import { nearestGym, bearing, arrowRotation, formatDistance } from "./src/geo.js";

// --- DOM references (grabbed once so we are not querying on every frame) -----
const $ = (id) => document.getElementById(id);
const els = {
  arrow: $("arrow"),
  compass: $("compass"),
  distance: $("distance"),
  gym: $("gym"),
  status: $("status"),
  hype: $("hype"),
  streak: $("streak"),
  gate: $("gate"),
  start: $("start"),
  unitMi: $("unit-mi"),
  unitKm: $("unit-km"),
};

// --- App state ---------------------------------------------------------------
const NEAR_METERS = 300; // start the "closing in" pulse inside this radius
const CHECKIN_METERS = 150; // count a gym visit once we are this close
const HYPE = ["Time to lift", "Don't skip leg day", "Chase the pump", "Go get GAINZ", "Iron awaits"];

const state = {
  unit: localStorage.getItem("unit") === "km" ? "km" : "mi", // default to miles
  gyms: [],
  position: null, // {lat, lon} from geolocation
  heading: 0, // device compass heading in degrees (0 = North)
};

// --- Unit toggle (persisted in localStorage, SPEC §4) ------------------------
function setUnit(unit) {
  state.unit = unit;
  localStorage.setItem("unit", unit);
  els.unitMi.setAttribute("aria-pressed", String(unit === "mi"));
  els.unitKm.setAttribute("aria-pressed", String(unit === "km"));
  render(); // reflect the new unit immediately
}
els.unitMi.addEventListener("click", () => setUnit("mi"));
els.unitKm.addEventListener("click", () => setUnit("km"));

// --- Streaks (local-only retention hook, SPEC §5) ----------------------------
// We keep a tiny record in localStorage: the streak count and the date of the
// last proximity check-in. Visiting on consecutive days grows the streak.
function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem("streak")) || { count: 0, lastDay: null };
  } catch {
    return { count: 0, lastDay: null };
  }
}
function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" in the user's clock
}
function renderStreak() {
  els.streak.textContent = `🔥 ${loadStreak().count}`;
}
// Called when we detect the user is physically at a gym.
function registerCheckin() {
  const streak = loadStreak();
  const today = todayKey();
  if (streak.lastDay === today) return; // already counted today

  // Consecutive-day check: was the last check-in exactly yesterday?
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  streak.count = streak.lastDay === yesterday ? streak.count + 1 : 1;
  streak.lastDay = today;
  localStorage.setItem("streak", JSON.stringify(streak));

  renderStreak();
  if (navigator.vibrate) navigator.vibrate(200); // haptic reward (SPEC §5)
  els.status.textContent = "💪 Checked in. GAINZ secured!";
}

// --- Rendering ---------------------------------------------------------------
// Pure-data-in, DOM-out. Safe to call on every position/heading update.
function render() {
  if (!state.position || state.gyms.length === 0) return;

  const result = nearestGym(state.position, state.gyms);
  if (!result) {
    els.gym.textContent = "No gyms nearby.";
    return;
  }

  const { gym, distanceMeters } = result;
  els.distance.textContent = formatDistance(distanceMeters, state.unit);
  els.gym.textContent = gym.name;

  // Rotate the arrow to point at the gym relative to where the phone is facing.
  const bearingToGym = bearing(state.position, gym);
  const rotation = arrowRotation(bearingToGym, state.heading);
  els.arrow.style.transform = `rotate(${rotation}deg)`;

  // Visual cue + check-in when closing in.
  els.compass.classList.toggle("near", distanceMeters <= NEAR_METERS);
  if (distanceMeters <= CHECKIN_METERS) registerCheckin();
}

// --- Sensors -----------------------------------------------------------------
// Geolocation: continuously track the user so distance/direction stay live.
function watchLocation() {
  if (!navigator.geolocation) {
    els.status.textContent = "Geolocation not supported on this device.";
    return;
  }
  navigator.geolocation.watchPosition(
    (pos) => {
      state.position = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      els.status.textContent = "";
      render();
    },
    () => {
      // Denied or unavailable — explain rather than fail silently (SPEC §4, §10).
      els.status.textContent = "Location blocked. Enable it to find GAINZ.";
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
}

// Compass heading. iOS exposes a true-north heading via webkitCompassHeading;
// other browsers give us `alpha` (rotation around the z-axis) instead.
function onOrientation(event) {
  let heading;
  if (typeof event.webkitCompassHeading === "number") {
    heading = event.webkitCompassHeading; // already clockwise from North
  } else if (event.absolute && event.alpha != null) {
    heading = (360 - event.alpha) % 360; // convert alpha to a compass heading
  } else {
    return; // no usable heading in this event
  }
  state.heading = heading;
  render();
}

// iOS 13+ requires an explicit permission request triggered by a user gesture.
async function enableCompass() {
  const orientationEvent = window.DeviceOrientationEvent;
  if (orientationEvent && typeof orientationEvent.requestPermission === "function") {
    try {
      const result = await orientationEvent.requestPermission();
      if (result !== "granted") {
        els.status.textContent = "Compass blocked — distance still works.";
        return;
      }
    } catch {
      els.status.textContent = "Compass unavailable — distance still works.";
      return;
    }
  }
  window.addEventListener("deviceorientation", onOrientation, true);
}

// --- Startup -----------------------------------------------------------------
// Load the bundled gym dataset. Returns [] on failure so the app still renders.
async function loadGyms() {
  try {
    const res = await fetch("gyms.json");
    return await res.json();
  } catch {
    els.status.textContent = "Could not load gym data.";
    return [];
  }
}

// Rotate the hype phrase periodically for personality (SPEC §5).
function startHype() {
  let i = 0;
  els.hype.textContent = HYPE[0];
  setInterval(() => {
    i = (i + 1) % HYPE.length;
    els.hype.textContent = HYPE[i];
  }, 4000);
}

// The gate's single tap unlocks the sensors (satisfying iOS) and kicks off all
// independent startup work concurrently so results appear as fast as possible.
els.start.addEventListener("click", async () => {
  els.gate.classList.add("hidden");
  startHype();

  // These three tasks share no data, so run them in parallel (SPEC §9).
  const [gyms] = await Promise.all([
    loadGyms(),
    enableCompass(),
    Promise.resolve(watchLocation()),
  ]);
  state.gyms = gyms;
  render();
});

// --- Boot --------------------------------------------------------------------
setUnit(state.unit); // reflect the saved unit preference on first paint
renderStreak();

// Register the service worker for offline launch (SPEC §6). Non-blocking.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    /* Offline support is a progressive enhancement; ignore failures. */
  });
}
