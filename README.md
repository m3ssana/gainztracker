# GAINZ Tracker

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
6. Expose the key to the app without a build step — create a git-ignored
   `config.js` and load it before `app.js` in `index.html`:

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

GitHub Pages serves the static files; the `CNAME` file points the build at
`gainz.messana.ai`. Enable "Enforce HTTPS" in Pages settings (required for
sensors + install). Bump `CACHE` in [`sw.js`](sw.js) on each release so the
service worker rolls the update out to installed clients.
