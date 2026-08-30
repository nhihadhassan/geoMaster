import { useEffect, useRef, useState } from "react";

export const KEYBOARD_ACTIVITY_THRESHOLD = 100;

export type VisualViewportState = {
  usableWidth: number;
  usableHeight: number;
  offsetTop: number;
  offsetLeft: number;
  scale: number;
  keyboardActive: boolean;
  isLandscape: boolean;
};

export type VisualViewportSnapshot = {
  layoutWidth: number;
  layoutHeight: number;
  visualWidth: number;
  visualHeight: number;
  offsetTop: number;
  offsetLeft: number;
  scale: number;
  focusedTextInput: boolean;
  baselineHeight: number;
};

export const DEFAULT_VISUAL_VIEWPORT_STATE: VisualViewportState = {
  usableWidth: 0,
  usableHeight: 0,
  offsetTop: 0,
  offsetLeft: 0,
  scale: 1,
  keyboardActive: false,
  isLandscape: false,
};

export function isTextEntryElement(element: Element | null) {
  if (
    typeof HTMLTextAreaElement !== "undefined" &&
    element instanceof HTMLTextAreaElement
  ) {
    return true;
  }

  if (
    typeof HTMLInputElement === "undefined" ||
    !(element instanceof HTMLInputElement)
  ) {
    return false;
  }

  return !["button", "checkbox", "file", "hidden", "image", "radio", "range", "reset", "submit"].includes(element.type);
}

export function deriveVisualViewportState(
  snapshot: VisualViewportSnapshot,
): VisualViewportState {
  const scale = snapshot.scale || 1;
  const pinchZoomed = scale > 1.05;
  const visualHeightLoss = Math.max(
    0,
    snapshot.baselineHeight - snapshot.visualHeight - snapshot.offsetTop,
  );
  const layoutHeightLoss = Math.max(
    0,
    snapshot.baselineHeight - snapshot.layoutHeight,
  );
  const keyboardActive =
    snapshot.focusedTextInput &&
    !pinchZoomed &&
    Math.max(visualHeightLoss, layoutHeightLoss) >
      KEYBOARD_ACTIVITY_THRESHOLD;

  return {
    usableWidth: keyboardActive ? snapshot.visualWidth : snapshot.layoutWidth,
    usableHeight: keyboardActive
      ? snapshot.visualHeight
      : snapshot.layoutHeight,
    offsetTop: keyboardActive ? Math.max(0, snapshot.offsetTop) : 0,
    offsetLeft: keyboardActive ? Math.max(0, snapshot.offsetLeft) : 0,
    scale,
    keyboardActive,
    isLandscape:
      (keyboardActive ? snapshot.visualWidth : snapshot.layoutWidth) >
      (keyboardActive ? snapshot.visualHeight : snapshot.layoutHeight),
  };
}

function readLayoutViewport() {
  const layoutWidth = Math.max(
    1,
    window.innerWidth || document.documentElement.clientWidth,
  );
  const layoutHeight = Math.max(
    1,
    window.innerHeight || document.documentElement.clientHeight,
  );
  const viewport = window.visualViewport;

  return {
    layoutWidth,
    layoutHeight,
    visualWidth: Math.max(1, viewport?.width ?? layoutWidth),
    visualHeight: Math.max(1, viewport?.height ?? layoutHeight),
    offsetTop: viewport?.offsetTop ?? 0,
    offsetLeft: viewport?.offsetLeft ?? 0,
    scale: viewport?.scale ?? 1,
  };
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(
    DEFAULT_VISUAL_VIEWPORT_STATE,
  );
  const activeRef = useRef(false);
  const baselineHeightRef = useRef(0);
  const orientationRef = useRef<string | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    let frame: number | null = null;

    const sync = () => {
      frame = null;
      const snapshot = readLayoutViewport();
      const orientation =
        snapshot.layoutWidth > snapshot.layoutHeight ? "landscape" : "portrait";

      if (orientationRef.current && orientationRef.current !== orientation) {
        baselineHeightRef.current = snapshot.layoutHeight;
      }
      orientationRef.current = orientation;

      const focusedTextInput = isTextEntryElement(document.activeElement);
      if (!baselineHeightRef.current || !focusedTextInput) {
        baselineHeightRef.current = snapshot.layoutHeight;
      } else if (!activeRef.current) {
        baselineHeightRef.current = Math.max(
          baselineHeightRef.current,
          snapshot.layoutHeight,
          snapshot.visualHeight + snapshot.offsetTop,
        );
      }

      const nextState = deriveVisualViewportState({
        ...snapshot,
        focusedTextInput,
        baselineHeight: baselineHeightRef.current,
      });
      activeRef.current = nextState.keyboardActive;
      setState(nextState);
    };

    const scheduleSync = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(sync);
      }
    };

    const handleFocus = () => {
      scheduleSync();
    };

    const handleOrientationChange = () => {
      baselineHeightRef.current = 0;
      scheduleSync();
    };

    sync();
    viewport?.addEventListener("resize", scheduleSync);
    viewport?.addEventListener("scroll", scheduleSync);
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("orientationchange", handleOrientationChange);
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleFocus);

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      viewport?.removeEventListener("resize", scheduleSync);
      viewport?.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("orientationchange", handleOrientationChange);
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleFocus);
    };
  }, []);

  return state;
}
