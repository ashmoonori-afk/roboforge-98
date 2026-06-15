# SUMMARY — RoboForge (one-page, keep current)

**Last updated:** 2026-06-15 (implementation slice 1 done)

## What
Browser-native 3D robot engineering studio for **makers**: *describe in plain language → see it
move in real-time physics → buy the parts.* Now a **runnable Windows-98-styled web app**.

## Locked decisions (2026-06-15)
- Platform: **web app** (no install). Win98 UI style.
- Robot scope: **all robot types in the data model; MVP ships 2 archetypes** (diff-drive rover
  + simple N-DOF arm).
- "Mobility" = **locomotion + joint ROM + grasp**.
- Users: **makers/hobbyists**. v1 = **working MVP** (Amazon/AI may be mocked/simplified).
- Name "RoboForge" is a **working title**.

## Implementation status — `app/` (Vite + React 18 + R3F v8 + TS)
**Built + verified (build green, 15/15 unit tests, live screenshots in `docs/screenshots/`):**
- ✅ Win98 desktop: `98.css`, draggable windows, taskbar/status.
- ✅ F1 mobility demo: procedural 3D rover & arm, kinematic motion (wheels roll, arm ROM, grasp).
- ✅ F2 parts suggestion: mock catalog tagged **Amazon + Nexar + Mouser**, buy links.
- ✅ F3 NL auto-design: **dev-mode local `claude` CLI (Opus) via `/api/nl-design`** (real NL understanding) → archetype match → closed-form sizing; **rule-based fallback** when offline/static.
- ✅ Drag-and-drop (bin → viewport / MCU pin).
- ✅ Mouse-over spec tooltip (parts, boards, pins).
- ✅ Microprocessor system: board + pin map + capability/conflict-validated wiring (`core/mcu.ts`).
- ✅ Realistic **procedural** 3D part library (`ui/models/parts3d.tsx`) — see [F4](FEATURES/F4-win98-ui-interactions.md).
- ✅ **Activity Log** window (color-coded generation/wiring logs), **resizable windows** (corner grip; 3D + MCU scale with size), **MCU map + wiring diagram** shown side by side (SVG pinout + live part→pin connectors).
- ✅ Viewport **camera nav** (pan/zoom/reset + mouse pan/rotate/zoom).
- ✅ Archetypes (4 fallback): rover, single arm, multi-arm stationary (surgical), humanoid automaton (clockwork/android).
- ✅ **Generative 3D (primary path)**: the local `claude` (Opus) CLI now emits a **primitive scene graph** (`{nodes:[{shape,size,pos,rot,color,spin,swing,children}]}`) alongside the spec, rendered generically by `ui/SceneRenderer.tsx` (`core/scene.ts` validates/clamps). So **any prompt is auto-modeled** into a bespoke 3D assembly (e.g. a 17–47-node clockwork automaton with gears) — not limited to fixed archetypes; archetypes are the offline/fallback. Tradeoff: ~25–50 s/generation (spec+scene output); primitive-based = recognizable, not photoreal. Local-CLI generation sped up to **~7–12 s** (Opus + `--strict-mcp-config --setting-sources project`). Activity Log: **Copy/Clear + selectable text**; assumptions shown as **NOTE** (calm blue, not an error).

**Mocked / deferred (by design):** live LLM, live parts APIs, Rapier physics (kinematic for now),
imported glTF meshes, accounts/cloud. **No AI image→mesh tool available in this env** → 3D is
procedural (honest note in F4 / app README).

## Stack (implemented)
React 18 + R3F v8 + drei v9 + three 0.169 · `98.css` · zustand · Vite 5 + Vitest 2.
(Plan's R3F v9/React 19 = later upgrade.)

## Biggest risks (still open for the "production" path)
1. **R1** Rapier multibody bugs → ImpulseJoints + Spike A (when physics is added).
2. **R4/R5** Amazon 10-sale gate + no-scraping → mock-first + manual affiliate links (in place).
3. **R9/R12** NL-design trust → strict schema, null defaults, safety factors (formulas in place).

## Docs
`README.md` · `PRD` · `ARCHITECTURE` · `TECH_STACK` · `ROADMAP` · `RISKS` ·
`FEATURES/F1–F4` · `research/01–04` · `screenshots/` · app at `app/` (+ `app/README.md`).

## Next action (pick one)
1. Wire real physics (Rapier) behind the kinematic motion (Phase 0 Spike A).
2. Swap procedural 3D for imported glTF/URDF part meshes (if photoreal assets wanted).
3. Connect a live parts source (Nexar free tier) behind the existing `CatalogPort`.
4. Hook the NL stage to Claude tool-use (same `RequirementsSpec`).

## Run it
`cd app && npm install && npm run dev` → http://localhost:5173 (preview build currently live on
:4173).
