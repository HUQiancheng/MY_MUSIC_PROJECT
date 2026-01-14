# Getting Started

Quick guide to start making music with this project.

## Prerequisites

### Install Plugdata
```bash
# Download from https://plugdata.org/
# Or use package manager if available
```

Plugdata comes with:
- ELSE library (comprehensive object collection)
- cyclone library (Max/MSP compatibility)

### Audio Setup (Ubuntu)

1. **Check audio devices:**
   ```bash
   aplay -l          # List playback devices
   pactl list        # PulseAudio devices
   ```

2. **Test audio:**
   ```bash
   speaker-test -c 2  # Test stereo output
   ```

3. **Optional - JACK for low latency:**
   ```bash
   sudo apt install jackd2 qjackctl
   # Configure with qjackctl GUI
   ```

## Your First Patch

### 1. Launch Plugdata
```bash
cd patches/experiments
plugdata
```

### 2. Create a Simple Synth

In Plugdata, create these objects (right-click → Put):

```
[osc~ 440]          # 440 Hz oscillator
|
[*~ 0.3]            # Volume control (30%)
|
[dac~]              # Audio output (Digital-to-Analog Converter)
```

Connect them with patch cords (click output → click input).

### 3. Turn on Audio

- Click the checkbox/toggle in the top right (or Ctrl+.)
- You should hear a tone!
- Edit mode: Ctrl+E

### 4. Make It Interactive

Add a number box to control pitch:
```
[nbx]               # Number box
|
[osc~ 440]
|
[*~ 0.3]
|
[dac~]
```

Now you can change the frequency in real-time!

## Project Workflow

### Starting New Work

1. **Experiment first:**
   ```bash
   cd patches/experiments
   plugdata exp-[your-idea].pd
   ```

2. **Organize when it works:**
   - Move to appropriate folder (`synthesis/`, `effects/`, etc.)
   - Extract reusable parts as abstractions

3. **Use abstractions:**
   Add to your patch:
   ```
   [declare -path ../../abstractions/synth]
   [sy-vco]  # Now you can use your custom abstractions
   ```

### Building a Track

1. Create composition patch:
   ```bash
   cd patches/composition
   plugdata comp-track-001.pd
   ```

2. Combine elements:
   - Load synth patches as subpatches
   - Add effects chains
   - Build sequencing/rhythm

3. Export audio:
   - Use `[writesf~]` object to record
   - Save to `/exports/demos/`

## Essential Plugdata Shortcuts

- **Ctrl+E**: Toggle Edit mode
- **Ctrl+N**: New object
- **Ctrl+.**: Start/stop audio (DSP)
- **Ctrl+M**: New message box
- **Ctrl+S**: Save patch
- **Ctrl+/**: New comment

## IDM Sound Design Quick Starts

### Glitchy Drums
```
[noise~]            # White noise
|
[bp~ 2000 10]      # Bandpass filter
|
[*~]                # VCA
|
[line~]             # Envelope
```

### FM Bell
```
[osc~ 440]          # Carrier
  |
  [*~ 200]          # Modulation amount
  |
[osc~ 220]          # Modulator (creates harmonics)
|
[*~ 0.3]
|
[dac~]
```

### Granular Texture
Look into ELSE library:
- `[gran~]` - Granular synthesis
- `[player~]` - Buffer playback
- `[pvoc~]` - Phase vocoder

## Common Issues

### No audio output
- Check DSP is on (Ctrl+.)
- Verify audio device in Preferences→Audio Settings
- Test with `speaker-test -c 2` in terminal

### Can't find abstractions
- Use `[declare -path]` in patch
- Or add to Settings→Paths
- Or copy abstraction to same folder as patch

### High CPU usage
- Reduce sample rate in audio settings
- Optimize patches (avoid redundant calculations)
- Use block size adjustments

## Next Steps

1. **Explore ELSE library:** Type object name and Ctrl+click for help
2. **Check `/docs` folder** for collected techniques
3. **Study example patches** from Plugdata examples menu
4. **Experiment in `/patches/experiments`** without pressure

## Learning Resources

- [Plugdata Documentation](https://plugdata.org/documentation.html)
- [ELSE library documentation](https://github.com/porres/pd-else)
- [Pure Data tutorial patches](https://puredata.info/docs/tutorials)
- Pure Data mailing list and forums

## Tips

- **Save often** - crashes can happen
- **Use comments** - document your patches
- **Start simple** - complexity emerges from simple building blocks
- **Keep experimenting** - happy accidents are valuable in IDM!
