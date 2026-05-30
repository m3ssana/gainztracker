# GAINZ Tracker

A backend-free PWA that points you at the nearest gym using your phone's
geolocation and compass, with the distance in your preferred units. Installable
on iOS Safari, runs offline. See [`SPEC.html`](SPEC.html) for the full spec.

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

## Deploy

GitHub Pages serves the static files; the `CNAME` file points the build at
`gainz.messana.ai`. Enable "Enforce HTTPS" in Pages settings (required for
sensors + install). Bump `CACHE` in [`sw.js`](sw.js) on each release so the
service worker rolls the update out to installed clients.
