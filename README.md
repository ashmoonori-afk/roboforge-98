# RoboForge (working title)

> Browser-native 3D robot engineering studio for makers: describe a robot in plain
> language, watch it move under real-time physics, and get a clickable, buyable parts list.

**Status:** Planning / pre-implementation (docs only)
**Date started:** 2026-06-15
**Primary author of plan:** Claude (Opus 4.8) under `/oable`

> The name "RoboForge" is a working title only. Alternatives to consider: *MechaForge,
> Forge3D, BotSmith, RoboBench, Tinker3D*. Pick before first public commit.

---

## What this is

A web application where a hobbyist/maker can:

1. **Describe** a robot goal in natural language ("a small 4-wheel rover that carries a
   2 kg payload across a room and picks up a can").
2. **Get an auto-recommended design** — structure, key parameters, and a parts shortlist.
3. **See it move in real time** — locomotion, joint range-of-motion (ROM), and grasp,
   simulated in the browser.
4. **Buy the parts** — ranked suggestions from Amazon plus two alternative sources.

The internal data model is **general** (any link/joint kinematic structure), but the **MVP
ships a deliberately limited robot library** to stay shippable. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Three flagship features

| # | Feature | Spec |
|---|---------|------|
| F1 | Real-time mobility demo (locomotion + ROM + grasp) | [`docs/FEATURES/F1-realtime-mobility-demo.md`](docs/FEATURES/F1-realtime-mobility-demo.md) |
| F2 | Parts suggestion (Amazon + 2 options) | [`docs/FEATURES/F2-parts-suggestion.md`](docs/FEATURES/F2-parts-suggestion.md) |
| F3 | Natural-language auto-design recommendation | [`docs/FEATURES/F3-nl-auto-design.md`](docs/FEATURES/F3-nl-auto-design.md) |

## Document map

| Doc | Purpose |
|-----|---------|
| [`docs/PRD.md`](docs/PRD.md) | Product requirements: users, problem, offer, scope, MVP, metrics |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture + universal robot data model + data flow |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Technology choices with rationale and citations |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phased plan, milestones, scope guardrails |
| [`docs/RISKS.md`](docs/RISKS.md) | Risk register (technical, legal/ToS, scope) |
| [`docs/SUMMARY.md`](docs/SUMMARY.md) | One-page rolling summary (kept current) |
| [`docs/research/`](docs/research/) | Cited research notes that back the decisions above |

## Decisions locked (2026-06-15)

- **Platform:** Web app (no install).
- **Robot scope:** All robot types in the data model; MVP ships a representative subset.
- **"Mobility" definition:** full motion expression = locomotion + joint ROM + grasp.
- **Target user:** makers / hobbyists.
- **v1 ambition:** working MVP; Amazon + AI integrations may be simplified/mocked.

## How to read the plan

Start with `PRD.md` (what & why) → `ARCHITECTURE.md` (how it fits together) →
`TECH_STACK.md` (what we build with) → the three `FEATURES/*` specs (the hard parts) →
`ROADMAP.md` (in what order) → `RISKS.md` (what could go wrong).

> Convention: claims that are not yet verified are tagged **`UNVERIFIED`** or **`ASSUMPTION`**
> inline, per project rules. Numbers carry a source or a calculation basis.

## Export & handoff

Any generated design exports to **.glb / .stl** (3D), **BOM.csv** (buyable parts), and
**design.json** (spec + scene) — RoboForge is the fast concept front-end that hands off to real
CAD / print / cart. **Fast/Quality** generation modes and shareable `?p=` links are built in.

## Strategy

Positioning, ICP, business model and the risk-hedge design are in
[`docs/STRATEGY.md`](docs/STRATEGY.md).

## License

Released under the [MIT License](LICENSE). © 2026 ashmoonori-afk.
