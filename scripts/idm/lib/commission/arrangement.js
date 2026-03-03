"use strict";

const { ConductorScheduler } = require("./scheduler");

function renderArrangement({ opts, rng, stems, harmonyCycle, motifLibrary }) {
  const conductor = new ConductorScheduler({
    opts,
    rng,
    stems,
    harmonyCycle,
    motifLibrary
  });
  return conductor.run();
}

module.exports = {
  renderArrangement
};
