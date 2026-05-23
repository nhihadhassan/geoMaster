"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import type { Country } from "@/data/countries";
import { getCountryStory } from "@/data/countryStories";
import {
  formatCountryEducation,
  formatGDP,
  formatLanguages,
  formatPopulation,
} from "@/utils/countryEducation";
import { getCountryFlagDisplay } from "@/utils/countryFlags";

type CountryEducationCardProps = {
  country: Country;
  variant?: "popup" | "review";
};

type IconName = "capital" | "language" | "gdp" | "population";

const regionLabels: Record<string, string> = {
  "north-america": "North America",
  "south-america": "South America",
  europe: "Europe",
  asia: "Asia",
  africa: "Africa",
  oceania: "Oceania",
};

function FactIcon({ name }: { name: IconName }) {
  const commonProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "capital") {
    return (
      <svg {...commonProps}>
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    );
  }

  if (name === "language") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12S9.8 18.6 12 21" />
      </svg>
    );
  }

  if (name === "gdp") {
    return (
      <svg {...commonProps}>
        <path d="M5 19V9M12 19V5M19 19v-7" />
        <path d="M3 19h18" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
      <circle cx="12" cy="9" r="3" />
      <path d="M22 19c0-1.9-1.3-3.4-3-3.9M19 7.5a2.5 2.5 0 0 1-1.3 4.6M2 19c0-1.9 1.3-3.4 3-3.9M5 7.5a2.5 2.5 0 0 0 1.3 4.6" />
    </svg>
  );
}

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
  const regionLabel =
    country.continentQuizGroups
      .map((region) => regionLabels[region])
      .filter(Boolean)
      .join(" + ") || country.continentQuizGroup;
  const countryRows = [
    {
      icon: "capital" as const,
      label: "Capital",
      value: country.capital,
    },
    {
      icon: "language" as const,
      label: country.education.languages.length > 1 ? "Languages" : "Language",
      value: formatLanguages(country.education.languages),
    },
    {
      icon: "gdp" as const,
      label: "GDP (Nominal)",
      value: formatGDP(country.education.gdpUsd),
    },
    {
      icon: "population" as const,
      label: "Population",
      value: formatPopulation(country.education.population),
    },
  ].filter((row): row is { icon: IconName; label: string; value: string } =>
    Boolean(row.value),
  );

  const storySection = story ? (
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
  ) : null;

  if (education.featuredImage) {
    return (
      <article
        className={
          isPopup
            ? "text-white"
            : "rounded-3xl border border-cyan-100/16 bg-slate-950/55 p-4 text-white shadow-[0_24px_80px_rgba(8,18,32,0.38)]"
        }
      >
        {!isPopup ? (
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-white/18 bg-white/10 text-3xl shadow-[0_0_32px_rgba(125,211,252,0.16)]">
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
              <h3 className="truncate text-2xl font-semibold leading-7 tracking-[-0.01em]">
                {country.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-cyan-50/54">
                {regionLabel}
              </p>
            </div>
          </div>
        ) : null}

        <div
          className={
            isPopup
              ? "grid gap-3"
              : "mt-5 grid gap-4 border-t border-white/12 pt-4"
          }
        >
          <dl className="min-w-0 divide-y divide-white/10">
            {countryRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 py-2.5"
              >
                <dt className="flex items-center pt-0.5 text-cyan-100/66">
                  <FactIcon name={row.icon} />
                </dt>
                <dd className="min-w-0 text-sm font-medium leading-5 text-white/58">
                  {row.label}
                </dd>
                <dd className="col-start-2 mt-1 min-w-0 text-base font-semibold leading-5 text-white/88">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <figure className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-cyan-100/18 bg-white/8">
            <img
              src={education.featuredImage.src}
              alt={education.featuredImage.alt}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            {education.featuredImage.credit ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-slate-950/58 px-2 py-1 text-[0.55rem] font-medium text-white/52">
                {education.featuredImage.credit}
              </figcaption>
            ) : null}
          </figure>
        </div>

        <div
          className={
            isPopup
              ? "mt-3 border-t border-white/12 pt-3"
              : "mt-4 border-t border-white/12 pt-4"
          }
        >
          <p className="text-sm leading-6 text-white/72">
            {education.featuredFunFact}
          </p>
        </div>

        {!isPopup && quickFacts.length > 0 ? (
          <section className="mt-3 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3">
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

        {storySection}
      </article>
    );
  }

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

      {storySection}
    </article>
  );
}
