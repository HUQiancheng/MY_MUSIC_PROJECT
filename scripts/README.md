# Scripts

Automation scripts and helper tools.

## Purpose

- Python scripts for generating Pure Data patches programmatically
- Shell scripts for batch processing audio
- MIDI utilities and parameter automation
- Build scripts for complex patch workflows

## Examples

- OSC control scripts for live parameter manipulation
- Patch template generators
- Audio file conversion utilities
- Backup and versioning tools

## IDM Generator

The folder `scripts/idm/` contains a modular generative track system with explicit controllers and services:

- `controllers/`: CLI-facing orchestration
- `services/`: reusable workflow logic (rendering, scaffolding)
- `lib/`: DSP primitives, theory, timbre, scheduling

Run:

```bash
node scripts/idm/generate-track.js --duration 96 --bpm 172 --seed "alien-grid-v1" --name "comp-alien-idm-track01"
```

Canonical commission render (active version):

```bash
node scripts/idm/render-commission-master.js --duration 180 --bpm 174 --seed "fractured-meridian-main" --name "fractured-meridian"
```

Patch-tree scaffold for modular composition workspace:

```bash
node scripts/idm/scaffold-patch-tree.js --name "fractured-meridian"
```

Outputs:

- Generic renderer (`generate-track.js`): timestamped files in `exports/demos/`, `exports/masters/`, and `exports/stems/`.
- Canonical commission renderer (`render-commission-master.js`): stable overwrite targets `exports/demos/fractured-meridian.wav`, `exports/masters/fractured-meridian.wav`, and `exports/stems/fractured-meridian/`.

Main modules:

- `scripts/idm/lib/prng.js`: deterministic seeded random utilities
- `scripts/idm/lib/instruments.js`: kick/snare/hat/bass/fm/glitch/ambient synthesis
- `scripts/idm/lib/audio-utils.js`: EQ, delay, widening, ducking, wav writing
- `scripts/idm/controllers/generate-track-controller.js`: CLI controller for the generic renderer
- `scripts/idm/services/generate-track-service.js`: generic render pipeline service
- `scripts/idm/controllers/commission-controller.js`: CLI controller for commission renders
- `scripts/idm/services/commission-render-service.js`: render pipeline service for WAV/stems/metadata
- `scripts/idm/controllers/patch-tree-controller.js`: CLI controller for patch workspace generation
- `scripts/idm/services/patch-tree-service.js`: creates role-oriented patch directory trees
- `scripts/idm/lib/commission/form.js`: section arc + motif transformation logic
- `scripts/idm/lib/commission/narrative.js`: section role-activity plans and handoff emphasis
- `scripts/idm/lib/commission/harmony.js`: harmony cycle and scale-locked pitch conversion
- `scripts/idm/lib/commission/timbres.js`: 30+ timbre role registry + synthesis emitters
- `scripts/idm/lib/commission/arrangement.js`: arrangement wrapper for conductor scheduler
- `scripts/idm/lib/commission/mix.js`: bus processing, ducking, and final master chain
