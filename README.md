# GAINZ Sherpa

A backend-free PWA that points you at the nearest gym using your phone's
geolocation and compass, with the distance in your preferred units. Gyms are
discovered live via the Google Maps Places API; the app shell and last results
are cached for offline use. Installable on iOS Safari. See
[`SPEC.html`](SPEC.html) for the full spec.

## Develop

```bash
npm test                 # run the pure geo-core unit tests (Node, zero deps)
node tools/make-icons.mjs # regenerate the app icons
```

The compass and geolocation need a secure context, so serve over HTTPS (or
`localhost`) to try it on a device:

```bash
npx http-server -p 8080   # then open http://localhost:8080
```

## Google Maps API key

Gym discovery uses the **Google Maps Places API**, called directly from the
browser. Set up a referrer-restricted key:

1. In the [Google Cloud Console](https://console.cloud.google.com/), create (or
   select) a project and enable **billing** — Maps Platform requires it, though
   it includes a recurring monthly free credit.
2. **APIs & Services → Library**: enable the **Places API** (and the **Maps
   JavaScript API** if you load the JS SDK).
3. **APIs & Services → Credentials → Create credentials → API key**.
4. Restrict the key — this is what keeps a public client-side key safe:
   - **Application restrictions → HTTP referrers**: add
     `https://gainz.messana.ai/*` and, for local testing, `http://localhost:8080/*`.
   - **API restrictions**: limit it to the Places API (+ Maps JavaScript API).
5. Set a **quota / budget alert** so a leaked key cannot run up the bill.
6. **For local dev**, expose the key via a git-ignored `config.js` loaded before
   `app.js` in `index.html`. Never commit it — add `config.js` to `.gitignore`.
   In production the same file is generated in CI from a secret (see [Deploy](#deploy)):

   ```js
   // config.js — DO NOT commit (add to .gitignore)
   window.GMAPS_KEY = "YOUR_KEY_HERE";
   ```

   ```html
   <script src="config.js"></script>
   <script type="module" src="app.js"></script>
   ```

> A client-side key is always visible in the browser; security comes from the
> referrer + API restrictions and the quota cap, not from hiding the key.

## Deploy

The repo never contains the key — store it as a **GitHub Actions secret** and
inject it into `config.js` at deploy time:

1. **Settings → Secrets and variables → Actions → New repository secret** — name
   it `GMAPS_KEY` and paste the key. It is encrypted, and is never exposed in the
   repo, git history, or build logs.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** (instead
   of "Deploy from a branch") so the workflow below publishes the site.
3. Add a workflow that writes `config.js` from the secret, then deploys Pages:

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   on:
     push: { branches: [main] }
   permissions:
     pages: write
     id-token: write
   jobs:
     build-deploy:
       runs-on: ubuntu-latest
       environment: github-pages
       steps:
         - uses: actions/checkout@v4
         # Inject the secret at build time — config.js is NOT in the repo.
         - run: echo "window.GMAPS_KEY='${{ secrets.GMAPS_KEY }}';" > config.js
         - uses: actions/upload-pages-artifact@v3
           with: { path: . }
         - uses: actions/deploy-pages@v4
   ```

`config.js` is generated fresh in CI and stays in `.gitignore`, so the key is
never committed. The `CNAME` file still points the build at `gainz.messana.ai`;
keep "Enforce HTTPS" on (required for sensors + install). Bump `CACHE` in
[`sw.js`](sw.js) each release so the service worker rolls the update out.

> The injected key is still readable in the deployed `config.js` (it is a
> client-side key). Secrets only keep it out of source control — the referrer +
> API restrictions and quota cap are what actually prevent abuse.
