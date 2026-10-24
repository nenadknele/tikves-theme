// Consent test for tikveslondon.uk. Usage: node consent-test.js [preview_theme_id] > out.json
const { chromium } = require('playwright');
const PREVIEW = process.argv[2] || '';
const BASE = 'https://tikveslondon.uk';
const PAGES = ['/', '/products/babuna-red', '/collections/all-wines', '/pages/cookie-policy'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const FIRST_PARTY = /(^|\.)tikveslondon\.uk$|(^|\.)shopify\.com$|(^|\.)shopifysvc\.com$|(^|\.)shopifycdn\.com$|(^|\.)shop\.app$|(^|\.)shopifycloud\.com$/;
const TRACKER_HOST = /googletagmanager|google-analytics|googleadservices|doubleclick|google\.com$|google\.co\.uk$|facebook|fbcdn|klaviyo|luckyorange|pinterest|pinimg|accesseaze|access-ease|tiktok|bing|clarity/i;
const TRACKER_KEY = /^_ga|^_gcl|^_gid|^_fbp|^_fbc|__kla|kla_|klaviyo|^lo-|^_lo|lucky|_pin|pinterest|^_tt|^_uet|^ttcsid/i;
const url = p => BASE + p + (PREVIEW ? (p.includes('?') ? '&' : '?') + 'preview_theme_id=' + PREVIEW : '');

async function snapshot(page, ctx, reqs) {
  const cookies = (await ctx.cookies()).map(c => `${c.domain}:${c.name}`);
  const st = await page.evaluate(() => {
    const ls = [], ss = [];
    try { for (let i = 0; i < localStorage.length; i++) ls.push(localStorage.key(i)); } catch (e) {}
    try { for (let i = 0; i < sessionStorage.length; i++) ss.push(sessionStorage.key(i)); } catch (e) {}
    let consent = null;
    try { consent = window.Shopify.customerPrivacy.currentVisitorConsent(); } catch (e) { consent = 'n/a'; }
    let mk = null; try { mk = window.Shopify.customerPrivacy.marketingAllowed(); } catch (e) {}
    const scripts = [...document.scripts].map(s => s.src).filter(s => s && !/tikveslondon|cdn\.shopify|shopifycloud/.test(s));
    return { ls, ss, consent, marketingAllowed: mk, scripts };
  });
  const third = [...new Set(reqs.map(u => new URL(u).host))].filter(h => !FIRST_PARTY.test(h)).sort();
  return { thirdPartyHosts: third, trackerHosts: third.filter(h => TRACKER_HOST.test(h)),
    trackerUrls: reqs.filter(u => TRACKER_HOST.test(new URL(u).host)).map(u => u.slice(0, 160)),
    cookies, trackingCookies: cookies.filter(c => TRACKER_KEY.test(c.split(':').slice(1).join(':'))),
    localStorage: st.ls, sessionStorage: st.ss,
    trackingStorage: [...st.ls.map(k => 'ls:' + k), ...st.ss.map(k => 'ss:' + k)].filter(k => TRACKER_KEY.test(k.slice(3))),
    consent: st.consent, marketingAllowed: st.marketingAllowed, externalScripts: st.scripts };
}

async function visit(page, ctx, path, label, out) {
  const reqs = [];
  const h = r => reqs.push(r.url());
  ctx.on('request', h);
  await page.goto(url(path), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(9000);
  try { await page.mouse.wheel(0, 1500); await page.waitForTimeout(2000); } catch (e) {}
  ctx.off('request', h);
  out.push({ step: label, page: path, ...(await snapshot(page, ctx, reqs)) });
}

async function passGate(page) {
  const btn = await page.$('[data-age-verification-popup-exit-button]');
  if (btn && await btn.isVisible()) { await btn.click(); await page.waitForTimeout(2500); return true; }
  return false;
}

async function run(name) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: UA, locale: 'en-GB', timezoneId: 'Europe/London', viewport: { width: 1366, height: 900 } });
  if (process.env.SIM_EMBED_OFF) {
    await ctx.route(u => u.host === 'tikveslondon.uk', async (route, req) => {
      if (req.resourceType() !== 'document') return route.continue();
      const resp = await route.fetch();
      let body = await resp.text();
      body = body.replace(/<!-- BEGIN app block: shopify:\/\/apps\/klaviyo-email-marketing-sms\/blocks\/klaviyo-onsite-embed[\s\S]*?<!-- END app block -->/g, '<!-- klaviyo embed stripped by test -->');
      await route.fulfill({ response: resp, body });
    });
  }
  const page = await ctx.newPage();
  const out = [];
  // bot challenge warm-up: first load, wait, gate.
  await page.goto(url('/'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  await passGate(page);
  const choose = async (sel) => {
    for (let i = 0; i < 3; i++) {
      try { await page.waitForSelector(sel, { state: 'visible', timeout: 15000 }); await page.click(sel); await page.waitForTimeout(3000); return; }
      catch (e) { await page.screenshot({ path: 'fail-' + name + '-' + i + '.png' }); await page.goto(url('/'), { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(6000); await passGate(page); }
    }
    throw new Error('banner never showed');
  };
  if (name === 'decline') await choose('#shopify-pc__banner__btn-decline');
  if (name === 'accept' || name === 'accept-then-decline') await choose('#shopify-pc__banner__btn-accept');
  const prefix = name === 'accept-then-decline' ? 'after accept' : 'after choice';
  for (const p of PAGES) await visit(page, ctx, p, name === 'none' ? 'no choice' : prefix, out);
  if (name === 'accept-then-decline') {
    await page.goto(url('/'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.privacyBanner.showPreferences());
    await page.waitForTimeout(2500);
    const btns = await page.evaluate(() => [...document.querySelectorAll('[id^="shopify-pc"] button')].filter(e => e.offsetParent !== null).map(e => e.id + '|' + e.textContent.trim()));
    out.push({ step: 'prefs-dialog-buttons', page: '/', buttons: btns });
    const dec = btns.find(t => /decline|reject/i.test(t));
    await page.click('#' + dec.split('|')[0]);
    await page.waitForTimeout(3000);
    for (const p of PAGES) await visit(page, ctx, p, 'after later decline', out);
  }
  await b.close();
  return { run: name, results: out };
}

(async () => {
  const which = (process.argv[3] || 'none,decline,accept,accept-then-decline').split(',');
  const all = [];
  for (const r of which) { const res = await run(r); all.push(res); process.stderr.write('done ' + r + '\n'); }
  console.log(JSON.stringify({ preview: PREVIEW || 'live', at: new Date().toISOString(), runs: all }, null, 1));
})();
