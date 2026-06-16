# Free options for more realistic 3D rendering

**Date:** 2026-06-16
**Goal:** make RoboForge's 3D look more realistic using only **free / open / CC0** options.
Everything tagged free below is verified free **for commercial use** unless a caution says otherwise.

> **Biggest, immediate win = upgrade the *rendering*, not the geometry.** Our scenes are
> primitive but render with flat lighting. Image-based lighting + tone mapping + ambient
> occlusion + bloom + soft shadows (all MIT, ~one afternoon) make the *same* primitives look
> dramatically more believable — no mesh generation, no GPU server, no cost.

npm-verified (2026-06-16): `@react-three/postprocessing` 3.0.4 (MIT) · `postprocessing` 6.39.1
(Zlib) · `@react-three/drei` 10.7.7 (MIT) · `three` 0.184.0 (MIT) · `@pmndrs/assets` 1.25.0 (MIT).

---

## 1. Recommended FREE realism stack (do this first — all MIT/free)

In rough order of impact-per-effort on a bare primitive scene:

| # | Add | Package (license) | What it does |
|---|-----|-------------------|--------------|
| 1 | **IBL** `<Environment/>` | `@react-three/drei` (MIT) + `@pmndrs/assets` (MIT, self-hosted CC0 HDRIs) | replaces flat ambient with a 360° HDRI → realistic reflections + indirect light on all PBR materials, one tag |
| 2 | **ACES tone mapping** | `three` built-in | cinematic HDR→display curve; no blown whites; `gl={{ toneMapping: ACESFilmicToneMapping }}` |
| 3 | **Ambient occlusion (N8AO)** | `@react-three/postprocessing` (MIT) + `n8ao` (MIT) | contact darkening in crevices → perceived weight/depth (the biggest "fake-real" effect) |
| 4 | **Bloom** | `@react-three/postprocessing` (MIT) | light bleed from bright/emissive surfaces |
| 5 | **Soft shadows** | drei `SoftShadows` (PCSS) or `AccumulativeShadows`+`RandomizedLight` (MIT) | area-light-style soft ground shadows |
| + | SMAA / Vignette / DepthOfField | `@react-three/postprocessing` (MIT) | cheap anti-alias + cinematic polish |

> Production note: use **`@pmndrs/assets`** (self-hosted CC0 HDRIs via npm) for `<Environment files={…}/>`.
> drei's `<Environment preset="…">` pulls from a CDN and the docs say **not for production**.
> Profile with `r3f-perf` (MIT); on low-end GPUs use N8AO `halfRes` and limit stacked effects.

Sources: [react-postprocessing](https://github.com/pmndrs/react-postprocessing) · [n8ao](https://github.com/N8python/n8ao) · [drei Environment](https://drei.docs.pmnd.rs/staging/environment) · [@pmndrs/assets](https://github.com/pmndrs/assets) · [realism-effects (SSGI/SSR, MIT)](https://github.com/0beqz/realism-effects)

## 2. Free CC0 assets (HDRIs / textures / models)

Download/bundle at **build time** → only the CC0 asset license applies (zero restriction).

| Source | Assets | License | Access |
|--------|--------|---------|--------|
| **Poly Haven** | 750+ HDRIs, 700+ PBR textures, models | **CC0** (no attribution) | [api.polyhaven.com](https://polyhaven.com/our-api) + `dl.polyhaven.org` CDN — *commercial **API** calls need a free license; downloaded assets are unrestricted* |
| **ambientCG** | 400+ HDRIs, 2400+ PBR materials | **CC0** | [ambientcg.com/api/v2](https://docs.ambientcg.com/api/) |
| **@pmndrs/assets** | 18 HDRIs (Poly Haven subset) | **CC0**, MIT pkg | `npm i @pmndrs/assets` → `import { city } from '@pmndrs/assets/hdri'` (self-hosted, production-safe) |
| **Kenney.nl** | CC0 game model kits (glTF/OBJ/FBX) | **CC0** | manual download |
| **Quaternius** | CC0 modular low-poly packs | **CC0** | manual download |
| **Poly Pizza** | 7000+ low-poly models | mixed CC0/CC BY | REST API (free hobby, paid commercial) |
| **Khronos glTF-Sample-Assets** | reference GLB/GLTF | **mixed** — many CC BY, some CC0 | raw GitHub CDN; check `Models.md` per model |

Sources: [Poly Haven license](https://polyhaven.com/license) · [ambientCG license](https://docs.ambientcg.com/license/) · [Kenney](https://kenney.nl/support) · [Quaternius](https://quaternius.com/) · [Khronos models](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Models.md)

## 3. Free / open text-or-image → real 3D mesh (replace primitives with meshes)

For *photoreal meshes* you need a generative model. These run offline on a GPU (or a free
Hugging Face Space) and output GLB/OBJ you load with `GLTFLoader`. **License is the gotcha.**

### Truly free for commercial use (MIT / Apache-2.0)
| Model | Input | Output | License | Note |
|-------|-------|--------|---------|------|
| **TripoSR** | image | OBJ/mesh | **MIT** | fastest, ~6 GB VRAM; great entry point |
| **InstantMesh** | image | OBJ/GLB | **Apache-2.0** | richer topology; ~16 GB VRAM |
| **TRELLIS / TRELLIS.2** (Microsoft) | **text** or image | GLB + PLY | **MIT** (audit submodules) | best open-source quality 2025; ~16 GB VRAM |
| **LGM** | image | PLY→GLB | **MIT** | feed-forward Gaussians, fast |
| **Shap-E / Point-E** (OpenAI) | **text** or image | mesh / point cloud | **MIT** | 2023 quality (coarser) but native text-to-3D |
| **Zero123++** | image | multi-view | **Apache-2.0** | a stage, not a final mesh |

### Commercially restricted — read before use
- **SF3D / Stable Fast 3D**, **Stable Zero123C**: Stability Community License — OK only if org revenue **< $1M/yr**.
- **Hunyuan3D-2** (Tencent): OK only if **MAU < 1M**, and **restricted in EU/UK/South Korea**.
- **OpenLRM**: code Apache-2.0 but **weights are CC-BY-NC (non-commercial only)**.
- **Stable Zero123** (original): research-only.

### Hosted services with a free tier
- **Meshy** — 100 credits/mo, GLB/OBJ/FBX; free outputs are **CC BY 4.0 (must credit Meshy)**; no API on free tier.
- **Tripo3D** — free tier is explore-only (**no commercial use**); paid for commercial/API.
- **fal.ai / Replicate** — not free but cheap pay-per-call (e.g. fal TripoSR ~$0.07/gen), **output is yours**, simple REST API → good for on-demand from a backend.
- **Hugging Face Spaces** — free to test, not a stable production API.

Sources: [TripoSR (MIT)](https://github.com/VAST-AI-Research/TripoSR) · [InstantMesh](https://github.com/TencentARC/InstantMesh) · [TRELLIS](https://github.com/microsoft/TRELLIS) · [Hunyuan3D-2 license](https://github.com/Tencent-Hunyuan/Hunyuan3D-2/blob/main/LICENSE) · [Stability license](https://stability.ai/license) · [Meshy pricing](https://www.meshy.ai/pricing) · [fal.ai 3D](https://fal.ai/3d-models)

## 4. "Free skills/plugins" — what's actually available

- **Free npm plugins (the real win):** the §1 stack — all MIT/Zlib, install + use, no account.
- **Free assets:** §2 CC0 sources.
- **Local Claude Code skills / MCP:** there is **no dedicated free "photoreal 3D render" skill or MCP**
  in this environment (the `fal-ai-media` skill exists but fal is paid). The free path is the npm
  plugins + CC0 assets above, optionally wrapping an open model offline.

## 5. Integration paths for RoboForge

- **A. Render upgrade (recommended, free, now):** add the §1 stack to `ui/Viewport3D.tsx`. Keeps the
  LLM-generated primitive scenes but renders them realistically. No new infra.
- **B. Real meshes, offline:** run TripoSR/TRELLIS once on a GPU/Colab → export GLB → load via
  `GLTFLoader` (drei `useGLTF`). Static, free, license-clean (prefer MIT/Apache models).
- **C. Real meshes, on-demand:** browser → our serverless proxy → fal.ai/Replicate → GLB back. Not
  free but cheap; pairs with the existing local-CLI pattern.

## 6. Recommendation for RoboForge

1. **Now (free):** ship the §1 render stack — IBL (`@pmndrs/assets` HDRI) + ACES tone mapping +
   N8AO + Bloom + soft shadows. Biggest realism jump, zero cost, MIT.
2. **Next (free-ish):** offer an optional **GLB import** slot so any externally-generated mesh
   (TripoSR/TRELLIS offline, or a CC0 model) can replace the primitive scene.
3. **Later (paid, cheap):** wire fal.ai/Replicate behind the serverless proxy for on-demand
   photoreal meshes, gated as a "pro" feature (ties to the monetization hedge).

> Honest limit: even the §1 upgrade makes *primitives* look good, not photoreal. True photoreal =
> real meshes (§3) + this rendering stack. The free, license-clean photoreal route is **open model
> offline → GLB → load**, not an in-browser free API.
