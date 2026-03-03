"use strict";

function createHarmonyCycle() {
  return [
    {
      symbol: "Dm11",
      root: 50,
      bassRoot: 38,
      scale: [0, 2, 3, 5, 7, 9, 11],
      voicing: [50, 53, 57, 60, 64, 67],
      keyVoicing: [53, 57, 60, 64],
      color: "minor-root"
    },
    {
      symbol: "G13",
      root: 43,
      bassRoot: 31,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [43, 47, 50, 53, 57, 64],
      keyVoicing: [47, 50, 57, 64],
      color: "dominant-drive"
    },
    {
      symbol: "Cmaj9#11",
      root: 48,
      bassRoot: 36,
      scale: [0, 2, 4, 6, 7, 9, 11],
      voicing: [48, 52, 55, 59, 62, 66],
      keyVoicing: [52, 55, 62, 66],
      color: "lydian-open"
    },
    {
      symbol: "A13sus",
      root: 45,
      bassRoot: 33,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [45, 50, 52, 55, 59, 62],
      keyVoicing: [50, 55, 59, 62],
      color: "suspended-turn"
    },
    {
      symbol: "Fm11",
      root: 41,
      bassRoot: 29,
      scale: [0, 2, 3, 5, 7, 9, 10],
      voicing: [41, 44, 48, 51, 55, 58],
      keyVoicing: [44, 48, 55, 58],
      color: "dark-minor"
    },
    {
      symbol: "Bb13",
      root: 46,
      bassRoot: 34,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [46, 50, 53, 56, 60, 67],
      keyVoicing: [50, 53, 60, 67],
      color: "dominant-lift"
    },
    {
      symbol: "Ebmaj9#11",
      root: 51,
      bassRoot: 39,
      scale: [0, 2, 4, 6, 7, 9, 11],
      voicing: [51, 55, 58, 62, 65, 69],
      keyVoicing: [55, 58, 65, 69],
      color: "lydian-bloom"
    },
    {
      symbol: "A13",
      root: 45,
      bassRoot: 33,
      scale: [0, 2, 4, 5, 7, 9, 10],
      voicing: [45, 49, 52, 55, 59, 66],
      keyVoicing: [49, 52, 59, 66],
      color: "return-bridge"
    }
  ];
}

function chordAtBar(cycle, bar) {
  return cycle[Math.floor(bar / 2) % cycle.length];
}

function nextChordAtBar(cycle, bar) {
  return cycle[Math.floor((bar + 1) / 2) % cycle.length];
}

function quantizeToScale(midi, rootMidi, scaleIntervals) {
  let best = rootMidi;
  let bestDistance = Infinity;

  for (let oct = -6; oct <= 6; oct++) {
    for (const step of scaleIntervals) {
      const candidate = rootMidi + step + oct * 12;
      const d = Math.abs(candidate - midi);
      if (d < bestDistance) {
        bestDistance = d;
        best = candidate;
      }
    }
  }

  return best;
}

function degreeToScaleMidi(chord, degree, octaveShift = 0, anchor = "root") {
  const base = anchor === "bass" ? chord.bassRoot : chord.root;
  const scale = chord.scale;
  const size = scale.length;
  const oct = Math.floor(degree / size);
  let idx = degree % size;
  if (idx < 0) idx += size;
  return base + scale[idx] + (oct + octaveShift) * 12;
}

module.exports = {
  chordAtBar,
  createHarmonyCycle,
  degreeToScaleMidi,
  nextChordAtBar,
  quantizeToScale
};
