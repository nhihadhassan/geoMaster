"use client";

import { motion, useReducedMotion } from "framer-motion";

type PerfectRunCelebrationProps = {
  sequence: number;
};

const burstParticles = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2;
  const distance = 96 + (index % 4) * 18;

  return {
    id: index,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    delay: (index % 6) * 0.035,
    size: 5 + (index % 3) * 2,
    color: ["#34d399", "#bae6fd", "#fef3c7", "#a7f3d0"][index % 4],
  };
});

export function PerfectRunCelebration({
  sequence,
}: PerfectRunCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={sequence}
      aria-live="polite"
      className="pointer-events-none absolute inset-0 z-40 grid place-items-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: prefersReducedMotion ? 3.2 : 4.8, times: [0, 0.08, 0.82, 1] }}
    >
      {!prefersReducedMotion ? (
        <div className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2">
          {burstParticles.map((particle) => (
            <motion.span
              key={particle.id}
              className={`absolute rounded-full shadow-[0_0_18px_rgba(255,255,255,0.35)] ${
                particle.id >= 12 ? "hidden sm:block" : ""
              }`}
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
              animate={{
                x: particle.x,
                y: particle.y,
                opacity: [0, 1, 0],
                scale: [0.6, 1, 0.75],
              }}
              transition={{
                duration: 1.45,
                delay: particle.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </div>
      ) : null}

      <motion.section
        className="relative overflow-hidden rounded-[2rem] border border-emerald-100/28 bg-black/58 px-7 py-5 text-center text-white shadow-2xl shadow-emerald-950/42 backdrop-blur-3xl"
        initial={{ y: prefersReducedMotion ? 0 : 18, scale: prefersReducedMotion ? 1 : 0.95 }}
        animate={{
          y: 0,
          scale: 1,
          boxShadow: prefersReducedMotion
            ? "0 24px 80px rgba(6,78,59,0.28)"
            : [
                "0 24px 80px rgba(6,78,59,0.18)",
                "0 28px 110px rgba(16,185,129,0.36)",
                "0 24px 80px rgba(6,78,59,0.18)",
              ],
        }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent" />
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-emerald-100/76">
          Perfect Run
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Flawless geography.
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-5 text-white/66">
          Every country completed without a miss or assisted answer.
        </p>
      </motion.section>
    </motion.div>
  );
}
