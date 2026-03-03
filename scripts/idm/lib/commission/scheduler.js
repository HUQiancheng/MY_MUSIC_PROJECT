"use strict";

const { emitTimbre } = require("./timbres");
const { chordAtBar, nextChordAtBar } = require("./harmony");
const { barSignatureAt, motifStateAtBar, sectionAt, sectionProfile, transitionNear } = require("./form");
const { rolePlanAt } = require("./narrative");
const {
  BassAgent,
  DrummerAgent,
  GuitarAgent,
  HarmonyAgent,
  LeadAgent,
  TextureAgent
} = require("./agents");

function conversationAt(section, phraseBar) {
  if (section === "intro") return "harmony_call";
  if (section === "verse") return phraseBar % 2 ? "drum_call" : "harmony_call";
  if (section === "hook") return "guitar_call";
  if (section === "chorus") return phraseBar === 3 ? "drum_call" : "mixed_call";
  if (section === "bridge") return "bass_call";
  return "release_call";
}

class ConductorScheduler {
  constructor({ opts, rng, stems, harmonyCycle, motifLibrary }) {
    this.opts = opts;
    this.rng = rng;
    this.stems = stems;
    this.harmonyCycle = harmonyCycle;
    this.motifLibrary = motifLibrary;

    this.beat = 60 / opts.bpm;
    this.barSec = this.beat * 4;
    this.totalBars = Math.ceil(opts.duration / this.barSec);
    this.usedTimbres = new Set();
    this.motivationTrace = [];

    this.drummer = new DrummerAgent(this);
    this.bass = new BassAgent(this);
    this.harmony = new HarmonyAgent(this);
    this.guitar = new GuitarAgent(this);
    this.lead = new LeadAgent(this);
    this.texture = new TextureAgent(this);

    this.agents = [
      this.drummer,
      this.bass,
      this.harmony,
      this.guitar,
      this.lead,
      this.texture
    ];
  }

  emit(id, params) {
    this.usedTimbres.add(id);
    emitTimbre(this.stems, id, {
      rng: this.rng,
      beat: this.beat,
      ...params
    });
  }

  buildContext(bar) {
    const barStart = bar * this.barSec;
    const section = sectionAt(barStart);
    const phraseBar = bar % 4;
    const phraseIndex = Math.floor(bar / 4);
    const prevSection = sectionAt(Math.max(0, barStart - 0.01));
    const nextSection = sectionAt(barStart + this.barSec + 0.01);
    const entryBar = bar === 0 || prevSection !== section;
    const preSwitchBar = nextSection !== section;

    const chord = chordAtBar(this.harmonyCycle, bar);
    const nextChord = nextChordAtBar(this.harmonyCycle, bar);
    const motif = motifStateAtBar(this.motifLibrary, bar, section);
    const barSig = barSignatureAt(this.motifLibrary, bar, section);
    const profile = sectionProfile(section);
    const conversation = conversationAt(section, phraseBar);
    const rolePlan = rolePlanAt(section, phraseBar, entryBar, preSwitchBar);

    return {
      bar,
      barStart,
      barSec: this.barSec,
      beat: this.beat,
      duration: this.opts.duration,
      section,
      phraseBar,
      phraseIndex,
      entryBar,
      preSwitchBar,
      transitionNear: transitionNear(barStart + this.barSec * 0.5),
      nextSection,
      chord,
      nextChord,
      motif,
      barSig,
      profile,
      conversation,
      rolePlan
    };
  }

  recordTrace(ctx) {
    if (ctx.phraseBar !== 0) return;
    this.motivationTrace.push({
      bar: ctx.bar,
      section: ctx.section,
      next_section: ctx.nextSection,
      conversation: ctx.conversation,
      chord: ctx.chord.symbol,
      melodic_motif: ctx.motif.melodic.name,
      bass_motif: ctx.motif.bass.name,
      drum_motif: this.drummer.lastMotifName,
      guitar_riff: this.guitar.lastMotifName,
      bar_variant: ctx.barSig.branch,
      role_plan: ctx.rolePlan,
      switch_reason: ctx.preSwitchBar ? `handoff_to_${ctx.nextSection}` : "phrase_development"
    });
  }

  run() {
    for (let bar = 0; bar < this.totalBars; bar++) {
      const ctx = this.buildContext(bar);
      if (ctx.barStart >= this.opts.duration + 0.02) break;

      let calls = [];
      for (const agent of this.agents) {
        calls = agent.perform(ctx, calls) || calls;
      }

      this.recordTrace(ctx);
    }

    return {
      beat: this.beat,
      barSec: this.barSec,
      totalBars: this.totalBars,
      usedTimbres: Array.from(this.usedTimbres).sort(),
      motivationTrace: this.motivationTrace,
      kick_unique_patterns: this.drummer.uniqueKickPatterns.size
    };
  }
}

module.exports = {
  ConductorScheduler
};
