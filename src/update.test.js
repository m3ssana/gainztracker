// Tests for the pure service-worker update decision logic (issue #25).
// No browser APIs here, so these run in Node alongside the geo-core tests.
import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldPromptRestart } from "./update.js";

test("shouldPromptRestart: prompts when a new worker installs over an existing version", () => {
  // A controller already exists, so this is a genuine update the user should restart for.
  assert.equal(shouldPromptRestart(true, "installed"), true);
});

test("shouldPromptRestart: stays silent on the very first install (no controller yet)", () => {
  // First visit: nothing to restart, so we must not nag the user.
  assert.equal(shouldPromptRestart(false, "installed"), false);
});

test("shouldPromptRestart: stays silent while the new worker is still installing", () => {
  // Only act once the worker has fully reached the "installed" state.
  assert.equal(shouldPromptRestart(true, "installing"), false);
});
