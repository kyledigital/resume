# Portfolio update

The site stays static HTML, CSS and JavaScript for GitHub Pages. The existing colour and typography system is retained.

## Editing projects

Edit `assets/data/projects.json`, then run `python scripts/build_portfolio.py` from the repository root. Commit both the data and generated HTML. The builder updates only the marked project collections in `index.html` and the standalone pages in `work/`.

Run `python scripts/check_portfolio.py` for local links, fragment targets, unique IDs, page headings and content guardrails. Browser verification also covers category filtering and mobile navigation.

## Evidence and assets

The user-supplied brief provides project descriptions, contributions and reporting figures. The eight PNG images under `assets/images/projects/` are actual interface captures from the linked sites, inspected on 8 September 2026. They are snapshots, not live embeds.

- Intelligence Hub: homepage confirms six-market scope, reach, impressions, GA4 campaign sessions, and separated reporting dates. Snapshot; not a live analytics connection.
- Sales Academy: `/training` confirms 11 products, 10 scenarios and 20 questions. Retained the user's conservative internal prototype status despite the source's live/internal wording.
- Quest: discovered the working URL from the operations dashboard's `/prototypes` page. Demo data is not treated as adoption.
- Yaad Vibes: map, categories, search and place suggestions are visible.
- Workload dashboard: 20 workstreams, 19 active items, 4 creative systems, 10 innovation inputs and 7 presentations. Counts describe scope, not productivity.
- Psychology of Jamaicans: 28 chapters, four parts, commerce links, Pulse and contribution interface are visible. No sales or usage claims.
- PhotoLab: visible simulator, motion, depth, lenses and missions. The upcoming AI coach is excluded from completed features.
- Marketing Practice Lab: visible study notes, practice selection, sprints and rehearsal. No claim of official DMI exam content or improved pass rates.

Creative-system source pages have asset-evidence placeholders. No substitute campaign artwork was invented. Creative Systems, Content Engine and Audi use text-led cards until approved frames or execution images are supplied. Content Engine includes an HTML process diagram.

Six original campaign records remain in Marketing, with their original metrics preserved on detail pages. Their reporting periods were not supplied; no dates or extra results were invented.

Personal retrospective statements were not provided. Detail pages use `Learning / Next question` instead of fabricated first-person lessons. Add a `learning` value to a project to replace that section with `What I Learned` once supplied.

The downloadable resume PDF has not been edited as part of this website update.
