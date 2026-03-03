#!/usr/bin/env node
"use strict";

const { runGenerateTrackCli } = require("./controllers/generate-track-controller");

runGenerateTrackCli(process.argv);
