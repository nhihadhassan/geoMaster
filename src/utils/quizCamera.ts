import type { PaddingOptions } from "mapbox-gl";

const MOBILE_FRAME_PADDING = {
  top: 76,
  right: 24,
  bottom: 142,
  left: 24,
} as const;
const DESKTOP_QUIZ_FRAME_PADDING = {
  top: 112,
  right: 96,
  bottom: 148,
  left: 96,
} as const;
const DESKTOP_IDLE_FRAME_PADDING = {
  top: 118,
  right: 240,
  bottom: 154,
  left: 240,
} as const;
const MINIMUM_MAP_HEIGHT = 156;

export function getQuizFramePadding({
  width,
  height,
  running,
}: {
  width: number;
  height: number;
  running: boolean;
}): PaddingOptions {
  const mobile = width < 768;
  const base = mobile
    ? MOBILE_FRAME_PADDING
    : running
      ? DESKTOP_QUIZ_FRAME_PADDING
      : DESKTOP_IDLE_FRAME_PADDING;

  if (!mobile) {
    return { ...base };
  }

  const availablePadding = Math.max(0, height - MINIMUM_MAP_HEIGHT);
  const baseVerticalPadding = base.top + base.bottom;
  const scale = Math.min(1, availablePadding / baseVerticalPadding);

  return {
    top: Math.round(base.top * scale),
    right: base.right,
    bottom: Math.round(base.bottom * scale),
    left: base.left,
  };
}
