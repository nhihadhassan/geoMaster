import { useEffect, useState } from "react";

// How many pixels of the layout viewport are currently covered by the on-screen
// keyboard. Uses the visualViewport API (works on iOS Safari and Android Chrome)
// and returns 0 when there is no keyboard, on desktop, or during SSR. A small
// threshold keeps address-bar / gesture-bar fluctuations from registering as a
// keyboard.
const KEYBOARD_INSET_THRESHOLD = 100;

const readKeyboardInset = () => {
  if (typeof window === "undefined" || !window.visualViewport) {
    return 0;
  }

  const viewport = window.visualViewport;
  const inset = Math.max(
    0,
    window.innerHeight - viewport.height - viewport.offsetTop,
  );

  return inset > KEYBOARD_INSET_THRESHOLD ? inset : 0;
};

export function useKeyboardInset() {
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    const sync = () => setKeyboardInset(readKeyboardInset());

    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);

    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
    };
  }, []);

  return keyboardInset;
}
