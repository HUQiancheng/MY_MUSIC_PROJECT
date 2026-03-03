"use strict";

const { midiToHz, panToGains } = require("./audio-utils");

function addKick(stereo, startSec, velocity = 1) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.42 * sr);
  let phase = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const env = Math.exp(-t * 12);
    const pitchEnv = Math.exp(-t * 24);
    const freq = 160 * pitchEnv + 39;
    phase += (2 * Math.PI * freq) / sr;
    const body = Math.sin(phase) * env;
    const click = Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 130);
    const dist = Math.tanh((body * 1.35 + click * 0.3) * 1.1);
    const sample = dist * velocity;
    stereo.L[i] += sample;
    stereo.R[i] += sample;
  }
}

function addSnare(stereo, startSec, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(0.24 * sr);
  const [gl, gr] = panToGains(pan);
  let lp = 0;
  let phase = 0;
  const toneFreq = 190 + (rng ? rng.range(-15, 25) : 0);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const noise = rng ? rng.signed() : Math.random() * 2 - 1;
    lp += 0.35 * (noise - lp);
    const hp = noise - lp;

    phase += (2 * Math.PI * toneFreq) / sr;
    const tone = Math.sin(phase + 0.2 * Math.sin(2 * phase));

    const envN = Math.exp(-t * 24);
    const envT = Math.exp(-t * 17);
    const sample = (0.8 * hp * envN + 0.35 * tone * envT) * velocity;
    stereo.L[i] += sample * gl;
    stereo.R[i] += sample * gr;
  }
}

function addHat(stereo, startSec, velocity = 1, pan = 0, open = false, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor((open ? 0.19 : 0.06) * sr);
  const [gl, gr] = panToGains(pan);
  let low = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const n = rng ? rng.signed() : Math.random() * 2 - 1;
    low = 0.92 * low + 0.08 * n;
    const hp = n - low;
    const metal =
      0.4 * Math.sin(2 * Math.PI * 8300 * t) +
      0.35 * Math.sin(2 * Math.PI * 11200 * t) +
      0.25 * Math.sin(2 * Math.PI * 12700 * t);
    const env = Math.exp(-t * (open ? 16 : 80));
    const sample = (0.72 * hp + 0.28 * metal) * env * velocity;
    stereo.L[i] += sample * gl;
    stereo.R[i] += sample * gr;
  }
}

function addBassNote(stereo, startSec, durationSec, midi, velocity = 1) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const base = midiToHz(midi);
  let p1 = 0;
  let p2 = 0;
  let filt = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const env = Math.min(1, t * 45) * Math.exp(-t * 3.4);
    p1 += (2 * Math.PI * base) / sr;
    p2 += (2 * Math.PI * base * 1.006) / sr;
    const raw =
      0.75 * Math.sin(p1) +
      0.45 * Math.sin(2 * p1 + 0.5 * Math.sin(0.8 * p2)) +
      0.25 * Math.sin(3 * p2);
    const sat = Math.tanh(raw * 1.7);
    filt += 0.11 * (sat - filt);
    const sample = filt * env * velocity;
    stereo.L[i] += sample;
    stereo.R[i] += sample;
  }
}

function addFmPluck(stereo, startSec, midi, durationSec, velocity = 1, pan = 0) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  const carrier = midiToHz(midi);
  const mod = carrier * 2.98;
  let cp = 0;
  let mp = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const env = Math.exp(-t * 9);
    const modEnv = Math.exp(-t * 14);
    cp += (2 * Math.PI * carrier) / sr;
    mp += (2 * Math.PI * mod) / sr;
    const m = Math.sin(mp) * modEnv * 7;
    const sample =
      (Math.sin(cp + m) * 0.8 + 0.35 * Math.sin(2 * cp + 0.5 * m)) * env * velocity;
    stereo.L[i] += sample * gl;
    stereo.R[i] += sample * gr;
  }
}

function addPadChord(stereo, startSec, durationSec, midiNotes, velocity = 1, width = 0.7) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const x = Math.max(0, Math.min(1, t / durationSec));
    const env = Math.pow(Math.sin(Math.PI * x), 1.22) * velocity;

    let l = 0;
    let r = 0;
    for (let n = 0; n < midiNotes.length; n++) {
      const hz = midiToHz(midiNotes[n]);
      const detune = 1 + (n - midiNotes.length * 0.5) * 0.0018;
      const phase = 2 * Math.PI * hz * detune * t;
      const voice =
        0.8 * Math.sin(phase + 0.15 * Math.sin(2 * Math.PI * 0.17 * t + n)) +
        0.2 * Math.sin(2 * phase);
      const pan = ((n / Math.max(1, midiNotes.length - 1)) * 2 - 1) * width;
      const [gl, gr] = panToGains(pan);
      l += voice * gl;
      r += voice * gr;
    }

    const sampleL = (l / midiNotes.length) * env;
    const sampleR = (r / midiNotes.length) * env;
    stereo.L[i] += sampleL;
    stereo.R[i] += sampleR;
  }
}

function addGlitchBurst(stereo, startSec, durationSec, baseHz, velocity = 1, pan = 0, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  const [gl, gr] = panToGains(pan);
  let hold = 0;
  let holdCounter = 0;
  let phaseA = 0;
  let phaseB = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;

    if (holdCounter <= 0) {
      hold = rng ? rng.signed() : Math.random() * 2 - 1;
      holdCounter = rng ? rng.int(8, 62) : 25;
    }
    holdCounter--;

    const fm = 1 + 0.4 * Math.sin(2 * Math.PI * 7.2 * t);
    phaseA += (2 * Math.PI * baseHz * fm) / sr;
    phaseB += (2 * Math.PI * baseHz * 1.73) / sr;
    const ring = Math.sin(phaseA) * Math.sin(phaseB);
    const digital = Math.tanh((hold * 0.8 + ring * 0.9) * 1.9);
    const env = Math.exp(-t * 9) * Math.exp(-Math.max(0, t - durationSec * 0.1) * 6);
    const sample = digital * env * velocity;
    stereo.L[i] += sample * gl;
    stereo.R[i] += sample * gr;
  }
}

function addNoiseRiser(stereo, startSec, durationSec, velocity = 1, rng) {
  const sr = stereo.sampleRate;
  const i0 = Math.floor(startSec * sr);
  const len = Math.floor(durationSec * sr);
  let low = 0;
  let ph = 0;

  for (let j = 0; j < len; j++) {
    const i = i0 + j;
    if (i < 0 || i >= stereo.frames) break;
    const t = j / sr;
    const x = Math.max(0, Math.min(1, t / durationSec));
    const n = rng ? rng.signed() : Math.random() * 2 - 1;
    low = 0.96 * low + 0.04 * n;
    const hp = n - low;
    ph += (2 * Math.PI * (160 + 4200 * x * x)) / sr;
    const tone = Math.sin(ph) * 0.3;
    const env = Math.pow(x, 1.8) * (1 - Math.exp(-(1 - x) * 12));
    const pan = Math.sin(2 * Math.PI * x * 2.3) * 0.5;
    const [gl, gr] = panToGains(pan);
    const sample = (hp * 0.78 + tone) * env * velocity;
    stereo.L[i] += sample * gl;
    stereo.R[i] += sample * gr;
  }
}

module.exports = {
  addBassNote,
  addFmPluck,
  addGlitchBurst,
  addHat,
  addKick,
  addNoiseRiser,
  addPadChord,
  addSnare
};

