# Consent test, 24 Oct 2026

Does "Reject all" on the cookie banner really block tracking on tikveslondon.uk?

## Short answer

- **Live theme (babuna-six): FAIL.** Klaviyo loads before any choice and after "Reject all". On a later "Decline all" it leaves `__kla_id` and its storage behind.
- Google, Meta and Pinterest: **PASS**. None of them load or set anything until "Accept all". After a later decline they stop.
- **Fixed copy, with the Klaviyo embed off: PASS on every run.** Nothing reaches any tracker host before consent or after a no. A later no clears Klaviyo's cookie and storage.

## How it was run

- Playwright, headless Chromium, a fresh profile for every run, desktop Chrome user agent, en-GB, Europe/London.
- Age gate answered Yes. Then the banner: no choice, "Reject all", "Accept all", or "Accept all" then `window.privacyBanner.showPreferences()` and "Decline all". The footer has no cookie settings link, only the cookie policy page.
- Pages: home, /products/babuna-red, /collections/all-wines, /pages/cookie-policy. About 11 seconds on each, with a scroll.
- Logged per page: every third-party request host, all cookies on every domain, localStorage and sessionStorage keys, and `Shopify.customerPrivacy.currentVisitorConsent()`.
- PASS means: with no choice and after a no, nothing reaches a tracker host and no tracking cookie or storage key is set. Shopify essentials are fine.
- Script: `tests/consent-test.js`. Run `node tests/consent-test.js [preview_theme_id] [runs]`. Set `SIM_EMBED_OFF=1` to strip the Klaviyo app embed from each page in the test browser.

In the tables, a number means that many hosts from that company were contacted. A dot means none. Klaviyo's four hosts are static.klaviyo.com, static-tracking.klaviyo.com, static-forms.klaviyo.com and fast.a.klaviyo.com. Google is www.googletagmanager.com. Meta is connect.facebook.net. Pinterest is ct.pinterest.com. Runs 3 and the "after accept" steps of run 4 are consented, so trackers there are expected.

## Before: live theme, babuna-six

| Run | Step | Page | Klaviyo | Google | Meta | Pinterest | Lucky Orange | AccessEaze | Tracking cookies | Tracking storage | Consent (mkt/an) | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 No choice | no choice | home | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 1 No choice | no choice | babuna-red | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 1 No choice | no choice | all-wines | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 1 No choice | no choice | cookie-policy | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 2 Reject all | after choice | home | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 2 Reject all | after choice | babuna-red | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 2 Reject all | after choice | all-wines | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 2 Reject all | after choice | cookie-policy | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 3 Accept all | after choice | home | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | babuna-red | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | all-wines | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | cookie-policy | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | home | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | babuna-red | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | all-wines | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | cookie-policy | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after later decline | home | **4 hosts** | · | · | · | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 4 Accept, then Decline all | after later decline | babuna-red | **4 hosts** | · | · | · | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 4 Accept, then Decline all | after later decline | all-wines | **4 hosts** | · | · | · | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 4 Accept, then Decline all | after later decline | cookie-policy | **4 hosts** | · | · | · | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |

## After: theme copy, Klaviyo embed off (simulated)

Theme copy `consent-fix (copy of babuna-six)`, ID 209468719449, with the new loader. The Klaviyo app embed is still switched on in that copy, because that switch is a theme editor click. So for this run the test browser cut the embed's block out of each page before it ran. That is what the page looks like with the embed off.

| Run | Step | Page | Klaviyo | Google | Meta | Pinterest | Lucky Orange | AccessEaze | Tracking cookies | Tracking storage | Consent (mkt/an) | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 No choice | no choice | home | · | · | · | · | · | · | · | · | unset/unset | PASS |
| 1 No choice | no choice | babuna-red | · | · | · | · | · | · | · | · | unset/unset | PASS |
| 1 No choice | no choice | all-wines | · | · | · | · | · | · | · | · | unset/unset | PASS |
| 1 No choice | no choice | cookie-policy | · | · | · | · | · | · | · | · | unset/unset | PASS |
| 2 Reject all | after choice | home | · | · | · | · | · | · | · | · | no/no | PASS |
| 2 Reject all | after choice | babuna-red | · | · | · | · | · | · | · | · | no/no | PASS |
| 2 Reject all | after choice | all-wines | · | · | · | · | · | · | · | · | no/no | PASS |
| 2 Reject all | after choice | cookie-policy | · | · | · | · | · | · | · | · | no/no | PASS |
| 3 Accept all | after choice | home | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | babuna-red | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | all-wines | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | cookie-policy | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | home | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | babuna-red | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | all-wines | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | cookie-policy | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after later decline | home | · | · | · | · | · | · | · | · | no/no | PASS |
| 4 Accept, then Decline all | after later decline | babuna-red | · | · | · | · | · | · | · | · | no/no | PASS |
| 4 Accept, then Decline all | after later decline | all-wines | · | · | · | · | · | · | · | · | no/no | PASS |
| 4 Accept, then Decline all | after later decline | cookie-policy | · | · | · | · | · | · | · | · | no/no | PASS |

## Interim: theme copy as it stands, embed still on

This is what happens if the code goes live before the embed is switched off. Klaviyo still loads before consent. A no now clears Klaviyo's cookie and most of its storage.

| Run | Step | Page | Klaviyo | Google | Meta | Pinterest | Lucky Orange | AccessEaze | Tracking cookies | Tracking storage | Consent (mkt/an) | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 No choice | no choice | home | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 1 No choice | no choice | babuna-red | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 1 No choice | no choice | all-wines | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 1 No choice | no choice | cookie-policy | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | unset/unset | **FAIL** |
| 2 Reject all | after choice | home | **4 hosts** | · | · | · | · | · | · | · | no/no | **FAIL** |
| 2 Reject all | after choice | babuna-red | **4 hosts** | · | · | · | · | · | · | · | no/no | **FAIL** |
| 2 Reject all | after choice | all-wines | **4 hosts** | · | · | · | · | · | · | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | no/no | **FAIL** |
| 2 Reject all | after choice | cookie-policy | **4 hosts** | · | · | · | · | · | · | · | no/no | **FAIL** |
| 3 Accept all | after choice | home | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | babuna-red | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | all-wines | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 3 Accept all | after choice | cookie-policy | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | home | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | babuna-red | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | all-wines | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after accept | cookie-policy | **4 hosts** | **1 host** | **1 host** | **1 host** | · | · | __kla_id | ls:klaviyoOnsite, ls:__kla_viewed, ls:__kla_viewed_reviewed_items, ss:klaviyoPagesVisitCountV2 | yes/yes | n/a (consented) |
| 4 Accept, then Decline all | after later decline | home | **4 hosts** | · | · | · | · | · | · | · | no/no | **FAIL** |
| 4 Accept, then Decline all | after later decline | babuna-red | **4 hosts** | · | · | · | · | · | · | · | no/no | **FAIL** |
| 4 Accept, then Decline all | after later decline | all-wines | **4 hosts** | · | · | · | · | · | · | · | no/no | **FAIL** |
| 4 Accept, then Decline all | after later decline | cookie-policy | **4 hosts** | · | · | · | · | · | · | · | no/no | **FAIL** |

## What leaked, and from where

1. **Klaviyo onsite app embed** (`config/settings_data.json`, block `klaviyo-onsite-embed`). It writes klaviyo.js into the page head on every page. It is outside Shopify's pixel sandbox, so the banner does not hold it back.
   - Before any choice and after "Reject all": klaviyo.js and about 25 more scripts load from Klaviyo. It fetches the sign-up forms and fonts. It writes `klaviyoOnsite` (localStorage) and `klaviyoPagesVisitCountV2` (sessionStorage, a list of pages visited).
   - It does hold back `__kla_id` and does not send browse events until a yes. That is Klaviyo's own link to Shopify's consent API, and it is already working. It does not stop the script loading.
   - After "Accept all" and then "Decline all": `__kla_id`, `__kl_key`, `__kla_viewed`, `$referrer` and the rest stay. Shopify clears its own marketing cookies on the no. Klaviyo's stay.
   - This contradicts the live cookie page, section 9: "Until you agree, that system lets none of them set a cookie or send anything from your browser" and "Klaviyo's start only once you agree to both."
2. Nothing else leaked.

## Other checks

- **Google & YouTube, Facebook & Instagram.** Load only after "Accept all": gtag.js for GT-NS8RRB9K and AW-18463933576, and fbevents.js. Nothing before, nothing after a no. No `_ga`, `_gcl`, `_fbp` or `_fbc` cookie showed up in any run. In about 20 seconds after accept I saw no Google Analytics collect hit either. That may be headless Chrome. Julian's phone check settles it.
- **Pinterest.** Live, but only after "Accept all". It loads from a Shopify app pixel in Customer events (the requests are tagged `shopify-web-pixel`). It is not in the theme and has no app embed. Kept on operator instruction, 24 Oct 2026. No Pinterest cookie was set on our domain.
- **Lucky Orange.** Not seen in any run, including after "Accept all". Its theme loader was removed on 18 Oct (commit 37c956c, "Lucky Orange is retired") and there is no embed. If its app pixel is still in Customer events, it is not firing.
- **AccessEaze.** Loads from cdn.shopify.com (a Shopify app extension). No third-party host, no cookie, no storage key. PASS.
- **Shopify Inbox.** Talks only to shop.app and sets `_shop_app_essential`. Shopify essential. PASS.
- **Banner.** Shows after the age gate. Consent reads back correctly as no/no after a reject and yes/yes after an accept.
- **4 Oct report.** Not reproduced. No Google, Meta or Pinterest cookie appeared in any no-choice or reject run.

## Sign-up popup and back-in-stock form

- **Joining Gift popup.** It is the theme's own popup, a Shopify customer form. It is not Klaviyo, so the fix does not touch it. It opens after a banner choice, the same as on live.
- **Back in stock** ("Email me when it lands"). This is a Klaviyo form, so it now waits for a yes. Operator accepted this cost, 24 Oct 2026.
  - On live, before consent: the button shows and the form submits.
  - On the copy, before consent or after a no: the button does not show.
  - On the copy, after "Accept all": the button shows, the form opens, and submitting sends the same requests as live after accept.
  - My test stopped those requests so no real profile was made. So the final save was not proved end to end. One real submit on the preview link will prove it.
- **Footer sign-up.** A Shopify form. It works whatever the banner choice.
