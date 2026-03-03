"use strict";

const fs = require("fs");
const path = require("path");
const { writeWavFile } = require("../lib/audio-utils");
const { createRng } = require("../lib/prng");
const { SECTION_WINDOWS, createMotifLibrary } = require("../lib/commission/form");
const { createHarmonyCycle } = require("../lib/commission/harmony");
const { renderArrangement } = require("../lib/commission/arrangement");
const { BUS_NAMES, createCommissionStems, mixAndMaster } = require("../lib/commission/mix");
const { TIMBRE_PALETTE } = require("../lib/commission/timbres");

function buildMetadata({
  opts,
  arrangement,
  harmonyCycle,
  motifLibrary,
  gains,
  usedTimbres,
  missingTimbres,
  beat,
  barSec,
  totalBars,
  renderDuration
}) {
  return {
    title: opts.title,
    canonical_name: opts.name,
    created_at: new Date().toISOString(),
    bpm: opts.bpm,
    duration_seconds: renderDuration,
    seed: opts.seed,
    architecture: {
      entry: "scripts/idm/render-commission-master.js",
      controllers: [
        "scripts/idm/controllers/commission-controller.js",
        "scripts/idm/controllers/patch-tree-controller.js"
      ],
      services: [
        "scripts/idm/services/commission-render-service.js",
        "scripts/idm/services/patch-tree-service.js"
      ],
      modules: [
        "lib/commission/cli.js",
        "lib/commission/form.js",
        "lib/commission/narrative.js",
        "lib/commission/harmony.js",
        "lib/commission/timbres.js",
        "lib/commission/agents.js",
        "lib/commission/scheduler.js",
        "lib/commission/arrangement.js",
        "lib/commission/mix.js"
      ],
      buses: BUS_NAMES
    },
    form_arc_seconds: SECTION_WINDOWS,
    harmony_cycle: harmonyCycle.map((h) => ({ symbol: h.symbol, color: h.color })),
    motif_seeds: motifLibrary.signatures,
    motivation_trace: arrangement.motivationTrace,
    timbre_inventory_count: TIMBRE_PALETTE.length,
    timbre_inventory: TIMBRE_PALETTE,
    timbre_used_count: usedTimbres.length,
    timbre_used_ids: usedTimbres,
    timbre_missing_ids: missingTimbres,
    rhythmic_design:
      "4 jungle/DnB drum motifs (amen-a, amen-b, think-break, tramen-lite) under OOP band agents with conductor-led call/response and handoff transitions.",
    kick_unique_patterns: arrangement.kick_unique_patterns,
    pitch_logic: "All melodic and bass events quantized per active chord scale.",
    mix_bus_gains: gains,
    render_stats: {
      beat_seconds: Number(beat.toFixed(6)),
      bar_seconds: Number(barSec.toFixed(6)),
      total_bars: totalBars,
      rendered_bars: arrangement.totalBars
    }
  };
}

function renderCommissionMaster(opts) {
  const rng = createRng(opts.seed);
  const harmonyCycle = createHarmonyCycle();
  const motifLibrary = createMotifLibrary(rng);

  const beat = 60 / opts.bpm;
  const barSec = beat * 4;
  const totalBars = Math.ceil(opts.duration / barSec);
  const renderDuration = opts.duration;
  const tailSec = 3;
  const renderLength = renderDuration + tailSec;

  const stems = createCommissionStems(renderLength);
  const arrangement = renderArrangement({
    opts,
    rng,
    stems,
    harmonyCycle,
    motifLibrary
  });

  const { trimmedMaster, trimmedStems, gains } = mixAndMaster({
    stems,
    renderLength,
    renderDuration
  });

  const renderId = opts.name;
  const demoPath = path.resolve("exports/demos", `${renderId}.wav`);
  const masterPath = path.resolve("exports/masters", `${renderId}.wav`);
  const stemsDir = path.resolve("exports/stems", renderId);

  fs.rmSync(demoPath, { force: true });
  fs.rmSync(masterPath, { force: true });
  fs.rmSync(stemsDir, { recursive: true, force: true });

  writeWavFile(demoPath, trimmedMaster);
  writeWavFile(masterPath, trimmedMaster);
  fs.mkdirSync(stemsDir, { recursive: true });

  for (const [name, stem] of Object.entries(trimmedStems)) {
    writeWavFile(path.join(stemsDir, `${name}.wav`), stem);
  }

  const allTimbres = TIMBRE_PALETTE.map((t) => t.id);
  const usedTimbres = arrangement.usedTimbres;
  const missingTimbres = allTimbres.filter((id) => !usedTimbres.includes(id));
  const metadataPath = path.join(stemsDir, "metadata.json");

  const metadata = buildMetadata({
    opts,
    arrangement,
    harmonyCycle,
    motifLibrary,
    gains,
    usedTimbres,
    missingTimbres,
    beat,
    barSec,
    totalBars,
    renderDuration
  });
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  return {
    paths: {
      demoPath,
      masterPath,
      stemsDir,
      metadataPath
    },
    bpm: opts.bpm,
    seed: opts.seed,
    renderDuration,
    usedTimbresCount: usedTimbres.length,
    timbreInventoryCount: TIMBRE_PALETTE.length,
    kickUniquePatterns: arrangement.kick_unique_patterns
  };
}

module.exports = {
  renderCommissionMaster
};
