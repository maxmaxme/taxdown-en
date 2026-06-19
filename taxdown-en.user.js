// ==UserScript==
// @name         TaxDown EN locale
// @namespace    https://github.com/maxmaxme/taxdown-en
// @version      1.2.0
// @description  Switch the app.taxdown.es UI to English (merges en/ over es/, es as per-key fallback). Toggle via an on-page button or the userscript menu.
// @author       maxmaxme
// @match        https://app.taxdown.es/*
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/maxmaxme/taxdown-en/main/taxdown-en.user.js
// @downloadURL  https://raw.githubusercontent.com/maxmaxme/taxdown-en/main/taxdown-en.user.js
// ==/UserScript==
(() => {
  'use strict';

  // The fetch override must patch the PAGE's real window. With any @grant other
  // than `none`, the script runs sandboxed and `window` is a proxy, so we patch
  // `unsafeWindow` (falling back to `window` if unavailable).
  const pageWindow = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  const KEY = 'enabled';
  const enabled = GM_getValue(KEY, true); // English on by default

  const toggle = () => { GM_setValue(KEY, !enabled); pageWindow.location.reload(); };
  const setLang = (en) => () => {
    if (en === enabled) return; // already active
    GM_setValue(KEY, en);
    pageWindow.location.reload();
  };

  // --- Menu: one command per language, active one marked -------------------
  GM_registerMenuCommand((enabled ? '● ' : '○ ') + 'English', setLang(true));
  GM_registerMenuCommand((!enabled ? '● ' : '○ ') + 'Español', setLang(false));

  // --- On-page floating EN/ES switch ---------------------------------------
  const addButton = () => {
    if (!document.body || document.getElementById('td-lang-switch')) return;
    const btn = document.createElement('button');
    btn.id = 'td-lang-switch';
    btn.type = 'button';
    btn.textContent = enabled ? 'EN' : 'ES';
    btn.title = enabled ? 'Switch to Spanish' : 'Switch to English';
    btn.style.cssText = [
      'position:fixed', 'bottom:16px', 'right:16px', 'z-index:2147483647',
      'width:44px', 'height:44px', 'border-radius:50%', 'border:none',
      'background:#111', 'color:#fff', 'font:600 14px/1 system-ui,sans-serif',
      'cursor:pointer', 'box-shadow:0 2px 8px rgba(0,0,0,.3)', 'opacity:.85',
    ].join(';');
    btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = '.85'; });
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButton);
  } else {
    addButton();
  }

  if (!enabled) return; // leave the app in its native Spanish

  // --- Translation rewrite -------------------------------------------------
  // Matches the language segment of:
  //   https://assets.taxdown.es/assets/translations/<lng>/<vertical>/<ns>.json
  const RE = /(https:\/\/assets\.taxdown\.es\/assets\/translations\/)es(\/)/;

  const deepMerge = (base, over) => {
    const out = Array.isArray(base) ? base.slice() : { ...base };
    for (const k in over) {
      const bv = base ? base[k] : undefined;
      const ov = over[k];
      out[k] = (ov && typeof ov === 'object' && bv && typeof bv === 'object')
        ? deepMerge(bv, ov)
        : ov;
    }
    return out;
  };

  const origFetch = pageWindow.fetch.bind(pageWindow);
  pageWindow.fetch = async (input, init) => {
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
