# Abstractions

Reusable Pure Data components for use across multiple patches.

## Structure

- **synth/**: Oscillators, filters, envelopes, synthesis building blocks
- **fx/**: Effect processors (reverb, delay, distortion, etc.)
- **rhythm/**: Clock dividers, euclidean sequencers, drum modules
- **utilities/**: Helper objects, converters, math functions

## Creating Abstractions

1. Build and test functionality in a main patch
2. Extract to separate `.pd` file with clear interface
3. Use `$1`, `$2`, etc. for creation arguments
4. Add inlet/outlet comments for documentation
5. Place in appropriate subfolder

## Naming Convention

Use two-letter prefixes for easy identification:
- `sy-vco.pd` - Voltage-controlled oscillator
- `fx-bitcrush.pd` - Bitcrusher effect
- `rh-clock.pd` - Clock generator
- `ut-scale.pd` - Value scaler utility

## Path Setup

To use these abstractions, add to your patches:
```
[declare -path ../abstractions/synth]
[declare -path ../abstractions/fx]
```
Or add `/abstractions` folder to Plugdata global paths.
