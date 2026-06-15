# Research 02 — Parts Sourcing (Amazon + 2 options)

> **Provenance:** parallel research subagent (Sonnet), 2026-06-15. Real-world API terms change;
> all `UNVERIFIED` items must be confirmed against official docs before they go live. Evidence
> base for `FEATURES/F2`.

## Verdict — the 3 sources
1. **Amazon Creators API** (replaces PA-API 5.0) — consumer-familiar finished goods. Caveats:
   10-sale gate; PA-API 5.0 deprecated 2026-04-30, endpoint dark 2026-05-15.
2. **Nexar API (Octopart data, GraphQL)** — best multi-distributor electronics catalog; free
   1,000 matched parts/month.
3. **Mouser Search API** — 8M+ SKUs, robotics pages, free API key, simple auth.

## Amazon PA-API 5.0 / Creators API
- **Status:** PA-API 5.0 deprecated 2026-04-30; dark 2026-05-15. Replacement = **Creators API**
  (OAuth2 client id/secret from Associates Central). Target Creators API for new work.
  ([src](https://dev.to/th3nate/amazon-pa-api-v5-is-shutting-down-april-30-2026-here-is-what-changes-at-the-auth-layer-22ek), [migration](https://blog.freshstore.com/amazon-creators-api-pa-api-retirement/))
- **Access barriers:** Associates account; **10 qualifying sales in prior 30 days** to get/keep
  API access (the chicken-and-egg blocker); access revoked after 30 days of zero sales.
  ([src](https://www.keywordrush.com/blog/amazon-pa-api-associatenoteligible-error-is-there-a-new-10-sales-rule/))
- **Rate (PA-API 5.0; Creators limits UNVERIFIED):** 1 TPS / 8,640 req/day baseline, scales with
  revenue, 429 on exceed. ([src](https://webservices.amazon.com/paapi5/documentation/troubleshooting/api-rates.html))
- **Data:** ASIN, title, brand, current price (no history), images, star rating, availability,
  affiliate deep links.
- **ToS:** cache price ≤ 1 h, other product data ≤ 24 h; partner tag unmodified; no scraping;
  must drive sales to Amazon. ([src](https://webservices.amazon.com/paapi5/documentation/best-programming-practices.html))
- **MVP realism:** high friction → use manually curated ASINs + affiliate links for v1.

## Alternative 1 — Nexar API (Octopart)
- GraphQL; OAuth2; self-serve at portal.nexar.com. Free **1,000 matched parts/mo** (100-part
  playground lifetime). Paid tiers exist; **pricing UNVERIFIED**.
- Catalog: aggregates 40+ authorized distributors (Digi-Key, Mouser, Arrow, Farnell, RS).
  Strong on electronic components; **weak on mechanical assemblies**.
- Data: price breaks, availability, images, descriptions, lead time, distributor, MPN. Datasheets/
  specs only on Pro/Enterprise.
- Caching ToS / commercial free-tier use: **UNVERIFIED** ([nexar.com/api/legal](https://nexar.com/api/legal)).
- Sources: [Nexar API](https://nexar.com/api), [compare-plans](https://nexar.com/compare-plans), [Octopart→Nexar](https://octopart.com/pulse/p/the-octopart-api-is-now-the-nexar-legacy-api)

## Alternative 2 — Mouser Search API
- Free API key (application review step; turnaround **UNVERIFIED**); API-key auth (no OAuth).
- Limits (community-sourced, **UNVERIFIED** vs official): **30 req/min, 1,000 req/day**, 50
  results/search.
- Catalog: 8M+ products, explicit robotics application pages (motors, drivers, MCUs, sensors,
  encoders, battery mgmt). Mechanical/structural parts absent.
- Data: part#, manufacturer, description, stock, price breaks, datasheet URL, product URL, images.
- Sources: [API Hub](https://www.mouser.com/api-hub/), [terms](https://www.mouser.com/apiterms/), [robotics](https://www.mouser.com/applications/motor-control-options-robotics/)

## Recommended MVP Approach
- **Mock-first** against an internal normalized `Part` schema (200–500 curated entries from
  public pages — manual entry, not scraping). Amazon = manual affiliate deep links.
- **Phase 1:** live Nexar (free tier). **Phase 2:** live Amazon Creators API after 10-sale gate.
  **Phase 3:** Mouser enrichment.
- **Legal:** official APIs or manual entry only; scraping violates ToS (bans + liability).
  ([scraping note](https://scrapfly.io/blog/posts/how-to-scrape-mouser))
- `Part` schema: id, name, sku, source, sourceId, category, priceUsd, priceFetchedAt, currency,
  availability, imageUrl, productUrl, affiliateTag, description, specs, timestamps.

## Open Uncertainties
1. Creators API exact data fields — **UNVERIFIED** ([docs](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction)).
2. Creators API rate limits — **UNVERIFIED** (PA-API figures may not carry over).
3. Nexar paid pricing — not public.
4. Nexar caching ToS — **UNVERIFIED**.
5. Mouser approval turnaround — **UNVERIFIED**.
6. Mouser official rate limits — **UNVERIFIED** (community figures only).
7. **Mechanical-parts gap:** none of the three covers frames/extrusion/brackets/gearboxes;
   McMaster-Carr (no public API), Pololu (private API by request), RobotShop (no documented API).
   v1 → "mechanical parts: manual entry."
8. Nexar free-tier commercial use — **UNVERIFIED**.

> Additional references: [Digi-Key API](https://developer.digikey.com/), [Pololu API](https://github.com/pololu/pololu-api/blob/master/product.md), [PA-API 2026 overview](https://dev.to/agenthustler/amazon-product-api-pa-api-in-2026-restrictions-alternatives-and-web-scraping-4l35)
