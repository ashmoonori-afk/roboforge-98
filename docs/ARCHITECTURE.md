# Architecture — RoboForge

**Date:** 2026-06-15
**Scope:** system structure, the universal robot data model, module breakdown, data flow.
Per-feature internals live in [`FEATURES/`](FEATURES/).

---

## 1. Guiding principle: general core, narrow MVP surface

> **General data model, limited shipped library.** The internal representation must express
> *any* robot (wheeled, arm, legged, humanoid, drone) as a link/joint graph. The MVP only
> *exposes* two archetypes (rover + arm). This resolves the tension between "all robotics"
> (user's stated scope) and "working MVP" (user's stated v1 ambition).

Consequences:
- Adding a robot type later = new archetype + new sim behaviors, **not** a data-model rewrite.
- Every module is written against the generic `Robot` graph, never against "rover" or "arm".

## 2. The universal robot data model

A robot is a **kinematic tree**: nodes are rigid **links**, edges are **joints**. This is the
URDF mental model and maps 1:1 to both the render scene graph and the physics world.

```
Robot
  id, name, archetype?            // archetype is a hint, not a constraint
  links:  Link[]
  joints: Joint[]                 // forms a tree (one root link)
  metadata: { mass_total?, bbox?, source: 'archetype'|'urdf'|'generated' }

Link
  id, name
  visual:    GeometryRef          // glTF/GLB mesh or primitive
  collision: CollisionShape       // box | cylinder | sphere | convexMesh (simplified)
  inertial:  { mass_kg, com[3], inertiaTensor? }

Joint
  id, name, type                  // fixed | revolute | prismatic | spherical | continuous
  parent: LinkId, child: LinkId
  origin: Transform               // pose of child frame in parent frame
  axis:   Vec3                    // for revolute/prismatic
  limits: { lower, upper, effort?, velocity? }
  motor?: { mode: 'velocity'|'position', target, maxImpulse }   // actuated joints
  mimic?: { joint: JointId, multiplier, offset }                // e.g., coupled gripper
```

Three projections of the same graph:

| Projection | Used by | Built with |
|------------|---------|-----------|
| **Scene graph** (visual) | renderer | Three.js groups (via `urdf-loader`) |
| **Physics world** (dynamics) | simulator | Rapier rigid bodies + colliders + joints |
| **Spec/BOM** (semantic) | design + parts | the `Robot` object + `RobotRequirementsSpec` |

A dedicated **URDF→Rapier mapper** (must be built, ~300–500 LOC) keeps the physics world in
sync with the kinematic tree. See [`research/01`](research/01-web-3d-sim-stack.md).

## 3. Module breakdown (high cohesion, low coupling)

```
src/
  core/
    robot-model/        // Robot/Link/Joint types, validation, graph utils (pure, no deps)
    units/              // SI units, conversions, guards
  sim/
    physics-world/      // Rapier setup, stepping, world lifecycle
    urdf-bridge/        // urdf-loader -> Robot; Robot -> Rapier mapper
    kinematics/         // FK from scene graph; IK (FABRIK) for arms
    grasp/              // contact detection + fixed-joint attach (MVP)
    sim-loop/           // fixed-timestep loop, render sync, telemetry
  design/
    requirements/       // RobotRequirementsSpec schema + LLM extraction client
    archetypes/         // archetype library (JSON templates + scoring)
    sizing/             // closed-form engineering formulas (torque, battery, frame)
    pipeline/           // NL -> spec -> archetype -> params -> Robot + BOM
  parts/
    part-schema/        // normalized Part type
    catalog/            // mock/curated catalog (v1)
    adapters/           // amazon | nexar | mouser adapters (behind one interface)
    ranker/             // match parts to design slots, rank, dedupe
  ui/
    viewport/           // R3F canvas, controls, gizmos
    panels/             // prompt box, design params, parts list, joint editor
    state/              // app store (zustand)
  server/               // thin proxy: LLM key, parts API creds, caching (added when needed)
```

**Dependency direction:** `ui → {design, sim, parts} → core`. `core/robot-model` depends on
nothing (pure, unit-tested). Adapters depend on `part-schema`, never the reverse.

## 4. Primary data flow (the "happy path")

```
[User prompt]
     │  natural language
     ▼
design/requirements  ──(Claude tool-use, strict JSON schema)──►  RobotRequirementsSpec
     │
     ▼
design/archetypes    ──(rule-based scoring)──►  chosen archetype + parameter template
     │
     ├─────────────► parts/ranker ──► Part[] shortlist (per slot)  ──► UI parts panel
     ▼
design/sizing        ──(closed-form formulas)──►  filled parameters
     │
     ▼
core/robot-model     ──►  Robot graph (links/joints)
     │
     ├──► sim/urdf-bridge ──► Rapier world ──► sim/sim-loop ──► UI viewport (real-time motion)
     └──► UI design panel (params, topology, warnings)
```

Notes:
- Parts ranking and physics build can run **in parallel** off the same `Robot` + spec.
- `ambiguities` from the spec are surfaced to the UI as clarifying chips before/after the run.
- Everything after extraction is **deterministic** (auditable), per the design-tool goal.

## 5. Where the LLM is and isn't

- **Is:** natural-language → structured `RobotRequirementsSpec` (and later, optional
  tool-use to call sizing functions and explain part choices).
- **Is not:** physics, parameter math, or final part selection in v1 — those are deterministic
  code so results are repeatable and reviewable. (Growth path in [`FEATURES/F3`](FEATURES/F3-nl-auto-design.md).)

## 6. Client/server split

- **MVP is client-heavy.** Simulation, rendering, robot model = browser.
- **Thin serverless backend** exists only to: (1) proxy the LLM call (hold API key),
  (2) proxy/cache parts APIs (hold creds, honor ToS cache windows), (3) optionally log
  anonymized prompts for evaluation. No user DB in v1 (local save only).

## 7. Testing seams (for the 80% target)

- `core/robot-model`, `design/sizing`, `parts/ranker`, `design/archetypes` are **pure** →
  unit-testable without a browser or network.
- `sim/*` validated with headless Rapier stepping + golden trajectories.
- LLM extraction validated with a fixture set of prompts → expected spec (schema-conformance
  + field assertions), mocking the model.
- E2E: prompt → demo runs → parts list appears (Playwright).

See [`ROADMAP.md`](ROADMAP.md) for phasing and [`RISKS.md`](RISKS.md) for the known hazards
in the multibody/grasp/parts areas.
