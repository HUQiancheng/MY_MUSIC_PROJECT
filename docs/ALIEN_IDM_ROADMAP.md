# Alien IDM Roadmap

Long-term development plan for high-complexity, groove-heavy, unpredictable IDM production.

## Current Foundation (Implemented)

- Modular generator in `scripts/idm/` with deterministic seeds.
- Full-track arrangement sections (intro/build/drop/break/drop/outro).
- Sophisticated rhythm logic: probabilistic hits, ghost notes, drill'n'bass micro-fills, glitch bursts.
- Sound design layers: drum synths, FM lead, bass synth, pad bed, ambient field, FX risers.
- Mix stage features: stem EQ, width control, Haas widening, sidechain ducking, saturation, master chain.
- Export pipeline: demo/master wav + organized stems with metadata.

## Production Standard Target

- Sonic target: dense but controlled low-end, unpredictable rhythm language, clear spatial orientation.
- Spatial target:
  - Front/center: kick, bass, core snare energy.
  - Mid field: lead and transient hats with motion.
  - Back/wide field: ambient bed, glitch tails, transitional FX.
- Iteration target: evaluate each render and keep only seeds that pass groove + novelty checks.

## Next Upgrade Steps

1. Build Plugdata mirror modules for each script instrument:
   - `abstractions/synth/sy-idm-bass.pd`
   - `abstractions/synth/sy-idm-fmpluck.pd`
   - `abstractions/fx/fx-idm-glitch.pd`
2. Add sequencer abstractions:
   - `abstractions/rhythm/rh-prob-seq.pd`
   - `abstractions/rhythm/rh-microfill.pd`
3. Add track patch:
   - `patches/composition/comp-alien-idm-track01.pd`
4. Add offline render helper:
   - batch script for multi-seed renders and automatic shortlist by loudness + crest factor.
5. Add subjective review checklist in docs:
   - groove pressure
   - novelty per 8 bars
   - spectral balance
   - field depth and localization clarity

## Usage

```bash
node scripts/idm/generate-track.js --duration 96 --bpm 172 --seed "alien-grid-v1" --name "comp-alien-idm-track01"
```
