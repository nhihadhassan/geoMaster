"use client";

// Occasional atlas note shown while the user idles in explore mode.
// Extracted verbatim from MapContainer.tsx.
import { motion } from "framer-motion";

export function IdlePromptToast({ prompt }: { prompt: string }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute inset-x-3 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-sm rounded-2xl border border-white/12 bg-zinc-950/54 px-4 py-3 text-sm font-medium leading-5 text-white/72 shadow-lg shadow-black/24 backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-5 sm:max-w-xs"
      aria-live="polite"
    >
      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-emerald-100/54">
        Atlas note
      </span>
      <span className="mt-1 block">{prompt}</span>
    </motion.aside>
  );
}
