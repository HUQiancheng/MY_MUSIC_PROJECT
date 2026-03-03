"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  printCommissionSummary,
  runCommissionCli
} = require("../scripts/idm/controllers/commission-controller");

test("runCommissionCli delegates parse/render and logs summary", () => {
  const calls = {
    parsed: null,
    rendered: null,
    logs: []
  };
  const stubResult = {
    paths: {
      demoPath: "/tmp/demo.wav",
      masterPath: "/tmp/master.wav",
      stemsDir: "/tmp/stems",
      metadataPath: "/tmp/stems/metadata.json"
    },
    renderDuration: 180,
    bpm: 174,
    seed: "s1",
    usedTimbresCount: 36,
    timbreInventoryCount: 44,
    kickUniquePatterns: 23
  };

  const result = runCommissionCli(["node", "x.js", "--bpm", "179"], {
    parseArgs(argv) {
      calls.parsed = argv.slice();
      return { bpm: 174, duration: 180, seed: "s1", name: "x", title: "X" };
    },
    renderCommissionMaster(opts) {
      calls.rendered = opts;
      return stubResult;
    },
    logger: {
      log(line) {
        calls.logs.push(line);
      }
    }
  });

  assert.deepEqual(calls.parsed, ["node", "x.js", "--bpm", "179"]);
  assert.deepEqual(calls.rendered, { bpm: 174, duration: 180, seed: "s1", name: "x", title: "X" });
  assert.equal(result, stubResult);
  assert.ok(calls.logs.some((l) => l.includes("Generated: /tmp/demo.wav")));
  assert.ok(calls.logs.some((l) => l.includes("Metadata:  /tmp/stems/metadata.json")));
  assert.ok(calls.logs.some((l) => l.includes("Kick Vars: 23")));
});

test("printCommissionSummary emits all key lines", () => {
  const logs = [];
  printCommissionSummary(
    {
      log(line) {
        logs.push(line);
      }
    },
    {
      paths: {
        demoPath: "/a",
        masterPath: "/b",
        stemsDir: "/c",
        metadataPath: "/d"
      },
      renderDuration: 123.456,
      bpm: 180,
      seed: "seed-a",
      usedTimbresCount: 33,
      timbreInventoryCount: 44,
      kickUniquePatterns: 19
    }
  );

  assert.equal(logs.length, 9);
  assert.ok(logs[0].startsWith("Generated: "));
  assert.ok(logs[8].includes("Kick Vars: 19"));
});
