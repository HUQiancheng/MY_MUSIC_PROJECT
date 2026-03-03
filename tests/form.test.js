"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createRng } = require("../scripts/idm/lib/prng");
const {
  SECTION_WINDOWS,
  barSignatureAt,
  createMotifLibrary,
  motifStateAtBar,
  sectionAt,
  transitionNear
} = require("../scripts/idm/lib/commission/form");

test("sectionAt follows intro/verse/hook/chorus/bridge/outro boundaries", () => {
  assert.equal(sectionAt(0), "intro");
  assert.equal(sectionAt(SECTION_WINDOWS.intro[1] - 0.0001), "intro");
  assert.equal(sectionAt(SECTION_WINDOWS.intro[1]), "verse");
  assert.equal(sectionAt(SECTION_WINDOWS.verse[1]), "hook");
  assert.equal(sectionAt(SECTION_WINDOWS.hook[1]), "chorus");
  assert.equal(sectionAt(SECTION_WINDOWS.chorus[1]), "bridge");
  assert.equal(sectionAt(SECTION_WINDOWS.bridge[1]), "outro");
  assert.equal(sectionAt(179.99), "outro");
});

test("transitionNear only reports true close to section switch points", () => {
  for (const edge of [
    SECTION_WINDOWS.intro[1],
    SECTION_WINDOWS.verse[1],
    SECTION_WINDOWS.hook[1],
    SECTION_WINDOWS.chorus[1],
    SECTION_WINDOWS.bridge[1]
  ]) {
    assert.equal(transitionNear(edge), true);
    assert.equal(transitionNear(edge + 0.65), true);
    assert.equal(transitionNear(edge + 0.67), false);
  }

  assert.equal(transitionNear(10), false);
  assert.equal(transitionNear(40), false);
});

test("motif library and bar signature stay deterministic for a fixed seed", () => {
  const libA = createMotifLibrary(createRng("form-seed"));
  const libB = createMotifLibrary(createRng("form-seed"));
  assert.deepEqual(libA, libB);

  const sigA = barSignatureAt(libA, 33, "chorus");
  const sigB = barSignatureAt(libA, 33, "chorus");
  assert.deepEqual(sigA, sigB);
  assert.ok(sigA.rotation >= 0 && sigA.rotation <= 15);
  assert.ok(sigA.mutateIndex >= 0 && sigA.mutateIndex <= 15);
  assert.ok(sigA.accentBias >= 0.8 && sigA.accentBias <= 1.35);
});

test("dropout threshold tracks new section semantics", () => {
  const library = createMotifLibrary(createRng("dropout-seed"));
  const intro = barSignatureAt(library, 10, "intro").dropoutThreshold;
  const verse = barSignatureAt(library, 10, "verse").dropoutThreshold;
  const hook = barSignatureAt(library, 10, "hook").dropoutThreshold;
  const chorus = barSignatureAt(library, 10, "chorus").dropoutThreshold;
  const bridge = barSignatureAt(library, 10, "bridge").dropoutThreshold;
  const outro = barSignatureAt(library, 10, "outro").dropoutThreshold;

  assert.equal(intro, 0.52);
  assert.equal(verse, 0.34);
  assert.equal(hook, 0.34);
  assert.equal(chorus, 0.25);
  assert.equal(bridge, 0.42);
  assert.equal(outro, 0.58);
});

test("motifStateAtBar produces section-aware motif variants", () => {
  const library = createMotifLibrary(createRng("motif-state"));
  const normal = motifStateAtBar(library, 8, "verse");
  const chorus = motifStateAtBar(library, 8, "chorus");
  const outro = motifStateAtBar(library, 8, "outro");

  assert.ok(!normal.melodic.name.includes("-fragment"));
  assert.ok(chorus.melodic.name.includes("-fragment"));
  assert.ok(chorus.bass.name.includes("-dense"));
  assert.ok(outro.melodic.name.includes("-long"));
  assert.ok(outro.bass.name.includes("-sparse"));
});
