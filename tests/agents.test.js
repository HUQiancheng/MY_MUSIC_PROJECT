"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createRng } = require("../scripts/idm/lib/prng");
const {
  Agent,
  BassAgent,
  DrummerAgent,
  GuitarAgent,
  HarmonyAgent,
  LeadAgent,
  TextureAgent
} = require("../scripts/idm/lib/commission/agents");

function createConductor(seed = "agent-test") {
  return {
    rng: createRng(seed),
    emitted: [],
    emit(id, params) {
      this.emitted.push({ id, params });
    }
  };
}

test("all specialized agents inherit from Agent", () => {
  const conductor = createConductor();
  const instances = [
    new DrummerAgent(conductor),
    new BassAgent(conductor),
    new HarmonyAgent(conductor),
    new GuitarAgent(conductor),
    new LeadAgent(conductor),
    new TextureAgent(conductor)
  ];

  for (const instance of instances) {
    assert.ok(instance instanceof Agent);
    assert.equal(typeof instance.perform, "function");
  }
});

test("DrummerAgent includes four named jungle motifs", () => {
  const drummer = new DrummerAgent(createConductor("motifs"));
  const motifNames = drummer.jungleMotifs.map((m) => m.name);

  assert.equal(drummer.jungleMotifs.length, 4);
  assert.deepEqual(motifNames, ["amen-a", "amen-b", "think-break", "tramen-lite"]);
});

test("DrummerAgent conversation pattern map is section dependent", () => {
  const drummer = new DrummerAgent(createConductor("conversation"));
  assert.equal(drummer.chooseConversationPattern("intro", 3), 1);
  assert.equal(drummer.chooseConversationPattern("verse", 2), 3);
  assert.equal(drummer.chooseConversationPattern("hook", 1), 3);
  assert.equal(drummer.chooseConversationPattern("chorus", 0), 3);
  assert.equal(drummer.chooseConversationPattern("bridge", 3), 3);
  assert.equal(drummer.chooseConversationPattern("outro", 2), 3);
});

test("kick timbre selection changes by section and timing role", () => {
  const drummer = new DrummerAgent(createConductor("kick-variants"));
  const ctx = {
    barSig: { branch: "sync" },
    phraseBar: 1,
    preSwitchBar: false
  };

  assert.equal(drummer.kickVariant({ ...ctx, section: "intro" }, 0), "kick-soft");
  assert.equal(drummer.kickVariant({ ...ctx, section: "intro" }, 1), "kick-tight");
  assert.equal(drummer.kickVariant({ ...ctx, section: "verse" }, 4), "kick-tight");
  assert.equal(drummer.kickVariant({ ...ctx, section: "hook" }, 1), "kick-crunch");
  assert.equal(drummer.kickVariant({ ...ctx, section: "chorus" }, 6), "kick-tight");
  assert.equal(drummer.kickVariant({ ...ctx, section: "outro" }, 6), "kick-soft");
});
