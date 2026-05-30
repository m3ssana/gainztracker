// Pure decision logic for the service-worker update flow (SPEC §6, issue #25).
// Kept browser-free so it can be unit-tested in Node and imported by app.js.

// Decide whether to prompt the user to restart for a newly installed worker.
//
// A worker reaching the "installed" state means a new app shell is ready and
// waiting. We only prompt when the page is ALREADY controlled by a worker
// (`hasController` is true) — that is what distinguishes a real UPDATE from the
// very FIRST install, where there is no previous version and nothing to restart.
export function shouldPromptRestart(hasController, workerState) {
  return workerState === "installed" && hasController === true;
}
