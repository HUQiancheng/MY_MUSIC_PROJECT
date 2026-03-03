"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { BASE_ROLE_PLAN, rolePlanAt } = require("../scripts/idm/lib/commission/narrative");

test("base role plan covers all timeline sections", () => {
  for (const section of ["intro", "verse", "hook", "chorus", "bridge", "outro"]) {
    assert.ok(BASE_ROLE_PLAN[section]);
  }
});

test("rolePlanAt returns clamped levels for each role", () => {
  const plan = rolePlanAt("chorus", 3, true, true);
  for (const role of ["drums", "bass", "harmony", "guitar", "lead", "texture"]) {
    assert.equal(typeof plan[role], "number");
    assert.ok(plan[role] >= 0 && plan[role] <= 1);
  }
});

test("pre-switch bars attenuate drums and emphasize texture", () => {
  const normal = rolePlanAt("hook", 2, false, false);
  const preSwitch = rolePlanAt("hook", 2, false, true);

  assert.ok(preSwitch.drums < normal.drums);
  assert.ok(preSwitch.texture >= normal.texture);
});
