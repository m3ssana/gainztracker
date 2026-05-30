# GitHub Issue Commenting Policy

Agents must keep the GitHub Issue they are working on up to date with progress comments. The issue is the single source of truth for status — anyone reading it should understand what happened without needing the chat transcript.

## Required Comments

There are three mandatory moments to comment, using the `gh` CLI (`gh issue comment <number> --body "..."`):

1. **Work started** — When beginning work on an issue, post a comment announcing that work has begun. Note the branch name and a brief plan of attack.

2. **Notable milestones** — As work progresses, comment on each noteworthy milestone within the user story. Examples:
   - A failing test written (TDD red) or a passing implementation (TDD green).
   - A meaningful sub-component completed.
   - A blocker, design decision, or trade-off worth recording.
   - A pivot in approach and the reason for it.

3. **Completion summary** — Before closing the issue, post a summary comment covering:
   - What was completed (mapped to the acceptance criteria).
   - How it was tested.
   - Anything left out of scope or deferred to a follow-up.

## Keeping SPEC.html in Sync

The story card in SPEC.html §12 must reflect the issue's real status. When an issue is completed, update its card **before closing the issue** (ideally in the same PR as the implementation):

- Flip the card's `data-status="open"` to `data-status="done"`.
- Swap the status badge `<span class="badge badge-open">Open</span>` for `<span class="badge badge-done">Done</span>`.
- Move the card into the "DONE stories" group so it sorts and filters correctly.

This keeps the spec, the GitHub Issue, and the code telling the same story.

## Style

- Be concise and factual — these are progress notes, not essays.
- Reference commits, branches, and PRs by link where relevant.
- Never paste secret values into a comment.

## What This Means for the AI

- I comment when I start, at each notable milestone, and with a summary before closing.
- I err on the side of more frequent updates so the issue tells the full story.
- I update the story card's status in SPEC.html to "Done" before closing the issue.
- I use `gh issue comment` for all of the above and `gh issue close` only after the summary comment is posted.
