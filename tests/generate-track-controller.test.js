"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseGenerateArgs,
  printGenerateSummary,
  runGenerateTrackCli
} = require("../scripts/idm/controllers/generate-track-controller");

test("parseGenerateArgs parses and clamps options", () => {
  const opts = parseGenerateArgs([
    "node",
    "generate-track.js",
    "--bpm",
    "999",
    "--duration",
    "2",
    "--seed",
    "a",
    "--name",
    "x"
  ]);

  assert.equal(opts.bpm, 210);
  assert.equal(opts.duration, 32);
  assert.equal(opts.seed, "a");
  assert.equal(opts.name, "x");
});

test("runGenerateTrackCli delegates parse and render", () => {
  const calls = {
    parsed: null,
    rendered: null,
    logs: []
  };
  const fake = {
    paths: {
      demoPath: "/tmp/d.wav",
      masterPath: "/tmp/m.wav",
      stemsDir: "/tmp/s"
    },
    renderDuration: 99,
    bpm: 170,
    seed: "seed-1"
  };

  const result = runGenerateTrackCli(["node", "x.js", "--seed", "abc"], {
    parseGenerateArgs(argv) {
      calls.parsed = argv.slice();
      return { bpm: 170, duration: 99, seed: "seed-1", name: "id" };
    },
    renderLegacyTrack(opts) {
      calls.rendered = opts;
      return fake;
    },
    logger: {
      log(line) {
        calls.logs.push(line);
      }
    }
  });

  assert.equal(result, fake);
  assert.deepEqual(calls.parsed, ["node", "x.js", "--seed", "abc"]);
  assert.deepEqual(calls.rendered, { bpm: 170, duration: 99, seed: "seed-1", name: "id" });
  assert.ok(calls.logs.some((line) => line.includes("Generated: /tmp/d.wav")));
});

test("printGenerateSummary prints six report lines", () => {
  const lines = [];
  printGenerateSummary(
    {
      log(line) {
        lines.push(line);
      }
    },
    {
      paths: { demoPath: "/a", masterPath: "/b", stemsDir: "/c" },
      renderDuration: 120,
      bpm: 174,
      seed: "s"
    }
  );

  assert.equal(lines.length, 6);
  assert.ok(lines[5].includes("Seed:      s"));
});
