# RoboForge 98 — app

A runnable, Windows-98-styled 3D robot design studio. Implements the MVP core loop
(**describe → move → buy**) plus drag-and-drop, mouse-over part specs, and a microprocessor
(pin-wiring) system.

> This is the implementation of the plan in [`../docs`](../docs). For product context read
> [`../docs/SUMMARY.md`](../docs/SUMMARY.md) first.

## Run

```bash
cd app           # or use npm --prefix app <script>
npm install
npm run dev      # Vite dev server (HMR)        → http://localhost:5173
npm run build    # tsc --noEmit + vite build    → dist/
npm run preview  # serve the production build    → http://localhost:4173
npm run test     # vitest (15 unit tests)
npm run typecheck
```

## Tech stack (and why these versions)

| Layer | Choice | Note |
|-------|--------|------|
| UI/3D | React 18 + React-Three-Fiber **v8** + drei v9 + three 0.169 | Pinned to the rock-solid v8/React-18 combo for a clean first build. The plan's R3F v9/React 19 is a later upgrade. |
| Win98 chrome | `98.css` | Authentic title bars, buttons, fieldsets, tree-view, MS Sans Serif. |
| State | `zustand` | Tiny store; plays well with the R3F render loop. |
| Build/test | Vite 5 + Vitest 2 | Pure-logic unit tests run in node env. |

## Structure

```
src/
  core/      types, sizing (closed-form), mcu (pin logic), nl (rule-based) + *.test.ts
  data/      parts (mock catalog), boards (MCUs+pins), archetypes
  state/     zustand store (design, placed, wiring, hover, status)
  ui/        Window, Desktop pieces, PartsBin, McuPanel, Viewport3D, Tooltip, ...
  ui/models/ parts3d.tsx — procedural 3D part library (wheel, gearmotor, servo, …)
```

## The three requested additions

- **Windows-98 UI** — `98.css` + a teal desktop, draggable windows (`ui/Window.tsx`,
  pointer-drag by title bar), and a taskbar with a live status line.
- **Drag-and-drop** — HTML5 DnD (`dataTransfer` `text/plain` = part id). Drag a part from the
  **Parts Bin** onto the **Robot Viewport** (places it) or onto an **MCU pin** (wires it).
- **Mouse-over spec on parts** — a single global Win98 balloon (`ui/Tooltip.tsx`) fed by
  `store.hover`; every part, board, and pin reports its specs on hover.
- **Microprocessor system** — `ui/McuPanel.tsx` + `core/mcu.ts`: pick a board (Uno / Pico /
  ESP32), see its pins, drag parts onto pins. Validates pin capability (a PWM servo needs a
  ~PWM pin, I2C needs an I2C pin), blocks double-assignment and mechanical parts, tracks usage.

## What is real vs mocked (MVP)

| Area | Now | Upgrade path |
|------|-----|--------------|
| 3D parts | **Procedural** geometry, modeled part-by-part (`ui/models/parts3d.tsx`) with PBR materials, shadows, contact shadow | import scanned glTF/URDF meshes |
| Physics | **Kinematic** animation (wheels spin, joints sweep ROM, gripper opens) | Rapier (see `../docs/TECH_STACK.md`) |
| Parts catalog | **Mock** entries tagged Amazon / Nexar / Mouser (`data/parts.ts`) | live APIs (`../docs/FEATURES/F2`) |
| NL → design | **Dev:** local `claude` CLI (Opus) via `/api/nl-design` (`core/nlClient.ts` + a Vite dev plugin) — real NL understanding; **rule-based fallback** (`core/nl.ts`) when offline/static | hosted LLM (Claude API + proxy) for production |

> **On "AI-image → 3D":** no diffusion image-generation or image-to-mesh tool is available in
> this environment (the installed `codex` CLI is a coding agent, not an image model). The
> realistic look is therefore delivered as **detailed procedural models**, which is the
> standard approach for in-browser robot configurators and is fully offline + verifiable.

## Verification

- `npm run test` → **15/15** unit tests pass (sizing, mcu pin logic, nl extraction).
- `npm run build` → type-checks + bundles clean.
- Live screenshots in [`../docs/screenshots`](../docs/screenshots) (Win98 desktop, rover & arm
  3D, hover tooltip, wired pin).
