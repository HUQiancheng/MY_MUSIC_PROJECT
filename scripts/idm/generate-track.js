#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const {
  applyDucking,
  applyEqChain,
  applyStereoDelay,
  computeKickEnvelope,
  createStereoBuffer,
  mixIn,
  normalizeStereo,
  softClipStereo,
  trimStereo,
  writeWavFile
} = require("./lib/audio-utils");
const { createRng } = require("./lib/prng");
const {
  addBassNote,
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
    bpm: 172,
    duration: 96,
    seed: "alien-groove-standard",
    name: "comp-alien-idm-track01"
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

  opts.bpm = Math.max(120, Math.min(210, Number.isFinite(opts.bpm) ? opts.bpm : 172));
  opts.duration = Math.max(32, Math.min(420, Number.isFinite(opts.duration) ? opts.duration : 96));
  return opts;
}

function dateTag() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${y}${m}${d}-${hh}${mm}`;
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
  const delayed = side === "R" ? new Float32Array(stereo.R) : new Float32Array(stereo.L);
  for (let i = stereo.frames - 1; i >= delay; i--) {
    delayed[i] = delayed[i - delay];
  }
  for (let i = 0; i < delay; i++) delayed[i] = 0;
  if (side === "R") {
    stereo.R = delayed;
  } else {
    stereo.L = delayed;
  }
}

function applyFade(stereo, fadeInSec, fadeOutSec) {
  const sr = stereo.sampleRate;
  const inFrames = Math.floor(fadeInSec * sr);
  const outFrames = Math.floor(fadeOutSec * sr);
  for (let i = 0; i < stereo.frames; i++) {
    let g = 1;
    if (i < inFrames) g *= i / Math.max(1, inFrames);
    const fromEnd = stereo.frames - 1 - i;
    if (fromEnd < outFrames) g *= fromEnd / Math.max(1, outFrames);
    stereo.L[i] *= g;
    stereo.R[i] *= g;
  }
}

function makeSections(totalBars) {
  const intro = Math.max(4, Math.floor(totalBars * 0.13));
  const build = Math.max(intro + 4, Math.floor(totalBars * 0.28));
  const dropA = Math.max(build + 8, Math.floor(totalBars * 0.52));
  const breakA = Math.max(dropA + 2, Math.floor(totalBars * 0.64));
  const dropB = Math.max(breakA + 6, Math.floor(totalBars * 0.84));
  return { intro, build, dropA, breakA, dropB, outro: totalBars };
}

function sectionAtBar(bar, sections) {
  if (bar < sections.intro) return "intro";
  if (bar < sections.build) return "build";
  if (bar < sections.dropA) return "dropA";
  if (bar < sections.breakA) return "break";
  if (bar < sections.dropB) return "dropB";
  return "outro";
}

function intensityFromSection(section) {
  if (section === "intro") return 0.3;
  if (section === "build") return 0.54;
  if (section === "dropA") return 0.82;
  if (section === "break") return 0.42;
  if (section === "dropB") return 0.98;
  return 0.48;
}

function main() {
  const opts = parseArgs(process.argv);
  const rng = createRng(opts.seed);

  const beat = 60 / opts.bpm;
  const barSec = beat * 4;
  const totalBars = Math.floor(opts.duration / barSec);
  const sections = makeSections(totalBars);
  const tailSec = 2.8;
  const renderDuration = totalBars * barSec;

  const stems = {
    kick: createStereoBuffer(renderDuration + tailSec),
    snare: createStereoBuffer(renderDuration + tailSec),
    hats: createStereoBuffer(renderDuration + tailSec),
    bass: createStereoBuffer(renderDuration + tailSec),
    pads: createStereoBuffer(renderDuration + tailSec),
    lead: createStereoBuffer(renderDuration + tailSec),
    glitch: createStereoBuffer(renderDuration + tailSec),
    ambience: createStereoBuffer(renderDuration + tailSec),
    fx: createStereoBuffer(renderDuration + tailSec)
  };

  const kickPatterns = [
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0]
  ];
  const bassRoots = [0, -2, -5, -7, -9, -4, -2, 3];
  const leadScale = [0, 2, 3, 5, 7, 10];
  const leadTransitions = {
    0: [0, 1, 2, 4],
    1: [2, 3, 4],
    2: [0, 2, 4, 5],
    3: [1, 3, 4, 5],
    4: [0, 2, 4, 5],
    5: [2, 4, 5]
  };
  let leadState = 0;

  for (let bar = 0; bar < totalBars; bar++) {
    const section = sectionAtBar(bar, sections);
    const intensity = intensityFromSection(section);
    const barStart = bar * barSec;

    const pattern =
      section === "intro" && bar % 2
        ? kickPatterns[0]
        : rng.choose(kickPatterns);
    for (let s = 0; s < 16; s++) {
      if (!pattern[s]) continue;
      if (section === "break" && s > 8 && rng.chance(0.7)) continue;
      const jitter = rng.range(-0.004, 0.004) * (1.1 - intensity);
      const start = barStart + s * (barSec / 16) + jitter;
      const vel = (0.7 + intensity * 0.5) * (s % 4 === 0 ? 1.05 : 0.9);
      addKick(stems.kick, start, vel);
      if (section === "dropB" && s % 4 === 2 && rng.chance(0.22)) {
        addKick(stems.kick, start + beat * 0.125, vel * 0.52);
      }
    }

    if (section !== "intro" || bar > sections.intro * 0.7) {
      addSnare(stems.snare, barStart + beat, 0.72 + intensity * 0.2, -0.08, rng);
      addSnare(stems.snare, barStart + beat * 3, 0.84 + intensity * 0.2, 0.12, rng);
      const ghostSlots = [0.75, 1.75, 2.5, 3.5];
      for (const slot of ghostSlots) {
        if (rng.chance(0.22 + intensity * 0.25)) {
          addSnare(
            stems.snare,
            barStart + beat * slot + rng.range(-0.008, 0.008),
            0.24 + intensity * 0.2,
            rng.range(-0.3, 0.3),
            rng
          );
        }
      }
    }

    const hatRes = intensity > 0.75 ? 64 : 32;
    for (let h = 0; h < hatRes; h++) {
      const t = barStart + h * (barSec / hatRes);
      const accent = h % 8 === 0 ? 1.15 : h % 4 === 0 ? 1.0 : 0.75;
      const prob = 0.48 + intensity * 0.42 + (h % 2 ? 0.05 : -0.08);
      if (!rng.chance(prob)) continue;
      const open = h % 16 === 14 && rng.chance(0.5);
      const pan = Math.sin((bar * hatRes + h) * 0.16) * 0.68;
      addHat(stems.hats, t + rng.range(-0.003, 0.003), 0.18 * accent, pan, open, rng);
      if (section === "dropB" && h % 8 === 6 && rng.chance(0.28)) {
        addHat(stems.hats, t + barSec / hatRes * 0.5, 0.11, -pan * 0.6, false, rng);
      }
    }

    if (section === "dropB" && bar % 4 === 3) {
      const fillStart = barStart + barSec * 0.74;
      const bursts = rng.int(10, 28);
      for (let f = 0; f < bursts; f++) {
        const t = fillStart + f * (barSec / 190);
        if (rng.chance(0.58)) {
          addSnare(stems.snare, t, 0.2 + rng.range(0, 0.22), rng.range(-0.6, 0.6), rng);
        } else {
          addHat(stems.hats, t, 0.09 + rng.range(0, 0.12), rng.range(-0.8, 0.8), false, rng);
        }
      }
    }

    const root = bassRoots[Math.floor(bar / 2) % bassRoots.length];
    const bassSlots = 8;
    for (let b = 0; b < bassSlots; b++) {
      if (rng.chance(0.2) && b % 2) continue;
      if (section === "intro" && b > 5 && rng.chance(0.8)) continue;
      const scaleDegree = rng.choose([0, 0, 2, 3, 4, 5]);
      const midi = 32 + root + leadScale[scaleDegree] - (rng.chance(0.7) ? 12 : 0);
      const durMult = rng.choose([0.42, 0.56, 0.74, 0.95]);
      const start = barStart + b * (barSec / bassSlots) + rng.range(-0.008, 0.006);
      addBassNote(stems.bass, start, (barSec / bassSlots) * durMult, midi, 0.36 + intensity * 0.32);
    }

    if (bar % 2 === 0) {
      const chordRoot = 50 + bassRoots[Math.floor(bar / 2) % bassRoots.length];
      const chordA = [0, 3, 7, 10].map((x) => chordRoot + x);
      const chordB = [0, 5, 10, 14].map((x) => chordRoot + x);
      const chord = rng.chance(0.55) ? chordA : chordB;
      addPadChord(stems.pads, barStart, barSec * 2.2, chord, 0.16 + (1 - intensity) * 0.08, 0.55);
      const ambientVoicing = chord.map((m, idx) => m + 12 + (idx % 2 ? 5 : 0));
      addPadChord(stems.ambience, barStart + beat * 0.1, barSec * 2.8, ambientVoicing, 0.11, 0.95);
    }

    const leadSteps = 16;
    for (let s = 0; s < leadSteps; s++) {
      const prob =
        section === "intro"
          ? 0.14
          : section === "build"
            ? 0.32
            : section === "break"
              ? 0.22
              : 0.45;
      if (!rng.chance(prob)) continue;
      leadState = rng.choose(leadTransitions[leadState]);
      const rootMod = bassRoots[bar % bassRoots.length];
      const midi = 66 + rootMod + leadScale[leadState] + (rng.chance(0.24) ? 12 : 0);
      const start = barStart + s * (barSec / leadSteps) + rng.range(-0.007, 0.007);
      const pan = Math.sin((bar * leadSteps + s) * 0.31) * 0.82;
      const dur = beat * rng.choose([0.18, 0.22, 0.28, 0.36]);
      addFmPluck(stems.lead, start, midi, dur, 0.2 + intensity * 0.22, pan);
    }

    const glitchCount =
      section === "dropB"
        ? rng.int(3, 7)
        : section === "dropA"
          ? rng.int(1, 4)
          : section === "build"
            ? rng.int(0, 2)
            : rng.int(0, 1);
    for (let g = 0; g < glitchCount; g++) {
      const start = barStart + rng.range(0, barSec * 0.94);
      const dur = rng.range(0.04, 0.19);
      addGlitchBurst(
        stems.glitch,
        start,
        dur,
        rng.range(220, 8800),
        rng.range(0.15, 0.4),
        rng.range(-0.95, 0.95),
        rng
      );
    }

    if (bar % 8 === 7 || bar === sections.build - 1 || bar === sections.breakA - 1) {
      addNoiseRiser(stems.fx, barStart + barSec * 0.56, barSec * 0.44, 0.24 + intensity * 0.18, rng);
    }
  }

  applyEqChain(stems.kick, [
    { type: "lowshelf", freq: 74, q: 0.707, gainDb: 4 },
    { type: "peaking", freq: 260, q: 1.1, gainDb: -2.5 },
    { type: "highshelf", freq: 6500, q: 0.707, gainDb: -3 }
  ]);
  softClipStereo(stems.kick, 1.35);

  applyEqChain(stems.snare, [
    { type: "highpass", freq: 130, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2100, q: 1.1, gainDb: 2.3 },
    { type: "highshelf", freq: 7200, q: 0.707, gainDb: 1.8 }
  ]);
  softClipStereo(stems.snare, 1.18);

  applyEqChain(stems.hats, [
    { type: "highpass", freq: 4800, q: 0.707, gainDb: 0 },
    { type: "highshelf", freq: 8500, q: 0.707, gainDb: 2.8 }
  ]);
  stereoWidth(stems.hats, 1.25);

  applyEqChain(stems.bass, [
    { type: "lowpass", freq: 420, q: 0.707, gainDb: 0 },
    { type: "lowshelf", freq: 90, q: 0.707, gainDb: 2.1 },
    { type: "peaking", freq: 320, q: 1.2, gainDb: -1.7 }
  ]);
  softClipStereo(stems.bass, 1.22);

  applyEqChain(stems.pads, [
    { type: "highpass", freq: 170, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 1800, q: 0.85, gainDb: -1.2 },
    { type: "highshelf", freq: 7200, q: 0.707, gainDb: 0.6 }
  ]);
  applyStereoDelay(stems.pads, 0.29, 0.36, 0.2);
  stereoWidth(stems.pads, 1.38);

  applyEqChain(stems.lead, [
    { type: "highpass", freq: 540, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 3200, q: 1.2, gainDb: 1.8 },
    { type: "highshelf", freq: 9500, q: 0.707, gainDb: 1.5 }
  ]);
  applyStereoDelay(stems.lead, 0.21, 0.31, 0.24);
  stereoWidth(stems.lead, 1.45);

  applyEqChain(stems.glitch, [
    { type: "highpass", freq: 700, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2600, q: 1.4, gainDb: 2.2 },
    { type: "highshelf", freq: 9000, q: 0.707, gainDb: 2.4 }
  ]);
  applyStereoDelay(stems.glitch, 0.17, 0.27, 0.3);
  stereoWidth(stems.glitch, 1.52);

  applyEqChain(stems.ambience, [
    { type: "highpass", freq: 220, q: 0.707, gainDb: 0 },
    { type: "lowpass", freq: 9000, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 4200, q: 0.8, gainDb: -1.4 }
  ]);
  applyStereoDelay(stems.ambience, 0.37, 0.46, 0.28);
  applyHaas(stems.ambience, 9, "R");
  stereoWidth(stems.ambience, 1.8);

  applyEqChain(stems.fx, [
    { type: "highpass", freq: 260, q: 0.707, gainDb: 0 },
    { type: "highshelf", freq: 6600, q: 0.707, gainDb: 1.5 }
  ]);
  applyStereoDelay(stems.fx, 0.27, 0.35, 0.22);
  stereoWidth(stems.fx, 1.42);

  const kickEnv = computeKickEnvelope(stems.kick);
  applyDucking(stems.bass, kickEnv, 0.33);
  applyDucking(stems.pads, kickEnv, 0.41);
  applyDucking(stems.lead, kickEnv, 0.37);
  applyDucking(stems.ambience, kickEnv, 0.48);
  applyDucking(stems.glitch, kickEnv, 0.26);
  applyDucking(stems.fx, kickEnv, 0.3);

  const master = createStereoBuffer(renderDuration + tailSec);
  const gains = {
    kick: 0.94,
    snare: 0.77,
    hats: 0.48,
    bass: 0.89,
    pads: 0.58,
    lead: 0.56,
    glitch: 0.44,
    ambience: 0.39,
    fx: 0.33
  };

  for (const [name, stem] of Object.entries(stems)) {
    mixIn(master, stem, gains[name] || 1);
  }

  applyEqChain(master, [
    { type: "highpass", freq: 28, q: 0.707, gainDb: 0 },
    { type: "lowshelf", freq: 88, q: 0.707, gainDb: 1.1 },
    { type: "peaking", freq: 330, q: 1.1, gainDb: -1.1 },
    { type: "highshelf", freq: 8800, q: 0.707, gainDb: 1.0 }
  ]);
  softClipStereo(master, 1.18);
  stereoWidth(master, 1.12);
  applyFade(master, 0.08, 2.1);
  normalizeStereo(master, 0.93);

  const trimmedMaster = trimStereo(master, renderDuration);
  const trimmedStems = {};
  for (const [name, stem] of Object.entries(stems)) {
    const s = trimStereo(stem, renderDuration);
    applyFade(s, 0.04, 1.6);
    normalizeStereo(s, 0.93);
    trimmedStems[name] = s;
  }

  const tag = dateTag();
  const renderId = `${opts.name}-${tag}`;
  const demoPath = path.resolve("exports/demos", `${renderId}.wav`);
  const masterPath = path.resolve("exports/masters", `${renderId}.wav`);
  const stemsDir = path.resolve("exports/stems", renderId);

  writeWavFile(demoPath, trimmedMaster);
  writeWavFile(masterPath, trimmedMaster);
  fs.mkdirSync(stemsDir, { recursive: true });
  for (const [name, stem] of Object.entries(trimmedStems)) {
    writeWavFile(path.join(stemsDir, `${name}.wav`), stem);
  }

  const metadata = {
    created_at: new Date().toISOString(),
    bpm: opts.bpm,
    duration_seconds: Number(renderDuration.toFixed(3)),
    seed: opts.seed,
    sections,
    orientation: {
      center: ["kick", "bass"],
      midWidth: ["snare", "pads", "lead"],
      wideBack: ["ambience", "fx", "glitch"]
    },
    notes:
      "Original generative IDM workflow with probabilistic rhythm, glitch synthesis, ambient field design, and stem export."
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

