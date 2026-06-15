# Tech Stack — RoboForge

**Date:** 2026-06-15
**Basis:** [`research/01-web-3d-sim-stack.md`](research/01-web-3d-sim-stack.md),
[`research/02-parts-sourcing.md`](research/02-parts-sourcing.md),
[`research/03-nl-to-design.md`](research/03-nl-to-design.md)

> Every choice below carries a rationale and a source. Items we could not verify are tagged
> **`UNVERIFIED`** and must be confirmed by hands-on spike before they go on the critical path.

---

## 1. Recommended MVP stack (one glance)

| Layer | Choice | Package | Why |
|-------|--------|---------|-----|
| Rendering + UI | **React Three Fiber v9** + Drei | `@react-three/fiber`, `@react-three/drei` | Declarative React scene composes naturally with a complex design UI; largest helper ecosystem ([src](https://www.pkgpulse.com/guides/threejs-vs-react-three-fiber-vs-babylonjs-3d-webgl-2026)) |
| Physics | **Rapier (WASM)** via R3F binding | `@dimforge/rapier3d-compat`, `@react-three/rapier` | Broadest browser joint+motor support (revolute/prismatic/spherical + PD motors) ([src](https://rapier.rs/docs/user_guides/javascript/joints/)) |
| Robot description | **urdf-loader** | `urdf-loader` (gkjohnson) | Loads standard URDF into a Three.js joint graph; handles all joint types + Xacro ([src](https://github.com/gkjohnson/urdf-loaders)) |
| Inverse kinematics | **FABRIK** (FIK) or in-house | `fullik`/FIK, or ~200-line TS | FABRIK converges fast, no singularities; for arm reach/ROM ([src](https://github.com/lo-th/fullik)) |
| App framework | **React + TypeScript + Vite** | — | Standard, fast HMR, fits R3F |
| State | lightweight store (e.g., Zustand) | `zustand` | Simple, works well with R3F render loop |
| NL/AI | **Claude tool-use / structured output** | Anthropic SDK | Schema-guaranteed extraction; latest Claude per project default |
| Parts data | **normalized Part schema**, mock-first; then Nexar + Mouser; Amazon via Creators API later | — | See §4 |

**Front-end is the whole app for MVP.** A thin backend is introduced only when live parts
APIs / LLM keys must be proxied (see §4, §5).

## 2. Rendering: React Three Fiber (not raw Three.js, not Babylon.js)

- Three.js is the engine; **R3F** wraps it as declarative JSX, which matters because the UI
  is heavy (joint editors, archetype pickers, parameter panels) and benefits from React
  state/composition.
- **Babylon.js deprioritized:** strong engine but integrating a React design UI needs more
  imperative bridge code; smaller web-robotics ecosystem.
- **Drei** supplies `TransformControls`, gizmos, orbit controls, HTML overlays, `useGLTF`.
- WebGL2 is sufficient for MVP; **WebGPU is a later perf lever**, not a dependency.

Source: [`research/01`](research/01-web-3d-sim-stack.md).

## 3. Physics: Rapier now, Jolt as escape hatch

**Use Rapier for MVP**, with one hard rule from research:

> **Use `ImpulseJoint`, NOT `MultibodyJoint`, in the MVP.** Dimforge acknowledged (Jan 2026)
> that the multibody implementation has "several outstanding known bugs and limitations." A
> MuJoCo-inspired solver is on their 2026 roadmap. Impulse joints are stable for 4–8 link
> chains (covers rover + typical arm). ([src](https://dimforge.com/blog/2026/01/09/the-year-2025-in-dimforge/))

- **Joints/motors:** revolute, prismatic, spherical, fixed, generic; PD velocity/position
  motors via `configureMotor*`. Covers wheels, arm joints, linear actuators.
- **Grasp (MVP):** create a **Fixed joint** between gripper link and object on contact
  ("telekinetic" but stable). Friction-based grasp is **deferred** — `UNVERIFIED` stability
  in current solver.
- **Escape hatch:** **Jolt-web** (`jolt-physics`) is actively maintained (v1.0.0 Dec 2024),
  more constraint types (swing-twist, 6DOF), AAA-battle-tested. Adopt only if high-DOF robots
  destabilize Rapier. R3F binding maturity is `UNVERIFIED`.
- **Not used:** cannon-es (unmaintained ~2022), Ammo.js (dormant port).

Source: [`research/01`](research/01-web-3d-sim-stack.md).

## 4. Parts data layer (Amazon + 2 options)

**Source-agnostic internal `Part` schema first; integrations behind it.** (Schema in
[`FEATURES/F2`](FEATURES/F2-parts-suggestion.md).)

| Source | Role | Access reality |
|--------|------|----------------|
| **Amazon** | consumer-familiar finished goods | PA-API 5.0 **deprecated 2026-04-30** → **Creators API** (OAuth2). **Hard blocker:** 10 qualifying sales / 30 days for new accounts. MVP = manual curated ASINs + affiliate links. ([src](https://dev.to/th3nate/amazon-pa-api-v5-is-shutting-down-april-30-2026-here-is-what-changes-at-the-auth-layer-22ek)) |
| **Nexar (Octopart)** — option 2 | multi-distributor electronics aggregation | GraphQL, OAuth2, **free 1,000 matched parts/mo**; aggregates Digi-Key/Mouser/Arrow/40+ ([src](https://nexar.com/api)) |
| **Mouser Search API** — option 3 | single-distributor fallback, simple auth | Free API key, **30 req/min / 1,000 req/day**, 8M+ SKUs, robotics section ([src](https://www.mouser.com/api-hub/)) |

- **Caching/ToS:** Amazon mandates price cache ≤ 1 h, other product data ≤ 24 h; partner tag
  must stay unmodified. ([src](https://webservices.amazon.com/paapi5/documentation/best-programming-practices.html))
- **Legal:** official APIs or manual entry only — **no scraping** (ToS + liability).
- **Mechanical-parts gap (`UNVERIFIED` coverage):** none of the three covers frames /
  extrusion / brackets / gearboxes well. v1 marks mechanical parts as **manual entry**.

Source: [`research/02`](research/02-parts-sourcing.md).

## 5. AI layer (NL → design)

- **Requirement extraction:** Claude **tool-use with a strict JSON Schema** (`RobotRequirementsSpec`)
  to guarantee structure at decode time. (OpenAI structured outputs is an equivalent option;
  project default is latest Claude.)
- **No model fine-tuning in MVP.** Prompt + schema + a small archetype library + closed-form
  sizing formulas.
- **Backend proxy required** to hold the LLM API key and parts API credentials (never ship
  secrets to the browser). Smallest possible serverless function set.

Source: [`research/03`](research/03-nl-to-design.md).

## 6. Things that must be built (no off-the-shelf lib)

- **URDF → Rapier joint mapper** (~300–500 LOC TS): translate each parsed `URDFJoint` into the
  matching Rapier `JointData.*`. No maintained package found. (`research/01`)
- **Archetype library + parameter-sizing rules** (the heart of F3).
- **Part normalizer/adapters** per source.

## 7. Confirm-before-critical-path (spikes)

1. Rapier impulse-joint stability for an N-DOF arm + a grasp attach. (multibody bug risk)
2. FIK maintenance status / fallback to in-house FABRIK. (`UNVERIFIED`)
3. Nexar free-tier commercial-use terms + cache duration. (`UNVERIFIED`)
4. Mouser API approval turnaround. (`UNVERIFIED`)
