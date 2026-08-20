"use client";

import { motion } from "framer-motion";

type MapControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
};

const controlClass =
  "grid size-11 place-items-center rounded-full border border-white/12 bg-zinc-950/58 text-white/72 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:bg-zinc-950/72 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200/70";

// Deliberately not Mapbox's NavigationControl: this keeps the atlas glass
// language, the 44px touch targets, and the safe-area offsets the rest of the
// floating UI uses.
export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
}: MapControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2 sm:right-5"
    >
      <button
        type="button"
        onClick={onZoomIn}
        className={controlClass}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M10 4v12M4 10h12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className={controlClass}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M4 10h12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onRecenter}
        className={controlClass}
        aria-label="Recenter the map"
        title="Recenter the map"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="5.5" />
          <path d="M10 1.6v2.4M10 16v2.4M1.6 10h2.4M16 10h2.4" />
        </svg>
      </button>
    </motion.div>
  );
}
