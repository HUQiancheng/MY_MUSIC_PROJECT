"use strict";

const { renderLegacyTrack } = require("../services/generate-track-service");

function parseGenerateArgs(argv) {
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

function printGenerateSummary(logger, result) {
  logger.log(`Generated: ${result.paths.demoPath}`);
  logger.log(`Master:    ${result.paths.masterPath}`);
  logger.log(`Stems:     ${result.paths.stemsDir}`);
  logger.log(`Duration:  ${result.renderDuration.toFixed(3)} sec`);
  logger.log(`BPM:       ${result.bpm}`);
  logger.log(`Seed:      ${result.seed}`);
}

function runGenerateTrackCli(argv = process.argv, deps = {}) {
  const parse = deps.parseGenerateArgs || parseGenerateArgs;
  const render = deps.renderLegacyTrack || renderLegacyTrack;
  const logger = deps.logger || console;

  const opts = parse(argv);
  const result = render(opts);
  printGenerateSummary(logger, result);
  return result;
}

module.exports = {
  parseGenerateArgs,
  printGenerateSummary,
  runGenerateTrackCli
};
