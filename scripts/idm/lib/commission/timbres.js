"use strict";

const { midiToHz, panToGains } = require("../audio-utils");
const {
  addFmPluck,
  addGlitchBurst,
  addHat,
  addKick,
  addNoiseRiser,
  addPadChord,
  addSnare
} = require("../instruments");

const TIMBRE_PALETTE = [
  { id: "kick-deep", bus: "kick", band: "30-90Hz", role: "foundation", purpose: "Primary low-end anchor" },
  { id: "kick-punch", bus: "kick", band: "80-250Hz", role: "transient", purpose: "Adds mid punch to kick" },
  { id: "kick-ghost", bus: "kick", band: "40-130Hz", role: "syncopation", purpose: "Ghost low hits and momentum" },
  { id: "kick-soft", bus: "kick", band: "45-140Hz", role: "narrative-space", purpose: "Soft heartbeat kick to leave room" },
  { id: "kick-tight", bus: "kick", band: "70-220Hz", role: "articulation", purpose: "Short tight kick for pattern pivots" },
  { id: "kick-crunch", bus: "kick", band: "90-380Hz", role: "contrast", purpose: "Crunch kick color for section contrast" },
  { id: "snare-body", bus: "snare", band: "160-2200Hz", role: "backbeat", purpose: "Main snare body" },
  { id: "snare-bright", bus: "snare", band: "2-9kHz", role: "backbeat", purpose: "Top snap layer" },
  { id: "snare-rim", bus: "snare", band: "900-5kHz", role: "ghost-note", purpose: "Rim articulation and ghosts" },
  { id: "clap-wide", bus: "snare", band: "900-8kHz", role: "accent", purpose: "Stereo clap reinforcement" },
  { id: "hat-closed", bus: "hats", band: "5-12kHz", role: "time-grid", purpose: "Primary hat pulse" },
  { id: "hat-open", bus: "hats", band: "4-11kHz", role: "release", purpose: "Open-hat release points" },
  { id: "hat-dust", bus: "hats", band: "7-14kHz", role: "air", purpose: "Dusty high noise texture" },
  { id: "shaker-grain", bus: "hats", band: "5-13kHz", role: "microtime", purpose: "Continuous shaker detail" },
  { id: "ride-ping", bus: "ride", band: "2.5-10kHz", role: "swing-mark", purpose: "Ride time marker" },
  { id: "ride-bell", bus: "ride", band: "4-12kHz", role: "accent", purpose: "Bell accents at peak" },
  { id: "perc-wood", bus: "perc", band: "500-3kHz", role: "syncopation", purpose: "Woody percussive notes" },
  { id: "perc-tick", bus: "perc", band: "1-4kHz", role: "micro-accent", purpose: "Fast short ticks" },
  { id: "perc-tom", bus: "perc", band: "120-900Hz", role: "fill", purpose: "Tom-like resonant fills" },
  { id: "perc-blip", bus: "perc", band: "700-5kHz", role: "motif accent", purpose: "Pitched blip punctuation" },
  { id: "bass-sub", bus: "bass", band: "30-90Hz", role: "counterpoint", purpose: "Sub harmonic backbone" },
  { id: "bass-growl", bus: "bass", band: "70-450Hz", role: "counterpoint", purpose: "Harmonic bass growl" },
  { id: "bass-glide", bus: "bass", band: "40-220Hz", role: "voice-leading", purpose: "Gliding bass transitions" },
  { id: "pad-warm", bus: "pads", band: "180-5kHz", role: "harmony-bed", purpose: "Warm sustained chord bed" },
  { id: "pad-glass", bus: "pads", band: "350-9kHz", role: "harmony-color", purpose: "Bright glass chord layer" },
  { id: "pad-noise", bus: "pads", band: "1-12kHz", role: "harmony-air", purpose: "Noisy pad halo" },
  { id: "keys-ep", bus: "keys", band: "220-6kHz", role: "motif-core", purpose: "Main motivic electric keys" },
  { id: "keys-fm", bus: "keys", band: "300-8kHz", role: "motif-answer", purpose: "FM key response phrase" },
  { id: "chord-stab", bus: "keys", band: "250-9kHz", role: "harmonic-hit", purpose: "Short chord punctuations" },
  { id: "guitar-clean", bus: "guitar", band: "180-7kHz", role: "riff", purpose: "Clean plucked guitar-like riff voice" },
  { id: "guitar-mute", bus: "guitar", band: "220-5kHz", role: "groove", purpose: "Muted guitar chank for rhythmic comping" },
  { id: "lead-fm", bus: "lead", band: "500-10kHz", role: "foreground", purpose: "Primary lead material" },
  { id: "lead-glass", bus: "lead", band: "1-12kHz", role: "foreground", purpose: "Glass lead during climax" },
  { id: "counter-pulse", bus: "counter", band: "300-5kHz", role: "counterline", purpose: "Rhythmic pulse counterline" },
  { id: "arp-chip", bus: "counter", band: "1-9kHz", role: "counterline", purpose: "Fast digital arpeggio" },
  { id: "counter-soft", bus: "counter", band: "450-4kHz", role: "residual-melody", purpose: "Soft dissolve counterphrase" },
  { id: "drone-low", bus: "drone", band: "70-500Hz", role: "continuity", purpose: "Low sustained drone" },
  { id: "drone-high", bus: "drone", band: "1-10kHz", role: "continuity", purpose: "High spectral drone" },
  { id: "metal-short", bus: "metal", band: "800-11kHz", role: "mechanical", purpose: "Short metallic scrape" },
  { id: "metal-long", bus: "metal", band: "700-10kHz", role: "mechanical", purpose: "Long morphing metallic sweep" },
  { id: "glitch-digital", bus: "glitch", band: "900-12kHz", role: "fracture", purpose: "Digital glitch fragments" },
  { id: "noise-riser", bus: "fx", band: "300-12kHz", role: "transition", purpose: "Section transition riser" },
  { id: "air-spark", bus: "ambience", band: "2-14kHz", role: "atmosphere", purpose: "Air sparkle texture" },
  { id: "texture-grain", bus: "ambience", band: "600-11kHz", role: "atmosphere", purpose: "Granular cloudy texture" }
];

const timbreById = Object.fromEntries(TIMBRE_PALETTE.map((t) => [t.id, t]));

function addKickPunch(stereo, startSec, velocity = 1) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.13 * sr);
  let p = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const env = Math.exp(-t * 26);
    const f = 140 + Math.exp(-t * 32) * 180;
    p += (2 * Math.PI * f) / sr;
    const click = Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 90);
    const body = Math.sin(p) * env;
    const s = Math.tanh((body * 0.9 + click * 0.4) * 1.3) * velocity;
    stereo.L[i] += s;
    stereo.R[i] += s;
  }
}

function addKickSoft(stereo, startSec, velocity = 1) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.26 * sr);
  let p = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const env = Math.exp(-t * 14);
    const f = 74 + Math.exp(-t * 18) * 56;
    p += (2 * Math.PI * f) / sr;
    const sub = Math.sin(p) * env;
    const tone = Math.sin(2 * p + Math.sin(p) * 0.3) * env * 0.32;
    const s = Math.tanh((sub * 0.95 + tone) * 1.1) * velocity;
    stereo.L[i] += s;
    stereo.R[i] += s;
  }
}

function addKickTight(stereo, startSec, velocity = 1) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.12 * sr);
  let p = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const env = Math.exp(-t * 38);
    const f = 118 + Math.exp(-t * 30) * 90;
    p += (2 * Math.PI * f) / sr;
    const body = Math.sin(p + Math.sin(2 * p) * 0.18) * env;
    const s = Math.tanh(body * 1.55) * velocity;
    stereo.L[i] += s;
    stereo.R[i] += s;
  }
}

function addKickCrunch(stereo, startSec, velocity = 1) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.16 * sr);
  let p = 0;
  let lp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const env = Math.exp(-t * 26);
    const f = 104 + Math.exp(-t * 28) * 112;
    p += (2 * Math.PI * f) / sr;
    const click = Math.sin(2 * Math.PI * 2100 * t) * Math.exp(-t * 70);
    const raw = Math.sin(p) * 0.8 + click * 0.46;
    lp += 0.2 * (raw - lp);
    const hp = raw - lp;
    const s = Math.tanh((lp * 1.1 + hp * 0.6) * 1.45) * env * velocity;
    stereo.L[i] += s;
    stereo.R[i] += s;
  }
}

function addRimTick(stereo, startSec, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.09 * sr);
  const [gl, gr] = panToGains(pan);
  let p = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p += (2 * Math.PI * 2300) / sr;
    const tone = Math.sin(p + Math.sin(2 * p) * 0.2);
    const s = tone * Math.exp(-t * 55) * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addClapWide(stereo, startSec, velocity = 1, rng) {
  const sr = stereo.sampleRate;
  const bursts = [0, 0.008, 0.016, 0.024];

  for (const offset of bursts) {
    const i0 = Math.floor((startSec + offset) * sr);
    const len = Math.floor(0.12 * sr);
    let lp = 0;
    for (let j = 0; j < len; j++) {
      const i = i0 + j;
      if (i < 0 || i >= stereo.frames) break;
      const t = j / sr;
      const n = rng ? rng.signed() : Math.random() * 2 - 1;
      lp = lp * 0.85 + n * 0.15;
      const hp = n - lp;
      const env = Math.exp(-t * (34 + offset * 700));
      const pan = Math.sin((i + offset * 1000) * 0.001) * 0.7;
      const [gl, gr] = panToGains(pan);
      const s = hp * env * velocity * 0.6;
      stereo.L[i] += s * gl;
      stereo.R[i] += s * gr;
    }
  }
}

function addShaker(stereo, startSec, durationSec, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  let lp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const n = rng ? rng.signed() : Math.random() * 2 - 1;
    lp = lp * 0.97 + n * 0.03;
    const hp = n - lp;
    const trem = 0.6 + 0.4 * Math.sin(2 * Math.PI * 14 * t);
    const env = Math.exp(-t * 18);
    const s = hp * trem * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addWoodPerc(stereo, startSec, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.18 * sr);
  const [gl, gr] = panToGains(pan);
  let p1 = 0;
  let p2 = 0;
  const f1 = 500 + (rng ? rng.range(-40, 40) : 0);
  const f2 = 740 + (rng ? rng.range(-55, 55) : 0);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p1 += (2 * Math.PI * f1) / sr;
    p2 += (2 * Math.PI * f2) / sr;
    const s = (Math.sin(p1) * 0.7 + Math.sin(p2) * 0.3) * Math.exp(-t * 26) * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addTomRes(stereo, startSec, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.3 * sr);
  const [gl, gr] = panToGains(pan);
  let p = 0;
  const f0 = 120 + (rng ? rng.range(-12, 12) : 0);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const f = f0 + Math.exp(-t * 10) * 40;
    p += (2 * Math.PI * f) / sr;
    const s = Math.sin(p) * Math.exp(-t * 13) * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addBlipPerc(stereo, startSec, midi, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.14 * sr);
  const [gl, gr] = panToGains(pan);
  let p = 0;
  const base = midiToHz(midi);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const f = base * (1 + Math.exp(-t * 24) * 1.6);
    p += (2 * Math.PI * f) / sr;
    const s = Math.sin(p + Math.sin(2 * p) * 0.25) * Math.exp(-t * 36) * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
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

function addBassGrowl(stereo, startSec, durationSec, midi, velocity = 1) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const base = midiToHz(midi);
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let filt = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p1 += (2 * Math.PI * base) / sr;
    p2 += (2 * Math.PI * base * 1.51) / sr;
    p3 += (2 * Math.PI * base * 2.02) / sr;
    const raw = Math.sin(p1) * 0.6 + Math.sin(p2 + Math.sin(p1) * 0.7) * 0.28 + Math.sin(p3) * 0.2;
    const sat = Math.tanh(raw * 2.1);
    filt += 0.08 * (sat - filt);
    const env = Math.min(1, t * 30) * Math.exp(-t * 3.2);
    const s = filt * env * velocity;
    stereo.L[i] += s;
    stereo.R[i] += s;
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

function addGuitarPluck(stereo, startSec, midi, durationSec, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  const base = midiToHz(midi);
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let lp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p1 += (2 * Math.PI * base) / sr;
    p2 += (2 * Math.PI * base * 2.01) / sr;
    p3 += (2 * Math.PI * base * 3.0) / sr;
    const pick = Math.sin(2 * Math.PI * 2800 * t) * Math.exp(-t * 95);
    const body = Math.sin(p1) * 0.7 + Math.sin(p2) * 0.22 + Math.sin(p3) * 0.12;
    const raw = body + pick * 0.45;
    lp += 0.14 * (raw - lp);
    const hp = raw - lp;
    const env = Math.min(1, t * 45) * Math.exp(-t * 6.8);
    const s = Math.tanh((lp * 1.2 + hp * 0.4) * 1.35) * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addGuitarMute(stereo, startSec, durationSec, midi, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(Math.max(0.04, durationSec) * sr);
  const [gl, gr] = panToGains(pan);
  const base = midiToHz(midi);
  let p = 0;
  let lp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p += (2 * Math.PI * base * (1 + 0.2 * Math.exp(-t * 25))) / sr;
    const n = rng ? rng.signed() : Math.random() * 2 - 1;
    lp = lp * 0.88 + n * 0.12;
    const hp = n - lp;
    const tone = Math.sin(p + Math.sin(2 * p) * 0.2);
    const env = Math.exp(-t * 30);
    const s = (tone * 0.58 + hp * 0.32) * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addPulseCounter(stereo, startSec, durationSec, midi, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  const base = midiToHz(midi);
  let p = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p += (2 * Math.PI * base) / sr;
    const pulse = Math.sign(Math.sin(p + Math.sin(0.5 * p) * 0.6));
    const env = Math.exp(-t * 7.5);
    const s = pulse * env * velocity * 0.4;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addGlassLead(stereo, startSec, midi, durationSec, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  const base = midiToHz(midi);
  let cp = 0;
  let mp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    cp += (2 * Math.PI * base) / sr;
    mp += (2 * Math.PI * base * 3.2) / sr;
    const env = Math.exp(-t * 6.8);
    const shimmer = Math.sin(cp + Math.sin(mp) * 6.2) * 0.7 + Math.sin(2 * cp + Math.sin(mp * 0.7) * 3) * 0.3;
    const s = shimmer * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addArpChip(stereo, startSec, midi, durationSec, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  const base = midiToHz(midi);
  let p = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p += (2 * Math.PI * base) / sr;
    const square = Math.sign(Math.sin(p)) * 0.65 + Math.sin(2 * p) * 0.2;
    const env = Math.exp(-t * 11.2);
    const s = square * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addDroneTone(stereo, startSec, durationSec, midi, velocity = 1, pan = 0, bright = false) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  const base = midiToHz(midi);
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p1 += (2 * Math.PI * base) / sr;
    p2 += (2 * Math.PI * base * 1.5) / sr;
    p3 += (2 * Math.PI * base * 2.01) / sr;
    const drift = Math.sin(2 * Math.PI * 0.09 * t) * 0.18;
    const tone =
      Math.sin(p1 + drift) * 0.7 +
      Math.sin(p2 + drift * 1.4) * (bright ? 0.35 : 0.18) +
      Math.sin(p3) * (bright ? 0.2 : 0.08);
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, j / Math.max(1, len - 1))), 0.4);
    const s = tone * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addAirSpark(stereo, startSec, durationSec, velocity = 1, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  let lp = 0;
  let ph = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const x = j / Math.max(1, len - 1);
    const n = rng ? rng.signed() : Math.random() * 2 - 1;
    lp = lp * 0.985 + n * 0.015;
    const hp = n - lp;
    ph += (2 * Math.PI * (1800 + x * x * 6200)) / sr;
    const tone = Math.sin(ph + Math.sin(0.01 * i)) * 0.25;
    const env = Math.pow(Math.sin(Math.PI * x), 1.2);
    const pan = Math.sin(2 * Math.PI * x * 1.9) * 0.7;
    const [gl, gr] = panToGains(pan);
    const s = (hp * 0.45 + tone) * env * velocity;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addTextureGrain(stereo, startSec, durationSec, velocity = 1, rng) {
  const grains = Math.max(4, Math.floor(durationSec * 12));
  for (let g = 0; g < grains; g++) {
    const gt = startSec + (g / grains) * durationSec + (rng ? rng.range(-0.015, 0.015) : 0);
    const gmidi = 72 + (rng ? rng.int(-9, 9) : 0);
    addBlipPerc(stereo, gt, gmidi, velocity * (0.3 + (rng ? rng.range(0, 0.4) : 0.2)), rng ? rng.range(-0.85, 0.85) : 0);
  }
}

function addPadNoise(stereo, startSec, durationSec, velocity = 1, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  let lp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const x = j / Math.max(1, len - 1);
    const n = rng ? rng.signed() : Math.random() * 2 - 1;
    lp = lp * 0.995 + n * 0.005;
    const hp = n - lp;
    const env = Math.pow(Math.sin(Math.PI * x), 1.1) * Math.exp(-t * 0.6);
    const pan = Math.sin(2 * Math.PI * x * 0.7) * 0.95;
    const [gl, gr] = panToGains(pan);
    const s = hp * env * velocity * 0.5;
    stereo.L[i] += s * gl;
    stereo.R[i] += s * gr;
  }
}

function addRidePing(stereo, startSec, velocity = 1, pan = 0, rng, bell = false) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor((bell ? 0.45 : 0.32) * sr);
  const [gl, gr] = panToGains(pan);
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;

  const f1 = (bell ? 5200 : 4200) + (rng ? rng.range(-120, 120) : 0);
  const f2 = (bell ? 7800 : 6900) + (rng ? rng.range(-180, 180) : 0);
  const f3 = (bell ? 10600 : 9800) + (rng ? rng.range(-240, 240) : 0);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    p1 += (2 * Math.PI * f1) / sr;
    p2 += (2 * Math.PI * f2) / sr;
    p3 += (2 * Math.PI * f3) / sr;
    const body = Math.sin(p1) * Math.exp(-t * (bell ? 16 : 34));
    const top = Math.sin(p2 + Math.sin(p1) * 0.8) * Math.exp(-t * (bell ? 13 : 22));
    const air = Math.sin(p3) * Math.exp(-t * (bell ? 10 : 18));
    const s = (body * 0.45 + top * 0.38 + air * 0.24) * velocity;
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

function emitTimbre(stems, id, params) {
  const timbre = timbreById[id];
  if (!timbre) return;

  const target = stems[timbre.bus];
  if (!target) return;

  const {
    startSec,
    durationSec = 0.2,
    midi = 60,
    velocity = 1,
    pan = 0,
    rng,
    chord,
    beat = 0.322,
    glideSemis = 0
  } = params;

  switch (id) {
    case "kick-deep":
      addKick(target, startSec, velocity);
      break;
    case "kick-punch":
      addKickPunch(target, startSec, velocity);
      break;
    case "kick-ghost":
      addKick(target, startSec, velocity * 0.72);
      addKickPunch(target, startSec + beat * 0.03, velocity * 0.5);
      break;
    case "kick-soft":
      addKickSoft(target, startSec, velocity);
      break;
    case "kick-tight":
      addKickTight(target, startSec, velocity);
      break;
    case "kick-crunch":
      addKickCrunch(target, startSec, velocity);
      break;
    case "snare-body":
      addSnare(target, startSec, velocity, pan, rng);
      break;
    case "snare-bright":
      addSnare(target, startSec, velocity * 0.82, pan * 0.6, rng);
      addRimTick(target, startSec + 0.002, velocity * 0.48, pan * 0.7);
      break;
    case "snare-rim":
      addRimTick(target, startSec, velocity, pan);
      break;
    case "clap-wide":
      addClapWide(target, startSec, velocity, rng);
      break;
    case "hat-closed":
      addHat(target, startSec, velocity, pan, false, rng);
      break;
    case "hat-open":
      addHat(target, startSec, velocity, pan, true, rng);
      break;
    case "hat-dust":
      addShaker(target, startSec, Math.max(0.03, durationSec), velocity * 0.5, pan, rng);
      break;
    case "shaker-grain":
      addShaker(target, startSec, Math.max(0.045, durationSec), velocity, pan, rng);
      break;
    case "ride-ping":
      addRidePing(target, startSec, velocity, pan, rng, false);
      break;
    case "ride-bell":
      addRidePing(target, startSec, velocity, pan, rng, true);
      break;
    case "perc-wood":
      addWoodPerc(target, startSec, velocity, pan, rng);
      break;
    case "perc-tick":
      addRimTick(target, startSec, velocity, pan);
      break;
    case "perc-tom":
      addTomRes(target, startSec, velocity, pan, rng);
      break;
    case "perc-blip":
      addBlipPerc(target, startSec, midi, velocity, pan);
      break;
    case "bass-sub":
      addSubCounterNote(target, startSec, durationSec, midi, velocity, 0);
      break;
    case "bass-growl":
      addBassGrowl(target, startSec, durationSec, midi, velocity);
      break;
    case "bass-glide":
      addSubCounterNote(target, startSec, durationSec, midi, velocity, glideSemis);
      break;
    case "pad-warm":
      if (chord) addPadChord(target, startSec, durationSec, chord.voicing, velocity, 0.64);
      break;
    case "pad-glass":
      if (chord) {
        const high = chord.voicing.slice(1).map((n, i) => n + 12 + (i % 2 ? 5 : 0));
        addPadChord(target, startSec, durationSec, high, velocity, 0.9);
      }
      break;
    case "pad-noise":
      addPadNoise(target, startSec, durationSec, velocity, rng);
      break;
    case "keys-ep":
      addEpianoNote(target, startSec, midi, durationSec, velocity, pan);
      break;
    case "keys-fm":
      addFmPluck(target, startSec, midi, durationSec, velocity, pan);
      break;
    case "chord-stab":
      if (chord) {
        for (let i = 0; i < chord.keyVoicing.length; i++) {
          const note = chord.keyVoicing[i] + (i % 2 ? 12 : 0);
          const p = (i / Math.max(1, chord.keyVoicing.length - 1)) * 1.2 - 0.6;
          addFmPluck(target, startSec, note, durationSec * 0.7, velocity * (1 - i * 0.1), p);
        }
      }
      break;
    case "guitar-clean":
      addGuitarPluck(target, startSec, midi, durationSec, velocity, pan);
      break;
    case "guitar-mute":
      addGuitarMute(target, startSec, durationSec, midi, velocity, pan, rng);
      break;
    case "lead-fm":
      addFmPluck(target, startSec, midi, durationSec, velocity, pan);
      break;
    case "lead-glass":
      addGlassLead(target, startSec, midi, durationSec, velocity, pan);
      break;
    case "counter-pulse":
      addPulseCounter(target, startSec, durationSec, midi, velocity, pan);
      break;
    case "arp-chip":
      addArpChip(target, startSec, midi, durationSec, velocity, pan);
      break;
    case "counter-soft":
      addPulseCounter(target, startSec, durationSec, midi, velocity * 0.7, pan * 0.7);
      break;
    case "drone-low":
      addDroneTone(target, startSec, durationSec, midi, velocity, pan, false);
      break;
    case "drone-high":
      addDroneTone(target, startSec, durationSec, midi, velocity, pan, true);
      break;
    case "metal-short":
      addMetalScrape(target, startSec, Math.max(0.06, durationSec), midiToHz(midi), velocity, pan, rng);
      break;
    case "metal-long":
      addMetalScrape(target, startSec, Math.max(0.16, durationSec), midiToHz(midi), velocity, pan, rng);
      break;
    case "glitch-digital":
      addGlitchBurst(target, startSec, Math.max(0.03, durationSec), midiToHz(midi), velocity, pan, rng);
      break;
    case "noise-riser":
      addNoiseRiser(target, startSec, Math.max(0.12, durationSec), velocity, rng);
      break;
    case "air-spark":
      addAirSpark(target, startSec, durationSec, velocity, rng);
      break;
    case "texture-grain":
      addTextureGrain(target, startSec, durationSec, velocity, rng);
      break;
    default:
      break;
  }
}

module.exports = {
  TIMBRE_PALETTE,
  emitTimbre
};
