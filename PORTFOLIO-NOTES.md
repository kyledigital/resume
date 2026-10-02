# Portfolio maintenance

The site remains static HTML, CSS and JavaScript for GitHub Pages. The slate/cyan visual system, portrait, navigation, independent projects and existing project URLs are preserved.

## Content update: 1 October 2026

- Added authentic Refill Hope Instagram previews, direct post links and carefully scoped historical reporting; see `REFILL-HOPE-SOURCES.md`
- Enersave is an independent freelance client: separate experience entry, independent collection and marketing/independent filters
- Marketing-led headline and featured work: content strategy, paid media, reporting and practical AI-assisted delivery
- Added VW Plus, Asher’s Fleet and The New Best Decorators, with actual homepage screenshots captured on 1 October
- Refreshed the Yello Marketing Intelligence Hub and Sales Academy / Ask Yello entries and screenshots
- Replaced inherited revenue, ROAS, percentage and audience-growth claims lacking adequate reporting context with the specific contributions and delivered work
- Confirmed DMI title and issue date; current Yello role starts May 2026
- Grouped earlier Yello roles without uncertain intermediate dates or any continuous-tenure claim
- Added AI-LIGNED facilitation, without including a future Pitch-a-thon proposal as delivered work
- Replaced the downloadable PDF with the corrected two-page generic résumé

## Editing and verification

Edit `assets/data/projects.json`, then run:

```sh
python3 scripts/build_portfolio.py
python3 scripts/check_portfolio.py
node scripts/check_filters.mjs
python3 scripts/test_campaign_media.py
node --check assets/js/main.js
node --check assets/js/portfolio.js
```

Commit both data and generated HTML. The builder updates only the marked project collections in `index.html` and the standalone pages in `work/`. The checks cover local links, fragment targets, unique IDs, headings, project inventory, stale-claim guardrails and filtering logic. DOM-contract tests are not browser or accessibility tests.

Preview locally with `python3 -m http.server 8765`, then open `http://localhost:8765`.

Before publishing, verify desktop and mobile layouts, all category buttons, direct category URLs, Back/Forward, repeated filtering, mobile menu opening and closing, experience/About disclosures, project-page navigation and the PDF download. Check at 360, 390, 768 and 1440 pixels, keyboard-only navigation, horizontal overflow and browser console errors.

## Project scope and public evidence

- https://yello-media-stakeholder-report.vercel.app/ — published reporting snapshots; latest Meta through 13 September and FindYello usage through 9 September 2026. Separate data periods remain visible
- https://yello-media-stakeholder-report.vercel.app/training — sales-enablement prototype with device-local progress. No production AI backend or organisation-wide adoption claim
- https://vwplus-website.vercel.app/ — public enquiry, vehicle selection, services, troubleshooting and workshop case pages. A separate sample customer dashboard is a prototype
- https://ashers-fleet.vercel.app/ — fleet information and customer-reviewed WhatsApp enquiries. No checkout or automatic booking confirmation
- https://newbestdecorators.kahnec.com/ — services, inspiration gallery and structured estimate enquiries. No client acceptance, payment, enquiries or revenue claimed
- https://certs.digitalmarketinginstitute.com/7b29222d-3b2e-4398-9184-5ac1baf4b336 — Certified Digital Marketing Professional, issued 14 September 2026

All new interface images are real site captures, not substitute artwork. Earlier campaign projects remain available under their original URLs. Existing independent products and concepts retain their status distinctions.
