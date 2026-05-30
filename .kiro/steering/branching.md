# Branching & Pull Request Policy

## The Golden Rule

**Never commit directly to `main`.** Treat `main` like a museum exhibit — look, don't touch. All changes, no matter how small (yes, even fixing a typo in a comment), must live on a feature branch and arrive in `main` via a pull request.

## Branch Workflow

1. Create a feature branch off `main` with a descriptive name (e.g., `feat/compass-calibration`, `fix/streak-off-by-one`, `chore/update-gym-data`).
2. Do your work on that branch. Commit early, commit often — nobody's judging your WIP messages (okay, maybe a little).
3. Push the branch and open a pull request into `main`.
4. Get it reviewed, merged, and bask in the glory of a clean git history.

## Pull Request Requirements

Every PR description must include:

- **What changed** — a clear summary of the work. Bullet points are your friend.
- **Why it changed** — the motivation. "Because I felt like it" is not sufficient (we checked).
- **How to test** — steps a reviewer can follow to verify the change works. Assume they just woke up from a nap.
- **Anything weird** — gotchas, trade-offs, or things that look wrong but are intentional. Future-you will thank present-you.

## The Humor Mandate

PR descriptions should be informative AND entertaining. Life is too short for dry changelogs. Acceptable approaches include:

- Gym puns (strongly encouraged — this is GAINZ Sherpa after all)
- Self-deprecating commentary about the bug you introduced and then fixed
- Dramatic narration of the problem you solved ("The arrow pointed south. The gym was north. Users wandered into the ocean.")
- Emoji usage that would make a Slack power-user proud

## What This Means for the AI

When Kiro (that's me) makes changes:

- I will create a feature branch before touching any code.
- I will not push directly to `main` unless explicitly told to (and even then, I'll raise an eyebrow).
- I will open a PR with detailed, well-structured, and mildly hilarious notes.
- I will keep PR titles concise (<70 chars) and save the comedy for the description.

## Why?

Because `main` is sacred ground. Because code review catches bugs. Because `git blame` should tell a story. And because reading a PR titled "fix: arrow now points at gym instead of into the void" is objectively better than a mystery force-push at 2 AM.
