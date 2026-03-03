"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createRng } = require("../scripts/idm/lib/prng");
const { createMotifLibrary } = require("../scripts/idm/lib/commission/form");
const { createHarmonyCycle } = require("../scripts/idm/lib/commission/harmony");
const { BUS_NAMES } = require("../scripts/idm/lib/commission/mix");
const { ConductorScheduler } = require("../scripts/idm/lib/commission/scheduler");

function createTinyStem(frames = 480, sampleRate = 240) {
  return {
    sampleRate,
    frames,
    L: new Float32Array(frames),
    R: new Float32Array(frames)
  };
}

function createTinyStems() {
  const stems = {};
  for (const bus of BUS_NAMES) stems[bus] = createTinyStem();
  return stems;
}

test("scheduler emits a full motivation trace and diverse timbre usage", () => {
  const opts = {
    bpm: 174,
    duration: 162
  };

  const rng = createRng("scheduler-run");
  const scheduler = new ConductorScheduler({
    opts,
    rng,
    stems: createTinyStems(),
    harmonyCycle: createHarmonyCycle(),
    motifLibrary: createMotifLibrary(rng)
  });

  const result = scheduler.run();

  assert.ok(result.totalBars > 100);
  assert.ok(result.usedTimbres.length >= 30);
  assert.ok(result.kick_unique_patterns >= 8);
  assert.ok(result.motivationTrace.length > 0);

  const sections = new Set(result.motivationTrace.map((item) => item.section));
  for (const section of ["intro", "verse", "hook", "chorus", "bridge", "outro"]) {
    assert.ok(sections.has(section));
  }

  assert.ok(result.motivationTrace.some((item) => item.switch_reason.startsWith("handoff_to_")));
  assert.ok(result.motivationTrace.every((item) => item.role_plan && typeof item.role_plan.drums === "number"));
});

test("scheduler context handoff reports pre-switch bars around section edges", () => {
  const opts = {
    bpm: 174,
    duration: 48
  };

  const rng = createRng("scheduler-context");
  const scheduler = new ConductorScheduler({
    opts,
    rng,
    stems: createTinyStems(),
    harmonyCycle: createHarmonyCycle(),
    motifLibrary: createMotifLibrary(rng)
  });

  const preSwitchBars = [];
  for (let bar = 0; bar < scheduler.totalBars; bar++) {
    const ctx = scheduler.buildContext(bar);
    if (ctx.preSwitchBar) preSwitchBars.push(ctx.section);
  }

  assert.ok(preSwitchBars.length > 0);
  assert.ok(preSwitchBars.includes("intro"));
});
