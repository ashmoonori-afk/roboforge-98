# F3 — Natural-Language Auto-Design Recommendation

**Date:** 2026-06-15
**Basis:** [`../research/03-nl-to-design.md`](../research/03-nl-to-design.md)
**Goal:** turn a plain-language goal into a recommended robot design (structure + parameters +
parts shortlist).

---

## 1. Behavior

User types a goal, e.g.:
> "a small 4-wheel robot that can carry 2 kg across a room and pick up a soda can"

System returns:
- a **chosen archetype** + topology (links/joints),
- **sized parameters** (motor torque, battery capacity, frame size, wheel dia, arm reach),
- a **parts shortlist** (via F2),
- a **runnable robot** (via F1),
- any **ambiguities** as clarifying chips ("payload not stated — assumed 2 kg from text").

## 2. MVP pipeline (3 deterministic stages after extraction)

```
[NL prompt]
   ▼  (1) LLM requirement extraction  — Claude tool-use, STRICT JSON schema
RobotRequirementsSpec
   ▼  (2) Archetype matching          — rule-based scoring over 5–10 templates
chosen archetype + parameter template
   ▼  (3) Parameter sizing            — closed-form engineering formulas
filled Robot graph + parameter table
   ├──► F2 parts shortlist (per slot)
   └──► F1 simulation
```

Only **stage 1 is the LLM**. Stages 2–3 are deterministic code → repeatable, auditable
outputs (a design tool must be reviewable). Growth path adds LLM tool-use later (§6).

> **Dev-mode status (2026-06-15):** stage 1 is now wired to the **local `claude` CLI** (routed
> to **Opus**) through a Vite dev plugin at `POST /api/nl-design` (`app/vite.config.ts` +
> `app/src/core/nlClient.ts`). This gives real NL understanding during development with no paid
> API key. When the endpoint is unavailable (production/static build), the client **falls back**
> to the rule-based parser (`core/nl.ts`). Each call spawns the CLI (~15–25 s incl. wrapper
> overhead) and is billed to the local Claude session — Opus keeps it cheap. Evidence:
> `../screenshots/roboforge-nl-cli.png`.
>
> **Perf + scope (2026-06-15):** the spawn now uses `--model opus --strict-mcp-config
> --setting-sources project` → **~7–12 s** (was ~30 s; MCP + global settings/skills/hooks were
> the overhead). The spec gained **`armCount`** + a **`stationary`** locomotion type, and a new
> **multi-arm stationary** archetype (e.g. Da Vinci-style surgical) with a dedicated white
> medical 3D model (`ui/models/SurgicalModel.tsx`). Stationary/arm designs report drive-torque
> N/A in sizing. Evidence: `../screenshots/roboforge-surgical.png`.
>
> **Generative 3D (2026-06-15) — automatic text-to-3D within this env.** The CLI now returns
> `{spec, scene}` where `scene` is a **primitive scene graph** (nodes of box/cylinder/sphere/
> cone/torus/gear/group with pos/rot/color/material + `spin`/`swing` animation + `children`).
> `core/scene.ts` validates & clamps it (node cap, shape allow-list); `ui/SceneRenderer.tsx`
> renders it generically. So **arbitrary prompts are auto-modeled** into a bespoke 3D assembly
> (the LLM is the text-to-3D engine), instead of being forced into a fixed archetype — the
> 4 archetypes are now just the offline/fallback when the CLI is unavailable. It is
> primitive-based (recognizable, not photoreal) and costs ~25–50 s/generation (spec+scene is a
> large output). Evidence: `../screenshots/roboforge-generative.png` (LLM-authored 17-node
> clockwork automaton).

## 3. `RobotRequirementsSpec` (extraction target)

Strict JSON schema; optional fields default to **`null`** (never hallucinated). Key fields
(full schema in research/03):

- `task_summary` (verbatim one-sentence goal),
- `locomotion_type` (enum incl. `unknown`), `wheel_count?`,
- `payload_kg?`, `total_mass_budget_kg?`,
- `manipulation` { required, dof?, grasp_type?, object_description?, object_mass_kg? },
- `environment` { indoor_outdoor, surface_type?, terrain_slope_deg?, operating_range_m? },
- `size_constraints` { max_*_mm?, size_class? },
- `sensors_required[]`, `autonomy_level?`, `budget_usd?`, `power_source?`, `mission_duration_min?`,
- `open_constraints[]`, **`ambiguities[]`** (phrases needing clarification).

Enforced via Claude **tool-use with this schema** (decode-time conformance), not post-hoc
parsing. ([src](https://openai.com/index/introducing-structured-outputs-in-the-api/) — equivalent OpenAI feature)

## 4. Archetype library (the matchable templates)

Each archetype = topology + parameter slots + constraint ranges + a scoring rule.
MVP ships **2** (rover, arm); design the library to grow to 5–10.

```
Archetype {
  id, name                         // "diff_drive_rover", "n_dof_arm"
  topology: Robot template          // links/joints with parameter placeholders
  slots: ParamSlot[]                // {name, unit, formula-or-source, bounds}
  match(spec) -> score              // rule-based: locomotion, manipulation, payload, env
  partSlots: PartSlotSpec[]          // maps to F2 (motor, battery, MCU, wheel, servo...)
}
```
Precedent that archetype+parametric works for real robots: Metabot (parametric quadruped),
OPPAS (parametric snake). (research/03)

## 5. Parameter sizing (closed-form, with sources)

Deterministic formulas with explicit **safety factors (1.5–2×)** (RISKS R9):

- **Drive motor torque:** `τ = (m_total · g · μ_r · r_wheel) / η_drivetrain`, then ×SF.
  (`m_total` = robot + payload; `μ_r` ≈ 0.015–0.05 flat hard floor; `η` ≈ 0.7–0.85)
  ([src](https://wiki.dfrobot.com/How_to_Calculate_the_Motor_Torque_for_a_Mobile_Robot),
  [src](https://thinkrobotics.com/blogs/learn/basics-of-motor-sizing-and-selection-for-robots-a-complete-engineering-guide))
- **Battery capacity:** `C_mAh = (P_drive_W · t_min · 60 / V_nominal) · 1000 · SF`.
- **Arm reach / workspace:** from archetype geometry + segment lengths.
- Parameters exceeding archetype bounds → flagged as warnings, not silently clamped.

## 6. Capability ladder (MVP → advanced)

| Level | Approach | Phase |
|-------|----------|-------|
| L1 | archetype + rule-based sizing | **MVP** |
| L2 | LLM tool/function-calling into sizing + catalog functions | Phase 2 |
| L3 | RAG over a parts/module catalog for selection | Phase 2 |
| L4 | constraint solving / multi-objective optimization | Phase 3 |
| L5 | LLM morphology co-design w/ sim feedback (RoboMorph/RoboMoRe) | Phase 4 (research) |
| L6 | text-to-CAD geometry output (Zoo/AdamCAD) | Phase 4 (research) |

Prior art (real, cited): Lang2Morph, RobotDesignGPT, RoboMorph, RoboMoRe, TOOLCAD, Zoo
Text-to-CAD. See research/03.

## 7. Acceptance criteria (MVP)

- [ ] 10 sample prompts each yield a schema-valid `RobotRequirementsSpec` (fixture test).
- [ ] Unspecified fields are `null`; at least one `ambiguity` is surfaced when input is vague.
- [ ] A rover prompt and an arm prompt each produce a matched archetype, sized parameters, a
  parts shortlist, and a runnable robot.
- [ ] Sizing formulas are unit-tested against hand-computed values (deterministic).

## 8. Open questions / risks

- Out-of-distribution goals (e.g., "climbs glass") need an explicit **low-confidence / no-match**
  path. (R8 adjacency)
- Hallucination boundary on implicit constraints. → `null` defaults + `ambiguities` (R12).
- LLM cost per design at volume (R11).
- How accurate must sizing be for v1 credibility? (PRD Open Question 5 / R9)
