# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a music production project focused on creating IDM (Intelligent Dance Music) using Plugdata (Pure Data fork) on Ubuntu Linux. The goal is to develop tools, patches, and workflows for producing music in the style of artists like Aphex Twin, Autechre, and Squarepusher.

**Key Context:**
- Target platform: Ubuntu Linux (no macOS-specific tools like Max/MSP)
- Primary tool: Plugdata (Pure Data implementation)
- Music genre: IDM/experimental electronic music
- Project stage: Building from scratch

## Technology Stack

### Audio/DSP Environment
- **Plugdata**: Main audio programming environment (Pure Data fork with modern UI)
- Pure Data patches (.pd files) for audio synthesis, processing, and sequencing
- JACK or PulseAudio for Linux audio routing

### Potential Additional Tools
- Python for patch generation, MIDI scripting, or audio analysis
- Shell scripts for workflow automation
- SuperCollider or other synthesis engines as needed

## Project Architecture

This project is in its initial phase. The architecture will evolve to include:

1. **Patches**: Pure Data/Plugdata patches for synthesis, effects, and composition
2. **Scripts**: Automation scripts for patch generation or parameter control
3. **Samples/Assets**: Audio samples and sound design materials
4. **Documentation**: Patch documentation and usage guides

## Development Commands

As the project develops, document key commands here:

### Plugdata
- Launch Plugdata from terminal: `plugdata` or `plugdata <patch-file.pd>`
- Pure Data patches use `.pd` file extension

### Testing Audio
- Test JACK audio system: `jack_simple_client`
- List audio devices: `aplay -l` or `pactl list`
- Monitor CPU/audio performance: `htop` or `top`

## Sound Design Philosophy

The target aesthetic is IDM/experimental electronic music characterized by:
- Complex rhythmic structures and polyrhythms
- Granular synthesis and microsound techniques
- Extensive use of modulation and automation
- Glitchy, digital textures combined with analog warmth
- Unconventional sound sources and processing chains

## Working with Pure Data/Plugdata

### Patch Structure
- Pure Data uses visual programming with objects connected by patch cords
- Each `.pd` file represents a patch (can contain subpatches)
- Objects are created as text (e.g., `osc~`, `dac~`, `*~`)
- Abstractions are reusable patch components

### Key Concepts
- Signal rate (`~` objects) vs control rate (no `~`)
- Message passing and event triggering
- Arrays and tables for wavetables/buffers
- External objects and libraries for extended functionality

### Common Plugdata Objects
- Oscillators: `osc~`, `phasor~`, `noise~`
- Filters: `lop~`, `hip~`, `bp~`, `vcf~`
- Effects: `rev~`, `freeverb~`, `delay~`
- Math: `+~`, `*~`, `expr~`
- Control: `metro`, `random`, `line~`

### Built-in Libraries
- **ELSE**: Pre-installed library with extensive general-purpose objects and high-level abstractions
- **cyclone**: Max/MSP compatibility objects (useful when adapting Max tutorials)
- Libraries can be added via Settings→Paths→Libraries

### IDM-Specific Techniques to Explore
- **Synthesis**: FM synthesis, wavetable synthesis, granular synthesis
- **Rhythm Processing**: Breakbeat deconstruction, time-stretching, complex polyrhythms
- **Glitch Aesthetics**: Bitcrushing (`crusher~`), sample rate reduction, buffer manipulation
- **Modulation**: Extensive LFO routing, envelope looping (envelopes as LFOs)
- **Sampling**: Granular sampling, buffer manipulation, microsound techniques

## File Organization

The project follows a modular structure designed for IDM production workflows:

```
/patches/
├── synthesis/      # Synthesizer patches and sound generators
├── effects/        # Audio processing and effects chains
├── sequencing/     # Pattern generators, sequencers, rhythm engines
├── composition/    # Complete tracks and compositional tools
└── experiments/    # Exploratory patches and sound design sketches

/abstractions/
├── synth/         # Oscillators, filters, envelopes
├── fx/            # Effect processors (reverb, delay, distortion)
├── rhythm/        # Clock dividers, euclidean sequencers
└── utilities/     # Helper objects, converters, math functions

/samples/
├── drums/         # Kick, snare, hi-hat, percussion
├── ambience/      # Pads, drones, atmospheric sounds
├── field-recordings/  # Found sounds and environmental recordings
└── processed/     # Pre-processed or mangled audio

/exports/
├── stems/         # Individual track stems
├── masters/       # Final mastered tracks
└── demos/         # Work-in-progress demos

/scripts/          # Python/shell scripts for automation
/docs/             # Documentation and notes
```

### Naming Conventions

Use category prefixes for easy identification:
- **Patches**: `syn-fm-bell.pd`, `fx-granular-delay.pd`, `seq-polyrhythm.pd`, `comp-track01.pd`
- **Abstractions**: `sy-vco.pd`, `fx-bitcrush.pd`, `rh-clock.pd`, `ut-scale.pd`
- **Samples**: `kick-808-punchy.wav`, `glitch-vinyl-crackle.wav`

### Path Management

Abstractions can be accessed via:
1. `[declare -path ../abstractions/synth]` object in patches
2. Adding `/abstractions` to Plugdata Settings→Paths
3. Placing abstractions in same folder as patches that use them

For cross-computer compatibility, consider using `~/Documents/plugdata/Patches` as an alternative location.

## Notes for Future Development

- Focus on modular, reusable patch components
- Document complex patches with comments (Pd comment objects)
- Version control `.pd` files (they're text-based)
- Consider Max/MSP to Pure Data compatibility when referencing tutorials
- Ubuntu-specific audio configuration may be needed (JACK, ALSA, PulseAudio)
