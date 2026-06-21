// ==UserScript==
// @name         TaxDown EN locale
// @namespace    https://github.com/maxmaxme/taxdown-en
// @version      2.0.0
// @description  Switch the app.taxdown.es UI to English (merges en/ over es/, es as per-key fallback). Disable the script to go back to Spanish.
// @author       maxmaxme
// @match        https://app.taxdown.es/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/maxmaxme/taxdown-en/main/taxdown-en.user.js
// @downloadURL  https://raw.githubusercontent.com/maxmaxme/taxdown-en/main/taxdown-en.user.js
// ==/UserScript==
(() => {
  'use strict';

  // --- Translation rewrite -------------------------------------------------
  // Matches the language segment of:
  //   https://assets.taxdown.es/assets/translations/<lng>/<vertical>/<ns>.json
  const RE = /(https:\/\/assets\.taxdown\.es\/assets\/translations\/)es(\/)/;

  // TaxDown's en/ files are machine-translated and sometimes clobber technical
  // values — e.g. an `icon` field "IconSheetM" becomes a sentence, which the app
  // looks up as a React component and crashes on (React error #130). Keep the
  // Spanish value for keys that hold identifiers, not human-readable text.
  const keepSpanish = (key, esVal) =>
    /icon$/i.test(key) || (typeof esVal === 'string' && /^Icon[A-Z0-9]/.test(esVal));

  const deepMerge = (base, over) => {
    const out = Array.isArray(base) ? base.slice() : { ...base };
    for (const k in over) {
      const bv = base ? base[k] : undefined;
      const ov = over[k];
      out[k] = (ov && typeof ov === 'object' && bv && typeof bv === 'object')
        ? deepMerge(bv, ov)
        : (keepSpanish(k, bv) ? bv : ov);
    }
    return out;
  };

  const origFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url);
    if (url && RE.test(url)) {
      const esUrl = url;
      const enUrl = url.replace(RE, '$1en$2');
      try {
        const [es, en] = await Promise.all([
          origFetch(esUrl, init).then(r => (r.ok ? r.json() : {})).catch(() => ({})),
          origFetch(enUrl, init).then(r => (r.ok ? r.json() : {})).catch(() => ({})),
        ]);
        const merged = deepMerge(es, en);
        return new Response(JSON.stringify(merged), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // On any failure, fall back to the original (Spanish) request.
        return origFetch(input, init);
      }
    }
    return origFetch(input, init);
  };
})();
