"use strict";

const { degreeToScaleMidi, quantizeToScale } = require("./harmony");

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function rotate(pattern, amount) {
  if (!pattern.length) return [];
  const n = ((amount % pattern.length) + pattern.length) % pattern.length;
  return pattern.slice(n).concat(pattern.slice(0, n));
}

function microOffset(role, step, section, rng) {
  let ms = rng.range(-1.8, 1.8);
  if (role === "snare") {
    ms += 6 + rng.range(-1.1, 1.1);
  } else if (role === "kick") {
    ms += step % 4 === 0 ? rng.range(-0.8, 0.7) : rng.range(-2.1, 1.5);
  } else if (role === "hat") {
    ms += step % 2 ? 2.1 : -1.1;
    if (section === "chorus") ms *= 0.84;
  } else if (role === "ride") {
    ms += step % 4 === 2 ? 1.4 : -0.7;
  }
  return ms / 1000;
}

function roleLevel(ctx, role, fallback = 1) {
  if (!ctx || !ctx.rolePlan || typeof ctx.rolePlan[role] !== "number") return fallback;
  return clamp01(ctx.rolePlan[role]);
}

class Agent {
  constructor(name, conductor) {
    this.name = name;
    this.conductor = conductor;
    this.rng = conductor.rng;
    this.lastSignature = "";
  }

  emit(id, params) {
    this.conductor.emit(id, params);
  }

  chance(p) {
    return this.rng.chance(clamp01(p));
  }

  stepTime(ctx, step, role = "hat") {
    return ctx.barStart + step * (ctx.barSec / 16) + microOffset(role, step, ctx.section, this.rng);
  }

  responseTime(base, beat, ratio = 0.5) {
    return base + beat * ratio;
  }
}

class DrummerAgent extends Agent {
  constructor(conductor) {
    super("drummer", conductor);
    this.uniqueKickPatterns = new Set();
    this.lastKickPattern = "";
    this.lastMotifName = "none";
    this.jungleMotifs = [
      {
        name: "amen-a",
        kick: [1, 0, 0.52, 0, 0, 0.72, 0, 0, 0.9, 0, 0.58, 0, 0.66, 0, 0, 0.5],
        snareGhost: [3, 7, 11, 15],
        hat: [0.34, 0.28, 0.42, 0.31, 0.36, 0.3, 0.44, 0.32, 0.38, 0.3, 0.45, 0.32, 0.4, 0.3, 0.47, 0.33],
        ride: [2, 6, 10, 14]
      },
      {
        name: "amen-b",
        kick: [1, 0, 0, 0.6, 0.8, 0, 0, 0, 0.95, 0, 0.65, 0, 0.7, 0, 0.52, 0],
        snareGhost: [2, 6, 10, 14, 15],
        hat: [0.36, 0.29, 0.43, 0.32, 0.38, 0.29, 0.45, 0.32, 0.4, 0.29, 0.46, 0.33, 0.41, 0.3, 0.49, 0.34],
        ride: [2, 5, 10, 13]
      },
      {
        name: "think-break",
        kick: [1, 0.42, 0, 0, 0.7, 0, 0.5, 0, 0.9, 0, 0.62, 0, 0.68, 0, 0, 0.58],
        snareGhost: [1, 6, 9, 11, 14],
        hat: [0.35, 0.3, 0.41, 0.33, 0.39, 0.3, 0.46, 0.34, 0.42, 0.3, 0.47, 0.34, 0.43, 0.3, 0.5, 0.35],
        ride: [2, 6, 11, 14]
      },
      {
        name: "tramen-lite",
        kick: [1, 0, 0.56, 0, 0.76, 0, 0, 0.46, 0.92, 0, 0.66, 0, 0.72, 0, 0.52, 0],
        snareGhost: [2, 5, 7, 10, 13, 15],
        hat: [0.37, 0.3, 0.44, 0.33, 0.4, 0.3, 0.47, 0.34, 0.43, 0.31, 0.49, 0.34, 0.44, 0.31, 0.51, 0.35],
        ride: [2, 6, 10, 14]
      }
    ];
  }

  chooseConversationPattern(section, phraseBar) {
    if (section === "intro") return phraseBar % 2;
    if (section === "verse") return (phraseBar + 1) % 4;
    if (section === "hook") return (phraseBar + 2) % 4;
    if (section === "chorus") return (phraseBar + 3) % 4;
    if (section === "bridge") return phraseBar % 4;
    return (phraseBar + 1) % 4;
  }

  transformKick(base, ctx) {
    const cell = base.slice();
    const rotateBy = (ctx.barSig.rotation + ctx.phraseBar) % 16;
    const rotated = rotate(cell, rotateBy);
    for (let i = 0; i < 16; i++) cell[i] = rotated[i];

    if (ctx.section === "intro") {
      for (let i = 0; i < 16; i++) {
        cell[i] *= i % 4 === 0 ? 0.62 : 0.28;
      }
    } else if (ctx.section === "verse") {
      cell[(ctx.barSig.mutateIndex + 3) % 16] += 0.18;
      if (ctx.phraseBar === 3) cell[15] += 0.24;
    } else if (ctx.section === "hook") {
      cell[2] += 0.22;
      cell[6] += 0.24;
      cell[11] += 0.2;
      if (ctx.preSwitchBar) {
        cell[0] *= 0.4;
        cell[14] += 0.28;
      }
    } else if (ctx.section === "chorus") {
      if (ctx.phraseBar === 0) {
        cell[0] *= 0.25;
        cell[1] += 0.36;
        cell[9] += 0.3;
      } else if (ctx.phraseBar === 1) {
        cell[3] += 0.34;
        cell[7] += 0.28;
        cell[15] += 0.36;
      } else if (ctx.phraseBar === 2) {
        cell[2] += 0.22;
        cell[10] += 0.24;
        cell[14] += 0.26;
      } else {
        for (let i = 0; i < 8; i++) cell[i] *= 0.32;
        cell[11] += 0.3;
        cell[13] += 0.26;
        cell[15] += 0.32;
      }
    } else if (ctx.section === "bridge") {
      for (let i = 0; i < 16; i++) {
        if (i % 4 === 0) cell[i] *= 0.72;
        else cell[i] *= 0.42;
      }
      cell[(ctx.barSig.mutateIndex + 5) % 16] += 0.2;
    } else {
      for (let i = 0; i < 16; i++) {
        if (![0, 6, 12].includes(i)) cell[i] *= 0.14;
        else cell[i] *= 0.5;
      }
    }

    if (ctx.preSwitchBar) {
      cell[0] = 0;
      for (let i = 0; i < 8; i++) cell[i] *= 0.3;
      for (let i = 8; i < 16; i++) cell[i] *= 0.78;
      cell[15] += 0.24;
    }

    for (let i = 0; i < 16; i++) {
      if (this.chance(ctx.barSig.dropoutThreshold * 0.25)) {
        cell[(ctx.barSig.mutateIndex + i) % 16] *= 0.18;
      }
      cell[i] = Math.max(0, Math.min(1.15, cell[i] + this.rng.range(-0.03, 0.03)));
    }

    const signature = cell.map((x) => Math.round(x * 100)).join(",");
    if (signature === this.lastKickPattern) {
      const idx = (ctx.barSig.mutateIndex + 7) % 16;
      cell[idx] = Math.min(1.15, cell[idx] + 0.24);
      cell[(idx + 8) % 16] *= 0.36;
    }

    const finalKey = cell.map((x) => Math.round(x * 100)).join(",");
    this.lastKickPattern = finalKey;
    this.uniqueKickPatterns.add(finalKey);

    return cell;
  }

  deepBudget(ctx) {
    if (ctx.section === "intro") return ctx.preSwitchBar ? 1 : 2;
    if (ctx.section === "verse") return ctx.preSwitchBar ? 2 : 3;
    if (ctx.section === "hook") return ctx.preSwitchBar ? 2 : 3;
    if (ctx.section === "chorus") return ctx.phraseBar === 2 ? 4 : 3;
    if (ctx.section === "bridge") return 2;
    return 1;
  }

  kickVariant(ctx, step) {
    if (ctx.section === "intro") return step % 4 === 0 ? "kick-soft" : "kick-tight";
    if (ctx.section === "outro") return step % 6 === 0 ? "kick-soft" : "kick-tight";
    if (ctx.section === "verse") {
      if (ctx.preSwitchBar && step >= 10) return "kick-crunch";
      if (step % 8 === 4 || ctx.barSig.branch === "sync") return "kick-tight";
      return ctx.phraseBar === 1 ? "kick-soft" : "kick-deep";
    }
    if (ctx.section === "hook") {
      if (step % 4 === 1) return "kick-crunch";
      return step % 8 === 6 ? "kick-tight" : "kick-deep";
    }
    if (ctx.section === "chorus") {
      if (step % 4 === 1) return "kick-crunch";
      if (step % 8 === 6) return "kick-tight";
      return ctx.phraseBar === 0 ? "kick-soft" : "kick-deep";
    }
    return step % 4 === 0 ? "kick-soft" : "kick-tight";
  }

  perform(ctx, calls) {
    const drumLevel = roleLevel(ctx, "drums", 1);
    if (drumLevel <= 0.02) return calls;

    const motifIndex = this.chooseConversationPattern(ctx.section, ctx.phraseBar);
    const motif = this.jungleMotifs[motifIndex];
    this.lastMotifName = motif.name;

    const kickCell = this.transformKick(motif.kick, ctx);
    const budget = this.deepBudget(ctx);
    let deepHits = 0;

    const kickEnabled =
      (ctx.section === "intro" ? ctx.barStart > 10 : ctx.section !== "outro" || ctx.barStart < ctx.duration - 5) &&
      this.chance(0.38 + drumLevel * 0.62);

    if (kickEnabled) {
      for (let step = 0; step < 16; step++) {
        const v = kickCell[step] || 0;
        if (v <= 0.06 + (1 - drumLevel) * 0.16) continue;

        const t = this.stepTime(ctx, step, "kick");
        if (t >= ctx.duration) continue;

        const variant = this.kickVariant(ctx, step);
        if (variant === "kick-deep") {
          if (deepHits < budget && this.chance(0.48 + drumLevel * 0.32 + ctx.profile.drive * 0.2)) {
            this.emit("kick-deep", {
              startSec: t,
              velocity: v * (0.5 + drumLevel * 0.2 + ctx.profile.drive * 0.16)
            });
            deepHits++;
          } else {
            this.emit("kick-tight", { startSec: t, velocity: v * (0.42 + drumLevel * 0.16) });
          }
        } else if (variant === "kick-soft") {
          this.emit("kick-soft", {
            startSec: t,
            velocity: v * (0.38 + drumLevel * 0.14 + ctx.profile.drive * 0.12)
          });
          if (step % 8 === 4 && this.chance(0.12 + drumLevel * 0.26)) {
            this.emit("kick-punch", { startSec: t + ctx.beat * 0.015, velocity: v * (0.18 + drumLevel * 0.2) });
          }
        } else if (variant === "kick-crunch") {
          this.emit("kick-crunch", {
            startSec: t,
            velocity: v * (0.4 + drumLevel * 0.14 + ctx.profile.chaos * 0.18)
          });
          if (this.chance(0.08 + drumLevel * 0.22)) {
            this.emit("kick-tight", { startSec: t + ctx.beat * 0.012, velocity: v * (0.12 + drumLevel * 0.18) });
          }
        } else {
          this.emit("kick-tight", {
            startSec: t,
            velocity: v * (0.4 + drumLevel * 0.16 + ctx.profile.drive * 0.14)
          });
        }

        if (step % 4 === 0 || variant === "kick-crunch") {
          this.emit("kick-punch", {
            startSec: t + ctx.beat * 0.01,
            velocity: v * (0.3 + drumLevel * 0.2 + ctx.profile.drive * 0.12)
          });
        }
        if ((ctx.section === "chorus" || ctx.preSwitchBar) && this.chance(0.06 + drumLevel * 0.22 + ctx.profile.chaos * 0.14)) {
          this.emit("kick-ghost", { startSec: t + ctx.beat * 0.11, velocity: v * (0.14 + drumLevel * 0.2) });
        }

        if ((ctx.conversation === "drum_call" || ctx.conversation === "mixed_call") && step % 4 === 2 && this.chance(0.4 + drumLevel * 0.4)) {
          calls.push({ source: "drums", time: t, midi: ctx.chord.root + 24, energy: 0.36 + drumLevel * 0.26 + v * 0.2 });
        }
      }
    }

    const snareMain1 = ctx.barStart + ctx.beat + microOffset("snare", 4, ctx.section, this.rng);
    const snareMain2 = ctx.barStart + ctx.beat * 3 + microOffset("snare", 12, ctx.section, this.rng);
    if ((ctx.section !== "intro" || ctx.barStart > 16) && this.chance(0.32 + drumLevel * 0.64)) {
      const snareShape = 0.44 + drumLevel * 0.42;
      this.emit("snare-body", {
        startSec: snareMain1,
        velocity: (ctx.section === "chorus" ? 0.86 : 0.7) * snareShape,
        pan: -0.08
      });
      this.emit("snare-bright", { startSec: snareMain1 + 0.001, velocity: 0.44 * snareShape, pan: -0.05 });
      this.emit("snare-body", {
        startSec: snareMain2,
        velocity: (ctx.section === "chorus" ? 0.92 : 0.78) * snareShape,
        pan: 0.1
      });
      this.emit("snare-bright", { startSec: snareMain2 + 0.001, velocity: 0.5 * snareShape, pan: 0.08 });

      if (ctx.section === "chorus" && this.chance(0.16 + drumLevel * 0.22)) {
        const flam = snareMain2 - ctx.beat * 0.06;
        this.emit("snare-rim", { startSec: flam, velocity: 0.15 + drumLevel * 0.1, pan: -0.18 });
      }
    }

    if ((ctx.section === "chorus" || ctx.preSwitchBar || (ctx.section === "hook" && ctx.phraseBar === 3)) && this.chance(0.26 + drumLevel * 0.5)) {
      this.emit("clap-wide", { startSec: snareMain1 + 0.004, velocity: (0.18 + drumLevel * 0.26) });
      this.emit("clap-wide", { startSec: snareMain2 + 0.004, velocity: (0.2 + drumLevel * 0.28) });
    }

    for (const gs of motif.snareGhost) {
      if (!this.chance((ctx.section === "chorus" ? 0.34 : 0.16) + drumLevel * 0.34)) continue;
      const gt = ctx.barStart + gs * (ctx.barSec / 16) + this.rng.range(-0.009, 0.009);
      if (gt >= ctx.duration) continue;
      this.emit("snare-rim", {
        startSec: gt,
        velocity: 0.08 + drumLevel * 0.14 + ctx.profile.chaos * 0.08,
        pan: this.rng.range(-0.5, 0.5)
      });
    }

    for (let step = 0; step < 16; step++) {
      const hv = motif.hat[step] || 0;
      if (hv <= 0) continue;
      if (ctx.section === "intro" && step % 4 !== 2 && this.chance(0.75 - drumLevel * 0.4)) continue;
      if (!this.chance(0.14 + drumLevel * 0.78)) continue;
      const ht = this.stepTime(ctx, step, "hat");
      if (ht >= ctx.duration) continue;
      const pan = Math.sin((ctx.bar * 16 + step) * 0.2) * 0.66;

      this.emit("hat-closed", {
        startSec: ht,
        velocity: hv * (ctx.section === "chorus" ? 0.11 + drumLevel * 0.14 : 0.08 + drumLevel * 0.12),
        pan
      });

      if (step === 14 && ctx.section !== "intro" && this.chance((ctx.section === "chorus" ? 0.18 : 0.1) + drumLevel * 0.36)) {
        this.emit("hat-open", {
          startSec: ht + ctx.beat * 0.01,
          velocity: 0.05 + drumLevel * 0.1 + ctx.profile.drive * 0.06,
          pan: pan * 0.8
        });
      }

      if (step % 2 === 1 && this.chance(0.1 + drumLevel * 0.3 + ctx.profile.density * 0.14)) {
        this.emit("hat-dust", {
          startSec: ht + ctx.beat * 0.005,
          durationSec: ctx.beat * 0.1,
          velocity: 0.03 + drumLevel * 0.06 + ctx.profile.chaos * 0.06,
          pan: -pan * 0.7
        });
      }

      if (ctx.section !== "intro" && step % 4 !== 0 && this.chance(0.08 + drumLevel * 0.24 + ctx.profile.drive * 0.16)) {
        this.emit("shaker-grain", {
          startSec: ht + ctx.beat * 0.01,
          durationSec: ctx.beat * 0.11,
          velocity: 0.03 + drumLevel * 0.05 + ctx.profile.drive * 0.06,
          pan: pan * 0.6
        });
      }
    }

    if (ctx.section !== "intro" && drumLevel > 0.3) {
      for (const rs of motif.ride) {
        if (!this.chance(0.2 + drumLevel * 0.52)) continue;
        const rt = this.stepTime(ctx, rs, "ride");
        if (rt >= ctx.duration) continue;
        const rpan = Math.sin((ctx.bar * 16 + rs) * 0.09) * 0.5;
        this.emit("ride-ping", {
          startSec: rt,
          velocity: (ctx.section === "chorus" ? 0.08 : 0.05) + drumLevel * 0.14,
          pan: rpan
        });
        if (((ctx.section === "chorus" && rs % 8 === 2) || ctx.preSwitchBar) && this.chance(0.12 + drumLevel * 0.3)) {
          this.emit("ride-bell", { startSec: rt + ctx.beat * 0.02, velocity: 0.04 + drumLevel * 0.1, pan: rpan * 0.8 });
        }
      }
    }

    const percSteps = ctx.section === "chorus" ? [1, 3, 5, 7, 9, 11, 13, 15] : [3, 7, 11, 15];
    for (const ps of percSteps) {
      if (!this.chance((ctx.section === "chorus" ? 0.12 : 0.06) + drumLevel * 0.34)) continue;
      const pt = ctx.barStart + ps * (ctx.barSec / 16) + this.rng.range(-0.008, 0.008);
      if (pt >= ctx.duration) continue;
      this.emit("perc-wood", {
        startSec: pt,
        velocity: 0.03 + drumLevel * 0.08 + ctx.profile.drive * 0.06,
        pan: this.rng.range(-0.7, 0.7)
      });
      this.emit("perc-tick", {
        startSec: pt + ctx.beat * 0.04,
        velocity: 0.02 + drumLevel * 0.05 + ctx.profile.chaos * 0.05,
        pan: this.rng.range(-0.85, 0.85)
      });
      if (((ctx.section === "chorus" && ps % 4 === 1 && this.chance(0.12 + drumLevel * 0.26)) || (ctx.preSwitchBar && ps >= 11)) && drumLevel > 0.36) {
        this.emit("perc-tom", {
          startSec: pt + ctx.beat * 0.06,
          velocity: (ctx.preSwitchBar ? 0.08 : 0.06) + drumLevel * 0.1,
          pan: this.rng.range(-0.4, 0.4)
        });
      }
    }

    return calls;
  }
}

class BassAgent extends Agent {
  constructor(conductor) {
    super("bass", conductor);
    this.lastMotifName = "none";
  }

  perform(ctx, calls) {
    const bassLevel = roleLevel(ctx, "bass", 1);
    if (bassLevel <= 0.03) return calls;

    this.lastMotifName = ctx.motif.bass.name;
    const rhythm = ctx.motif.bass.rhythm16;
    const degrees = ctx.motif.bass.degrees;

    for (let i = 0; i < rhythm.length; i++) {
      const step = rhythm[i];
      const t = ctx.barStart + step * (ctx.barSec / 16) + this.rng.range(-0.006, 0.006);
      if (t >= ctx.duration) continue;
      if (ctx.section === "outro" && step > 10 && this.chance(0.66)) continue;
      if (!this.chance(0.42 + bassLevel * 0.58)) continue;

      const degree = degrees[i % degrees.length];
      const octave = ctx.section === "chorus" && this.chance(0.2) ? -1 : -2;
      const raw = degreeToScaleMidi(ctx.chord, degree, octave, "bass");
      const midi = quantizeToScale(raw, ctx.chord.bassRoot, ctx.chord.scale);
      const dur = (ctx.barSec / 16) * (ctx.section === "chorus" ? 2.2 : 3.1);

      this.emit("bass-sub", {
        startSec: t,
        durationSec: dur,
        midi,
        velocity: (0.12 + bassLevel * 0.18) + ctx.profile.drive * 0.13
      });

      if ((i % 2 === 0 || ctx.section === "chorus" || ctx.conversation === "bass_call") && this.chance(0.28 + bassLevel * 0.52)) {
        this.emit("bass-growl", {
          startSec: t + ctx.beat * 0.01,
          durationSec: dur * 0.92,
          midi: midi + 12,
          velocity: (0.04 + bassLevel * 0.08) + ctx.profile.drive * 0.08
        });
      }

      if ((i === rhythm.length - 1 || ctx.preSwitchBar) && this.chance(0.36 + bassLevel * 0.5)) {
        const nextMidi = quantizeToScale(ctx.nextChord.bassRoot - 24, ctx.chord.bassRoot, ctx.chord.scale);
        this.emit("bass-glide", {
          startSec: t + ctx.beat * 0.08,
          durationSec: dur * 1.2,
          midi,
          velocity: (ctx.preSwitchBar ? 0.1 : 0.08) + bassLevel * 0.1,
          glideSemis: (nextMidi - midi) * 0.24
        });
      }

      if (ctx.conversation === "bass_call" && i % 2 === 0 && this.chance(0.4 + bassLevel * 0.4)) {
        calls.push({ source: "bass", time: t, midi, energy: 0.34 + bassLevel * 0.34 });
      }
    }

    return calls;
  }
}

class HarmonyAgent extends Agent {
  constructor(conductor) {
    super("harmony", conductor);
    this.lastMotifName = "none";
  }

  perform(ctx, calls) {
    const harmonyLevel = roleLevel(ctx, "harmony", 1);
    if (harmonyLevel <= 0.03) return calls;

    this.lastMotifName = ctx.motif.melodic.name;

    if (ctx.bar % 2 === 0 && this.chance(0.24 + harmonyLevel * 0.72)) {
      this.emit("pad-warm", {
        startSec: ctx.barStart,
        durationSec: ctx.barSec * 2.4,
        chord: ctx.chord,
        velocity:
          (ctx.section === "chorus" ? 0.05 : ctx.section === "verse" || ctx.section === "hook" ? 0.09 : 0.12) +
          harmonyLevel * 0.1
      });
      this.emit("pad-glass", {
        startSec: ctx.barStart + ctx.beat * 0.08,
        durationSec: ctx.barSec * 2.6,
        chord: ctx.chord,
        velocity: (ctx.section === "chorus" ? 0.03 : 0.05) + harmonyLevel * 0.08
      });
      this.emit("pad-noise", {
        startSec: ctx.barStart + ctx.beat * 0.1,
        durationSec: ctx.barSec * 2.2,
        velocity: (ctx.section === "chorus" ? 0.015 : 0.025) + harmonyLevel * 0.045
      });
    }

    const keyRhythm =
      ctx.section === "intro"
        ? [0, 8]
        : ctx.section === "verse"
          ? [0, 4, 8, 12]
          : ctx.section === "hook"
            ? [1, 4, 7, 10, 13]
            : ctx.section === "chorus"
              ? [0, 2, 4, 6, 8, 10, 12, 14]
              : ctx.section === "bridge"
                ? [0, 3, 6, 9, 12, 15]
                : [0, 6, 12];

    for (let i = 0; i < keyRhythm.length; i++) {
      const step = keyRhythm[i];
      const t = ctx.barStart + step * (ctx.barSec / 16) + this.rng.range(-0.008, 0.008);
      if (t >= ctx.duration) continue;
      if (!this.chance(0.26 + harmonyLevel * 0.64)) continue;

      const degree = ctx.motif.melodic.degrees[i % ctx.motif.melodic.degrees.length];
      const midiMain = quantizeToScale(
        degreeToScaleMidi(ctx.chord, degree, 1, "root"),
        ctx.chord.root,
        ctx.chord.scale
      );

      this.emit("keys-ep", {
        startSec: t,
        durationSec: ctx.beat * this.rng.choose([0.26, 0.34, 0.44]),
        midi: midiMain,
        velocity: (ctx.section === "chorus" ? 0.045 : 0.06) + harmonyLevel * 0.1,
        pan: Math.sin((ctx.bar * 16 + step) * 0.28) * 0.48
      });

      if (ctx.section !== "intro" && this.chance(0.08 + harmonyLevel * 0.34 + ctx.profile.chaos * 0.12)) {
        this.emit("keys-fm", {
          startSec: t + ctx.beat * 0.04,
          durationSec: ctx.beat * this.rng.choose([0.18, 0.24, 0.3]),
          midi: midiMain + 12,
          velocity: 0.03 + harmonyLevel * 0.06 + ctx.profile.drive * 0.07,
          pan: this.rng.range(-0.55, 0.55)
        });
      }

      if ((ctx.conversation === "harmony_call" || ctx.conversation === "mixed_call") && this.chance(0.36 + harmonyLevel * 0.4)) {
        calls.push({ source: "harmony", time: t, midi: midiMain, energy: 0.28 + harmonyLevel * 0.34 });
      }
    }

    if ((ctx.section === "hook" || ctx.section === "chorus" || ctx.preSwitchBar) && this.chance(0.2 + harmonyLevel * 0.6)) {
      this.emit("chord-stab", {
        startSec: ctx.barStart + ctx.beat * (ctx.preSwitchBar ? 2.5 : 0.5),
        durationSec: ctx.beat * 0.42,
        chord: ctx.chord,
        velocity: (ctx.preSwitchBar ? 0.08 : ctx.section === "chorus" ? 0.06 : 0.045) + harmonyLevel * 0.09
      });
    }

    return calls;
  }
}

class GuitarAgent extends Agent {
  constructor(conductor) {
    super("guitar", conductor);
    this.lastMotifName = "none";
  }

  riffPattern(ctx) {
    if (ctx.section === "intro") return [6, 14];
    if (ctx.section === "verse") return [1, 5, 9, 13];
    if (ctx.section === "hook") return [0, 3, 6, 9, 12, 15];
    if (ctx.section === "chorus") return [0, 2, 4, 6, 8, 10, 12, 14];
    if (ctx.section === "bridge") return [2, 6, 10, 14];
    return [4, 12];
  }

  perform(ctx, calls) {
    const guitarLevel = roleLevel(ctx, "guitar", 1);
    if (guitarLevel <= 0.03) return calls;

    const pattern = this.riffPattern(ctx);
    this.lastMotifName = `${ctx.section}-riff-${pattern.length}`;

    for (let i = 0; i < pattern.length; i++) {
      if (!this.chance(0.24 + guitarLevel * 0.66)) continue;
      const step = pattern[i];
      const t = ctx.barStart + step * (ctx.barSec / 16) + this.rng.range(-0.007, 0.007);
      if (t >= ctx.duration) continue;

      const degree = ctx.motif.melodic.degrees[(i + ctx.phraseBar) % ctx.motif.melodic.degrees.length];
      const midi = quantizeToScale(degreeToScaleMidi(ctx.chord, degree, 1, "root"), ctx.chord.root, ctx.chord.scale);
      const pan = Math.sin((ctx.bar * 16 + step) * 0.13) * 0.72;

      if (ctx.section === "verse" || ctx.section === "bridge" || ctx.section === "outro") {
        this.emit("guitar-mute", {
          startSec: t,
          durationSec: ctx.beat * 0.2,
          midi,
          velocity: 0.03 + guitarLevel * 0.08 + ctx.profile.drive * 0.07,
          pan
        });
      }

      if (ctx.section === "hook" || ctx.section === "chorus" || ctx.section === "intro") {
        this.emit("guitar-clean", {
          startSec: t,
          durationSec: ctx.beat * this.rng.choose([0.22, 0.3, 0.38]),
          midi: midi + (ctx.section === "chorus" ? 12 : 7),
          velocity: (ctx.section === "chorus" ? 0.05 : 0.04) + guitarLevel * 0.1,
          pan
        });
      }

      if ((ctx.conversation === "guitar_call" || (ctx.conversation === "mixed_call" && i % 2 === 0)) && this.chance(0.3 + guitarLevel * 0.46)) {
        calls.push({ source: "guitar", time: t, midi: midi + 12, energy: 0.3 + guitarLevel * 0.34 });
      }
    }

    return calls;
  }
}

class LeadAgent extends Agent {
  constructor(conductor) {
    super("lead", conductor);
  }

  perform(ctx, calls) {
    const leadLevel = roleLevel(ctx, "lead", 1);
    if (leadLevel <= 0.03) return calls;

    const responseLimit = Math.min(calls.length, Math.max(1, Math.round((ctx.section === "chorus" ? 8 : 6) * (0.45 + leadLevel * 0.7))));
    for (let i = 0; i < responseLimit; i++) {
      if (!this.chance(0.35 + leadLevel * 0.5)) continue;
      const c = calls[i];
      const rt = this.responseTime(c.time, ctx.beat, this.rng.choose([0.25, 0.5, 0.75]));
      if (rt <= ctx.barStart || rt >= ctx.barStart + ctx.barSec || rt >= ctx.duration) continue;

      if (ctx.conversation === "harmony_call") {
        this.emit("counter-pulse", {
          startSec: rt,
          durationSec: ctx.beat * 0.22,
          midi: c.midi + 12,
          velocity: (0.03 + leadLevel * 0.06) + c.energy * 0.06,
          pan: this.rng.range(-0.85, 0.85)
        });
      } else if (ctx.conversation === "drum_call") {
        this.emit("lead-fm", {
          startSec: rt,
          durationSec: ctx.beat * 0.18,
          midi: c.midi + this.rng.choose([12, 14, 17]),
          velocity: (0.04 + leadLevel * 0.08) + c.energy * 0.06,
          pan: this.rng.range(-0.7, 0.7)
        });
      } else if (ctx.conversation === "bass_call") {
        this.emit("counter-soft", {
          startSec: rt,
          durationSec: ctx.beat * 0.24,
          midi: c.midi + 12,
          velocity: 0.025 + leadLevel * 0.05,
          pan: this.rng.range(-0.7, 0.7)
        });
      } else if (ctx.conversation === "guitar_call") {
        this.emit("arp-chip", {
          startSec: rt,
          durationSec: ctx.beat * 0.15,
          midi: c.midi + this.rng.choose([12, 17, 19]),
          velocity: 0.03 + leadLevel * 0.06,
          pan: this.rng.range(-0.9, 0.9)
        });
      } else {
        this.emit("lead-glass", {
          startSec: rt,
          durationSec: ctx.beat * 0.16,
          midi: c.midi + 17,
          velocity: 0.04 + leadLevel * 0.07,
          pan: this.rng.range(-0.85, 0.85)
        });
      }
    }

    if (ctx.section === "chorus") {
      for (let s = 0; s < 6; s++) {
        if (!this.chance(0.12 + leadLevel * 0.46)) continue;
        const t = ctx.barStart + (s + 1) * (ctx.barSec / 8) + this.rng.range(-0.008, 0.008);
        if (t >= ctx.duration) continue;
        const degree = ctx.motif.melodic.degrees[(s + ctx.phraseBar) % ctx.motif.melodic.degrees.length];
        const midi = quantizeToScale(degreeToScaleMidi(ctx.chord, degree + 2, 2, "root"), ctx.chord.root, ctx.chord.scale);
        this.emit("lead-fm", {
          startSec: t,
          durationSec: ctx.beat * this.rng.choose([0.14, 0.2, 0.26]),
          midi,
          velocity: 0.05 + leadLevel * 0.08,
          pan: Math.sin((ctx.bar * 8 + s) * 0.37) * 0.8
        });
        if (this.chance(0.08 + leadLevel * 0.26)) {
          this.emit("lead-glass", {
            startSec: t + ctx.beat * 0.03,
            durationSec: ctx.beat * 0.14,
            midi: midi + 5,
            velocity: 0.04 + leadLevel * 0.07,
            pan: this.rng.range(-0.85, 0.85)
          });
        }
      }
    }

    return calls;
  }
}

class TextureAgent extends Agent {
  constructor(conductor) {
    super("texture", conductor);
  }

  perform(ctx, calls) {
    const textureLevel = roleLevel(ctx, "texture", 1);
    if (textureLevel <= 0.03) return calls;

    if ((ctx.section === "intro" || ctx.section === "outro") && this.chance(0.3 + textureLevel * 0.62)) {
      this.emit("drone-low", {
        startSec: ctx.barStart + ctx.beat * 0.03,
        durationSec: ctx.barSec * 1.9,
        midi: ctx.chord.bassRoot - 12,
        velocity: (ctx.section === "intro" ? 0.04 : 0.03) + textureLevel * 0.1,
        pan: -0.2
      });
      this.emit("drone-high", {
        startSec: ctx.barStart + ctx.beat * 0.07,
        durationSec: ctx.barSec * 1.8,
        midi: ctx.chord.root + 24,
        velocity: 0.025 + textureLevel * 0.06,
        pan: 0.28
      });
      this.emit("air-spark", {
        startSec: ctx.barStart + ctx.beat * 0.12,
        durationSec: ctx.barSec * 1.7,
        velocity: 0.04 + textureLevel * 0.09
      });
      this.emit("texture-grain", {
        startSec: ctx.barStart + ctx.beat * 0.16,
        durationSec: ctx.barSec * 1.2,
        velocity: 0.025 + textureLevel * 0.06
      });
    }

    const glitchCount = Math.max(
      0,
      Math.round(
        (
      ctx.section === "chorus"
        ? this.rng.int(1, 4)
        : ctx.section === "hook" || ctx.section === "bridge"
          ? this.rng.int(0, 2)
          : ctx.section === "outro"
            ? this.rng.int(0, 1)
            : 0
        ) * (0.45 + textureLevel * 0.8)
      )
    );

    for (let g = 0; g < glitchCount; g++) {
      const gt = ctx.barStart + this.rng.range(0.04, ctx.barSec * 0.96);
      if (gt >= ctx.duration) continue;
      this.emit("glitch-digital", {
        startSec: gt,
        durationSec: this.rng.range(0.03, 0.1),
        midi: this.rng.choose([72, 76, 79, 83, 86, 91]),
        velocity: (ctx.section === "chorus" ? 0.05 : 0.03) + textureLevel * 0.08,
        pan: this.rng.range(-0.9, 0.9)
      });

      if (this.chance(0.08 + textureLevel * 0.2)) {
        this.emit("perc-blip", {
          startSec: gt + ctx.beat * 0.03,
          midi: this.rng.choose([74, 77, 81, 84, 88, 91]),
          velocity: 0.03 + textureLevel * 0.06,
          pan: this.rng.range(-0.75, 0.75)
        });
      }
    }

    const metalCount = Math.max(
      0,
      Math.round(
        (
      ctx.section === "chorus"
        ? this.rng.int(2, 5)
        : ctx.section === "hook" || ctx.section === "bridge"
          ? this.rng.int(1, 3)
          : 0
        ) * (0.5 + textureLevel * 0.82)
      )
    );

    for (let m = 0; m < metalCount; m++) {
      const mt = ctx.barStart + this.rng.range(0.08, ctx.barSec * 0.9);
      if (mt >= ctx.duration) continue;
      this.emit("metal-short", {
        startSec: mt,
        durationSec: this.rng.range(0.07, 0.22),
        midi: this.rng.choose([55, 58, 62, 65, 69, 72]),
        velocity: (ctx.section === "chorus" ? 0.06 : 0.04) + textureLevel * 0.09,
        pan: this.rng.range(-0.9, 0.9)
      });
    }

    if ((ctx.preSwitchBar || ctx.transitionNear || (ctx.section === "chorus" && ctx.phraseBar === 3)) && this.chance(0.3 + textureLevel * 0.6)) {
      this.emit("noise-riser", {
        startSec: ctx.barStart + ctx.barSec * 0.56,
        durationSec: ctx.barSec * 0.42,
        velocity: (ctx.section === "chorus" ? 0.08 : 0.05) + textureLevel * 0.1
      });
      this.emit("metal-long", {
        startSec: ctx.barStart + ctx.barSec * 0.58,
        durationSec: ctx.barSec * 0.36,
        midi: this.rng.choose([50, 53, 57, 62]),
        velocity: (ctx.preSwitchBar ? 0.06 : 0.05) + textureLevel * 0.08,
        pan: this.rng.range(-0.7, 0.7)
      });
      for (const fs of [11, 12, 13, 14, 15]) {
        if (!this.chance(0.22 + textureLevel * 0.46)) continue;
        const ft = ctx.barStart + fs * (ctx.barSec / 16) + this.rng.range(-0.004, 0.005);
        if (ft >= ctx.duration) continue;
        this.emit("perc-tom", {
          startSec: ft,
          velocity: 0.05 + textureLevel * 0.06 + (fs - 11) * 0.008,
          pan: this.rng.range(-0.45, 0.45)
        });
      }
    }

    return calls;
  }
}

module.exports = {
  Agent,
  BassAgent,
  DrummerAgent,
  GuitarAgent,
  HarmonyAgent,
  LeadAgent,
  TextureAgent
};
