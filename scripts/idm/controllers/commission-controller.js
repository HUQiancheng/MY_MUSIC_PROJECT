"use strict";

const { parseArgs } = require("../lib/commission/cli");
const { renderCommissionMaster } = require("../services/commission-render-service");

function printCommissionSummary(logger, result) {
  logger.log(`Generated: ${result.paths.demoPath}`);
  logger.log(`Master:    ${result.paths.masterPath}`);
  logger.log(`Stems:     ${result.paths.stemsDir}`);
  logger.log(`Metadata:  ${result.paths.metadataPath}`);
  logger.log(`Duration:  ${result.renderDuration.toFixed(3)} sec`);
  logger.log(`BPM:       ${result.bpm}`);
  logger.log(`Seed:      ${result.seed}`);
  logger.log(`Timbres:   ${result.usedTimbresCount}/${result.timbreInventoryCount} used`);
  logger.log(`Kick Vars: ${result.kickUniquePatterns} unique bar patterns`);
}

function runCommissionCli(argv = process.argv, deps = {}) {
  const parse = deps.parseArgs || parseArgs;
  const render = deps.renderCommissionMaster || renderCommissionMaster;
  const logger = deps.logger || console;

  const opts = parse(argv);
  const result = render(opts);
  printCommissionSummary(logger, result);
  return result;
}

module.exports = {
  printCommissionSummary,
  runCommissionCli
};
