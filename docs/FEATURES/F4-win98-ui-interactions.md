# F4 — Win98 UI, Drag-Drop, Hover Specs, Microprocessor System

**Date:** 2026-06-15
**Status:** implemented + verified (see [`../screenshots`](../screenshots))
**Code:** [`../../app`](../../app)

These were added on top of the F1–F3 MVP per user request (2026-06-15): "Windows-98 UI style,
plus a drag-drop system, mouse-over spec on parts, and a microprocessor system."

---

## 1. Windows-98 UI

- `98.css` provides authentic chrome (title bars, beveled buttons, fieldsets, tree-view, MS
  Sans Serif font). Desktop is classic teal; a taskbar shows a Start button and a live status.
- **Draggable windows** — `app/src/ui/Window.tsx` drags by the title bar via pointer capture.
  Six windows: Design Prompt, Parts Bin, Robot Viewport, Microprocessor System, Properties,
  Parts Suggestion.
- Evidence: `screenshots/roboforge-3d-rover.png`, `roboforge-3d-arm2.png`.

## 2. Drag-and-drop system

- HTML5 native DnD; payload = `dataTransfer.setData('text/plain', part.id)`.
- **Drop targets:** the Robot Viewport (`Viewport3D.tsx` → `placePart`) and every MCU pin
  (`McuPanel.tsx` → `assignPart`). The window shell can also receive a part drop.
- Verified end-to-end live: the React `onDrop` → `assignPart` → store → re-render path wires a
  pin green and updates the status bar (`Wired MPU-6050 IMU → A4`). Evidence:
  `screenshots/roboforge-wired.png`.
- Note: Playwright's synthetic native-DnD is unreliable (a known automation limitation); real
  user drags work. Pin-assignment rules are additionally covered by 7 unit tests.

## 3. Mouse-over spec on parts

- A single global Win98 balloon (`app/src/ui/Tooltip.tsx`) driven by `store.hover`
  (`{title, subtitle, specs, x, y}`). It follows the cursor and clamps to the viewport.
- Sources of hover specs: Parts Bin items, Parts Suggestion rows (incl. boards), and MCU pins
  (shows the wired part or the pin's capabilities).
- Evidence: `screenshots/roboforge-tooltip.png` (MG996R → Torque 11 kg·cm, 4.8–7.2 V, PWM 50 Hz).

## 4. Microprocessor system

- `app/src/ui/McuPanel.tsx` + pure logic in `app/src/core/mcu.ts`.
- Pick a **board** — Arduino Uno R3 / Raspberry Pi Pico / ESP32 DevKit (`data/boards.ts`), each
  with a realistic pin map (DIGITAL / ANALOG / PWM / I2C / SPI / UART / POWER / GND).
- **Wire** a part by dropping it on a pin. Validation (`assignPart`):
  - a part's `pinKind` must be supported by the pin (PWM servo → ~PWM pin; I2C IMU → I2C pin),
  - a pin can hold only one part (no double-assignment),
  - mechanical parts (no `pinKind`) are rejected.
- Live usage counter (`pins used X/total`); click a wired pin to remove. Power/GND rails are
  visually distinct and excluded from the signal-pin count.
- Verified by 7 unit tests + live drop test.

## 5. Realistic 3D (procedural, part-by-part)

- The initial boxes/cylinders were replaced with a **procedural part library**
  (`app/src/ui/models/parts3d.tsx`): rubber-tire-with-rim-and-spokes wheels, TT gearmotors, an
  Arduino-style PCB with headers/USB/chip/LED, hobby servos with horns, aluminium U-channel
  brackets, a 2-finger gripper, an HC-SR04 sensor, and a LiPo pack.
- `Viewport3D.tsx` composes these into a **Rover** (chassis + 4 wheels + drivetrain + board +
  battery + sensor) and an **Arm** (base turntable + base servo + brackets + elbow servo +
  gripper), with studio lighting, real-time shadows, and a contact shadow for grounding.
- Animation is kinematic: wheels roll + body translates; arm sweeps base-yaw / shoulder / elbow
  and the gripper opens/closes.
- Evidence: `screenshots/roboforge-3d-rover.png`, `roboforge-3d-arm2.png`.

### Honest limitation (per project rules)
A literal "generate an AI image per part, then convert to 3D mesh" pipeline was **not possible**
here: no diffusion image-generation or image-to-mesh tool is available in this environment, and
the installed `codex` CLI (v0.139.0) is a coding agent, not an image model. The faithful,
verifiable alternative delivered is detailed **procedural** modeling. If photoreal scanned
assets are required, the next step is importing open-licensed glTF/URDF part meshes into the
same `Viewport3D` composition slots.

## MVP vs deferred

| | Now | Deferred |
|---|---|---|
| Windows | drag to move | minimize/maximize/close behavior, z-order focus, snapping |
| DnD | bin → viewport / pin | drag to reorder, drag parts off the robot |
| 3D | procedural PBR parts, kinematic motion | imported meshes, Rapier physics, true grasp |
| MCU | capability + conflict validation | current-draw/voltage budgeting, auto-routing |

## 6. Update 2026-06-15 — log window, resizable windows, MCU map + wiring

Added per user request ("generation log window, customizable window size, and the microprocessor
must show its wiring diagram together with the microprocessor map").

- **Activity Log window** (`app/src/ui/LogWindow.tsx` + `store.logs`/`pushLog`): a scrollable,
  auto-scrolling, color-coded console. Generation pushes detailed `GEN` lines (prompt → spec →
  archetype → sizing), wiring pushes `WIRE` lines, assumptions push `WARN`.
- **Resizable windows** (`app/src/ui/Window.tsx`): every window has a bottom-right grip; drag it
  to resize (min-size clamped). The 3D viewport and MCU diagrams are flex-based, so they **scale
  with the window**. Windows remain draggable by the title bar.
- **Microprocessor map + wiring diagram, side by side** (`app/src/ui/McuPanel.tsx` +
  `PinMap.tsx` + `WiringDiagram.tsx`): the left **map** is an SVG board pinout (pins labeled
  around the board, drop targets, used=green / power=amber); the right **wiring diagram** is an
  SVG that draws each connection as `part ──▶ pin` with colored connector lines, updating live as
  pins are wired.
- **Viewport camera movement** (`app/src/ui/CameraController.tsx` + on-screen nav cluster):
  pan (↑↓←→), zoom (＋－), and reset (⛶) buttons translate/dolly the camera; OrbitControls also
  enables mouse pan (right-drag), rotate (left-drag), and wheel zoom.
- Evidence: `../screenshots/roboforge-v2-full.png`, `../screenshots/roboforge-camera.png`.
