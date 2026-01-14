# Project Structure & Methodology

This document explains the file management methodology for this IDM music production project using Plugdata.

## Philosophy

This structure is designed to support:
1. **Modular development**: Build reusable components (abstractions) used across multiple patches
2. **Iterative workflow**: Easy experimentation with organized results
3. **Collaboration & version control**: Clear organization for git tracking
4. **Cross-project compatibility**: Follows Plugdata best practices for portability

## Directory Structure

### `/patches` - Main Working Files

Your primary creative workspace, organized by function:

- **synthesis/**: Sound generators and synth patches
  - FM synthesizers, additive synthesis, wavetable oscillators
  - Experimental sound design patches

- **effects/**: Audio processing chains
  - Reverbs, delays, filters, distortion
  - Complex effect combinations and experimental processors

- **sequencing/**: Pattern generation and rhythm
  - Step sequencers, euclidean rhythm generators
  - MIDI processors, clock dividers
  - Polyrhythmic and algorithmic sequencers

- **composition/**: Complete tracks and arrangements
  - Full compositions combining multiple elements
  - Performance patches for live use

- **experiments/**: Sandbox for ideas
  - Quick sketches and proof-of-concepts
  - Testing ground for techniques
  - Failed experiments (keep for learning!)

### `/abstractions` - Reusable Components

Building blocks used across patches. Think of these as your personal library:

- **synth/**: Synthesis building blocks
  - Custom oscillators (`sy-osc.pd`)
  - Filters and envelopes (`sy-vcf.pd`, `sy-adsr.pd`)
  - Waveshapers and distortion (`sy-waveshape.pd`)

- **fx/**: Effect processors
  - Granular processors (`fx-grain.pd`)
  - Custom reverbs and delays
  - Bitcrushers and lo-fi effects

- **rhythm/**: Timing and rhythm utilities
  - Clock generators (`rh-clock.pd`)
  - Euclidean pattern generators (`rh-euclid.pd`)
  - Probability gates (`rh-prob.pd`)

- **utilities/**: Helper functions
  - Math operations (`ut-scale.pd`, `ut-quantize.pd`)
  - MIDI utilities
  - Conversion tools

**Creating abstractions:**
1. Build functionality in a main patch first
2. Test thoroughly
3. Extract to separate `.pd` file with clean interface
4. Use `$1`, `$2` for creation arguments
5. Document with comments

### `/samples` - Audio Files

Organized source material:

- **drums/**: One-shot percussion samples
- **ambience/**: Atmospheric recordings and drones
- **field-recordings/**: Environmental sounds, found sounds
- **processed/**: Pre-processed or mangled samples

**Best practices:**
- Use WAV or AIFF for quality
- Consistent sample rate (44.1kHz or 48kHz)
- Descriptive naming: `kick-808-punchy.wav`, `glitch-circuit-bend.wav`

### `/exports` - Rendered Output

Final and work-in-progress audio:

- **stems/**: Individual tracks for mixing
- **masters/**: Final mastered tracks
- **demos/**: Sketches and WIP exports

### `/scripts` - Automation Tools

Python and shell scripts for:
- Generating patches programmatically
- Batch audio processing
- Parameter automation via OSC
- Build and deployment tools

### `/docs` - Documentation

Notes, research, and documentation:
- Technique documentation
- Patch usage guides
- Links and research materials

## Naming Conventions

Consistent naming helps navigation and organization:

### Patches (in `/patches`)
Format: `[category]-[description].pd`

Examples:
- `syn-fm-bell.pd` - FM synthesis bell sound
- `fx-granular-delay.pd` - Granular delay effect
- `seq-polyrhythm-5-3.pd` - 5 against 3 polyrhythm
- `comp-track-001.pd` - First complete composition
- `exp-weird-feedback.pd` - Experimental feedback patch

### Abstractions (in `/abstractions`)
Format: `[2-letter-prefix]-[name].pd`

Prefixes:
- `sy-` = synthesis
- `fx-` = effects
- `rh-` = rhythm
- `ut-` = utility

Examples:
- `sy-fm-op.pd` - FM synthesis operator
- `fx-bitcrush.pd` - Bitcrusher
- `rh-clock-div.pd` - Clock divider
- `ut-midi-scale.pd` - MIDI note scaler

### Audio Files
Format: `[type]-[description]-[variant].wav`

Examples:
- `kick-808-punchy.wav`
- `snare-metal-reverb.wav`
- `ambient-warehouse-long.wav`
- `glitch-digital-stutter-01.wav`

## Workflow Recommendations

### Starting a New Patch

1. Choose appropriate folder in `/patches`
2. Use descriptive name with category prefix
3. Add `[declare -path ../abstractions/[subfolder]]` for needed abstractions
4. Include comment objects documenting purpose and I/O

### Building Abstractions

1. Prototype in main patch
2. Identify reusable components
3. Extract to abstraction with clear interface
4. Test in multiple contexts
5. Document creation arguments

### Version Control with Git

Pure Data files are text-based and git-friendly:
- Commit working patches regularly
- Use branches for experimental features
- Tag releases/milestones
- Include comments describing changes

### Path Management

Three ways to use abstractions:

1. **Declare in patch**: `[declare -path ../abstractions/synth]`
2. **Global settings**: Plugdata Settings→Paths
3. **Local placement**: Copy abstraction to patch folder

For portability, prefer method #1 (declare objects).

## Tips for IDM Production

### Modular Approach
Build small, focused abstractions that do one thing well. Combine them for complex results.

### Experimentation First
Use `/patches/experiments` freely. Not everything needs to be polished.

### Document Discoveries
When you find an interesting technique, document it in `/docs` or in patch comments.

### Iterate on Abstractions
As you use abstractions across projects, refine and improve them. The library grows with experience.

### Save Interesting States
Use Plugdata's preset system to save parameter combinations worth revisiting.

## References

- [Plugdata Documentation](https://plugdata.org/documentation.html)
- [Plugdata GitHub](https://github.com/plugdata-team/plugdata)
- [Getting Started with Plugdata Tutorial](https://polarity.me/posts/polarity-music/2022-10-26-plugdata/)
- [Pure Data Forums - File Organization Discussion](https://forum.pdpatchrepo.info/topic/11448/how-do-you-guys-organize-your-files)
