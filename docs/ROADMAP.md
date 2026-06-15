# Roadmap — RoboForge

**Date:** 2026-06-15
**Principle:** ship a believable end-to-end loop early (prompt → motion → parts), then deepen.
Each phase ends with a runnable, demoable artifact.

> Estimates are **rough order-of-magnitude (ASSUMPTION)**, assuming ~1–2 developers. They are
> planning aids, not commitments. No team velocity data exists yet to ground them.

---

## Phase 0 — Spikes / de-risking (before committing the architecture)

Goal: kill the top technical unknowns with throwaway code.

- [ ] **Spike A:** Rapier impulse-joint arm (4–6 DOF) + a fixed-joint grasp attach; confirm
  stability. (Guards against the multibody bug risk — see RISKS R1.)
- [ ] **Spike B:** `urdf-loader` → Three.js → minimal Rapier mapping for one rover URDF.
- [ ] **Spike C:** Claude tool-use returning a valid `RobotRequirementsSpec` from 10 sample
  prompts (schema-conformance check).
- [ ] **Spike D:** Pull live data once from Nexar free tier + Mouser; confirm auth + fields.

**Exit:** all four spikes green, or documented fallback chosen (e.g., in-house FABRIK, Jolt).

## Phase 1 — MVP "describe → move → buy" (the core loop)

The shippable v1. Two archetypes only: **diff-drive rover** and **simple N-DOF arm**.

- [ ] `core/robot-model` with validation + unit tests.
- [ ] `sim/physics-world` + `urdf-bridge` + `sim-loop`; rover drives, arm joints move (ROM).
- [ ] `sim/grasp` MVP: contact → fixed-joint attach/detach.
- [ ] `design/requirements` (LLM extraction) + 2 archetypes + `design/sizing` (motor torque,
  battery capacity, frame size).
- [ ] `parts/` with normalized schema + **curated/mock catalog**; Amazon = manual affiliate
  links; show 3 options per key slot (Amazon + Nexar-sourced + Mouser-sourced entries).
- [ ] `ui/`: prompt box, viewport with playback, design params panel, parts panel.
- [ ] Local save/load. Thin proxy for the LLM key.
- [ ] Tests: unit (pure modules) + 1 E2E happy path. Target 80% on `core`/`design`/`parts`.

**Exit (MVP DoD):** from a typed prompt, a user sees a rover *or* arm move in real time and
gets a parts shortlist, in-browser, no install. Time-to-first-demo ≤ 60 s (target).

## Phase 2 — Credibility + breadth

- [ ] Live parts: Nexar + Mouser adapters behind the existing interface (cache per ToS).
- [ ] LLM tool-use: let the model call sizing functions and explain part choices; surface
  `ambiguities` as clarifying questions.
- [ ] Add 1–2 archetypes (e.g., 4WD rover, omni base, 2-DOF gripper variants).
- [ ] Parts ranking by hard constraints (torque/voltage/form factor), not just keyword.
- [ ] Optional accounts + cloud project save (introduces the first real DB).

## Phase 3 — Depth toward "all robotics"

- [ ] Legged archetype (quadruped) — revisit physics solver (Rapier 2026 solver or Jolt).
- [ ] Parameter sizing via constraint/optimization (Pareto: cost vs payload vs runtime).
- [ ] User URDF import; export URDF/STL.
- [ ] Amazon Creators API once the 10-sale gate is cleared (live buy links).

## Phase 4 — Frontier (research-grade, opt-in/experimental)

- [ ] Friction-based grasp once solver supports it stably.
- [ ] Simulation-in-the-loop design search (RoboMorph/RoboMoRe style).
- [ ] Text-to-CAD geometry output (Zoo/AdamCAD-style) as an export channel.
- [ ] Drone/aerodynamics (no browser solution exists today — research first).

---

## Scope guardrails (anti-creep)

- A new robot type is **not** allowed to change `core/robot-model`'s public shape. If it does,
  stop and redesign the model deliberately.
- No live external API on the critical path until its free-tier terms + caching are verified
  (RISKS R4–R6).
- "All robotics" is a **data-model** promise, not a v1 **feature** promise. Say so in the UI.

## Cross-cutting (always-on)

- Keep [`SUMMARY.md`](SUMMARY.md) current at the end of every work session (project rule).
- Code review after each implementation slice: spaghetti, consistency, security, progress.
