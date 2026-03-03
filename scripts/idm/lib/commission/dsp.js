"use strict";

const { clamp } = require("../audio-utils");

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

module.exports = {
  applyFade,
  applyHaas,
  hardLimitStereo,
  stereoWidth
};
