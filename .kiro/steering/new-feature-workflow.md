# New Feature Workflow

Whenever a new feature is requested, the following actions must happen — in order:

1. **Update SPEC.html** — Add a new user story card to Section 12 ("User Stories") with the appropriate severity (CRITICAL / HIGH / MEDIUM), status (Open), title, and a short user-story-format description.

2. **Create a GitHub Issue** — Use the `gh` CLI to create an issue in `m3ssana/gainztracker` with:
   - A title matching the story card.
   - A severity label (`critical`, `high`, or `medium`).
   - A body containing full technical details and acceptance criteria.

3. **Link the issue in SPEC.html** — Add a `→ GitHub Issue #N` link in the story card pointing to the newly created issue URL.

All three steps are mandatory. A feature is not "tracked" until it exists in both the spec and as a linked GitHub Issue.
