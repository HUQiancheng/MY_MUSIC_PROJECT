"use strict";

const fs = require("fs");
const path = require("path");

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function writeIfMissing(filePath, content, createdFiles) {
  if (fs.existsSync(filePath)) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  createdFiles.push(filePath);
}

function ensureDir(dirPath, createdDirs) {
  if (fs.existsSync(dirPath)) return;
  fs.mkdirSync(dirPath, { recursive: true });
  createdDirs.push(dirPath);
}

function patchTemplate(title, note) {
  return [
    "#N canvas 120 120 1080 720 10;",
    `#X text 36 36 ${title};`,
    `#X text 36 64 ${note};`,
    "#X text 36 92 TODO: wire abstractions and role I/O here.;",
    ""
  ].join("\n");
}

function createCompositionPatchTree({ projectRoot = process.cwd(), name = "fractured-meridian" } = {}) {
  const slug = slugify(name || "fractured-meridian") || "composition";
  const createdDirs = [];
  const createdFiles = [];

  const topLevelPatchDirs = [
    path.join(projectRoot, "patches", "synthesis"),
    path.join(projectRoot, "patches", "effects"),
    path.join(projectRoot, "patches", "sequencing"),
    path.join(projectRoot, "patches", "composition"),
    path.join(projectRoot, "patches", "experiments")
  ];
  const abstractionDirs = [
    path.join(projectRoot, "abstractions", "synth"),
    path.join(projectRoot, "abstractions", "fx"),
    path.join(projectRoot, "abstractions", "rhythm"),
    path.join(projectRoot, "abstractions", "utilities")
  ];

  for (const dirPath of [...topLevelPatchDirs, ...abstractionDirs]) {
    ensureDir(dirPath, createdDirs);
    writeIfMissing(path.join(dirPath, ".gitkeep"), "", createdFiles);
  }

  const compositionRoot = path.join(projectRoot, "patches", "composition", slug);
  const roleDirs = {
    conductor: path.join(compositionRoot, "controllers"),
    drums: path.join(compositionRoot, "roles", "drums"),
    bass: path.join(compositionRoot, "roles", "bass"),
    harmony: path.join(compositionRoot, "roles", "harmony"),
    riffs: path.join(compositionRoot, "roles", "riffs"),
    textures: path.join(compositionRoot, "roles", "textures"),
    transitions: path.join(compositionRoot, "transitions"),
    prints: path.join(compositionRoot, "prints")
  };

  ensureDir(compositionRoot, createdDirs);
  for (const dirPath of Object.values(roleDirs)) {
    ensureDir(dirPath, createdDirs);
    writeIfMissing(path.join(dirPath, ".gitkeep"), "", createdFiles);
  }

  writeIfMissing(
    path.join(compositionRoot, "README.md"),
    `# ${slug}\n\nRole-oriented composition workspace.\n\n- \`controllers/\`: conductor and arrangement coordination\n- \`roles/\`: instrument role patches\n- \`transitions/\`: handoff and tension-shift patches\n- \`prints/\`: exported intermediate patch renders and notes\n`,
    createdFiles
  );

  writeIfMissing(
    path.join(roleDirs.conductor, `comp-${slug}-conductor.pd`),
    patchTemplate(`${slug} conductor`, "Controls section timeline and module call-response."),
    createdFiles
  );
  writeIfMissing(
    path.join(roleDirs.drums, `seq-${slug}-drum-motifs.pd`),
    patchTemplate(`${slug} drum motifs`, "3-4 motif banks + switch cues + ghost-note maps."),
    createdFiles
  );
  writeIfMissing(
    path.join(roleDirs.bass, `syn-${slug}-bass-counterpoint.pd`),
    patchTemplate(`${slug} bass counterpoint`, "Scale-locked sub and glide voice-leading."),
    createdFiles
  );
  writeIfMissing(
    path.join(roleDirs.harmony, `comp-${slug}-harmonic-engine.pd`),
    patchTemplate(`${slug} harmonic engine`, "m11 / 13 / #11 voicing lane and tension control."),
    createdFiles
  );
  writeIfMissing(
    path.join(roleDirs.riffs, `syn-${slug}-riff-agent.pd`),
    patchTemplate(`${slug} riff agent`, "Riff motifs, lead responses, and phrase-level variation."),
    createdFiles
  );
  writeIfMissing(
    path.join(roleDirs.textures, `fx-${slug}-texture-network.pd`),
    patchTemplate(`${slug} texture network`, "Metal FM, granular dust, and transition risers."),
    createdFiles
  );
  writeIfMissing(
    path.join(roleDirs.transitions, `comp-${slug}-handoff-cues.pd`),
    patchTemplate(`${slug} handoff cues`, "Motivated pattern shifts and section pre-cues."),
    createdFiles
  );

  writeIfMissing(
    path.join(roleDirs.prints, "README.md"),
    "# Prints\n\nKeep intermediate bounce notes, section references, and comparison snippets here.\n",
    createdFiles
  );

  return {
    slug,
    compositionRoot,
    createdDirs,
    createdFiles
  };
}

module.exports = {
  createCompositionPatchTree,
  slugify
};
