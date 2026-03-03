"use strict";

const path = require("path");
const { createCompositionPatchTree } = require("../services/patch-tree-service");

function parsePatchTreeArgs(argv) {
  const opts = {
    name: "fractured-meridian",
    projectRoot: process.cwd()
  };

  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    if (value == null || value.startsWith("--")) continue;

    if (key === "--name") opts.name = value;
    if (key === "--project-root") opts.projectRoot = path.resolve(value);
    i++;
  }

  return opts;
}

function runPatchTreeCli(argv = process.argv, deps = {}) {
  const parse = deps.parsePatchTreeArgs || parsePatchTreeArgs;
  const createTree = deps.createCompositionPatchTree || createCompositionPatchTree;
  const logger = deps.logger || console;

  const opts = parse(argv);
  const result = createTree(opts);

  logger.log(`Patch Tree: ${result.compositionRoot}`);
  logger.log(`Created Dirs: ${result.createdDirs.length}`);
  logger.log(`Created Files: ${result.createdFiles.length}`);
  return result;
}

module.exports = {
  parsePatchTreeArgs,
  runPatchTreeCli
};
