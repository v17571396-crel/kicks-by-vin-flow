

## Plan: Add Google Analytics (GA4) Tracking

**What:** Add GA4 tracking script site-wide and track page views on route changes.

**How:**

1. **`index.html`** — Add the GA4 `gtag.js` script tags in `<head>` with Measurement ID `G-XXXXXXXXXX`.

2. **`src/components/GoogleAnalytics.tsx`** (new) — Create a component that listens to React Router location changes and fires `gtag('config', ...)` on each navigation to track SPA page views.

3. **`src/App.tsx`** — Add the `GoogleAnalytics` component inside `<BrowserRouter>` so it has access to routing context.

This is a publishable key, so it's safe to embed directly in the code. No secrets management needed.

