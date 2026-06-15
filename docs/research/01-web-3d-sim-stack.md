# Research 01 — Browser 3D Robot Simulation Stack

> **Provenance:** parallel research subagent (Sonnet), 2026-06-15. Citations and `UNVERIFIED`
> flags are as returned by the research pass. Use as the evidence base for `TECH_STACK.md` and
> `FEATURES/F1`. Links reflect the researcher's knowledge as of the run date — re-verify before
> putting any item on the critical path.

## Recommended Stack (verdict)
React Three Fiber (R3F) v9 + `@react-three/drei` for rendering/UI; `@react-three/rapier`
(wrapping `@dimforge/rapier3d-compat`) for physics with joints/motors; `urdf-loader`
(gkjohnson) for robot import; `lo-th/fullik` (FIK, FABRIK) for arm IK. Jolt-web
(`jolt-physics`) is the credible post-MVP physics alternative. Babylon.js and cannon-es are
deprioritized (React-integration friction; cannon-es unmaintained ~2022).

## Rendering
- R3F wraps Three.js as a declarative React reconciler — decisive for a heavy design UI.
- Babylon.js: strong engine, but more imperative bridge code for a React UI; smaller web-robotics ecosystem.
- Drei: TransformControls, gizmos, orbit controls, HTML overlays, `useGLTF`.
- R3F v9 supports React 19 / Three r168+. WebGL2 sufficient for MVP; WebGPU a later lever.
- Sources: [PkgPulse 2026](https://www.pkgpulse.com/guides/threejs-vs-react-three-fiber-vs-babylonjs-3d-webgl-2026), [Aircada](https://aircada.com/blog/babylon-js-vs-react-three-fiber), [utsubo](https://www.utsubo.com/blog/threejs-vs-babylonjs-vs-playcanvas-comparison)

## Physics
- **Rapier (MVP).** Joints: fixed, spherical, revolute, prismatic, generic. Motors (PD) on
  revolute/prismatic/spherical via `configureMotor*`.
- **Critical:** multibody (reduced-coordinate) impl has "several outstanding known bugs and
  limitations" acknowledged Jan 2026; MuJoCo-inspired solver planned 2026. **Use `ImpulseJoint`,
  not `MultibodyJoint`, for MVP.** Stable for 4–8 link chains.
- **Jolt-web** (`jolt-physics`, v1.0.0 Dec 2024): more constraint types (swing-twist, 6DOF),
  AAA-battle-tested; React binding maturity **UNVERIFIED**. Escape hatch.
- **Not recommended:** cannon-es (unmaintained), Ammo.js (dormant port, **UNVERIFIED** commit date).
- Sources: [Rapier joints](https://rapier.rs/docs/user_guides/javascript/joints/), [Dimforge 2026 goals](https://dimforge.com/blog/2026/01/09/the-year-2025-in-dimforge/), [@react-three/rapier](https://www.npmjs.com/package/@react-three/rapier), [JoltPhysics.js releases](https://github.com/jrouwe/JoltPhysics.js/releases)

## Kinematics
- FK = scene-graph world transforms (no library needed); `urdf-loader` builds the graph.
- IK: **FABRIK** preferred (fast, no singularities). Options: `lo-th/fullik` (FIK; rotor
  constraints; maintenance date **UNVERIFIED**), THREE.IK (WIP/stale), glumb/kinematics
  (abandoned 2016). Fallback: ~100–200 LOC TS FABRIK.
- Sources: [fullik](https://github.com/lo-th/fullik), [THREE.IK](https://github.com/jsantell/THREE.IK), [IK overview](https://saeed1262.github.io/blog/2025/inverse-kinematics-models/)

## Robot Representation & Grasp
- Kinematic tree: links (mass/inertia/visual/collision) + joints (type/axis/limits).
- **URDF** (XML) via `urdf-loader` (gkjohnson, ~794★, active): all joint types, limits, mimic,
  Xacro, custom mesh callback (glTF/GLB visuals). No physics binding — must map URDF→Rapier
  manually. Working R3F demos exist (wty-andrew, vrtnis/robot-web-viewer).
- Collision: URDF `<collision>` → Rapier primitive colliders.
- **Grasp:** no grasp primitive in web physics. Options: (1) contact + friction (**UNVERIFIED**
  stability), (2) **Fixed joint attach on contact** (MVP, stable, telekinetic), (3) high-friction
  materials (aspirational). MVP = option 2.
- Sources: [urdf-loaders](https://github.com/gkjohnson/urdf-loaders), [robot-web-viewer](https://github.com/vrtnis/robot-web-viewer), [R3F URDF demo](https://wty-andrew.github.io/misc/r3f-urdf/)

## MVP vs Defer
- **MVP:** R3F+Drei, @react-three/rapier (ImpulseJoints), urdf-loader, FIK, primitive colliders,
  fixed-joint grasp, GLB visuals.
- **Defer:** friction grasp, Jacobian/optimization IK, full multibody, Jolt migration, WebGPU,
  SDF/MJCF, drone aerodynamics, closed-form analytic IK.

## Open Uncertainties
1. Rapier multibody bug severity — test 12+ revolute chain before high-DOF use.
2. FIK maintenance — fallback to in-house FABRIK.
3. Ammo.js dormancy — **UNVERIFIED**.
4. @react-three/jolt feature coverage — **UNVERIFIED**.
5. Physics-based grasp stability — defer; use fixed-joint attach.
6. **URDF→Rapier mapper must be built (~300–500 LOC).** No maintained package found.
