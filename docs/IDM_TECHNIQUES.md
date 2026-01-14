# IDM Techniques Reference

Techniques and approaches for creating IDM/experimental electronic music in Plugdata, inspired by Aphex Twin, Autechre, and Squarepusher.

## Core Aesthetic Elements

### Complex Rhythms
- Polyrhythms (multiple simultaneous time signatures)
- Euclidean rhythms (mathematically distributed patterns)
- Metric modulation (tempo relationships)
- Odd time signatures and subdivisions

### Glitch & Digital Artifacts
- Bitcrushing (reduce bit depth)
- Sample rate reduction
- Buffer manipulation and stuttering
- Digital noise and errors as musical elements

### Synthesis Techniques
- FM synthesis (frequency modulation)
- Granular synthesis (microsound)
- Wavetable synthesis
- Additive synthesis
- Physical modeling

### Sound Processing
- Extreme filtering and resonance
- Feedback loops and self-modulation
- Convolution and impulse responses
- Time-stretching and pitch-shifting
- Ring modulation

## Plugdata/ELSE Objects for IDM

### Rhythm & Timing

**Clock Division & Multiplication**
```
[else/tempo 120]     # Master tempo
[else/clock.div 3]   # Divide by 3
[else/clock.mul 2]   # Multiply by 2
```

**Euclidean Rhythms**
```
[else/euclid 5 8]    # 5 hits in 8 steps
```

**Probability Gates**
```
[else/chance 0.7]    # 70% probability
[else/markov]        # Markov chain sequencer
```

### Glitch Effects

**Bitcrushing**
```
[else/crusher~ 8 4]  # 8 bits, 4x sample rate reduction
```

**Buffer Manipulation**
```
[else/player~]       # Advanced sample player
[else/gran~]         # Granular synthesis
[else/freeze~]       # Freeze buffer
```

**Stuttering/Repetition**
```
[else/rec~]          # Record to buffer
[else/player~]       # Playback with speed control
```

### Synthesis

**FM Synthesis**
```
[osc~ 440]           # Carrier
|
[*~ 200]             # Modulation index
|
[osc~ 110]           # Modulator
```

**Wavetable**
```
[else/wavetable~]    # Wavetable oscillator
[else/wt~]           # Wavetable synthesis
```

**Granular**
```
[else/gran~]         # Granular synthesis
[else/grain~]        # Grain generator
```

### Filters & Processing

**Creative Filtering**
```
[else/resonant~]     # Resonant filter
[else/vowel~]        # Vowel filter
[else/vocoder~]      # Vocoder effect
```

**Feedback & Distortion**
```
[else/drive~]        # Distortion/overdrive
[else/fold~]         # Wavefolder
[else/xfade~]        # Crossfade for feedback loops
```

### Modulation

**LFOs**
```
[else/lfo~]          # LFO with multiple waveforms
[else/ramp~]         # Ramp generator
[else/function~]     # Function generator
```

**Envelopes**
```
[else/envelope~]     # Multi-stage envelope
[else/adsr~]         # ADSR envelope
[else/asr~]          # ASR envelope
```

**Random & Chaos**
```
[else/rand.f]        # Random float
[else/brown~]        # Brown noise
[else/perlin~]       # Perlin noise (smooth random)
[else/lorenz~]       # Lorenz attractor (chaos)
```

## Technique Recipes

### Recipe 1: Glitchy Percussion

```
[else/impulse~]      # Trigger
|
[else/brown~]        # Brown noise
|
[else/bp~ 3000 20]   # Narrow bandpass
|
[else/crusher~ 6 8]  # Bitcrush
|
[else/envelope~]     # Short decay
```

### Recipe 2: Evolving Pad

```
[else/rand.f 200 800]  # Random frequency range
|
[else/glide 500]       # Smooth transitions
|
[else/wavetable~]      # Wavetable osc
|
[else/vocoder~]        # Add formants
|
[else/freeverb~]       # Reverb
```

### Recipe 3: Polyrhythmic Sequence

```
[else/tempo 140]
|
+-- [else/clock.div 3]  # 3/4 division
|   |
|   [else/euclid 5 8]
|
+-- [else/clock.div 5]  # 5/4 division
    |
    [else/euclid 3 7]
```

### Recipe 4: Feedback Loop (Careful with volume!)

```
[adc~]               # Audio in
|
[else/xfade~ 0.3]    # Mix with feedback
|
+-- [else/delay~ 250] # 250ms delay
|   |
|   [else/fold~]      # Wavefold
|   |
|   (back to xfade~)
|
[dac~]               # Audio out
```

## Workflow Techniques

### Breakbeat Manipulation

1. Load break into `[else/player~]`
2. Use `[else/slice~]` to chop
3. Rearrange with random or euclidean triggers
4. Time-stretch individual slices
5. Process through bitcrusher or filter

### Generative Sequences

1. Use `[else/markov]` for note probability
2. `[else/rand.seq]` for random sequences
3. Quantize to scales with `[else/scale]`
4. Add swing with `[else/tempo]` swing parameter

### Modulation Routing

1. Create modulation sources (LFOs, envelopes, random)
2. Use `[else/scale]` to map ranges
3. Multiple destinations create evolving sounds
4. LFO-modulate other LFOs for complexity

### Layering

1. Start with simple elements
2. Layer with slight detuning
3. Process each layer differently
4. Combine with `[else/xfade~]` or `[else/mix~]`

## Sound Design Tips

### Creating "Warmth"
- Add subtle distortion (`[else/drive~]`)
- Low-pass filter high frequencies slightly
- Add tape saturation or vinyl noise
- Use analog-modeled filters

### Creating "Glitch"
- Extreme bitcrushing
- Buffer stuttering
- Random sample rate modulation
- Digital clipping and aliasing

### Creating "Space"
- Reverb with long decay
- Multiple delays at different times
- Stereo width with `[else/pan~]` and `[else/spread~]`
- Convolution with interesting impulses

### Creating "Movement"
- Multiple LFOs at different rates
- Slow random modulation
- Tempo-synced filter sweeps
- Panning and spatial modulation

## Experimentation Ideas

- **Feedback everything**: Route outputs back to inputs (carefully!)
- **Wrong sample rates**: Run audio at incorrect speeds
- **Misuse effects**: Use reverbs as instruments
- **Break it**: Push parameters to extremes
- **Happy accidents**: Keep mistakes that sound interesting
- **Layer chaos**: Combine random elements until patterns emerge
- **Constraint**: Limit yourself (one oscillator only, etc.)

## Reference Listening

When designing sounds, analyze:
- How many layers are present?
- What's the rhythmic relationship?
- What kind of synthesis/processing?
- What's the frequency balance?
- How much variation over time?

## Further Exploration

- Study the ELSE library help files (right-click object → Help)
- Explore cyclone objects for Max/MSP techniques
- Check Pure Data mailing list archives
- Analyze patches from other artists
- Document your own discoveries!
