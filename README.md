# MY_MUSIC_PROJECT

IDM production workspace built for Ubuntu with Plugdata (Pure Data fork), focused on modular sound design, reusable patch architecture, and scripted rendering workflows.

## Mission

This repository exists to build serious, from-scratch IDM production capability with:

- modular engineering discipline
- iterative experimentation
- reusable abstractions
- documented workflows

Musical direction: Aphex Twin / Autechre / Squarepusher inspired rhythm, timbre, and structure design.

## Quick Start

### Prerequisites

- Plugdata installed (`plugdata`)
- Ubuntu audio stack available (PulseAudio or JACK)

### Audio Sanity Check

```bash
aplay -l
pactl list
speaker-test -c 2
```

### Open Plugdata

```bash
plugdata
```

Or open a specific patch:

```bash
plugdata patches/experiments/exp-my-idea.pd
```

## First Patch (Minimal Tone)

Create and connect:

- `[osc~ 440]`
- `[*~ 0.3]`
- `[dac~]`

Turn DSP on (`Ctrl+.`), then tweak frequency with `[nbx]` into oscillator pitch.

## Directory Structure

- `patches/`: main Plugdata workspace
  - `synthesis/`, `effects/`, `sequencing/`, `composition/`, `experiments/`
- `abstractions/`: reusable patch components
  - `synth/`, `fx/`, `rhythm/`, `utilities/`
- `samples/`: source audio material
- `exports/`: rendered demos/stems/masters (ignored by git)
- `scripts/`: automation, renderers, scaffolding
- `docs/`: additional technique notes and design docs

## Patch + Abstraction Workflow

1. Prototype in `patches/experiments/`.
2. Promote stable patch work into functional folders (`synthesis`, `effects`, etc.).
3. Extract reusable components into `abstractions/*`.
4. Keep each abstraction interface documented (inlets/outlets + args).
5. Use `[declare -path ../abstractions/<subfolder>]` for portability.

## Naming Conventions

### Patches

- `syn-...`, `fx-...`, `seq-...`, `comp-...`, `exp-...`
- examples: `syn-fm-bell.pd`, `comp-track01.pd`

### Abstractions

- `sy-...`, `fx-...`, `rh-...`, `ut-...`
- examples: `sy-vco.pd`, `rh-clock.pd`

### Samples

- lowercase, hyphenated, descriptive
- example: `kick-808-punchy.wav`

## Scripted IDM Renderer Architecture

Under `scripts/idm/`:

- `controllers/`: CLI-level orchestration
- `services/`: render/scaffold services
- `lib/`: DSP/theory/mix/scheduler/timbre core

Key entrypoints:

- `node scripts/idm/render-commission-master.js --duration 180 --bpm 174 --seed "fractured-meridian-main" --name "fractured-meridian"`
- `node scripts/idm/generate-track.js --duration 96 --bpm 172 --seed "alien-grid-v1" --name "comp-alien-idm-track01"`
- `node scripts/idm/scaffold-patch-tree.js --name "fractured-meridian"`

## Composition Tree Scaffolding

Use scaffold to create modular role-oriented patch trees inside `patches/composition/`:

- conductor/control layer
- role patches (drums, bass, harmony, riffs, textures)
- transition/handoff patches
- print/reference subfolder

## Testing and Validation

Plugdata/Pd changes:

- validate by opening patches and listening with DSP enabled
- monitor CPU stability with `htop`/`top` when patches get heavy

Node render/test changes:

- run `node --test tests/*.test.js`
- smoke-render and confirm outputs in `exports/`

## Git Hygiene

- never commit generated renders from `exports/`
- keep temporary and editor backup files ignored
- use `.gitkeep` only when a tracked empty directory is truly needed

## References

- Plugdata: https://plugdata.org/documentation.html
- Plugdata GitHub: https://github.com/plugdata-team/plugdata
- ELSE library: https://github.com/porres/pd-else
- Pure Data tutorials: https://puredata.info/docs/tutorials
