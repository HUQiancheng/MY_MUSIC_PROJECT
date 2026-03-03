"use strict";

const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;

function createStereoBuffer(durationSec, sampleRate = SAMPLE_RATE) {
  const frames = Math.max(1, Math.floor(durationSec * sampleRate));
  return {
    sampleRate,
    frames,
    L: new Float32Array(frames),
    R: new Float32Array(frames)
  };
}

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function panToGains(pan) {
  const p = clamp(pan, -1, 1);
  const angle = (p + 1) * Math.PI * 0.25;
  return [Math.cos(angle), Math.sin(angle)];
}

function midiToHz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function mixIn(dest, src, gain = 1) {
  const n = Math.min(dest.L.length, src.L.length);
  for (let i = 0; i < n; i++) {
    dest.L[i] += src.L[i] * gain;
    dest.R[i] += src.R[i] * gain;
  }
}

function getPeak(stereo) {
  let peak = 0;
  for (let i = 0; i < stereo.L.length; i++) {
    const a = Math.abs(stereo.L[i]);
    const b = Math.abs(stereo.R[i]);
    if (a > peak) peak = a;
    if (b > peak) peak = b;
  }
  return peak;
}

function normalizeStereo(stereo, targetPeak = 0.92) {
  const peak = getPeak(stereo);
  if (peak <= 1e-9) return;
  const g = targetPeak / peak;
  for (let i = 0; i < stereo.L.length; i++) {
    stereo.L[i] *= g;
    stereo.R[i] *= g;
  }
}

function softClipStereo(stereo, drive = 1) {
  const d = Math.max(0.1, drive);
  for (let i = 0; i < stereo.L.length; i++) {
    stereo.L[i] = Math.tanh(stereo.L[i] * d);
    stereo.R[i] = Math.tanh(stereo.R[i] * d);
  }
}

function createBiquad(type, freq, q = 0.707, gainDb = 0, sampleRate = SAMPLE_RATE) {
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * q);
  const A = Math.pow(10, gainDb / 40);

  let b0 = 1;
  let b1 = 0;
  let b2 = 0;
  let a0 = 1;
  let a1 = 0;
  let a2 = 0;

  if (type === "lowpass") {
    b0 = (1 - cosW0) / 2;
    b1 = 1 - cosW0;
    b2 = (1 - cosW0) / 2;
    a0 = 1 + alpha;
    a1 = -2 * cosW0;
    a2 = 1 - alpha;
  } else if (type === "highpass") {
    b0 = (1 + cosW0) / 2;
    b1 = -(1 + cosW0);
    b2 = (1 + cosW0) / 2;
    a0 = 1 + alpha;
    a1 = -2 * cosW0;
    a2 = 1 - alpha;
  } else if (type === "peaking") {
    b0 = 1 + alpha * A;
    b1 = -2 * cosW0;
    b2 = 1 - alpha * A;
    a0 = 1 + alpha / A;
    a1 = -2 * cosW0;
    a2 = 1 - alpha / A;
  } else if (type === "lowshelf") {
    const sqrtA = Math.sqrt(A);
    const twoSqrtAAlpha = 2 * sqrtA * alpha;
    b0 = A * ((A + 1) - (A - 1) * cosW0 + twoSqrtAAlpha);
    b1 = 2 * A * ((A - 1) - (A + 1) * cosW0);
    b2 = A * ((A + 1) - (A - 1) * cosW0 - twoSqrtAAlpha);
    a0 = (A + 1) + (A - 1) * cosW0 + twoSqrtAAlpha;
    a1 = -2 * ((A - 1) + (A + 1) * cosW0);
    a2 = (A + 1) + (A - 1) * cosW0 - twoSqrtAAlpha;
  } else if (type === "highshelf") {
    const sqrtA = Math.sqrt(A);
    const twoSqrtAAlpha = 2 * sqrtA * alpha;
    b0 = A * ((A + 1) + (A - 1) * cosW0 + twoSqrtAAlpha);
    b1 = -2 * A * ((A - 1) + (A + 1) * cosW0);
    b2 = A * ((A + 1) + (A - 1) * cosW0 - twoSqrtAAlpha);
    a0 = (A + 1) - (A - 1) * cosW0 + twoSqrtAAlpha;
    a1 = 2 * ((A - 1) - (A + 1) * cosW0);
    a2 = (A + 1) - (A - 1) * cosW0 - twoSqrtAAlpha;
  }

  const nb0 = b0 / a0;
  const nb1 = b1 / a0;
  const nb2 = b2 / a0;
  const na1 = a1 / a0;
  const na2 = a2 / a0;

  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;

  return function processSample(x0) {
    const y0 = nb0 * x0 + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
    return y0;
  };
}

function applyEqChain(stereo, chain) {
  for (const stage of chain) {
    const left = createBiquad(stage.type, stage.freq, stage.q, stage.gainDb, stereo.sampleRate);
    const right = createBiquad(stage.type, stage.freq, stage.q, stage.gainDb, stereo.sampleRate);
    for (let i = 0; i < stereo.L.length; i++) {
      stereo.L[i] = left(stereo.L[i]);
      stereo.R[i] = right(stereo.R[i]);
    }
  }
}

function applyStereoDelay(stereo, delaySec = 0.22, feedback = 0.28, mix = 0.18) {
  const d = Math.max(1, Math.floor(delaySec * stereo.sampleRate));
  const bL = new Float32Array(d);
  const bR = new Float32Array(d);
  let index = 0;
  for (let i = 0; i < stereo.L.length; i++) {
    const inL = stereo.L[i];
    const inR = stereo.R[i];
    const tapL = bL[index];
    const tapR = bR[index];
    bL[index] = inR + tapL * feedback;
    bR[index] = inL + tapR * feedback;
    stereo.L[i] = inL * (1 - mix) + tapL * mix;
    stereo.R[i] = inR * (1 - mix) + tapR * mix;
    index++;
    if (index >= d) index = 0;
  }
}

function computeKickEnvelope(stereo, attack = 0.002, release = 0.08) {
  const env = new Float32Array(stereo.L.length);
  const atk = Math.exp(-1 / (stereo.sampleRate * attack));
  const rel = Math.exp(-1 / (stereo.sampleRate * release));
  let value = 0;
  for (let i = 0; i < env.length; i++) {
    const x = Math.abs(stereo.L[i]) + Math.abs(stereo.R[i]);
    const coeff = x > value ? atk : rel;
    value = x + coeff * (value - x);
    env[i] = value;
  }
  return env;
}

function applyDucking(stereo, env, amount = 0.35) {
  for (let i = 0; i < stereo.L.length && i < env.length; i++) {
    const duck = 1 - Math.min(1, env[i] * 2.6) * amount;
    stereo.L[i] *= duck;
    stereo.R[i] *= duck;
  }
}

function writeWavFile(outPath, stereo) {
  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });

  const channels = 2;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = stereo.sampleRate * blockAlign;
  const dataSize = stereo.L.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(stereo.sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < stereo.L.length; i++) {
    const l = clamp(stereo.L[i], -1, 1);
    const r = clamp(stereo.R[i], -1, 1);
    buffer.writeInt16LE(Math.round(l * 32767), offset);
    buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(outPath, buffer);
}

function trimStereo(stereo, durationSec) {
  const frames = Math.max(1, Math.floor(durationSec * stereo.sampleRate));
  if (frames >= stereo.L.length) return stereo;
  return {
    sampleRate: stereo.sampleRate,
    frames,
    L: stereo.L.slice(0, frames),
    R: stereo.R.slice(0, frames)
  };
}

module.exports = {
  SAMPLE_RATE,
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
};

