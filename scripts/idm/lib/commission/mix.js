"use strict";

const {
  applyDucking,
  applyEqChain,
  applyStereoDelay,
  computeKickEnvelope,
  createStereoBuffer,
  mixIn,
  normalizeStereo,
  softClipStereo,
  trimStereo
} = require("../audio-utils");
const { applyFade, applyHaas, hardLimitStereo, stereoWidth } = require("./dsp");

const BUS_NAMES = [
  "kick",
  "snare",
  "hats",
  "ride",
  "perc",
  "bass",
  "pads",
  "keys",
  "guitar",
  "lead",
  "counter",
  "metal",
  "glitch",
  "drone",
  "ambience",
  "fx"
];

function createCommissionStems(renderLength) {
  const stems = {};
  for (const name of BUS_NAMES) stems[name] = createStereoBuffer(renderLength);
  return stems;
}

function processStems(stems) {
  applyEqChain(stems.kick, [
    { type: "highpass", freq: 34, q: 0.707, gainDb: 0 },
    { type: "lowshelf", freq: 82, q: 0.707, gainDb: 1.9 },
    { type: "peaking", freq: 240, q: 1.15, gainDb: -2.4 },
    { type: "highshelf", freq: 6400, q: 0.707, gainDb: -2.3 }
  ]);
  softClipStereo(stems.kick, 1.28);

  applyEqChain(stems.snare, [
    { type: "highpass", freq: 130, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2100, q: 1.1, gainDb: 2.2 },
    { type: "highshelf", freq: 7600, q: 0.707, gainDb: 1.6 }
  ]);
  softClipStereo(stems.snare, 1.15);

  applyEqChain(stems.hats, [
    { type: "highpass", freq: 5200, q: 0.707, gainDb: 0 },
    { type: "highshelf", freq: 9800, q: 0.707, gainDb: 1.8 }
  ]);
  stereoWidth(stems.hats, 1.32);

  applyEqChain(stems.ride, [
    { type: "highpass", freq: 2600, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 6100, q: 1.1, gainDb: 1.8 },
    { type: "highshelf", freq: 10500, q: 0.707, gainDb: 1.3 }
  ]);
  applyStereoDelay(stems.ride, 0.1, 0.2, 0.09);
  stereoWidth(stems.ride, 1.34);

  applyEqChain(stems.perc, [
    { type: "highpass", freq: 320, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 1900, q: 1.2, gainDb: 1.5 },
    { type: "highshelf", freq: 7800, q: 0.707, gainDb: 1.1 }
  ]);
  stereoWidth(stems.perc, 1.4);

  applyEqChain(stems.bass, [
    { type: "lowpass", freq: 420, q: 0.707, gainDb: 0 },
    { type: "lowshelf", freq: 84, q: 0.707, gainDb: 2.7 },
    { type: "peaking", freq: 250, q: 1.0, gainDb: -1.2 }
  ]);
  softClipStereo(stems.bass, 1.24);

  applyEqChain(stems.pads, [
    { type: "highpass", freq: 170, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2200, q: 1.0, gainDb: -1.3 },
    { type: "highshelf", freq: 8800, q: 0.707, gainDb: 0.8 }
  ]);
  applyStereoDelay(stems.pads, 0.31, 0.38, 0.22);
  stereoWidth(stems.pads, 1.4);

  applyEqChain(stems.keys, [
    { type: "highpass", freq: 300, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 1800, q: 1.1, gainDb: 1.3 },
    { type: "highshelf", freq: 7500, q: 0.707, gainDb: 1.1 }
  ]);
  applyStereoDelay(stems.keys, 0.14, 0.24, 0.17);
  stereoWidth(stems.keys, 1.28);

  applyEqChain(stems.guitar, [
    { type: "highpass", freq: 180, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2600, q: 1.0, gainDb: 1.4 },
    { type: "highshelf", freq: 8600, q: 0.707, gainDb: 1.2 }
  ]);
  applyStereoDelay(stems.guitar, 0.11, 0.22, 0.16);
  stereoWidth(stems.guitar, 1.34);

  applyEqChain(stems.lead, [
    { type: "highpass", freq: 560, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 3200, q: 1.2, gainDb: 2.0 },
    { type: "highshelf", freq: 9800, q: 0.707, gainDb: 1.6 }
  ]);
  applyStereoDelay(stems.lead, 0.18, 0.31, 0.23);
  stereoWidth(stems.lead, 1.5);

  applyEqChain(stems.counter, [
    { type: "highpass", freq: 420, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 2600, q: 1.1, gainDb: 1.4 },
    { type: "highshelf", freq: 9200, q: 0.707, gainDb: 1.2 }
  ]);
  applyStereoDelay(stems.counter, 0.17, 0.28, 0.2);
  stereoWidth(stems.counter, 1.44);

  applyEqChain(stems.metal, [
    { type: "highpass", freq: 760, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 3200, q: 1.25, gainDb: 2.2 },
    { type: "highshelf", freq: 9800, q: 0.707, gainDb: 2.0 }
  ]);
  applyStereoDelay(stems.metal, 0.14, 0.22, 0.2);
  stereoWidth(stems.metal, 1.44);

  applyEqChain(stems.glitch, [
    { type: "highpass", freq: 880, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 3600, q: 1.3, gainDb: 1.8 },
    { type: "highshelf", freq: 9400, q: 0.707, gainDb: 1.5 }
  ]);
  applyStereoDelay(stems.glitch, 0.12, 0.22, 0.17);
  stereoWidth(stems.glitch, 1.42);

  applyEqChain(stems.drone, [
    { type: "highpass", freq: 60, q: 0.707, gainDb: 0 },
    { type: "lowpass", freq: 8400, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 1900, q: 1.0, gainDb: -1.0 }
  ]);
  applyStereoDelay(stems.drone, 0.42, 0.5, 0.23);
  stereoWidth(stems.drone, 1.6);

  applyEqChain(stems.ambience, [
    { type: "highpass", freq: 210, q: 0.707, gainDb: 0 },
    { type: "lowpass", freq: 9800, q: 0.707, gainDb: 0 },
    { type: "peaking", freq: 4200, q: 0.85, gainDb: -1.4 }
  ]);
  applyStereoDelay(stems.ambience, 0.4, 0.48, 0.28);
  applyHaas(stems.ambience, 10, "R");
  stereoWidth(stems.ambience, 1.82);

  applyEqChain(stems.fx, [
    { type: "highpass", freq: 250, q: 0.707, gainDb: 0 },
    { type: "highshelf", freq: 6800, q: 0.707, gainDb: 1.3 }
  ]);
  applyStereoDelay(stems.fx, 0.24, 0.34, 0.21);
  stereoWidth(stems.fx, 1.42);
}

function mixAndMaster({ stems, renderLength, renderDuration }) {
  processStems(stems);

  const kickEnv = computeKickEnvelope(stems.kick);
  applyDucking(stems.bass, kickEnv, 0.37);
  applyDucking(stems.pads, kickEnv, 0.42);
  applyDucking(stems.keys, kickEnv, 0.33);
  applyDucking(stems.guitar, kickEnv, 0.3);
  applyDucking(stems.lead, kickEnv, 0.34);
  applyDucking(stems.counter, kickEnv, 0.31);
  applyDucking(stems.drone, kickEnv, 0.25);
  applyDucking(stems.ambience, kickEnv, 0.47);
  applyDucking(stems.metal, kickEnv, 0.2);
  applyDucking(stems.glitch, kickEnv, 0.2);
  applyDucking(stems.fx, kickEnv, 0.26);

  const master = createStereoBuffer(renderLength);
  const gains = {
    kick: 0.74,
    snare: 0.72,
    hats: 0.29,
    ride: 0.34,
    perc: 0.26,
    bass: 0.82,
    pads: 0.6,
    keys: 0.57,
    guitar: 0.54,
    lead: 0.53,
    counter: 0.48,
    metal: 0.3,
    glitch: 0.18,
    drone: 0.35,
    ambience: 0.31,
    fx: 0.23
  };

  for (const [name, stem] of Object.entries(stems)) {
    mixIn(master, stem, gains[name] || 1);
  }

  applyEqChain(master, [
    { type: "highpass", freq: 28, q: 0.707, gainDb: 0 },
    { type: "lowshelf", freq: 92, q: 0.707, gainDb: 1.1 },
    { type: "peaking", freq: 300, q: 1.0, gainDb: -1.2 },
    { type: "peaking", freq: 2200, q: 1.2, gainDb: 0.8 },
    { type: "highshelf", freq: 9200, q: 0.707, gainDb: 1.0 }
  ]);
  softClipStereo(master, 1.1);
  stereoWidth(master, 1.12);
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

  return { trimmedMaster, trimmedStems, gains };
}

module.exports = {
  BUS_NAMES,
  createCommissionStems,
  mixAndMaster
};
