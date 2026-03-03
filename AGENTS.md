# Repository Guidelines

## Canonical Documentation

- `README.md` is the single source of truth for onboarding, structure, workflow, naming, and commands.
- Do not reintroduce split docs (`GETTING_STARTED.md`, `instructions.md`, `PROJECT_STRUCTURE.md`).

## Project Context

- Ubuntu-based IDM production project.
- Primary environment: Plugdata (Pure Data fork), no Max/MSP dependency.
- Keep all work modular and reusable across patches/abstractions/scripts.

## Working Rules

- Respect structure in `README.md`:
  - `patches/` for production patches
  - `abstractions/` for reusable components
  - `samples/` for source material
  - `scripts/` for automation/render/scaffolding
  - `exports/` for generated audio outputs (ignored by git)
- Prefer role-based, composable patch design over monolithic patches.
- Document non-obvious patch I/O and abstraction arguments.

## Naming

- Patches: `syn-*`, `fx-*`, `seq-*`, `comp-*`, `exp-*`
- Abstractions: `sy-*`, `fx-*`, `rh-*`, `ut-*`
- Samples: lowercase, hyphenated, descriptive

## Validation

- Patch/audio validation is manual in Plugdata.
- For JS renderer changes, run `node --test tests/*.test.js` where applicable.

## Git Hygiene

- Never commit generated renders from `exports/`.
- Keep `.gitignore` strict for generated/temp/editor files.
- Use `.gitkeep` only when a tracked empty directory is truly necessary.
