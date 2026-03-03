#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {
  applyDucking,
  applyEqChain,
  applyStereoDelay,
  clamp,
  computeKickEnvelope,
  createStereoBuffer,
  midiToHz,
  mixIn,
  normalizeStereo,
  panToGains,
  softClipStereo,
  trimStereo,
  writeWavFile
} = require("./lib/audio-utils");
const { createRng } = require("./lib/prng");
const {
  addFmPluck,
  addGlitchBurst,
  addHat,
  addKick,
  addNoiseRiser,
  addPadChord,
  addSnare
} = require("./lib/instruments");

function parseArgs(argv) {
  const opts = {
    bpm: 186,
    duration: 180,
    seed: "fractured-meridian-main",
    name: "fractured-meridian"
  };

  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (value == null || value.startsWith("--")) continue;

    if (key === "--bpm") opts.bpm = Number(value);
    if (key === "--duration") opts.duration = Number(value);
    if (key === "--seed") opts.seed = value;
    if (key === "--name") opts.name = value;
    i++;
  }

  opts.bpm = Math.max(165, Math.min(205, Number.isFinite(opts.bpm) ? opts.bpm : 186));
  opts.duration = Math.max(120, Math.min(420, Number.isFinite(opts.duration) ? opts.duration : 180));
  return opts;
}

function sectionAt(timeSec) {
  if (timeSec < 45) return "establish";
  if (timeSec < 120) return "engine";
  if (timeSec < 160) return "peak";
  return "dissolve";
}

function stereoWidth(stereo, amount) {
  const width = Math.max(0, amount);
  for (let i = 0; i < stereo.frames; i++) {
    const mid = (stereo.L[i] + stereo.R[i]) * 0.5;
    const side = (stereo.L[i] - stereo.R[i]) * 0.5 * width;
    stereo.L[i] = mid + side;
    stereo.R[i] = mid - side;
  }
}

function applyHaas(stereo, ms = 8, side = "R") {
  const delay = Math.max(1, Math.floor((ms / 1000) * stereo.sampleRate));
  const src = side === "R" ? stereo.R : stereo.L;
  const delayed = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) delayed[i] = i >= delay ? src[i - delay] : 0;
  if (side === "R") stereo.R = delayed;
  else stereo.L = delayed;
}

function applyFade(stereo, fadeInSec, fadeOutSec) {
  const sr = stereo.sampleRate;
  const inFrames = Math.floor(fadeInSec * sr);
  const outFrames = Math.floor(fadeOutSec * sr);
  for (let i = 0; i < stereo.frames; i++) {
    let g = 1;
    if (i < inFrames) {
      const x = i / Math.max(1, inFrames);
      g *= x * x;
    }
    const fromEnd = stereo.frames - 1 - i;
    if (fromEnd < outFrames) {
      const x = fromEnd / Math.max(1, outFrames);
      g *= x * x;
    }
    stereo.L[i] *= g;
    stereo.R[i] *= g;
  }
}

function hardLimitStereo(stereo, threshold = 0.965, releaseSec = 0.06, makeup = 1.03) {
  const sr = stereo.sampleRate;
  const rel = Math.exp(-1 / (sr * Math.max(0.005, releaseSec)));
  let gain = 1;
  for (let i = 0; i < stereo.frames; i++) {
    const peak = Math.max(Math.abs(stereo.L[i]), Math.abs(stereo.R[i])) * makeup;
    const needed = peak > threshold ? threshold / Math.max(1e-9, peak) : 1;
    if (needed < gain) gain = needed;
    else gain = gain * rel + (1 - rel);
    stereo.L[i] = clamp(stereo.L[i] * makeup * gain, -threshold, threshold);
    stereo.R[i] = clamp(stereo.R[i] * makeup * gain, -threshold, threshold);
  }
}

function transitionNear(timeSec) {
  return (
    Math.abs(timeSec - 45) < 0.66 ||
    Math.abs(timeSec - 120) < 0.66 ||
    Math.abs(timeSec - 160) < 0.66
  );
}

function quantizeToScale(midi, rootMidi, scaleIntervals) {
  let best = rootMidi;
  let bestD = Infinity;
  for (let oct = -6; oct <= 6; oct++) {
    for (const step of scaleIntervals) {
      const c = rootMidi + step + oct * 12;
      const d = Math.abs(c - midi);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
  }
  return best;
}

function addSubCounterNote(stereo, startSec, durationSec, midi, velocity = 1, glideSemis = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const f0 = midiToHz(midi);
  const f1 = midiToHz(midi + glideSemis);
  let p1 = 0;
  let p2 = 0;
  let lp = 0;
  let hpState = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const x = j / Math.max(1, len - 1);
    const f = f0 + (f1 - f0) * Math.pow(x, 1.2);
    p1 += (2 * Math.PI * f) / sr;
    p2 += (2 * Math.PI * f * 2.01) / sr;

    const body = Math.sin(p1) * 0.8 + Math.sin(p2 + Math.sin(p1) * 0.5) * 0.3;
    const snap = Math.sin(3.1 * p1 + Math.sin(0.8 * p2) * 1.2) * 0.16;
    const wave = Math.tanh((body + snap) * 1.52);

    lp += 0.07 * (wave - lp);
    const hp = wave - lp;
    hpState = hpState * 0.94 + hp * 0.06;

    const env = Math.min(1, t * 52) * Math.exp(-t * 4.2);
    const s = (lp * 0.95 + hpState * 0.22) * env * velocity;
    stereo.L[i] += s;
    stereo.R[i] += s;
  }
}

function addRidePing(stereo, startSec, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.32 * sr);
  const [gl, gr] = panToGains(pan);
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;

  const f1 = 4200 + (rng ? rng.range(-120, 120) : 0);
  const f2 = 6900 + (rng ? rng.range(-180, 180) : 0);
  const f3 = 9800 + (rng ? rng.range(-240, 240) : 0);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p1 += (2 * Math.PI * f1) / sr;
    p2 += (2 * Math.PI * f2) / sr;
    p3 += (2 * Math.PI * f3) / sr;
    const body = Math.sin(p1) * Math.exp(-t * 34);
    const bell = Math.sin(p2 + Math.sin(p1) * 0.8) * Math.exp(-t * 22);
    const air = Math.sin(p3) * Math.exp(-t * 18);
    const s = (body * 0.45 + bell * 0.38 + air * 0.24) * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addPercTick(stereo, startSec, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.08 * sr);
  const [gl, gr] = panToGains(pan);
  let ph = 0;
  const base = 1500 + (rng ? rng.range(-200, 200) : 0);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const f = base * (1 + 1.8 * Math.exp(-t * 45));
    ph += (2 * Math.PI * f) / sr;
    const tone = Math.sin(ph + 0.3 * Math.sin(2 * ph));
    const s = tone * Math.exp(-t * 52) * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addEpianoNote(stereo, startSec, midi, durationSec, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  const carrier = midiToHz(midi);
  const mod = carrier * 2.01;
  let cp = 0;
  let mp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const envA = Math.min(1, t * 40) * Math.exp(-t * 4.8);
    const envM = Math.exp(-t * 7.5);
    cp += (2 * Math.PI * carrier) / sr;
    mp += (2 * Math.PI * mod) / sr;
    const m = Math.sin(mp) * envM * 5.4;
    const tone = Math.sin(cp + m) * 0.78 + Math.sin(2 * cp + m * 0.36) * 0.26;
    const s = tone * envA * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addMetalScrape(stereo, startSec, durationSec, baseHz, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  let cp = 0;
  let mpA = 0;
  let mpB = 0;
  let fb = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const x = j / Math.max(1, len - 1);
    const cHz = baseHz * (0.8 + 1.7 * x * x);
    const mAHz = cHz * (2.1 + 0.5 * Math.sin(2 * Math.PI * 0.8 * t));
    const mBHz = cHz * (2.9 + 0.15 * Math.sin(2 * Math.PI * 0.5 * t));
    cp += (2 * Math.PI * cHz) / sr;
    mpA += (2 * Math.PI * mAHz) / sr;
    mpB += (2 * Math.PI * mBHz) / sr;
    const mod = Math.sin(mpA) * 5.4 + Math.sin(mpB) * 3.1;
    const tone = Math.sin(cp + mod + fb * 2.2);
    fb = fb * 0.93 + tone * 0.07;
    const env = Math.pow(Math.sin(Math.PI * x), 0.62) * Math.exp(-t * 4.2);
    const s = Math.tanh(tone * 1.5) * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function makeHarmonyCycle() {
  return [
    {
      symbol: "Dm11",
      root: 50,
      bassRoot: 38,
      scale: [0, 2, 3, 5, 7, 9, 11],
      voicing: [50, 53, 57, 60, 64, 67],
      keyVoicing: [53, 57, 60, 64]
    },
    {
      symbol: "G13",
      root: 43,
      bassRoot: 31,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [43, 47, 50, 53, 57, 64],
      keyVoicing: [47, 50, 57, 64]
    },
    {
      symbol: "Cmaj9#11",
      root: 48,
      bassRoot: 36,
      scale: [0, 2, 4, 6, 7, 9, 11],
      voicing: [48, 52, 55, 59, 62, 66],
      keyVoicing: [52, 55, 62, 66]
    },
    {
      symbol: "A13sus",
      root: 45,
      bassRoot: 33,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [45, 50, 52, 55, 59, 62],
      keyVoicing: [50, 55, 59, 62]
    },
    {
      symbol: "Fm11",
      root: 41,
      bassRoot: 29,
      scale: [0, 2, 3, 5, 7, 9, 10],
      voicing: [41, 44, 48, 51, 55, 58],
      keyVoicing: [44, 48, 55, 58]
    },
    {
      symbol: "Bb13",
      root: 46,
      bassRoot: 34,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [46, 50, 53, 56, 60, 67],
      keyVoicing: [50, 53, 60, 67]
    },
    {
      symbol: "Ebmaj9#11",
      root: 51,
      bassRoot: 39,
      scale: [0, 2, 4, 6, 7, 9, 11],
      voicing: [51, 55, 58, 62, 65, 69],
      keyVoicing: [55, 58, 65, 69]
    },
    {
      symbol: "A13",
      root: 45,
      bassRoot: 33,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [45, 49, 52, 55, 59, 66],
      keyVoicing: [49, 52, 59, 66]
    }
  ];
}

function microOffset(role, step, section, rng) {
  let ms = rng.range(-1.8, 1.8);
  if (role === "snare") {
    ms += 6.2 + rng.range(-1.2, 1.2);
  } else if (role === "kick") {
    ms += step % 4 === 0 ? rng.range(-0.6, 0.8) : rng.range(-2.2, 1.5);
  } else if (role === "hat") {
    ms += step % 2 ? 2.4 : -1.1;
    if (section === "peak") ms *= 0.8;
  } else if (role === "ride") {
    ms += step % 4 === 2 ? 1.2 : -0.6;
  }
  return ms / 1000;
}

function drumTemplates(section) {
  if (section === "peak") {
    return {
      kick: [
        [1, 0, 0.62, 0, 0, 0.78, 0, 0, 0.92, 0, 0.58, 0, 0.66, 0, 0.52, 0.7],
        [1, 0, 0, 0.62, 0.8, 0, 0, 0, 0.95, 0, 0.66, 0, 0.74, 0, 0.56, 0],
        [1, 0.5, 0, 0, 0.74, 0, 0.58, 0, 0.92, 0, 0.65, 0, 0.78, 0, 0, 0.68]
      ],
      hat: [
        [0.52, 0.48, 0.56, 0.52, 0.54, 0.5, 0.58, 0.52, 0.56, 0.48, 0.6, 0.54, 0.58, 0.48, 0.62, 0.5],
        [0.58, 0.44, 0.58, 0.48, 0.62, 0.44, 0.56, 0.5, 0.6, 0.46, 0.58, 0.5, 0.64, 0.44, 0.62, 0.5]
      ],
      ghosts: [2, 6, 10, 11, 14, 15],
      ride: [2, 6, 10, 14]
    };
  }

  if (section === "engine") {
    return {
      kick: [
        [1, 0, 0, 0, 0, 0.74, 0, 0, 0.9, 0, 0, 0.52, 0, 0.68, 0, 0],
        [1, 0, 0, 0, 0.72, 0, 0, 0, 0.92, 0, 0.6, 0, 0, 0.72, 0, 0],
        [1, 0, 0.56, 0, 0, 0.7, 0, 0, 0.9, 0, 0, 0.58, 0.62, 0, 0, 0]
      ],
      hat: [
        [0.34, 0.28, 0.38, 0.3, 0.34, 0.28, 0.4, 0.3, 0.34, 0.28, 0.42, 0.3, 0.36, 0.28, 0.46, 0.3],
        [0.36, 0.3, 0.4, 0.32, 0.36, 0.3, 0.42, 0.32, 0.36, 0.3, 0.44, 0.32, 0.4, 0.3, 0.46, 0.32]
      ],
      ghosts: [2, 7, 10, 15],
      ride: [2, 6, 10, 14]
    };
  }

  return {
    kick: [
      [1, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0.55, 0, 0],
      [1, 0, 0, 0, 0, 0.5, 0, 0, 0.74, 0, 0, 0, 0, 0.58, 0, 0]
    ],
    hat: [[0.18, 0, 0.22, 0, 0.18, 0, 0.24, 0, 0.18, 0, 0.24, 0, 0.18, 0, 0.26, 0]],
    ghosts: [10, 15],
    ride: [2, 10]
  };
}

function main() {
  const opts = parseArgs(process.argv);
  const rng = createRng(opts.seed);
  const harmony = makeHarmonyCycle();

  const beat = 60 / opts.bpm;
  const barSec = beat * 4;
  const totalBars = Math.ceil(opts.duration / barSec);
  const renderDuration = opts.duration;
  const tailSec = 3;
  const renderLength = renderDuration + tailSec;

  const stems = {
    kick: createStereoBuffer(renderLength),
    snare: createStereoBuffer(renderLength),
    hats: createStereoBuffer(renderLength),
    ride: createStereoBuffer(renderLength),
    perc: createStereoBuffer(renderLength),
    bass: createStereoBuffer(renderLength),
    pads: createStereoBuffer(renderLength),
    keys: createStereoBuffer(renderLength),
    lead: createStereoBuffer(renderLength),
    metal: createStereoBuffer(renderLength),
    glitch: createStereoBuffer(renderLength),
    ambience: createStereoBuffer(renderLength),
    fx: createStereoBuffer(renderLength)
  };

  const bassShapes = [
    [0, 2, 4, 3, 5, 4, 2],
    [0, 3, 4, 5, 3, 2, 6],
    [0, 2, 5, 4, 3, 1, 6],
    [0, 4, 5, 3, 2, 4, 1]
  ];
  const leadShapes = [
    [4, 5, 6, 4, 3, 2],
    [5, 4, 6, 5, 3, 1],
    [6, 5, 4, 2, 3, 5],
    [4, 6, 5, 3, 2, 1]
  ];

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * barSec;
    if (barStart >= renderDuration + 0.02) break;

    const section = sectionAt(barStart);
    const phraseBar = bar % 4;
    const chord = harmony[Math.floor(bar / 2) % harmony.length];
    const nextChord = harmony[Math.floor((bar + 1) / 2) % harmony.length];

    if (bar % 2 === 0) {
      const padVel =
        section === "establish" ? 0.2 : section === "engine" ? 0.16 : section === "peak" ? 0.13 : 0.19;
      addPadChord(stems.pads, barStart, barSec * 2.3, chord.voicing, padVel, 0.62);

      const highCloud = chord.voicing
        .slice(1)
        .map((n, i) => n + 12 + (i % 2 ? 5 : 0));
      addPadChord(stems.ambience, barStart + beat * 0.07, barSec * 2.9, highCloud, 0.11, 0.96);
    }

    const keyPattern =
      section === "establish"
        ? [1.5, 3.25]
        : section === "engine"
          ? [0.75, 1.5, 2.75, 3.5]
          : section === "peak"
            ? [0.5, 1.25, 2, 2.75, 3.5]
            : [1.5, 3.25];
    for (const beatPos of keyPattern) {
      const t = barStart + beat * beatPos + rng.range(-0.01, 0.009);
      if (t >= renderDuration) continue;
      for (let i = 0; i < chord.keyVoicing.length; i++) {
        const note = chord.keyVoicing[i] + (i % 2 ? 12 : 0);
        const pan = (i / (chord.keyVoicing.length - 1)) * 1.2 - 0.6;
        addEpianoNote(
          stems.keys,
          t,
          note,
          beat * rng.choose([0.32, 0.4, 0.48]),
          (section === "peak" ? 0.14 : 0.17) * (1 - i * 0.08),
          pan
        );
      }
    }

    const drumSet = drumTemplates(section);
    const kickPattern = drumSet.kick[(phraseBar + Math.floor(bar / 4)) % drumSet.kick.length];
    const hatPattern = drumSet.hat[(bar + phraseBar) % drumSet.hat.length];

    const kickEnable =
      section === "establish" ? barStart > 22 : section === "dissolve" ? barStart < 174 || phraseBar === 0 : true;

    if (kickEnable) {
      for (let s = 0; s < 16; s++) {
        const v = kickPattern[s];
        if (v <= 0) continue;
        if (section === "dissolve" && s % 4 !== 0 && rng.chance(0.5)) continue;
        const t = barStart + s * (barSec / 16) + microOffset("kick", s, section, rng);
        if (t >= renderDuration) continue;
        addKick(stems.kick, t, (section === "peak" ? 1.02 : 0.94) * v);
      }
    }

    const hasBackbeat = section !== "establish" || barStart > 33;
    if (hasBackbeat) {
      addSnare(stems.snare, barStart + beat + microOffset("snare", 4, section, rng), section === "peak" ? 0.84 : 0.75, -0.08, rng);
      addSnare(stems.snare, barStart + beat * 3 + microOffset("snare", 12, section, rng), section === "peak" ? 0.94 : 0.86, 0.11, rng);

      for (const gs of drumSet.ghosts) {
        if (section === "dissolve" && gs % 2 && rng.chance(0.55)) continue;
        if (!rng.chance(section === "peak" ? 0.55 : 0.38)) continue;
        const t = barStart + gs * (barSec / 16) + rng.range(-0.01, 0.009);
        if (t >= renderDuration) continue;
        addSnare(stems.snare, t, section === "peak" ? 0.28 : 0.22, rng.range(-0.45, 0.45), rng);
      }
    }

    for (let s = 0; s < 16; s++) {
      const hv = hatPattern[s];
      if (hv <= 0) continue;
      if (section === "establish" && s % 4 !== 2 && rng.chance(0.6)) continue;
      const t = barStart + s * (barSec / 16) + microOffset("hat", s, section, rng);
      if (t >= renderDuration) continue;
      const open = section !== "establish" && s === 14 && rng.chance(section === "peak" ? 0.42 : 0.22);
      const pan = Math.sin((bar * 16 + s) * 0.19) * 0.63;
      addHat(stems.hats, t, hv * (section === "peak" ? 0.21 : 0.17), pan, open, rng);
    }

    for (const rs of drumSet.ride) {
      const t = barStart + rs * (barSec / 16) + microOffset("ride", rs, section, rng);
      if (t >= renderDuration) continue;
      const pan = Math.sin((bar * 16 + rs) * 0.07) * 0.5;
      addRidePing(stems.ride, t, section === "peak" ? 0.24 : section === "engine" ? 0.2 : 0.15, pan, rng);
      if (section !== "establish" && rng.chance(0.45)) {
        addPercTick(stems.perc, t + barSec / 32, section === "peak" ? 0.16 : 0.13, -pan * 0.6, rng);
      }
    }

    if (section === "peak" && phraseBar === 3) {
      const fillStart = barStart + barSec * 0.7;
      const n = rng.int(10, 24);
      for (let i = 0; i < n; i++) {
        const t = fillStart + i * (barSec / 180);
        if (t >= renderDuration) continue;
        if (rng.chance(0.55)) {
          addSnare(stems.snare, t, 0.18 + rng.range(0, 0.2), rng.range(-0.7, 0.7), rng);
        } else {
          addPercTick(stems.perc, t, 0.1 + rng.range(0, 0.1), rng.range(-0.85, 0.85), rng);
        }
      }
    }

    const bassShape = bassShapes[(Math.floor(bar / 2) + phraseBar) % bassShapes.length];
    const bassSlots = section === "peak" ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 3, 5, 8, 10, 12, 14];
    for (let i = 0; i < bassSlots.length; i++) {
      const step = bassSlots[i];
      const t = barStart + step * (barSec / 16) + rng.range(-0.007, 0.006);
      if (t >= renderDuration) continue;
      if (section === "dissolve" && step > 10 && rng.chance(0.65)) continue;

      const degree = bassShape[i % bassShape.length];
      const octave = section === "peak" && rng.chance(0.18) ? -1 : -2;
      const midiRaw = chord.bassRoot + chord.scale[degree % chord.scale.length] + octave * 12;
      const midi = quantizeToScale(midiRaw, chord.bassRoot, chord.scale);

      const glide = i === bassSlots.length - 1 ? quantizeToScale(nextChord.bassRoot, chord.bassRoot, chord.scale) - midi : 0;
      const durBase = barSec / 16;
      const dur = durBase * (section === "peak" ? rng.choose([2.2, 2.8, 3.2]) : rng.choose([2.8, 3.4, 4.2]));
      addSubCounterNote(stems.bass, t, dur, midi, section === "establish" ? 0.24 : section === "peak" ? 0.42 : 0.35, glide * 0.15);
    }

    const leadShape = leadShapes[(Math.floor(bar / 2) + 1) % leadShapes.length];
    const leadStepCount = section === "peak" ? 12 : section === "engine" ? 8 : 6;
    for (let i = 0; i < leadStepCount; i++) {
      const p =
        section === "establish" ? 0.2 : section === "engine" ? 0.4 : section === "peak" ? 0.56 : 0.22;
      if (!rng.chance(p)) continue;
      const t = barStart + i * (barSec / leadStepCount) + rng.range(-0.009, 0.008);
      if (t >= renderDuration) continue;
      const degree = leadShape[i % leadShape.length];
      const register = section === "peak" ? 24 : 12;
      const midi = quantizeToScale(chord.root + chord.scale[degree % chord.scale.length] + register, chord.root, chord.scale);
      const pan = Math.sin((bar * leadStepCount + i) * 0.31) * 0.82;
      addFmPluck(stems.lead, t, midi, beat * rng.choose([0.16, 0.2, 0.26, 0.34]), section === "peak" ? 0.24 : 0.18, pan);
    }

    const metalEvents =
      section === "peak" ? rng.int(2, 5) : section === "engine" ? rng.int(1, 3) : section === "establish" ? 1 : 1;
    for (let m = 0; m < metalEvents; m++) {
      const t = barStart + rng.range(0.08, barSec * 0.9);
      if (t >= renderDuration) continue;
      const d = section === "peak" ? rng.range(0.09, 0.24) : rng.range(0.14, 0.32);
      addMetalScrape(stems.metal, t, d, rng.range(260, section === "peak" ? 1700 : 1100), rng.range(0.08, section === "peak" ? 0.22 : 0.15), rng.range(-0.9, 0.9), rng);
    }

    const glitchEvents =
      section === "peak"
        ? rng.int(1, 4)
        : section === "engine"
          ? rng.int(0, 2)
          : section === "establish"
            ? 0
            : rng.int(0, 1);
    for (let g = 0; g < glitchEvents; g++) {
      const t = barStart + rng.range(0.05, barSec * 0.95);
      if (t >= renderDuration) continue;
      addGlitchBurst(stems.glitch, t, rng.range(0.03, 0.12), rng.range(360, 6200), rng.range(0.08, 0.2), rng.range(-0.85, 0.85), rng);
    }

    if (transitionNear(barStart + barSec * 0.5) || (section === "peak" && phraseBar === 3)) {
      addNoiseRiser(stems.fx, barStart + barSec * 0.56, barSec * 0.42, section === "peak" ? 0.24 : 0.16, rng);
    }
  }

  applyEqChain(stems.kick, [
    { type: "lowshelf", freq: 78, q: 0.707, gainDb: 3.4 },
    { type: "peaking", freq: 260, q: 1.2, gainDb: -2.2 },
    { type: "highshelf", freq: 6400, q: 0.707, gainDb: -2.6 }
  ]);
  softClipStereo(stems.kick, 1.3);

  applyEqChain(stems.snare, [
    { type: "highpass", freq: 130, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2200, q: 1.1, gainDb: 2.2 },
    { type: "highshelf", freq: 7600, q: 0.707, gainDb: 1.5 }
  ]);
  softClipStereo(stems.snare, 1.14);

  applyEqChain(stems.hats, [
    { type: "highpass", freq: 5200, q: 0.707, gainDb: 0 },
    { type: "highshelf", freq: 9800, q: 0.707, gainDb: 1.7 }
  ]);
  stereoWidth(stems.hats, 1.3);

  applyEqChain(stems.ride, [
    { type: "highpass", freq: 2600, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 6200, q: 1.1, gainDb: 1.6 },
    { type: "highshelf", freq: 10400, q: 0.707, gainDb: 1.1 }
  ]);
  stereoWidth(stems.ride, 1.34);

  applyEqChain(stems.perc, [
    { type: "highpass", freq: 900, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2100, q: 1.2, gainDb: 1.4 }
  ]);
  stereoWidth(stems.perc, 1.38);

  applyEqChain(stems.bass, [
    { type: "lowpass", freq: 360, q: 0.707, gainDb: 0 },
    { type: "lowshelf", freq: 88, q: 0.707, gainDb: 2.4 },
    { type: "peaking", freq: 250, q: 1.0, gainDb: -1.2 }
  ]);
  softClipStereo(stems.bass, 1.22);

  applyEqChain(stems.pads, [
    { type: "highpass", freq: 170, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2000, q: 0.9, gainDb: -1.4 },
    { type: "highshelf", freq: 8800, q: 0.707, gainDb: 0.7 }
  ]);
  applyStereoDelay(stems.pads, 0.31, 0.38, 0.22);
  stereoWidth(stems.pads, 1.4);

  applyEqChain(stems.keys, [
    { type: "highpass", freq: 380, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 1800, q: 1.1, gainDb: 1.5 },
    { type: "highshelf", freq: 7800, q: 0.707, gainDb: 1.2 }
  ]);
  applyStereoDelay(stems.keys, 0.14, 0.24, 0.17);
  stereoWidth(stems.keys, 1.28);

  applyEqChain(stems.lead, [
    { type: "highpass", freq: 560, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 3200, q: 1.2, gainDb: 1.8 },
    { type: "highshelf", freq: 9800, q: 0.707, gainDb: 1.5 }
  ]);
  applyStereoDelay(stems.lead, 0.18, 0.3, 0.23);
  stereoWidth(stems.lead, 1.48);

  applyEqChain(stems.metal, [
    { type: "highpass", freq: 780, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 3000, q: 1.2, gainDb: 2.1 },
    { type: "highshelf", freq: 9200, q: 0.707, gainDb: 2.0 }
  ]);
  applyStereoDelay(stems.metal, 0.14, 0.22, 0.2);
  stereoWidth(stems.metal, 1.42);

  applyEqChain(stems.glitch, [
    { type: "highpass", freq: 850, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 3400, q: 1.3, gainDb: 1.7 },
    { type: "highshelf", freq: 9000, q: 0.707, gainDb: 1.5 }
  ]);
  applyStereoDelay(stems.glitch, 0.12, 0.22, 0.16);
  stereoWidth(stems.glitch, 1.4);

  applyEqChain(stems.ambience, [
    { type: "highpass", freq: 220, q: 0.707, gainDb: 0 },
    { type: "lowpass", freq: 9800, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 4200, q: 0.85, gainDb: -1.6 }
  ]);
  applyStereoDelay(stems.ambience, 0.4, 0.48, 0.28);
  applyHaas(stems.ambience, 10, "R");
  stereoWidth(stems.ambience, 1.8);

  applyEqChain(stems.fx, [
    { type: "highpass", freq: 250, q: 0.707, gainDb: 0 },
    { type: "highshelf", freq: 6800, q: 0.707, gainDb: 1.2 }
  ]);
  applyStereoDelay(stems.fx, 0.24, 0.33, 0.2);
  stereoWidth(stems.fx, 1.4);

  const kickEnv = computeKickEnvelope(stems.kick);
  applyDucking(stems.bass, kickEnv, 0.36);
  applyDucking(stems.pads, kickEnv, 0.4);
  applyDucking(stems.keys, kickEnv, 0.3);
  applyDucking(stems.lead, kickEnv, 0.32);
  applyDucking(stems.ambience, kickEnv, 0.45);
  applyDucking(stems.metal, kickEnv, 0.2);
  applyDucking(stems.glitch, kickEnv, 0.2);
  applyDucking(stems.fx, kickEnv, 0.26);

  const master = createStereoBuffer(renderLength);
  const gains = {
    kick: 0.88,
    snare: 0.74,
    hats: 0.32,
    ride: 0.36,
    perc: 0.28,
    bass: 0.86,
    pads: 0.61,
    keys: 0.58,
    lead: 0.52,
    metal: 0.32,
    glitch: 0.2,
    ambience: 0.34,
    fx: 0.24
  };

  for (const [name, stem] of Object.entries(stems)) {
    mixIn(master, stem, gains[name] || 1);
  }

  applyEqChain(master, [
    { type: "highpass", freq: 28, q: 0.707, gainDb: 0 },
    { type: "lowshelf", freq: 92, q: 0.707, gainDb: 1.0 },
    { type: "peaking", freq: 300, q: 1.0, gainDb: -1.1 },
    { type: "peaking", freq: 2200, q: 1.2, gainDb: 0.7 },
    { type: "highshelf", freq: 9200, q: 0.707, gainDb: 0.9 }
  ]);
  softClipStereo(master, 1.1);
  stereoWidth(master, 1.1);
  hardLimitStereo(master, 0.965, 0.08, 1.03);
  applyFade(master, 0.14, 2.8);
  normalizeStereo(master, 0.955);
  hardLimitStereo(master, 0.965, 0.08, 1.01);

  const trimmedMaster = trimStereo(master, renderDuration);
  const trimmedStems = {};
  for (const [name, stem] of Object.entries(stems)) {
    const s = trimStereo(stem, renderDuration);
    applyFade(s, 0.08, 2.0);
    normalizeStereo(s, 0.94);
    trimmedStems[name] = s;
  }

  const renderId = opts.name;
  const demoPath = path.resolve("exports/demos", `${renderId}.wav`);
  const masterPath = path.resolve("exports/masters", `${renderId}.wav`);
  const stemsDir = path.resolve("exports/stems", renderId);

  fs.rmSync(demoPath, { force: true });
  fs.rmSync(masterPath, { force: true });
  fs.rmSync(stemsDir, { recursive: true, force: true });

  writeWavFile(demoPath, trimmedMaster);
  writeWavFile(masterPath, trimmedMaster);
  fs.mkdirSync(stemsDir, { recursive: true });
  for (const [name, stem] of Object.entries(trimmedStems)) {
    writeWavFile(path.join(stemsDir, `${name}.wav`), stem);
  }

  const metadata = {
    title: "Fractured Meridian",
    canonical_name: renderId,
    created_at: new Date().toISOString(),
    bpm: opts.bpm,
    duration_seconds: renderDuration,
    seed: opts.seed,
    arc: {
      establish: "0:00-0:45",
      engine: "0:45-2:00",
      peak: "2:00-2:40",
      dissolve: "2:40-3:00"
    },
    harmony_cycle: harmony.map((h) => h.symbol),
    rhythmic_design: "Phrase-locked 4-bar drum templates with microtiming and controlled fills.",
    pitch_logic: "All melodic/bass notes quantized to each chord's scale array."
  };
  fs.writeFileSync(path.join(stemsDir, "metadata.json"), JSON.stringify(metadata, null, 2));

  console.log(`Generated: ${demoPath}`);
  console.log(`Master:    ${masterPath}`);
  console.log(`Stems:     ${stemsDir}`);
  console.log(`Duration:  ${renderDuration.toFixed(3)} sec`);
  console.log(`BPM:       ${opts.bpm}`);
  console.log(`Seed:      ${opts.seed}`);
}

main();
