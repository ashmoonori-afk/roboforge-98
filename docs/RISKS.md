# Risk Register — RoboForge

**Date:** 2026-06-15
Severity = impact × likelihood (qualitative). Each risk has a mitigation and, where relevant,
a rollback/fallback. IDs are referenced from other docs.

---

## Technical

### R1 — Rapier multibody bugs (HIGH)
- **Risk:** Dimforge acknowledged (Jan 2026) several outstanding bugs in the multibody (reduced
  -coordinate) joint implementation. ([src](https://dimforge.com/blog/2026/01/09/the-year-2025-in-dimforge/))
- **Impact:** unstable/incorrect motion for articulated robots — directly hits F1.
- **Mitigation:** use **ImpulseJoint** (penalty-based) for MVP; cap chains at ~4–8 links;
  Spike A validates before commit.
- **Fallback:** migrate physics to **Jolt-web** (more constraints, AAA-tested); abstract the
  physics layer behind `sim/physics-world` so the engine is swappable.

### R2 — Friction-based grasp instability (MEDIUM)
- **Risk:** multi-contact grasp via friction is unbenchmarked in Rapier's current solver
  (`UNVERIFIED`).
- **Impact:** grasp demo looks broken (objects jitter/slip).
- **Mitigation:** MVP grasp = **fixed-joint attach on contact** (telekinetic but stable);
  label it as a simplification. Defer physical grasp to Phase 4 / new solver.

### R3 — IK library staleness (LOW–MEDIUM)
- **Risk:** FIK (`lo-th/fullik`) maintenance status `UNVERIFIED`.
- **Impact:** arm reach/ROM helper unreliable.
- **Mitigation:** FABRIK is ~200 lines of TS; **fallback = implement in-house**. Low effort,
  fully owned.

### R7 — URDF→Rapier mapper is bespoke (MEDIUM)
- **Risk:** no maintained library maps URDF joints to Rapier; must build/maintain ~300–500 LOC.
- **Impact:** source of subtle motion bugs (axis/limit/origin mismatches).
- **Mitigation:** golden-trajectory tests per joint type; start with the two MVP archetypes only.

## Legal / ToS (parts feature)

### R4 — Amazon access gate (HIGH for "live Amazon")
- **Risk:** PA-API 5.0 deprecated 2026-04-30; **Creators API** requires an Associates account
  with **10 qualifying sales / 30 days** — a new product cannot get live credentials.
  ([src](https://www.keywordrush.com/blog/amazon-pa-api-associatenoteligible-error-is-there-a-new-10-sales-rule/))
- **Impact:** "Amazon suggestions" can't be live at launch.
- **Mitigation:** MVP uses **manual curated ASINs + affiliate deep links** (ToS-compliant
  manual linking); go live on Creators API after the gate clears (Phase 3).
- **Constraint:** price cache ≤ 1 h, other data ≤ 24 h, partner tag unmodified.
  ([src](https://webservices.amazon.com/paapi5/documentation/best-programming-practices.html))

### R5 — Scraping temptation (HIGH if ignored)
- **Risk:** scraping Amazon/Mouser/Digi-Key violates ToS → IP/account bans, civil liability.
- **Mitigation:** **official APIs or manual entry only.** Encode this as a hard rule in the
  parts adapters; no HTML scraping module exists in the codebase.

### R6 — Alternative-source terms unverified (MEDIUM)
- **Risk:** Nexar free-tier commercial-use terms + cache duration `UNVERIFIED`; Mouser approval
  turnaround + official rate limits `UNVERIFIED`.
- **Mitigation:** Spike D + legal read of [nexar.com/api/legal] and Mouser API terms before
  these become load-bearing.

### R10 — Mechanical-parts coverage gap (MEDIUM)
- **Risk:** Amazon/Nexar/Mouser all weak on frames/extrusion/brackets/gearboxes (`UNVERIFIED`).
- **Impact:** BOM incomplete for the mechanical half of a robot.
- **Mitigation:** v1 marks mechanical parts **"manual entry"**; evaluate Pololu/RobotShop
  (no clean public API) as curated sources later.

## Product / scope

### R8 — Scope explosion from "all robotics" (HIGH)
- **Risk:** trying to ship many robot types in v1.
- **Mitigation:** **2 archetypes only** in MVP; "all robotics" is a data-model promise (see
  ARCHITECTURE §1, ROADMAP guardrails). Enforced in review.

### R9 — Design credibility (MEDIUM)
- **Risk:** recommended sizing is wrong enough to mislead a maker.
- **Impact:** trust loss; potential wasted purchases.
- **Mitigation:** closed-form formulas with **explicit safety factors (1.5–2×)**
  ([src](https://thinkrobotics.com/blogs/learn/basics-of-motor-sizing-and-selection-for-robots-a-complete-engineering-guide));
  show assumptions; label outputs as **design sketches, not validated engineering**; set an
  accuracy bar in usability testing (PRD Open Question 5).

### R11 — LLM unit cost (MEDIUM)
- **Risk:** per-design LLM cost erodes margins at scale.
- **Mitigation:** schema-constrained single call (no agentic loops) in MVP; cache identical
  prompts; model the unit economics (PRD Open Question 3).

### R12 — LLM hallucinated requirements (MEDIUM)
- **Risk:** model invents `payload_kg`/constraints the user never gave.
- **Mitigation:** optional fields default to `null` (never guessed); populate an `ambiguities`
  list and surface as clarifying questions before sizing. (FEATURES/F3)

---

## Top-3 to retire first (do in Phase 0)
1. **R1** Rapier multibody → Spike A.
2. **R4/R5** Amazon/legal parts path → confirm mock-first design + manual linking.
3. **R12/R9** trust of NL→design output → schema + safety factors + "sketch" labeling.
