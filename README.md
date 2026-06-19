# TaxDown EN locale

Userscript that switches the [app.taxdown.es](https://app.taxdown.es) UI to **English**.

TaxDown ships English translation files on its CDN (`/translations/en/…`), but the web app is hard-locked to Spanish (`supportedLngs: ['es']`, no language switcher). This script makes the app load English without touching the app itself.

## How it works

i18next loads each translation file from:

```
https://assets.taxdown.es/assets/translations/<lng>/<vertical>/<namespace>.json
```

The script intercepts those `fetch` requests and, for every `…/es/…` file, fetches **both** the `es` and `en` versions and returns `en` merged over `es`:

- the app still thinks it loaded `es` (so `supportedLngs` is satisfied);
- you see English strings;
- any key missing from `en` falls back to the Spanish value (per-key fallback), so nothing renders blank.

Strings hardcoded in the app bundle (not in the JSON files), and date/number formats, stay Spanish.

## Install

1. Install a userscript manager — [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Click to install:

   **https://raw.githubusercontent.com/maxmaxme/taxdown-en/main/taxdown-en.user.js**

3. Open / reload [app.taxdown.es](https://app.taxdown.es).

Auto-updates are enabled (`@updateURL`); the manager checks periodically, or use *Check for updates* in its dashboard.

## Development

- Edit `taxdown-en.user.js`.
- **Bump `@version`** in the header on every change — otherwise userscript managers won't pull the update.
- Commit and push to `main`.

## Disclaimer

Unofficial, not affiliated with TaxDown. It only rewires which translation file the app loads in your own browser. Use at your own risk.
