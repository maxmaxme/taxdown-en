# TaxDown EN locale

Userscript that switches the [app.taxdown.es](https://app.taxdown.es) UI to **English**. TaxDown ships English translations on its CDN but locks the app to Spanish — this unlocks them in your browser, no app changes.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or [Violentmonkey](https://violentmonkey.github.io/)).
2. Install the script: **https://raw.githubusercontent.com/maxmaxme/taxdown-en/main/taxdown-en.user.js**
3. Open [app.taxdown.es](https://app.taxdown.es) — it's in English.

Auto-updates via `@updateURL`. To go back to Spanish, just disable the script in your userscript manager and reload.

## How it works

The app loads translations from `…/translations/<lng>/<vertical>/<namespace>.json`. The script intercepts those `fetch` calls and, for each `es` file, returns `en` merged over `es` — so you get English with Spanish as a per-key fallback. Only `es`/`en` exist on the CDN. Strings hardcoded in the bundle and date/number formats stay Spanish.

## Development

Edit `taxdown-en.user.js`, **bump `@version`** (else managers won't update), commit + push to `main`.

## Disclaimer

Unofficial, not affiliated with TaxDown. Use at your own risk.
