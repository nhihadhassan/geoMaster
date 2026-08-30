import assert from "node:assert/strict";
import {
  deriveVisualViewportState,
  KEYBOARD_ACTIVITY_THRESHOLD,
} from "../src/utils/visualViewport.ts";

const base = {
  layoutWidth: 390,
  layoutHeight: 844,
  visualWidth: 390,
  visualHeight: 844,
  offsetTop: 0,
  offsetLeft: 0,
  scale: 1,
  focusedTextInput: true,
  baselineHeight: 844,
};

assert.equal(deriveVisualViewportState({ ...base, focusedTextInput: false }).keyboardActive, false);
assert.equal(
  deriveVisualViewportState({ ...base, visualHeight: 430 }).keyboardActive,
  true,
);
assert.equal(
  deriveVisualViewportState({
    ...base,
    layoutHeight: 430,
    visualHeight: 430,
  }).usableHeight,
  430,
);
assert.deepEqual(
  deriveVisualViewportState({ ...base, visualHeight: 430, offsetTop: 18 }).offsetTop,
  18,
);
assert.equal(
  deriveVisualViewportState({
    ...base,
    visualHeight: base.visualHeight - KEYBOARD_ACTIVITY_THRESHOLD,
  }).keyboardActive,
  false,
);
assert.equal(
  deriveVisualViewportState({ ...base, visualHeight: 430, scale: 1.2 }).keyboardActive,
  false,
);
assert.equal(
  deriveVisualViewportState({
    ...base,
    layoutWidth: 844,
    layoutHeight: 390,
    visualWidth: 844,
    visualHeight: 390,
    baselineHeight: 390,
  }).isLandscape,
  true,
);

console.log("visual viewport calculations passed");
