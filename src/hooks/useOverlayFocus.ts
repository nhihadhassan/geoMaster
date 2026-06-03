"use client";

import { useEffect, type RefObject } from "react";

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isVisible = (element: HTMLElement) =>
  element.getClientRects().length > 0 &&
  window.getComputedStyle(element).visibility !== "hidden";

export function useOverlayFocus(
  active: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const root = rootRef.current;
    const getFocusableElements = () =>
      root
        ? Array.from(
            root.querySelectorAll<HTMLElement>(focusableSelector),
          ).filter(isVisible)
        : [];
    const focusTarget = getFocusableElements()[0];
    const focusTimeoutId = window.setTimeout(() => {
      focusTarget?.focus({ preventScroll: true });
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !root) {
        return;
      }

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus({ preventScroll: true });
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimeoutId);
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previousActiveElement &&
        previousActiveElement.isConnected &&
        previousActiveElement !== document.body
      ) {
        previousActiveElement.focus({ preventScroll: true });
      }
    };
  }, [active, onClose, rootRef]);
}
