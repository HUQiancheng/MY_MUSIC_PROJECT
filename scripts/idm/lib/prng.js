"use strict";

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function hash() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seedInput) {
  const str = String(seedInput == null ? "idm-seed" : seedInput);
  const hash = xmur3(str);
  const next = mulberry32(hash());

  return {
    float() {
      return next();
    },
    int(min, max) {
      const lo = Math.ceil(min);
      const hi = Math.floor(max);
      return Math.floor(next() * (hi - lo + 1)) + lo;
    },
    range(min, max) {
      return min + (max - min) * next();
    },
    signed() {
      return next() * 2 - 1;
    },
    chance(probability) {
      return next() < probability;
    },
    choose(values) {
      if (!values.length) return undefined;
      return values[Math.floor(next() * values.length)];
    },
    shuffle(values) {
      const out = values.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    }
  };
}

module.exports = {
  createRng
};

