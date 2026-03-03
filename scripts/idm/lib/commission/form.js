"use strict";

const SECTION_WINDOWS = {
  intro: [0, 24],
  verse: [24, 60],
  hook: [60, 84],
  chorus: [84, 120],
  bridge: [120, 156],
  outro: [156, 180]
};

const SECTION_INTENSITY = {
  intro: { density: 0.3, drive: 0.22, chaos: 0.12 },
  verse: { density: 0.58, drive: 0.52, chaos: 0.26 },
  hook: { density: 0.66, drive: 0.63, chaos: 0.34 },
  chorus: { density: 0.9, drive: 0.88, chaos: 0.62 },
  bridge: { density: 0.74, drive: 0.6, chaos: 0.45 },
  outro: { density: 0.36, drive: 0.28, chaos: 0.2 }
};

function sectionAt(timeSec) {
  if (timeSec < SECTION_WINDOWS.intro[1]) return "intro";
  if (timeSec < SECTION_WINDOWS.verse[1]) return "verse";
  if (timeSec < SECTION_WINDOWS.hook[1]) return "hook";
  if (timeSec < SECTION_WINDOWS.chorus[1]) return "chorus";
  if (timeSec < SECTION_WINDOWS.bridge[1]) return "bridge";
  return "outro";
}

function transitionNear(timeSec) {
  return (
    Math.abs(timeSec - SECTION_WINDOWS.intro[1]) < 0.66 ||
    Math.abs(timeSec - SECTION_WINDOWS.verse[1]) < 0.66 ||
    Math.abs(timeSec - SECTION_WINDOWS.hook[1]) < 0.66 ||
    Math.abs(timeSec - SECTION_WINDOWS.chorus[1]) < 0.66 ||
    Math.abs(timeSec - SECTION_WINDOWS.bridge[1]) < 0.66
  );
}

function sectionProfile(section) {
  return SECTION_INTENSITY[section] || SECTION_INTENSITY.intro;
}

function rotate(arr, amount) {
  if (!arr.length) return [];
  const n = ((amount % arr.length) + arr.length) % arr.length;
  return arr.slice(n).concat(arr.slice(0, n));
}

function fract(x) {
  return x - Math.floor(x);
}

function hash2(seedA, seedB, x) {
  return fract(Math.sin(x * 12.9898 + seedA * 0.013 + seedB * 0.017) * 43758.5453);
}

function createMotifLibrary(rng) {
  return {
    melodic: [
      { name: "axis", degrees: [0, 2, 4, 6, 5, 3, 2], rhythm16: [0, 3, 5, 8, 11, 13, 15] },
      { name: "spiral", degrees: [0, 3, 5, 6, 4, 2, 1], rhythm16: [0, 2, 6, 9, 10, 13, 15] },
      { name: "answer", degrees: [4, 5, 6, 4, 3, 2, 1], rhythm16: [1, 4, 6, 9, 12, 14, 15] },
      { name: "arc", degrees: [2, 4, 5, 6, 5, 4, 2], rhythm16: [0, 4, 7, 8, 11, 13, 15] }
    ],
    bass: [
      { name: "rootwalk", degrees: [0, 2, 4, 3, 5, 4, 2], rhythm16: [0, 3, 5, 8, 10, 12, 14] },
      { name: "counter", degrees: [0, 3, 4, 5, 3, 2, 6], rhythm16: [0, 2, 6, 8, 10, 13, 15] },
      { name: "lift", degrees: [0, 2, 5, 4, 3, 1, 6], rhythm16: [0, 4, 6, 9, 11, 13, 15] }
    ],
    drumKick: [
      [1, 0, 0, 0, 0, 0.8, 0, 0, 1, 0, 0, 0.55, 0, 0.72, 0, 0],
      [1, 0, 0.6, 0, 0, 0.74, 0, 0, 1, 0, 0.58, 0, 0.66, 0, 0, 0.5],
      [1, 0, 0, 0.64, 0.82, 0, 0, 0, 1, 0, 0.6, 0, 0.75, 0, 0.56, 0],
      [1, 0.48, 0, 0, 0.72, 0, 0.52, 0, 0.94, 0, 0.66, 0, 0.7, 0, 0, 0.62]
    ],
    drumHat: [
      [0.36, 0.3, 0.4, 0.32, 0.38, 0.3, 0.43, 0.33, 0.39, 0.3, 0.45, 0.33, 0.42, 0.3, 0.48, 0.33],
      [0.35, 0.28, 0.39, 0.3, 0.36, 0.28, 0.41, 0.31, 0.38, 0.28, 0.43, 0.31, 0.4, 0.28, 0.46, 0.31]
    ],
    signatures: {
      introSeed: rng.int(0, 99999),
      pivotSeed: rng.int(0, 99999)
    }
  };
}

function barSignatureAt(library, bar, section) {
  const s1 = library.signatures.introSeed;
  const s2 = library.signatures.pivotSeed;
  const hA = hash2(s1, s2, bar * 1.17 + 0.31);
  const hB = hash2(s1, s2, bar * 2.03 + 0.73);
  const hC = hash2(s1, s2, bar * 3.11 + 0.19);
  const hD = hash2(s1, s2, bar * 4.37 + 0.41);

  const rotation = Math.floor(hA * 16);
  const mutateIndex = Math.floor(hB * 16);
  const dropoutThreshold =
    section === "intro"
      ? 0.52
      : section === "verse" || section === "hook"
        ? 0.34
        : section === "chorus"
          ? 0.25
          : section === "bridge"
            ? 0.42
            : 0.58;

  return {
    rotation,
    mutateIndex,
    dropoutThreshold,
    accentBias: 0.8 + hC * 0.55,
    callBias: hD,
    branch:
      hA < 0.25
        ? "thin"
        : hA < 0.5
          ? "dense"
          : hA < 0.75
            ? "sync"
            : "broken",
    phraseHash: hB
  };
}

function motifStateAtBar(library, bar, section) {
  const phrase = Math.floor(bar / 4);
  const barInPhrase = bar % 4;

  const melodicBase = library.melodic[phrase % library.melodic.length];
  const bassBase = library.bass[(phrase + 1) % library.bass.length];
  const kickCell = library.drumKick[(phrase + barInPhrase) % library.drumKick.length];
  const hatCell = library.drumHat[(phrase + bar) % library.drumHat.length];

  if (section === "chorus") {
    return {
      melodic: {
        name: `${melodicBase.name}-fragment`,
        degrees: rotate(melodicBase.degrees.filter((_, i) => i % 2 === 0), barInPhrase),
        rhythm16: rotate(melodicBase.rhythm16, barInPhrase)
      },
      bass: {
        name: `${bassBase.name}-dense`,
        degrees: rotate(bassBase.degrees.concat([bassBase.degrees[0]]), barInPhrase),
        rhythm16: [0, 2, 4, 6, 8, 10, 12, 14]
      },
      kickCell,
      hatCell
    };
  }

  if (section === "outro") {
    return {
      melodic: {
        name: `${melodicBase.name}-long`,
        degrees: [melodicBase.degrees[0], melodicBase.degrees[2], melodicBase.degrees[4], melodicBase.degrees[6]],
        rhythm16: [0, 5, 10, 14]
      },
      bass: {
        name: `${bassBase.name}-sparse`,
        degrees: [bassBase.degrees[0], bassBase.degrees[3], bassBase.degrees[5]],
        rhythm16: [0, 6, 12]
      },
      kickCell,
      hatCell
    };
  }

  return {
    melodic: {
      name: melodicBase.name,
      degrees: rotate(melodicBase.degrees, barInPhrase),
      rhythm16: rotate(melodicBase.rhythm16, barInPhrase)
    },
    bass: {
      name: bassBase.name,
      degrees: rotate(bassBase.degrees, barInPhrase),
      rhythm16: rotate(bassBase.rhythm16, barInPhrase)
    },
    kickCell,
    hatCell
  };
}

module.exports = {
  SECTION_WINDOWS,
  barSignatureAt,
  createMotifLibrary,
  motifStateAtBar,
  sectionAt,
  sectionProfile,
  transitionNear
};
