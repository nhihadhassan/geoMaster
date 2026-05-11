"use client";

/* eslint-disable @next/next/no-img-element */

import type { Country } from "@/data/countries";
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
          {education.funFact}
        </p>
      </div>

      {!isPopup && education.sourceYear ? (
        <p className="mt-3 text-[0.68rem] font-medium text-white/36">
          Stats source year: {education.sourceYear}
        </p>
      ) : null}
    </article>
  );
}
