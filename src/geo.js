// Pure geo/math core for GAINZ Sherpa.
// No browser APIs here on purpose: keeping it pure means we can unit-test it in
// Node and reuse the exact same code in the browser and in a Web Worker.

const EARTH_RADIUS_M = 6371000; // mean Earth radius in metres
const METERS_PER_MILE = 1609.344;

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

// Great-circle distance between two {lat, lon} points using the Haversine formula.
export function haversineMeters(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  // h is the "haversine" of the central angle between the two points.
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Initial compass bearing (0-360, where 0 = North) when travelling from `from` to `to`.
export function bearing(from, to) {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLon = toRad(to.lon - from.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  // atan2 returns -180..180; shift into 0..360 so it reads like a compass.
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Find the closest gym to `pos`. Returns { gym, distanceMeters } or null if the
// list is empty. We scan once and keep the running minimum — O(n), plenty fast.
export function nearestGym(pos, gyms) {
  let best = null;
  for (const gym of gyms) {
    const distanceMeters = haversineMeters(pos, gym);
    if (best === null || distanceMeters < best.distanceMeters) {
      best = { gym, distanceMeters };
    }
  }
  return best;
}

// How far to rotate the on-screen arrow so it points at the gym.
// We subtract the device heading from the bearing-to-gym, then normalize to 0..360.
export function arrowRotation(bearingToGym, deviceHeading) {
  return (((bearingToGym - deviceHeading) % 360) + 360) % 360;
}

// Format a raw metre distance into a glanceable string in the user's unit.
export function formatDistance(meters, unit) {
  const value = unit === "mi" ? meters / METERS_PER_MILE : meters / 1000;
  return `${value.toFixed(1)} ${unit}`;
}
