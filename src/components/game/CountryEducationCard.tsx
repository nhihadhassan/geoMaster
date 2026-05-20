"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import type { Country } from "@/data/countries";
import { getCountryStory } from "@/data/countryStories";
import { formatCountryEducation } from "@/utils/countryEducation";
import { getCountryFlagDisplay } from "@/utils/countryFlags";

type CountryEducationCardProps = {
  country: Country;
  variant?: "popup" | "review";
};

export function CountryEducationCard({
  country,
  variant = "review",
}: CountryEducationCardProps) {
  const education = formatCountryEducation(country);
  const isPopup = variant === "popup";
  const flag = getCountryFlagDisplay(country);
  const story = getCountryStory(country.iso_a3);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const storyParagraphs = useMemo(
    () =>
      story?.story
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean) ?? [],
    [story],
  );
  const visibleStoryParagraphs =
    storyExpanded || isPopup ? storyParagraphs : storyParagraphs.slice(0, 1);
  const quickFacts = education.funFacts.slice(1, 4);

  return (
    <article
      className={
        isPopup
          ? "text-white"
          : "rounded-3xl border border-white/12 bg-white/8 p-4 text-white"
      }
    >
      {!isPopup ? (
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 text-2xl">
            {flag.src ? (
              <img
                src={flag.src}
                alt={`${country.name} flag`}
                className="col-start-1 row-start-1 z-10 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <span className="col-start-1 row-start-1" aria-hidden="true">
              {flag.fallback}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{country.name}</h3>
            <p className="text-sm text-white/58">Capital: {country.capital}</p>
          </div>
        </div>
      ) : null}

      <dl
        className={
          isPopup
            ? "mt-3 grid grid-cols-2 gap-2"
            : "mt-4 grid grid-cols-2 gap-2"
        }
      >
        {education.stats.slice(0, isPopup ? 3 : undefined).map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2"
          >
            <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/42">
              {row.label}
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-white/84">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div
        className={
          isPopup
            ? "mt-3 rounded-2xl border border-emerald-100/14 bg-emerald-300/8 px-3 py-2"
            : "mt-4 rounded-2xl border border-emerald-100/14 bg-emerald-300/8 px-3 py-3"
        }
      >
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-emerald-100/58">
          Did you know?
        </p>
        <p className="mt-1 text-sm leading-5 text-white/72">
          {education.featuredFunFact}
        </p>
      </div>

      {!isPopup && quickFacts.length > 0 ? (
        <section className="mt-3 rounded-2xl border border-white/10 bg-white/7 px-3 py-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/42">
            Quick facts
          </p>
          <ul className="mt-2 space-y-2">
            {quickFacts.map((fact) => (
              <li
                key={fact}
                className="rounded-xl border border-white/8 bg-white/[0.055] px-3 py-2 text-sm leading-5 text-white/66"
              >
                {fact}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isPopup && education.sourceYear ? (
        <p className="mt-3 text-[0.68rem] font-medium text-white/36">
          Stats source year: {education.sourceYear}
        </p>
      ) : null}

      {story ? (
        <section
          className={
            isPopup
              ? "mt-3 rounded-2xl border border-sky-100/14 bg-sky-300/8 px-3 py-2"
              : "mt-4 rounded-2xl border border-sky-100/14 bg-sky-300/8 px-3 py-3"
          }
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-sky-100/58">
                Country Story
              </p>
              {story.title ? (
                <h4 className="mt-1 text-sm font-semibold leading-5 text-white/86">
                  {story.title}
                </h4>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setStoryExpanded((expanded) => !expanded)}
              className="shrink-0 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/64 transition hover:bg-white/14 hover:text-white"
            >
              {storyExpanded ? "Hide" : isPopup ? "Read" : "Read more"}
            </button>
          </div>

          {isPopup && !storyExpanded ? null : (
            <div className="mt-3 space-y-3">
              {visibleStoryParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-white/72">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </article>
  );
}
