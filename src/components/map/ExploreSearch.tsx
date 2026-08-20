"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchExplore, type ExploreSearchResult } from "@/utils/exploreSearch";

type ExploreSearchProps = {
  onSelect: (result: ExploreSearchResult) => void;
  /** Compact variant for the mobile explore header. */
  compact?: boolean;
};

export function ExploreSearch({ onSelect, compact = false }: ExploreSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const results = useMemo(() => searchExplore(query), [query]);
  const listboxId = "explore-search-results";

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const choose = (result: ExploreSearchResult | undefined) => {
    if (!result) {
      return;
    }

    onSelect(result);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();

      return;
    }

    if (results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      choose(results[activeIndex]);
    }
  };

  const showResults = open && results.length > 0;

  return (
    <div
      ref={rootRef}
      className={`relative ${compact ? "min-w-0 flex-1" : "w-56"}`}
    >
      <label className="sr-only" htmlFor="explore-search">
        Search countries, cities, and landmarks
      </label>
      <input
        id="explore-search"
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          // A new query means a new result list; highlight its first entry.
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={showResults}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        placeholder="Search the map"
        className={`w-full rounded-full border border-white/12 bg-white/8 px-4 text-white outline-none transition placeholder:text-white/48 focus:border-cyan-200/40 focus:bg-white/14 ${
          compact ? "h-10 text-sm" : "h-11 text-sm"
        }`}
      />
      <AnimatePresence>
        {showResults ? (
          <motion.ul
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-white/12 bg-zinc-950/86 p-1 shadow-xl shadow-black/40 backdrop-blur-2xl"
          >
            {results.map((result, index) => (
              <li key={result.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => choose(result)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${
                    index === activeIndex ? "bg-white/12" : "hover:bg-white/8"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white/88">
                      {result.name}
                    </span>
                    {result.context ? (
                      <span className="block truncate text-xs text-white/52">
                        {result.context}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 rounded-full border border-cyan-100/16 bg-cyan-300/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-cyan-100/70">
                    {result.kindLabel}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
