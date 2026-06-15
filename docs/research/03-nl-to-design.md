# Research 03 — Natural-Language → Robot Design Architecture

> **Provenance:** parallel research subagent (Sonnet), 2026-06-15. Distinguishes proven vs
> speculative; `UNVERIFIED`/`speculative` flags preserved. Evidence base for `FEATURES/F3`.

## Recommended MVP Architecture (pipeline)
Three-stage funnel; only stage 1 is the LLM:
1. **NL intake** — free-text goal.
2. **Requirement extraction (LLM, JSON-mode/tool-use, strict schema)** → `RobotRequirementsSpec`.
3. **Archetype matching (rule-based)** → top-1 archetype + parameter template.
4. **Catalog retrieval (optional RAG / keyword at MVP)** → candidate components per slot.
5. **Parameter sizing (closed-form formulas)** → torque, battery, reach; flag out-of-bounds.
6. **Design spec output** — archetype, topology, params table, parts shortlist.
7. **(Optional) CAD stub** — substitute params into an OpenSCAD/KCL template.

## Requirement Extraction Schema (`RobotRequirementsSpec`)
Strict JSON Schema; optional fields **null** (not hallucinated). Fields: `task_summary`
(verbatim), `locomotion_type` (enum incl. `unknown`), `wheel_count?`, `payload_kg?`,
`total_mass_budget_kg?`, `manipulation{required, dof?, grasp_type?, object_description?,
object_mass_kg?}`, `environment{indoor_outdoor, surface_type?, terrain_slope_deg?,
operating_range_m?}`, `size_constraints{max_length/width/height_mm?, size_class?}`,
`sensors_required[]`, `autonomy_level?`, `budget_usd?`, `power_source?`, `mission_duration_min?`,
`open_constraints[]`, `ambiguities[]`.
Enforce via Anthropic tool-use (`input_schema`) or OpenAI `response_format: json_schema strict`.
([OpenAI structured outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/))

## Design Generation Approaches (ladder)
- **L1 Archetype + rule-based fill (MVP):** 5–10 templates; deterministic engineering sizing.
  Proven for physical robots: [Metabot](https://github.com/Rhoban/Metabot) (parametric quadruped),
  [OPPAS](https://github.com/FabReyesMecha/OPPAS) (parametric snake).
- **L2 LLM tool/function-calling** into sizing/catalog functions. ([TOOLCAD](https://arxiv.org/pdf/2604.07960))
- **L3 RAG over parts catalog.** ([RAG in eng. design, arXiv:2307.06985](https://arxiv.org/abs/2307.06985))
- **L4 Constraint solving / optimization** (SciPy/CVXPY; BILP for actuation
  [arXiv:2307.11573](https://arxiv.org/pdf/2307.11573)).
- **L5 LLM morphology co-design + sim** — [RoboMorph](https://arxiv.org/abs/2407.08626),
  [RoboMoRe](https://arxiv.org/abs/2506.00276). Research-grade / **speculative** for production.
- **L6 Text-to-CAD geometry** — [Zoo](https://zoo.dev/machine-learning-api), AdamCAD, NURBGen.
  Generic CAD, not robot-aware; **partially UNVERIFIED** end-to-end for robots.

## Engineering sizing formulas (established)
- Torque: `τ = (m_total·g·μ_r·r_wheel)/η_drivetrain`, ×SF 1.5–2.
  ([DFRobot](https://wiki.dfrobot.com/How_to_Calculate_the_Motor_Torque_for_a_Mobile_Robot),
  [ThinkRobotics](https://thinkrobotics.com/blogs/learn/basics-of-motor-sizing-and-selection-for-robots-a-complete-engineering-guide))
- Battery: `C_mAh = (P_drive_W·t_min·60/V_nominal)·1000·SF`.

## Prior Art (named, linked)
Lang2Morph [arXiv:2509.18937](https://arxiv.org/abs/2509.18937); LM-Based Soft Modular Robot
[arXiv:2411.00345](https://arxiv.org/abs/2411.00345); RobotDesignGPT
[arXiv:2601.11801](https://arxiv.org/pdf/2601.11801); RoboMorph
[arXiv:2407.08626](https://arxiv.org/abs/2407.08626); RoboMoRe
[arXiv:2506.00276](https://arxiv.org/abs/2506.00276); TOOLCAD
[arXiv:2604.07960](https://arxiv.org/pdf/2604.07960); Zoo Text-to-CAD/KCL
([zoo.dev](https://zoo.dev/research/introducing-text-to-cad)); Onshape URDF export
([onshape robotics](https://www.onshape.com/en/solutions/robotics)); OpenAI Structured Outputs.

## Growth Path
- **P1 (0–3mo):** extraction + 5–10 archetypes + closed-form sizing; optional OpenSCAD preview.
- **P2 (3–6mo):** catalog vector store; LLM tool-use; surface ambiguities; re-rank + explain.
- **P3 (6–12mo):** constraint optimization (Pareto); Onshape/FreeCAD parametric + URDF export.
- **P4 (12mo+, speculative):** sim-in-the-loop search; LLM topology variation; text-to-CAD output.

## Open Uncertainties
1. Archetype coverage vs goal diversity → need explicit low-confidence/no-match path.
2. Hallucination on optional fields → null defaults + `ambiguities`.
3. Parts catalog sourcing/licensing → manual curation at MVP (no unified open catalog).
4. Torque coefficients application-specific → safety factors heuristic.
5. Text-to-CAD robot-validity → **UNVERIFIED**.
6. Sim-in-the-loop latency for interactive use → **UNVERIFIED**.
7. Lang2Morph generalization beyond hands → open research.
