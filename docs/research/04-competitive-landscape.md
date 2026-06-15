# Research 04 — Competitive Landscape & Positioning

> **Provenance:** parallel research subagent (Sonnet), 2026-06-15. Capability claims the
> researcher could not directly confirm are flagged `UNVERIFIED`. Evidence base for `PRD.md`.

## Positioning Statement
**The only browser-native tool where makers describe a robot in plain language, watch it move
in real-time physics, and get a clickable bill of materials — no install, no PhD required.**

## Professional / Research Tools (why not a fit for maker quick-design web flow)
- **Gazebo Harmonic** — desktop, ROS 2, ~2GB, Linux-first; text-file model authoring.
- **Webots** — desktop (~1.5GB), Apache 2.0; PROTO/URDF ramp; no browser.
- **NVIDIA Isaac Sim** — desktop GPU-only (RTX, ~50GB), Omniverse coupling.
- **CoppeliaSim** — free edu only; ~$3,000 commercial (**UNVERIFIED** exact).
- **MuJoCo** — MJCF XML; convex-decomposition needed; manual ROS bridge.
- **RoboDK** — from €145; industrial arms only; no electronics/sensor stack.
- **ABB RobotStudio** — ABB lock-in; Cloud is a companion, standalone authoring **UNVERIFIED**.
- **Onshape** — browser CAD, but free tier public; sim via paid extensions; no robotics workflow/physics.
- **Fusion 360** — cloud-connected desktop; generative design but no robot motion sim/BOM-to-buy.
- **SolidWorks** — desktop, costly; no robotics/motion for makers.
- Sources: [SVRC comparison](https://www.roboticscenter.ai/learn/robot-simulation-software-comparison), [Startup Stash](https://startupstash.com/top-robotics-simulation-platforms/), [Fusion vs Onshape](https://www.xometry.com/resources/3d-printing/fusion-360-vs-onshape/)

## Maker / Web Tools (what's missing)
- **Tinkercad (3D)** — browser CSG + Arduino sim; no body physics/motion; no parts-to-buy.
- **Tinkercad Sim Lab** — browser physics (motors, joints, materials) but explicitly
  *approximate/education-grade*; no sensors/electronics integ; no multi-DOF kinematics; no BOM.
- **Wokwi** — browser MCU/electronics + firmware; no 3D mechanical/body/motion.
- **Fritzing** — desktop schematic/PCB; no sim/3D/motion/purchasing.
- **RobotShop** — parts e-commerce + guides; no design/sim/NL; user must already know parts.
- **Thingiverse/Printables/MakerWorld** — static STL repositories; no sim/recommendation.
- **Blender** — 3D modeling + visual Bullet physics; not a control-loop sim; steep; no parts.
- Sources: [Tinkercad robotics](https://www.tinkercad.com/blog/robotics), [Wokwi](https://wokwi.com/), [RobotShop community](https://community.robotshop.com/)

## Gap Analysis
No single tool combines all four: (1) NL → robot 3D geometry/kinematic chain, (2) real-time
full-motion browser physics, (3) buyable-parts (BOM-to-cart) recommendation, (4) zero-install
+ zero prior robotics knowledge. Browser physics is now feasible (WASM ~60–90% native; WebGPU
2–3× WebGL — figures **UNVERIFIED** secondary source). The gap is real and unoccupied as of
2026-06 (negative finding; stealth startups can't be excluded).
- Sources: [WebGPU/WASM browser physics](https://www.technology.org/2025/11/11/webassembly-webgpu-in-browser-game-platforms-pushing-the-frontier-of-real-time-graphics/), [WebGPU showcase](https://www.webgpu.com/showcase/realistic-physics-simulations-in-the-browser/)

## Differentiation Opportunities
1. **NL → kinematic-chain scaffold** (robot-domain-aware, not generic text-to-CAD).
2. **In-browser engineering-grade motion sim** (above Tinkercad, below MuJoCo/Isaac).
3. **Contextual parts recommendation tied to sim state** (torque/load/I-O → ranked buy links).
4. **Export-to-print + export-to-firmware in one session** (vs 4 disconnected tools today).
5. **Progressive complexity floor** (three-click chassis → advanced kinematics on-ramp).

## Open Uncertainties
1. Tinkercad Sim Lab joint/DOF ceiling — **UNVERIFIED** (page didn't load).
2. RobotStudio Cloud standalone authoring — **UNVERIFIED**.
3. CoppeliaSim exact price — **UNVERIFIED**.
4. Browser-physics "% of native" claims — **UNVERIFIED** secondary source.
5. "No maker-facing NL-to-robot tool exists (2026-06)" — high-confidence negative, not provable
   by absence.

> More refs: [Black Coffee Robotics](https://www.blackcoffeerobotics.com/blog/which-robot-simulation-software-to-use), [MIT speak-objects](https://news.mit.edu/2025/mit-researchers-speak-objects-existence-using-ai-robotics-1205), [ThinkRobotics design software guide](https://thinkrobotics.com/blogs/learn/the-ultimate-guide-to-robot-design-software-in-2025)
