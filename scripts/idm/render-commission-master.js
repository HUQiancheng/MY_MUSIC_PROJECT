#!/usr/bin/env node
"use strict";

const { runCommissionCli } = require("./controllers/commission-controller");

runCommissionCli(process.argv);
