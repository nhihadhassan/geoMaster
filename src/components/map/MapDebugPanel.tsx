"use client";

// Development-only map inspector. Extracted verbatim from MapContainer.tsx; it
// only renders when NODE_ENV !== "production" and the ?debug flag (or the
// geomaster-debug localStorage key) is set.
import { useGameStore } from "@/store/gameStore";

const formatDebugBoolean = (value: boolean) => (value ? "yes" : "no");

type MapDebugPanelProps = {
  onTestBrazilShade: () => void;
  onClearBrazilShade: () => void;
  onTestCanadaLabel: () => void;
  onTestStLuciaLabel: () => void;
  onClearTestLabels: () => void;
  remainingCount: number;
  pulseActive: boolean;
  pulseReason: string;
  caribbeanInsetMounted: boolean;
  targetHighlightActive: boolean;
  insetTargetHighlightActive: boolean;
  labelCount: number;
  leaderLineCount: number;
  insetLabelSourceLoaded: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
};

export function MapDebugPanel({
  onTestBrazilShade,
  onClearBrazilShade,
  onTestCanadaLabel,
  onTestStLuciaLabel,
  onClearTestLabels,
  remainingCount,
  pulseActive,
  pulseReason,
  caribbeanInsetMounted,
  targetHighlightActive,
  insetTargetHighlightActive,
  labelCount,
  leaderLineCount,
  insetLabelSourceLoaded,
  expanded,
  onToggleExpanded,
}: MapDebugPanelProps) {
  const debug = useGameStore((state) => state.debug);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const capitalHintEnabled = useGameStore(
    (state) => state.capitalHintEnabled,
  );
  const quizCountries = useGameStore((state) => state.quizCountries);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const countryResults = useGameStore((state) => state.countryResults);
  const currentTargetHints = useGameStore((state) => state.currentTargetHints);
  const targetQueue = useGameStore((state) => state.targetQueue);
  const lastMatchedCountry = useGameStore((state) => state.lastMatchedCountry);
  const currentTargetCountry = useGameStore(
    (state) => state.currentTargetCountry,
  );
  const resultEntries = Object.entries(countryResults);
  const assistedIds = resultEntries
    .filter(([, result]) => result.status === "assisted")
    .map(([iso]) => iso);
  const missedIds = resultEntries
    .filter(([, result]) => result.status === "missed")
    .map(([iso]) => iso);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggleExpanded}
        className="absolute left-5 top-36 z-30 rounded-full border border-white/14 bg-black/40 px-3 py-2 text-xs font-semibold text-white/66 shadow-xl shadow-black/30 backdrop-blur-2xl transition hover:bg-black/52 hover:text-white"
      >
        Debug
      </button>
    );
  }

  return (
    <aside className="absolute left-5 top-36 z-20 max-h-80 w-[min(22rem,calc(100vw-2.5rem))] overflow-auto rounded-3xl border border-white/14 bg-black/44 p-4 font-mono text-xs text-white/72 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/44">
          Debug
        </p>
        <button
          type="button"
          onClick={onToggleExpanded}
          className="rounded-full border border-white/12 bg-white/8 px-2 py-1 font-sans text-[0.65rem] font-semibold text-white/62 transition hover:bg-white/14 hover:text-white"
        >
          Hide
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
        <dt>Mapbox loaded</dt>
        <dd>{formatDebugBoolean(debug.mapLoaded)}</dd>
        <dt>Source loaded</dt>
        <dd>{formatDebugBoolean(debug.countrySourceLoaded)}</dd>
        <dt>Features</dt>
        <dd>{debug.countryFeatureCount}</dd>
        <dt>Region count</dt>
        <dd>{quizCountries.length}</dd>
        <dt>Mode</dt>
        <dd>{selectedMode}</dd>
        <dt>Last match</dt>
        <dd>{lastMatchedCountry?.name ?? "none"}</dd>
        <dt>Raw input</dt>
        <dd>{debug.lastRawInput ?? "none"}</dd>
        <dt>Norm input</dt>
        <dd>{debug.lastNormalizedInput ?? "none"}</dd>
        <dt>Matched</dt>
        <dd>
          {debug.lastMatchedIso
            ? `${debug.lastMatchedIso} ${debug.lastMatchedName ?? ""}`
            : "none"}
        </dd>
        <dt>Match method</dt>
        <dd>{debug.lastMatchMethod ?? "none"}</dd>
        <dt>Accepted</dt>
        <dd>
          {debug.lastMatchAccepted === null
            ? "n/a"
            : formatDebugBoolean(debug.lastMatchAccepted)}
        </dd>
        <dt>Popup ISO</dt>
        <dd>{debug.lastPopupIso ?? "none"}</dd>
        <dt>Shaded ISO</dt>
        <dd>{debug.lastShadedIso ?? "none"}</dd>
        <dt>Clicked ISO</dt>
        <dd>{debug.lastClickedIso ?? "none"}</dd>
        <dt>Clicked name</dt>
        <dd>{debug.lastClickedName ?? "none"}</dd>
        <dt>Click source</dt>
        <dd>{debug.lastClickSource ?? "none"}</dd>
        <dt>Target</dt>
        <dd>
          {currentTargetCountry
            ? `${currentTargetCountry.iso_a3} ${currentTargetCountry.name}`
            : "none"}
        </dd>
        <dt>Capital hint</dt>
        <dd>{formatDebugBoolean(capitalHintEnabled)}</dd>
        <dt>Target queue</dt>
        <dd>{targetQueue.length}</dd>
        <dt>Guessed count</dt>
        <dd>{guessedCountryIds.length}</dd>
        <dt>Results</dt>
        <dd>{resultEntries.length}</dd>
        <dt>Assisted</dt>
        <dd>{assistedIds.length}</dd>
        <dt>Missed</dt>
        <dd>{missedIds.length}</dd>
        <dt>Hints</dt>
        <dd>{currentTargetHints.length}</dd>
        <dt>Target highlight</dt>
        <dd>{formatDebugBoolean(targetHighlightActive)}</dd>
        <dt>Inset target</dt>
        <dd>{formatDebugBoolean(insetTargetHighlightActive)}</dd>
        <dt>Projection</dt>
        <dd>{debug.projection}</dd>
        <dt>Sources</dt>
        <dd>{debug.sourceIds.join(", ") || "none"}</dd>
        <dt>Layers</dt>
        <dd>{debug.layerIds.length}</dd>
        <dt>Label source</dt>
        <dd>{formatDebugBoolean(debug.labelSourceLoaded)}</dd>
        <dt>Label layer</dt>
        <dd>{formatDebugBoolean(debug.labelLayerLoaded)}</dd>
        <dt>Leader source</dt>
        <dd>{formatDebugBoolean(debug.leaderSourceLoaded)}</dd>
        <dt>Leader layer</dt>
        <dd>{formatDebugBoolean(debug.leaderLayerLoaded)}</dd>
        <dt>Label features</dt>
        <dd>{debug.labelFeatureCount}</dd>
        <dt>Leader features</dt>
        <dd>{debug.leaderFeatureCount}</dd>
        <dt>Inset label layer</dt>
        <dd>{formatDebugBoolean(debug.insetLabelLayerLoaded)}</dd>
        <dt>Last ISO exists</dt>
        <dd>
          {debug.guessedIsoExists === null
            ? "n/a"
            : formatDebugBoolean(debug.guessedIsoExists)}
        </dd>
        <dt>Last state</dt>
        <dd>
          {debug.lastFeatureStateCall
            ? `${debug.lastFeatureStateCall.id} ${debug.lastFeatureStateCall.ok ? "ok" : "fail"}`
            : "none"}
        </dd>
        <dt>Remaining</dt>
        <dd>{remainingCount}</dd>
        <dt>Pulse active</dt>
        <dd>{formatDebugBoolean(pulseActive)}</dd>
        <dt>Pulse reason</dt>
        <dd>{pulseReason}</dd>
        <dt>Feedback</dt>
        <dd>{lastMatchedCountry?.name ?? "none"}</dd>
        <dt>Caribbean inset</dt>
        <dd>{formatDebugBoolean(caribbeanInsetMounted)}</dd>
        <dt>Labels</dt>
        <dd>{labelCount}</dd>
        <dt>Leader lines</dt>
        <dd>{leaderLineCount}</dd>
        <dt>Inset labels</dt>
        <dd>{formatDebugBoolean(insetLabelSourceLoaded)}</dd>
        <dt>Inset missed</dt>
        <dd>{debug.insetMissedCount}</dd>
        <dt>Toast duration</dt>
        <dd>7s</dd>
      </dl>
      <p className="mt-3 break-words text-white/58">
        Guessed: {guessedCountryIds.join(", ") || "none"}
      </p>
      <p className="mt-2 break-words text-white/58">
        Assisted: {assistedIds.join(", ") || "none"}
      </p>
      <p className="mt-2 break-words text-white/58">
        Missed: {missedIds.join(", ") || "none"}
      </p>
      <p className="mt-2 break-words text-white/58">
        Target hints: {currentTargetHints.join(" | ") || "none"}
      </p>
      {debug.lastFeatureStateCall?.error ? (
        <p className="mt-2 rounded-xl border border-red-300/20 bg-red-950/30 p-2 text-red-100/80">
          {debug.lastFeatureStateCall.error}
        </p>
      ) : null}
      {debug.lastLabelLayerError ? (
        <p className="mt-2 rounded-xl border border-red-300/20 bg-red-950/30 p-2 text-red-100/80">
          {debug.lastLabelLayerError}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2 font-sans">
        <button
          type="button"
          onClick={onTestBrazilShade}
          className="rounded-full border border-emerald-200/24 bg-emerald-300/14 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/22"
        >
          Test BRA shade
        </button>
        <button
          type="button"
          onClick={onClearBrazilShade}
          className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/14"
        >
          Clear test
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 font-sans">
        <button
          type="button"
          onClick={onTestCanadaLabel}
          className="rounded-full border border-sky-200/24 bg-sky-300/14 px-3 py-1.5 text-xs font-semibold text-sky-50 transition hover:bg-sky-300/22"
        >
          Test Canada Label
        </button>
        <button
          type="button"
          onClick={onTestStLuciaLabel}
          className="rounded-full border border-sky-200/24 bg-sky-300/14 px-3 py-1.5 text-xs font-semibold text-sky-50 transition hover:bg-sky-300/22"
        >
          Test St Lucia Label
        </button>
        <button
          type="button"
          onClick={onClearTestLabels}
          className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/14"
        >
          Clear Test Labels
        </button>
      </div>
    </aside>
  );
}
