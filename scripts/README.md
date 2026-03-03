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

The folder `scripts/idm/` contains a modular generative track renderer for full-length IDM pieces.

Run:

```bash
node scripts/idm/generate-track.js --duration 96 --bpm 172 --seed "alien-grid-v1" --name "comp-alien-idm-track01"
```

Canonical commission render (active version):

```bash
node scripts/idm/render-commission-master.js --duration 180 --bpm 186 --seed "fractured-meridian-main" --name "fractured-meridian"
```

Outputs:

- `exports/demos/<name>-<timestamp>.wav`
- `exports/masters/<name>-<timestamp>.wav`
- `exports/stems/<name>-<timestamp>/` (individual stems + metadata)
- Commission canonical set: `exports/demos/fractured-meridian.wav`, `exports/masters/fractured-meridian.wav`, `exports/stems/fractured-meridian/`

Main modules:

- `scripts/idm/lib/prng.js`: deterministic seeded random utilities
- `scripts/idm/lib/instruments.js`: kick/snare/hat/bass/fm/glitch/ambient synthesis
- `scripts/idm/lib/audio-utils.js`: EQ, delay, widening, ducking, wav writing
