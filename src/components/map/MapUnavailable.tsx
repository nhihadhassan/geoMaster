"use client";

// Shown when Mapbox or WebGL cannot render. Deliberately styled as an atlas
// panel rather than an error page, and it never covers the whole screen: the
// HUD, quiz setup, and results stay usable underneath.
type MapUnavailableProps = {
  detail?: string | null;
  onRetry?: () => void;
};

export function MapUnavailable({ detail, onRetry }: MapUnavailableProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-[#05080c] px-5">
      <section className="pointer-events-auto w-[min(30rem,calc(100vw-2rem))] rounded-3xl border border-white/12 bg-zinc-950/76 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/62">
          Map unavailable
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          This device can&apos;t render the atlas right now.
        </h2>
        <p className="mt-2 text-sm leading-5 text-white/64">
          The map needs WebGL. Quiz setup, typed answers, hints, and your results
          still work — only the globe is missing.
        </p>
        {detail ? (
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 font-mono text-xs leading-4 text-white/56">
            {detail}
          </p>
        ) : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 min-h-11 w-full rounded-full border border-cyan-100/24 bg-cyan-300/14 px-4 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/22"
          >
            Try loading the map again
          </button>
        ) : null}
      </section>
    </div>
  );
}
