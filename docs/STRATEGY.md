# RoboForge — Strategy & Hedges

**Date:** 2026-06-15
Companion to the product docs. Captures positioning, who it's for, how it makes money, and —
most importantly — how each structural weakness is **hedged** (reframed as a design principle,
not a risk). Status tags: ✅ implemented · 🔧 buildable next · 🤝 go-to-market move.

---

## 1. Positioning

> **"Describe a robot → see it move → get a buyable parts list, in 60 seconds."**
> A natural-language **concept front-end** for robotics — the fast ideation + sourcing layer
> that hands off to real CAD / simulation / commerce.

It **is**: idea → recognizable 3D + bill of materials + wiring, instantly, in the browser.
It **is not**: a precision engineering/CAD tool, nor a photoreal text-to-mesh studio. We own
the *front of the funnel*, not the source of truth.

## 2. ICP (ranked by pain × willingness-to-pay × reach)

| Rank | Segment | Pain | Pays? |
|---|---|---|---|
| 1 | **Parts retailers / distributors** (RobotShop, Adafruit, Pololu) | beginners can't assemble a BOM → cart abandonment | **High** (leads = revenue) |
| 2 | **STEM / robotics education** (schools, universities, makerspaces) | install/ROS friction; need classroom BOM | Medium (budget exists) |
| 3 | **Concept / pre-viz** (industrial design, marketing, game/film, pitch decks) | fast robot concept 3D without engineering | Medium–High |
| 4 | Hardware startups / makers | feasibility + BOM sketch before CAD | Low–Medium |

> Makers are easy to reach but low-paying → treat as a **distribution channel**, not a customer.

## 3. Business model

- **Primary (near-term): B2B2C parts commerce.** The Amazon/Nexar/Mouser BOM is the revenue
  engine — affiliate commission + a **"config-to-cart" embeddable widget / lead-gen** sold to
  retailers.
- **Education licensing** (per-seat / per-school SaaS) — sticky, budgeted.
- **API / embed** for distributors and教具 vendors (usage-based).
- **Creative credits** if the concept-viz ICP wins.
- Free consumer tier = growth engine (viral Win98 + auto-3D shareables), paid = export / teams
  / API / quality mode.

## 4. The five hedges (design principles)

### H1 — Engineering precision → **"Own the scope, hand off the rest"**
Position as concept/ideation; never claim precision. Surface the model's assumptions as NOTEs
(thinking partner). Become the *front funnel* to real tools via **export**.
- ✅ **Export to `.glb` / `.stl` / `BOM.csv` / `design.json`** (handoff to Blender / slicers /
  CAD / cart). 🔧 next: URDF export for ROS/sim.

### H2 — Maker low willingness-to-pay → **"Separate who uses from who pays"**
Free for makers (growth), monetize retailers (leads) + schools (licenses). Make outputs
**shareable** so users become the distribution channel.
- ✅ **Shareable `?p=` links** (prompt encoded in URL) + exportable design files. 🤝 affiliate
  BOM + retailer lead-gen as the paid layer.

### H3 — Generative-3D quality vs. text-to-mesh incumbents → **"Change the axis; wrap, don't rebuild"**
Don't compete on photoreal mesh. Our moat is **buyable + wireable + simulatable** — their
meshes are none of those. Stay robotics-domain-specific.
- ✅ design→**BOM**→**MCU pin wiring**→**motion sim** coupling is the differentiator (already
  built). 🔧 optional: wrap Meshy/Tripo for photoreal visuals while keeping the parametric/BOM
  layer as the moat.

### H4 — Parts-integration constraints → **"Diversify supply, turn limits into partnerships"**
Source-agnostic adapter layer; lead with no-gate sources (Nexar/Mouser), Amazon later. Turn the
constraint into a **retailer partnership** (they supply catalog + pay for leads).
- ✅ multi-source schema (Amazon/Nexar/Mouser) + mock-first + no-scraping rule. 🤝 retailer
  pilot = the validation + revenue path. 🔧 curated kit catalog to cover the mechanical gap.

### H5 — Generation latency → **"Instant draft, async upgrade, pick a mode"**
- ✅ **Instant rule-based draft** renders immediately, then the CLI result **upgrades** the spec
  + swaps in the generated 3D. ✅ **Fast / Quality mode** (node count + model: Haiku/Opus).
  🔧 next: node streaming + prompt cache.

## 5. Go-to-market (early)

- **Channel:** maker communities (Reddit/Hackaday), education channels, "build-along" short-form
  video; B2B direct to 1–2 retailers for the widget pilot.
- **Hook:** the viral Win98 + auto-3D shareables (top of funnel).
- **CTA:** "Describe your robot →" on the landing page; gate at save/export/teams.

## 6. Validation plan (do before scaling build)

1. Pick **one** ICP (recommended: parts retailer **or** education) and freeze a one-line hypothesis.
2. Landing page + demo video → measure sign-up / waitlist conversion.
3. **5–8 interviews** with that ICP: "How do you solve this today? What would you pay?"
4. Define the wedge metric: retailer = "widget-attributed conversion lift"; education = "active
   students per class".
5. Use results to decide the real beachhead (commerce vs. creative).

## 7. Honest constraints (kept visible on purpose)

- Outputs are **design sketches**, not validated engineering (labeled as such).
- Generative 3D is **primitive-based** (recognizable, not photoreal).
- Quality-mode generation is **~25–50 s** and **billed** per local-CLI call.
- Live parts APIs / hosted LLM are not yet wired (mock-first / dev-CLI today).
