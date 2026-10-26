"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useOverlayFocus } from "@/hooks/useOverlayFocus";

export function PauseOverlay() {
  const resumeQuiz = useGameStore((state) => state.resumeQuiz);
  const resetQuiz = useGameStore((state) => state.resetQuiz);
  const giveUp = useGameStore((state) => state.giveUp);
  const backToRegionSelect = useGameStore((state) => state.backToRegionSelect);
  const hasProgress = useGameStore((state) => state.score > 0 || Object.keys(state.countryResults).length > 0);
  const [confirmation, setConfirmation] = useState<"restart" | "discard" | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const dismiss = useCallback(() => {
    if (confirmation) setConfirmation(null);
    else resumeQuiz();
  }, [confirmation, resumeQuiz]);
  useOverlayFocus(true, rootRef, dismiss);

  return (
    <motion.div className="atlas-pause-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18 }}>
      <motion.section ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="pause-dialog-title" tabIndex={-1}
        className="atlas-pause-sheet" initial={{ y: reducedMotion ? 0 : 18 }} animate={{ y: 0 }} exit={{ y: reducedMotion ? 0 : 10 }}>
        <h2 id="pause-dialog-title">{confirmation === "restart" ? "Restart this quiz?" : confirmation === "discard" ? "Discard this quiz?" : "Take your time."}</h2>
        <p>{confirmation ? "Your current quiz progress will be lost." : "Your quiz is saved here. The clock is paused."}</p>
        {confirmation ? (
          <div className="atlas-pause-actions">
            <button className="atlas-primary" onClick={() => setConfirmation(null)}>Keep Playing</button>
            <button className="atlas-danger" onClick={confirmation === "restart" ? resetQuiz : backToRegionSelect}>
              {confirmation === "restart" ? "Restart quiz" : "Discard & Exit"}
            </button>
          </div>
        ) : (
          <div className="atlas-pause-actions">
            <button className="atlas-primary" onClick={resumeQuiz}>Resume quiz</button>
            <button className="atlas-action-row" onClick={giveUp}>Finish & review <span aria-hidden="true">›</span></button>
            <button className="atlas-action-row" onClick={() => hasProgress ? setConfirmation("restart") : resetQuiz()}>Restart this quiz <span aria-hidden="true">›</span></button>
            <button className="atlas-danger" onClick={() => setConfirmation("discard")}>Discard quiz</button>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
