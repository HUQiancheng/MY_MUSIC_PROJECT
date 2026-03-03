# CLAUDE.md

Guidance for AI/code assistants working in this repository.

## Canonical Docs

- `README.md` is the canonical project document.
- Do not duplicate onboarding/structure docs elsewhere.

## Core Context

- Ubuntu + Plugdata (Pure Data fork) IDM production project.
- Goal: modular sound design, reusable abstractions, scripted render tooling.
- Favor maintainable architecture over one-off patches.

## Practical Rules

- Follow naming and folder conventions in `README.md`.
- Keep patches and abstractions modular.
- For scripted renderer work:
  - keep `scripts/idm/controllers`, `scripts/idm/services`, and `scripts/idm/lib` responsibilities clear
  - add/update tests under `tests/` for JS workflow changes
- Validate audio behavior manually in Plugdata when patch behavior changes.

## Git Hygiene

- Generated output must stay out of git (`exports/` ignored).
- Keep temporary/editor artifacts ignored.
- Keep `.gitkeep` usage minimal and intentional.
