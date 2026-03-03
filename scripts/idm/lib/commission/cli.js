"use strict";

function parseArgs(argv) {
  const opts = {
    bpm: 174,
    duration: 180,
    seed: "fractured-meridian-main",
    name: "fractured-meridian",
    title: "Fractured Meridian"
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
    if (key === "--title") opts.title = value;
    i++;
  }

  opts.bpm = Math.max(165, Math.min(205, Number.isFinite(opts.bpm) ? opts.bpm : 174));
  opts.duration = Math.max(120, Math.min(420, Number.isFinite(opts.duration) ? opts.duration : 180));
  return opts;
}

module.exports = {
  parseArgs
};
