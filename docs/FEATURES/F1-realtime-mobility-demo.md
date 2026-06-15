# F1 — Real-time Mobility Demo

**Date:** 2026-06-15
**Definition of "mobility":** full motion expression = **locomotion + joint range-of-motion
(ROM) + grasp** (per user decision, 2026-06-15).
**Basis:** [`../research/01-web-3d-sim-stack.md`](../research/01-web-3d-sim-stack.md)

---

## 1. Behavior (what the user sees)

From a generated (or selected) robot, the user can:
- **Play** a real-time physics simulation in the 3D viewport.
- **Drive** a mobile base (keyboard/on-screen: forward/back/turn) and watch it move under
  physics (mass, friction, motor torque).
- **Articulate** joints: move an arm through its ROM via sliders or a target, with limits
  enforced.
- **Grasp**: trigger a gripper to pick up / release a nearby object.
- **Inspect**: simple telemetry (speed, joint angles, contact events).

## 2. MVP vs deferred

| Capability | MVP | Deferred |
|------------|-----|----------|
| Locomotion | diff-drive rover, motorized wheels on flat ground | tracked, omni, legged gait, aerial |
| Joint ROM | revolute/prismatic joints with limits + motors (arm) | full dynamics tuning, compliance |
| Grasp | **fixed-joint attach on contact** (stable, "telekinetic") | friction/contact-rich grasp |
| Terrain | flat plane, tunable friction | uneven terrain, stairs, soft ground |
| Control | manual (keys/sliders) + scripted demo | autonomous controllers, path planning |

## 3. Technical design

**Engine:** Rapier (WASM) via `@react-three/rapier`. **Use `ImpulseJoint`, not
`MultibodyJoint`** (multibody has known bugs as of Jan 2026 — RISKS R1). Chains kept to
~4–8 links.

**Joint → motion mapping:**
- Wheels → revolute joints with **velocity motors** (`configureMotorVelocity`).
- Arm joints → revolute/prismatic with **position motors** (`configureMotorPosition`) + limits.
- Coupled gripper fingers → `mimic` in the model → driven together.

**Grasp (MVP algorithm):**
```
on contact(gripperFingerCollider, objectCollider):
  if graspRequested and not attached:
    create FixedJoint(gripperLink, object) at contact frame   // attach
    attached = true
on release:
  remove FixedJoint                                           // detach, object falls
```
Rationale: friction-based grasp stability is `UNVERIFIED` in the current solver (RISKS R2);
fixed-joint attach is predictable and demos the *intent* of grasp.

**Simulation loop:** fixed timestep (e.g., 1/60 s) accumulator; render sync each frame;
deterministic stepping for reproducible demos and headless tests.

**Kinematics:** forward kinematics = the scene-graph world transforms (free). Inverse
kinematics for "move end-effector to target" = FABRIK (FIK lib or in-house; RISKS R3).

## 4. Data flow

```
Robot graph ──► sim/urdf-bridge ──► Rapier world (bodies, colliders, joints, motors)
                                        │
   UI controls (keys/sliders/grasp) ───►│ set motor targets / grasp flag
                                        ▼
                              sim/sim-loop (fixed step) ──► telemetry + transforms
                                        │
                                        ▼
                              R3F viewport (render) ──► user sees motion
```

## 5. Acceptance criteria (MVP)

- [ ] A diff-drive rover drives on a plane with believable response to motor input.
- [ ] An N-DOF arm moves each joint within limits; an end-effector target is reachable via IK
  for at least one demo arm.
- [ ] Grasp attaches an object on contact when requested, and releases it; object falls under
  gravity on release.
- [ ] Runs at interactive frame rate on a mid-range laptop (target ≥ 30 FPS; **ASSUMPTION**,
  confirm in Spike A).
- [ ] Stepping is deterministic enough for a golden-trajectory test to pass repeatedly.

## 6. Open questions / risks

- Stability ceiling of impulse joints for the arm (Spike A). → R1
- FIK vs in-house FABRIK decision. → R3
- Exact FPS on low-end hardware (Chromebook persona P2) — **UNVERIFIED**, must measure.
- Wheel-ground friction model fidelity vs simplicity trade-off.
