# F2 — Parts Suggestion (Amazon + 2 options)

**Date:** 2026-06-15
**Basis:** [`../research/02-parts-sourcing.md`](../research/02-parts-sourcing.md)
**The 3 sources:** **Amazon** (consumer finished goods) + **Nexar/Octopart** (electronics
aggregator) + **Mouser** (distributor, simple auth).

---

## 1. Behavior

After a design is generated, for each key component slot (drive motor, battery, microcontroller,
wheels, sensor, gripper servo, …) the user sees a **ranked shortlist of buyable parts**, each
with: name, image, price (if known), availability, specs that matter for the slot, and a
**buy link**. Each slot shows **up to 3 options across the 3 sources** so the user can compare.

## 2. Source strategy (and why)

| Source | Role | Access reality (2026-06-15) |
|--------|------|------------------------------|
| **Amazon** | familiar finished goods (kits, battery packs, wheels) | PA-API 5.0 **deprecated 2026-04-30** → **Creators API** (OAuth2). New accounts blocked by **10 sales / 30 days** gate → **MVP = manual curated ASINs + affiliate links**. ([src](https://dev.to/th3nate/amazon-pa-api-v5-is-shutting-down-april-30-2026-here-is-what-changes-at-the-auth-layer-22ek)) |
| **Nexar (Octopart)** | electronics across 40+ distributors | GraphQL + OAuth2; **free 1,000 matched parts/mo**. ([src](https://nexar.com/api)) |
| **Mouser** | single-distributor fallback | Free API key; **30 req/min, 1,000 req/day**; robotics catalog. ([src](https://www.mouser.com/api-hub/)) |

> **Mechanical-parts gap (`UNVERIFIED`):** none of the three covers frames/extrusion/brackets/
> gearboxes well → v1 labels mechanical parts **"manual entry."** (RISKS R10)

## 3. Normalized `Part` schema (source-agnostic)

Everything is stored against one schema; adapters translate each source into it.

```
Part {
  id            // internal UUID
  name
  sku
  source        // AMAZON | NEXAR | MOUSER | MANUAL
  sourceId      // ASIN / MPN / Mouser part#
  category      // MOTOR | SERVO | MICROCONTROLLER | SENSOR | BATTERY | WHEEL | BRACKET | CABLE | OTHER
  priceUsd?     // null if unknown/stale
  priceFetchedAt?   // for ToS cache windows
  currency
  availability  // IN_STOCK | LOW_STOCK | OUT_OF_STOCK | UNKNOWN
  imageUrl?
  productUrl    // affiliate URL for Amazon; direct for others
  affiliateTag? // Amazon partner tag if applicable
  description
  specs         // free-form key/value: voltage, torque, rpm, dimensions, ...
  createdAt, updatedAt
}
```

## 4. Architecture (adapters behind one interface)

```
design slot (e.g., "drive motor, need ~0.4 Nm @ 12V")
        │
        ▼
parts/ranker ── queries ──► CatalogPort (interface)
                               ├── MockCatalogAdapter   (v1: curated JSON)
                               ├── NexarAdapter         (Phase 2: GraphQL)
                               ├── MouserAdapter         (Phase 2: REST)
                               └── AmazonAdapter          (Phase 3: Creators API; manual links in v1)
        ▼
ranker: filter by hard constraints (voltage/torque/form factor) → score → dedupe → top-3
        ▼
UI parts panel (3 options per slot, grouped by source)
```

- **Ranking (MVP):** category + keyword + hard-constraint filter (e.g., torque ≥ required,
  voltage compatible). Semantic/RAG ranking is Phase 2.
- **Secrets:** all live API creds live in the **server proxy**, never the browser. (R5)

## 5. MVP vs deferred

| | MVP (Phase 1) | Deferred (Phase 2–3) |
|---|---|---|
| Catalog | curated/mock JSON (200–500 entries seeded from public pages, manual) | live Nexar + Mouser; live Amazon Creators API |
| Amazon | manual ASIN + affiliate link | Creators API (after 10-sale gate) |
| Ranking | keyword + hard constraints | constraint re-rank, RAG, LLM explanation |
| Caching | n/a (static) | per-ToS: Amazon price ≤1h/data ≤24h; Nexar/Mouser per terms |

## 6. Legal / ToS guardrails (hard rules)

1. **No scraping.** Official APIs or manual entry only. No HTML-scraping module ships. (R5)
2. **Amazon:** unmodified partner tag; price cache ≤ 1 h, other data ≤ 24 h. ([src](https://webservices.amazon.com/paapi5/documentation/best-programming-practices.html))
3. **Affiliate disclosure** shown in UI where required.
4. Verify Nexar commercial free-tier + cache, Mouser approval/limits before live use. (R6)

## 7. Acceptance criteria (MVP)

- [ ] For a generated rover and arm, each key slot shows ≥1 (target 3) parts with name, price-or-
  "price unknown", and a working buy link.
- [ ] At least one Amazon manual affiliate link and one electronics-distributor-sourced entry
  appear in the shortlist.
- [ ] Adding a new source = implementing one `CatalogPort` adapter, no ranker/UI change.
- [ ] No secret is present in client bundle (verified).

## 8. Open questions

- Nexar free-tier commercial-use + cache duration (`UNVERIFIED`, R6).
- Mouser approval turnaround + official limits (`UNVERIFIED`, R6).
- Best curated source for mechanical parts (no clean API) — Pololu/RobotShop manual? (R10)
- Affiliate revenue model vs pure utility (affects Amazon access strategy).
