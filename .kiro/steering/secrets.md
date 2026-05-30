# Secrets Management Policy

## Where Secrets Live

All secrets (API keys, tokens, credentials, service account keys) must be stored in one of two places:

1. **GitHub Actions Secrets** (preferred) — free, integrated with CI/CD, and sufficient for this project's needs.
2. **GCP Secret Manager** — only when a secret must be accessed at runtime by a GCP service (e.g., Cloud Run) that cannot receive it via GitHub Actions injection.

## Rules

- **Never commit secrets** to the repository — not in code, config files, comments, or commit messages.
- **Never store secrets in localStorage, environment files checked into git, or client-side code at rest.** A client-side key (like `GMAPS_KEY`) is injected at deploy time into a git-ignored file; it is still "public" in the browser but never in source control.
- **Prefer GitHub Actions Secrets** over GCP Secret Manager unless there is a concrete reason the secret must be accessed outside of CI/CD.
- **One secret per value** — don't bundle multiple credentials into a single secret. Name them clearly (e.g., `GMAPS_KEY`, not `API_KEY`).
- **Rotate secrets** when compromised or when team members with access leave the project.

## GitHub Actions Secrets Usage

- Store secrets at **Settings → Secrets and variables → Actions**.
- Reference them in workflows via `${{ secrets.SECRET_NAME }}`.
- Never echo or log secret values in workflow steps.
- Inject secrets into build artifacts (e.g., `config.js`) only in CI — the generated files must be in `.gitignore`.

## GCP Secret Manager Usage (when required)

- Access secrets via the Secret Manager API with least-privilege IAM bindings.
- Use `secretmanager.versions.access` permission only on the service account that needs it.
- Pin secret references to a specific version rather than `latest` in production workloads.
- GCP Secret Manager has a free tier (6 active secret versions, 10,000 access operations/month) — stay within it.

## What This Means for the AI

- Never write a secret value into a file that will be committed.
- When a workflow needs a secret, reference it from GitHub Actions Secrets.
- If asked to add a new secret, instruct the user to store it in GitHub Actions Secrets (or GCP Secret Manager if justified) — do not create placeholder values.
- Flag any file read that appears to contain a real secret and avoid echoing the value.
