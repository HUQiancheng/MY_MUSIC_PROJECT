"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { parsePatchTreeArgs } = require("../scripts/idm/controllers/patch-tree-controller");
const {
  createCompositionPatchTree,
  slugify
} = require("../scripts/idm/services/patch-tree-service");

function hasFile(root, relPath) {
  return fs.existsSync(path.join(root, relPath));
}

test("slugify normalizes human names into stable path-safe ids", () => {
  assert.equal(slugify("Fractured Meridian"), "fractured-meridian");
  assert.equal(slugify("  A/B   Test__Name "), "a-b-test-name");
  assert.equal(slugify("###"), "");
});

test("parsePatchTreeArgs reads --name and --project-root", () => {
  const opts = parsePatchTreeArgs([
    "node",
    "scaffold-patch-tree.js",
    "--name",
    "Band Graph",
    "--project-root",
    "/tmp/my-project"
  ]);

  assert.equal(opts.name, "Band Graph");
  assert.equal(opts.projectRoot, path.resolve("/tmp/my-project"));
});

test("createCompositionPatchTree creates modular folders and role patch placeholders", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "idm-tree-"));

  const first = createCompositionPatchTree({
    projectRoot: tmpRoot,
    name: "Fractured Meridian"
  });

  assert.equal(first.slug, "fractured-meridian");
  assert.ok(hasFile(tmpRoot, "patches/synthesis/.gitkeep"));
  assert.ok(hasFile(tmpRoot, "patches/effects/.gitkeep"));
  assert.ok(hasFile(tmpRoot, "patches/sequencing/.gitkeep"));
  assert.ok(hasFile(tmpRoot, "patches/composition/fractured-meridian/README.md"));
  assert.ok(hasFile(tmpRoot, "patches/composition/fractured-meridian/controllers/comp-fractured-meridian-conductor.pd"));
  assert.ok(hasFile(tmpRoot, "patches/composition/fractured-meridian/roles/drums/seq-fractured-meridian-drum-motifs.pd"));
  assert.ok(hasFile(tmpRoot, "patches/composition/fractured-meridian/roles/bass/syn-fractured-meridian-bass-counterpoint.pd"));
  assert.ok(hasFile(tmpRoot, "abstractions/synth/.gitkeep"));
  assert.ok(hasFile(tmpRoot, "abstractions/fx/.gitkeep"));
  assert.ok(hasFile(tmpRoot, "abstractions/rhythm/.gitkeep"));
  assert.ok(hasFile(tmpRoot, "abstractions/utilities/.gitkeep"));

  const second = createCompositionPatchTree({
    projectRoot: tmpRoot,
    name: "Fractured Meridian"
  });

  assert.equal(second.createdDirs.length, 0);
  assert.equal(second.createdFiles.length, 0);
});
