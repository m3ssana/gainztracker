// Tests for the pure geo/math core of GAINZ Sherpa.
// These functions have no browser dependencies, so we can test them in Node.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  haversineMeters,
  bearing,
  nearestGym,
  arrowRotation,
  formatDistance,
} from "./geo.js";

// Helper: assert two numbers are close, since floating-point geo math is never exact.
function near(actual, expected, tolerance, message) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: expected ~${expected}, got ${actual}`
  );
}

test("haversineMeters: ~111.2 km for one degree of longitude at the equator", () => {
  const meters = haversineMeters({ lat: 0, lon: 0 }, { lat: 0, lon: 1 });
  near(meters, 111195, 50, "one degree of longitude at equator");
});

test("haversineMeters: zero distance for identical points", () => {
  assert.equal(haversineMeters({ lat: 40, lon: -74 }, { lat: 40, lon: -74 }), 0);
});

test("bearing: due north is ~0 degrees", () => {
  near(bearing({ lat: 0, lon: 0 }, { lat: 1, lon: 0 }), 0, 0.001, "north bearing");
});

test("bearing: due east is ~90 degrees", () => {
  near(bearing({ lat: 0, lon: 0 }, { lat: 0, lon: 1 }), 90, 0.001, "east bearing");
});

test("nearestGym: returns the closest gym and its distance", () => {
  const me = { lat: 0, lon: 0 };
  const far = { name: "Far Gym", lat: 0, lon: 5 };
  const close = { name: "Close Gym", lat: 0, lon: 1 };
  const result = nearestGym(me, [far, close]);
  assert.equal(result.gym.name, "Close Gym");
  near(result.distanceMeters, 111195, 50, "distance to closest gym");
});

test("nearestGym: returns null when there are no gyms", () => {
  assert.equal(nearestGym({ lat: 0, lon: 0 }, []), null);
});

test("arrowRotation: subtracts heading from bearing", () => {
  assert.equal(arrowRotation(90, 30), 60);
});

test("arrowRotation: normalizes negative results into 0-360", () => {
  assert.equal(arrowRotation(10, 350), 20);
});

test("formatDistance: miles to one decimal", () => {
  assert.equal(formatDistance(1609.344, "mi"), "1.0 mi");
});

test("formatDistance: kilometers to one decimal", () => {
  assert.equal(formatDistance(1000, "km"), "1.0 km");
});
