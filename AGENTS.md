# Repository Guidelines

This repository is a Plugdata (Pure Data) project for IDM-focused sound design and composition on Ubuntu (no Max/MSP). Keep changes modular, documented, and easy to reuse across patches and abstractions.

## Project Structure & Module Organization
- `patches/` is the main workspace, split into `synthesis/`, `effects/`, `sequencing/`, `composition/`, and `experiments/`.
- `abstractions/` holds reusable building blocks (`synth/`, `fx/`, `rhythm/`, `utilities/`).
- `samples/` stores source audio; `exports/` stores rendered demos, stems, and masters.
- `docs/` captures techniques and notes; `scripts/` contains automation helpers.

## Technology & Libraries
- Primary environment: Plugdata (Pure Data fork).
- Built-in libraries: ELSE and cyclone (useful for IDM techniques and Max/MSP compatibility).
- Audio routing: PulseAudio or JACK on Ubuntu as needed.

## Build, Test, and Development Commands
There is no build system. Work is driven by Plugdata:
- `plugdata` launches the UI.
- `plugdata patches/experiments/exp-my-idea.pd` opens a specific patch.
- `aplay -l` or `pactl list` lists audio devices; `speaker-test -c 2` validates output.
- `jack_simple_client` can verify JACK if you use low-latency routing.
- `htop` or `top` helps monitor CPU when patches are heavy.

## Coding Style & Naming Conventions
- Patch files: `syn-...`, `fx-...`, `seq-...`, `comp-...`, `exp-...` (e.g., `syn-fm-bell.pd`, `comp-track01.pd`).
- Abstractions: two-letter prefixes (`sy-`, `fx-`, `rh-`, `ut-`) (e.g., `fx-bitcrush.pd`).
- Samples: lowercase, hyphenated, descriptive (e.g., `kick-808-punchy.wav`), preferably WAV/AIFF at 44.1kHz or 48kHz.
- Use `[declare -path ../abstractions/<subfolder>]` or add `/abstractions` to Plugdata paths for portability.
- Document patch I/O with comment objects; use `$1`, `$2`, etc. for abstraction arguments.

## Testing Guidelines
Automated tests are not defined. Validate changes by opening patches in Plugdata, enabling DSP, and listening for expected behavior. For CPU-heavy patches, check that playback remains stable without dropouts.

## Commit & Pull Request Guidelines
- Commit messages are short, all-caps, and end with a period (e.g., `ADD GRANULAR DELAY ABSTRACTION.`).
- PRs should describe intent, list affected patches/abstractions, and include screenshots or audio renders when the change impacts sound or UI. Place renders in `exports/demos/` when applicable.
