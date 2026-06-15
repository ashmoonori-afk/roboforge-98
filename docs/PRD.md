# PRD — RoboForge (working title)

**Version:** 0.1 (planning)
**Date:** 2026-06-15
**Owner:** TBD

---

## 1. Objective

Let a maker go from *an idea expressed in plain language* to *a simulated, buildable robot
with a parts list* — entirely in the browser, with no robotics expertise or local install
required.

## 2. Problem

Makers who want to build a robot today must stitch together 4+ disconnected tools and a lot
of tacit knowledge:

- 3D/mechanical design (Tinkercad, Fusion 360) — no robot motion simulation.
- Electronics/firmware (Wokwi, Fritzing) — no mechanical body or motion.
- Engineering-grade simulation (Gazebo, Webots, Isaac Sim, MuJoCo) — desktop install,
  ROS/URDF expertise, sometimes expensive GPUs.
- Parts sourcing (RobotShop, Amazon, distributors) — disconnected from the design.

No single tool combines **NL → robot design → real-time full-motion simulation →
buyable parts**, in-browser, for makers. This gap is documented in
[`research/04-competitive-landscape.md`](research/04-competitive-landscape.md).

## 3. Target customer (personas)

> Personas below are **ASSUMPTIONS** for planning. Validate with 5–8 real maker interviews
> before committing build effort (see Open Questions).

- **P1 — "Weekend maker" (primary).** Owns a 3D printer or has access to one, comfortable
  with Arduino/Raspberry Pi at a basic level, builds rovers/arms for fun or learning. Pain:
  doesn't know how to size motors/batteries or which parts to buy; existing sim tools are
  too heavy.
- **P2 — "STEM educator / student."** Wants to demonstrate robot motion concepts and produce
  a parts list for a class budget. Pain: install/setup friction in labs; needs something that
  runs on a Chromebook.
- **P3 — "Early-stage tinkerer-founder."** Prototyping a robot product idea, wants a fast
  feasibility sketch + BOM before committing to CAD. Pain: time from idea to credible spec.

## 4. Offer (value proposition)

"Describe it, watch it move, build it." A zero-install web studio that turns a sentence into
a moving 3D robot and a shopping list.

## 5. Proof (evidence the approach is feasible)

- Browser physics is now viable: Rapier (WASM) supports articulated bodies, joints, and
  motors; `urdf-loader` loads standard robot descriptions into Three.js. See
  [`research/01-web-3d-sim-stack.md`](research/01-web-3d-sim-stack.md).
- NL → structured design is established practice: LLM structured-output extraction +
  archetype templates + closed-form engineering sizing. Multiple peer-reviewed precedents
  (Lang2Morph, RoboMorph, RoboMoRe, RobotDesignGPT). See
  [`research/03-nl-to-design.md`](research/03-nl-to-design.md).
- Real parts data is reachable via free developer tiers (Nexar/Octopart, Mouser). See
  [`research/02-parts-sourcing.md`](research/02-parts-sourcing.md).

## 6. Scope

### 6.1 In scope (product vision)

- General robot data model (any link/joint structure).
- Real-time simulation of locomotion, joint ROM, and grasp.
- NL-driven design recommendation.
- Parts suggestion from Amazon + 2 alternative sources.

### 6.2 MVP scope (v1 — what actually ships first)

| Area | MVP | Deferred |
|------|-----|----------|
| Robot types | 2 archetypes: **(a) wheeled rover (diff-drive)**, **(b) simple N-DOF arm** | legged, humanoid, drone, tracked, omni |
| Motion | locomotion (rover) + joint ROM (arm) + **grasp via fixed-joint attachment** | friction-based grasp, gait/balance control, aerodynamics |
| NL → design | LLM requirement extraction → archetype match → rule-based parameter sizing | constraint optimization, generative morphology, text-to-CAD |
| Parts | normalized Part schema + **curated/mock catalog**; Amazon = manual affiliate links | live Amazon Creators API, live Nexar/Mouser at scale |
| Robot import | `urdf-loader` for built-in archetypes | arbitrary user URDF upload |
| Persistence | local (browser) save/load | accounts, cloud projects, sharing |

### 6.3 Non-goals (v1)

- Not a replacement for engineering-grade simulators (Gazebo/Isaac/MuJoCo).
- Not a full CAD authoring tool (no B-Rep modeling in v1).
- Not a marketplace; we recommend parts, we do not sell or hold inventory.
- No guarantee of physical buildability/safety — outputs are **design sketches**, clearly
  labeled.

## 7. Go-to-market (early)

- **Channel (ASSUMPTION, to validate):** maker communities (Reddit r/robotics, Hackaday,
  RobotShop community), education channels, and "build along" YouTube/short-form.
- **CTA:** "Describe your robot →" single prompt box on the landing page; output is a moving
  demo + parts list, gated only at "save/export."

## 8. Success metrics (proposed targets — to validate, not benchmarks)

> These are **hypotheses**, not measured facts. Replace with real baselines after a usability
> round.

- **Activation:** % of new users who reach a running mobility demo from a prompt within one
  session. Proposed target: ≥ 50%.
- **Design-to-parts:** % of generated designs that produce a parts shortlist the user opens.
  Proposed target: ≥ 40%.
- **Time-to-first-demo:** median seconds from prompt submit to first simulated motion.
  Proposed target: ≤ 60 s.
- **Qualitative:** ≥ 8/10 maker testers say the recommended design is "a reasonable starting
  point."

## 9. Open questions (must resolve before/around build)

1. Persona validation — are P1–P3 real and rankable? (interviews)
2. Which 2 starter archetypes maximize "wow" with least build cost? (current assumption:
   rover + arm)
3. Is LLM cost per design acceptable at target activation volume? (model the unit economics)
4. Legal review of affiliate/ToS approach for parts links before any public launch.
5. Accuracy bar: how "right" must motor/battery sizing be for v1 to be credible?

## 10. Output contract reminder (per project rules)

Every generated artifact must show: target customer, problem, offer, proof, channel, CTA for
GTM surfaces; and for engineering outputs, an explicit assumption/fact separation.
