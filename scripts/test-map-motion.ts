// Guards the map motion curves. The original highlight looked like it was
// strobing because a ~1.75s sine was sampled every 120ms - only ~14 steps per
// cycle, with jumps of ~0.21 between them. These checks pin the properties
// that fix stops it regressing.
import { assert, assertEqual, runTests, test } from "./test-harness.ts";

const {
  breathe,
  easeOutCubic,
  smoothstep,
  mix,
  REMAINING_BREATH_PERIOD_MS,
  TARGET_BREATH_PERIOD_MS,
} = await import("../src/components/map/mapMotion.ts");

const FRAME_MS = 1000 / 60;

const maxStepPerFrame = (periodMs: number) => {
  let maxStep = 0;
  let previous = breathe(0, periodMs);

  for (let t = FRAME_MS; t <= periodMs * 2; t += FRAME_MS) {
    const value = breathe(t, periodMs);

    maxStep = Math.max(maxStep, Math.abs(value - previous));
    previous = value;
  }

  return maxStep;
};

test("the breath moves imperceptibly between frames", () => {
  // The old interval sampling jumped ~0.21 per step. Anything approaching that
  // reads as a flash rather than a breath.
  assert(
    maxStepPerFrame(TARGET_BREATH_PERIOD_MS) < 0.03,
    `target breath steps too far per frame: ${maxStepPerFrame(TARGET_BREATH_PERIOD_MS)}`,
  );
  assert(
    maxStepPerFrame(REMAINING_BREATH_PERIOD_MS) < 0.03,
    `remaining breath steps too far per frame: ${maxStepPerFrame(REMAINING_BREATH_PERIOD_MS)}`,
  );
});

test("the breath is continuous across the cycle boundary", () => {
  const period = TARGET_BREATH_PERIOD_MS;
  const beforeWrap = breathe(period - FRAME_MS, period);
  const afterWrap = breathe(period + FRAME_MS, period);

  // A seam here would show up as a visible hitch once per cycle.
  assert(
    Math.abs(afterWrap - beforeWrap) < 0.03,
    `discontinuity at the wrap: ${beforeWrap} -> ${afterWrap}`,
  );
});

test("the breath still spans its full range", () => {
  const period = TARGET_BREATH_PERIOD_MS;
  let low = 1;
  let high = 0;

  for (let t = 0; t <= period; t += FRAME_MS) {
    const value = breathe(t, period);

    low = Math.min(low, value);
    high = Math.max(high, value);
  }

  // Calmer must not mean invisible.
  assert(low < 0.02, `breath never reaches its floor: ${low}`);
  assert(high > 0.98, `breath never reaches its peak: ${high}`);
});

test("the target breathes slower than it used to, and slower still in the background", () => {
  // The old sine had a ~1759ms period; both breaths should now be calmer, and
  // the ambient remaining-country pulse slower than the focused target.
  assert(TARGET_BREATH_PERIOD_MS > 1759, "target breath should be slower than before");
  assert(
    REMAINING_BREATH_PERIOD_MS > TARGET_BREATH_PERIOD_MS,
    "the ambient pulse should sit behind the target, not compete with it",
  );
});

test("the easing curves are well formed", () => {
  assertEqual(smoothstep(0), 0, "smoothstep starts at 0");
  assertEqual(smoothstep(1), 1, "smoothstep ends at 1");
  assertEqual(easeOutCubic(0), 0, "easeOutCubic starts at 0");
  assertEqual(easeOutCubic(1), 1, "easeOutCubic ends at 1");
  // Clamped, so a late frame past the end cannot overshoot into a flash.
  assertEqual(easeOutCubic(1.4), 1, "easeOutCubic clamps above 1");
  assertEqual(smoothstep(-0.3), 0, "smoothstep clamps below 0");

  let previous = -1;

  for (let t = 0; t <= 1; t += 0.05) {
    const value = easeOutCubic(t);

    assert(value >= previous, "easeOutCubic must be monotonic");
    previous = value;
  }
});

test("mix maps a curve onto a paint range", () => {
  assertEqual(mix(0.26, 0.46, 0), 0.26, "start of range");
  assertEqual(mix(0.26, 0.46, 1), 0.46, "end of range");
  assert(Math.abs(mix(0, 1, 0.5) - 0.5) < 1e-9, "midpoint");
});

await runTests("Map motion checks");
