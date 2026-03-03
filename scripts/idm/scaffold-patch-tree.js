#!/usr/bin/env node
"use strict";

const { runPatchTreeCli } = require("./controllers/patch-tree-controller");

runPatchTreeCli(process.argv);
