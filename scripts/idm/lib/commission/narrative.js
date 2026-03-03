"use strict";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

const BASE_ROLE_PLAN = {
  intro: { drums: 0.22, bass: 0.3, harmony: 0.95, guitar: 0.42, lead: 0.2, texture: 0.84 },
  verse: { drums: 0.82, bass: 0.86, harmony: 0.66, guitar: 0.48, lead: 0.34, texture: 0.36 },
  hook: { drums: 0.88, bass: 0.81, harmony: 0.58, guitar: 0.8, lead: 0.54, texture: 0.48 },
  chorus: { drums: 0.94, bass: 0.92, harmony: 0.5, guitar: 0.74, lead: 0.76, texture: 0.68 },
  bridge: { drums: 0.58, bass: 0.75, harmony: 0.74, guitar: 0.62, lead: 0.42, texture: 0.8 },
  outro: { drums: 0.2, bass: 0.36, harmony: 0.9, guitar: 0.46, lead: 0.24, texture: 0.82 }
};

function rolePlanAt(section, phraseBar, entryBar, preSwitchBar) {
  const base = BASE_ROLE_PLAN[section] || BASE_ROLE_PLAN.intro;
  const plan = { ...base };

  if (entryBar) {
    if (section === "chorus") {
      plan.drums += 0.06;
      plan.guitar += 0.08;
      plan.lead += 0.08;
    } else if (section === "bridge") {
      plan.drums -= 0.18;
      plan.texture += 0.08;
    } else if (section === "outro") {
      plan.drums -= 0.12;
      plan.harmony += 0.06;
      plan.texture += 0.06;
    }
  }

  if (preSwitchBar) {
    plan.drums *= 0.62;
    plan.texture = Math.min(1, plan.texture + 0.2);
    plan.lead *= 0.75;
    plan.harmony *= 0.92;
  }

  if (section === "verse") {
    if (phraseBar === 1) {
      plan.guitar += 0.12;
      plan.harmony -= 0.08;
    } else if (phraseBar === 2) {
      plan.bass += 0.08;
      plan.drums -= 0.06;
    }
  } else if (section === "hook") {
    if (phraseBar === 0) {
      plan.harmony += 0.08;
      plan.guitar -= 0.12;
    } else if (phraseBar === 3) {
      plan.texture += 0.08;
      plan.lead += 0.06;
    }
  } else if (section === "chorus") {
    if (phraseBar === 1) {
      plan.lead += 0.08;
      plan.harmony -= 0.1;
    } else if (phraseBar === 2) {
      plan.bass += 0.05;
      plan.guitar += 0.06;
    } else if (phraseBar === 3) {
      plan.drums -= 0.16;
      plan.texture += 0.14;
    }
  } else if (section === "bridge") {
    if (phraseBar === 2 || phraseBar === 3) {
      plan.drums -= 0.1;
      plan.texture += 0.1;
      plan.harmony += 0.04;
    }
  } else if (section === "outro") {
    if (phraseBar === 2 || phraseBar === 3) {
      plan.drums -= 0.08;
      plan.lead -= 0.06;
      plan.harmony += 0.05;
      plan.texture += 0.06;
    }
  }

  for (const key of Object.keys(plan)) {
    plan[key] = clamp01(plan[key]);
  }

  return plan;
}

module.exports = {
  BASE_ROLE_PLAN,
  rolePlanAt
};
