# Infrastructure Policy

## Cost Constraint

This is an experimental project. **All infrastructure must fall within Google Cloud Platform's free tier or have very low cost.** Keeping costs near zero is mandatory, not a nice-to-have.

- Prefer Always Free tier resources (Cloud Run free invocations, Cloud Storage free egress tier, Firestore free reads/writes, etc.).
- If a service has no free tier, it must be demonstrably cheap (single-digit dollars/month max) and justified before provisioning.
- Set budget alerts at $1 and $5 so surprises don't happen.

## Infrastructure as Code

All infrastructure changes must be deployed using **Google Cloud Deployment Manager** (GCP's native IaC tool).

- Infrastructure is defined in Deployment Manager YAML/Jinja/Python templates committed to the repo.
- No ad-hoc `gcloud` commands that create, modify, or delete resources.
- If Deployment Manager cannot express a resource, a human makes the change manually in the GCP Console — never via a CLI write command.

## GCP CLI Usage

The `gcloud` CLI may only be used in **read-only mode**:

- ✅ `gcloud projects list`, `gcloud run services describe`, `gcloud storage ls`, `gcloud builds list`
- ❌ `gcloud run deploy`, `gcloud storage cp`, `gcloud compute instances create`, or any command that creates/modifies/deletes a resource

Changes to infrastructure are made exclusively through:

1. **Deployment Manager templates** (committed, reviewed, deployed via CI or `gcloud deployment-manager deployments create/update`), or
2. **A human in the GCP Console** for one-off configurations that IaC cannot cover.

## Why?

- IaC keeps infra reproducible and reviewable — no "who clicked what in the console last Tuesday" mysteries.
- Read-only CLI prevents accidental mutations from a terminal typo.
- Free tier keeps this project from costing more than the mass of iron it helps you find.
