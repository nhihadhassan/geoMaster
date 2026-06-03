"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { CountryEducationCard } from "@/components/game/CountryEducationCard";
import {
  getParentCountryName,
  type LearningFeature,
} from "@/data/learningFeatures";
import { useOverlayFocus } from "@/hooks/useOverlayFocus";
import { formatPopulation } from "@/utils/countryEducation";

type LearningModeCardProps = {
  feature: LearningFeature;
  onClose: () => void;
};

const labelForFeature = (feature: LearningFeature) => {
  if (feature.kind === "country") {
    return "Country";
  }

  if (feature.kind === "subdivision") {
    const typeLabel =
      feature.feature.type === "district"
        ? "District"
        : feature.feature.type.charAt(0).toUpperCase() +
          feature.feature.type.slice(1);

    return typeLabel;
  }

  if (feature.kind === "city") {
    return "City";
  }

  if (feature.kind === "physical") {
    return feature.feature.type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return feature.feature.type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const nameForFeature = (feature: LearningFeature) =>
  feature.kind === "country" ? feature.country.name : feature.feature.name;

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) =>
  value ? (
    <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
      <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/58">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-white/84">{value}</dd>
    </div>
  ) : null;

export function LearningModeCard({ feature, onClose }: LearningModeCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const isCountry = feature.kind === "country";
  const name = nameForFeature(feature);
  const label = labelForFeature(feature);
  const parentCountry =
    feature.kind === "subdivision"
      ? getParentCountryName(feature.feature.countryIsoA3)
      : feature.kind === "city"
        ? `${feature.feature.subdivision}, ${getParentCountryName(feature.feature.countryIsoA3) ?? "Canada"}`
        : feature.kind === "landmark"
          ? [
              feature.feature.city,
              feature.feature.subdivision,
              getParentCountryName(feature.feature.countryIsoA3),
            ]
              .filter(Boolean)
              .join(", ")
          : undefined;

  useOverlayFocus(true, cardRef, onClose);

  return (
    <motion.aside
      ref={cardRef}
      key={`${feature.kind}-${name}`}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute inset-x-2 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 mx-auto max-h-[70dvh] overflow-y-auto rounded-3xl border border-white/14 bg-zinc-950/74 p-4 text-white shadow-xl shadow-black/34 backdrop-blur-2xl md:inset-x-auto md:bottom-auto md:right-5 md:top-28 md:w-[22rem] md:max-h-[min(66vh,34rem)]"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} ${label.toLowerCase()} profile`}
    >
      <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-3 flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/86 px-4 py-3 backdrop-blur-2xl md:static md:-mx-0 md:-mt-0 md:border-b-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-sky-100/68">
            Learning Mode
          </p>
          <p className="mt-1 text-sm text-white/64">{label} profile</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/8 text-lg leading-none text-white/70 transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200/70"
          aria-label="Close learning card"
        >
          ×
        </button>
      </div>
      {isCountry ? (
        <CountryEducationCard country={feature.country} variant="review" />
      ) : (
        <article className="rounded-3xl border border-white/12 bg-white/8 p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="inline-flex rounded-full border border-sky-100/18 bg-sky-300/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-100/72">
                {label}
              </p>
              <h3 className="mt-3 text-xl font-semibold leading-tight">
                {name}
              </h3>
              {parentCountry ? (
                <p className="mt-1 text-sm text-white/56">{parentCountry}</p>
              ) : null}
            </div>
          </div>

          {feature.kind === "subdivision" || feature.kind === "city" ? (
            <>
              {feature.kind === "city" ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/8 px-3 py-3">
                  <p className="text-sm leading-5 text-white/74">
                    {feature.feature.education.description}
                  </p>
                </div>
              ) : null}
              <dl className="mt-4 grid grid-cols-2 gap-2">
                {feature.kind === "subdivision" ? (
                  <DetailRow
                    label="Capital"
                    value={feature.feature.education?.capital}
                  />
                ) : null}
                <DetailRow
                  label="Population"
                  value={formatPopulation(
                    feature.feature.education?.population ?? null,
                  )}
                />
              </dl>
              {feature.feature.education?.funFact ? (
                <div className="mt-4 rounded-2xl border border-emerald-100/14 bg-emerald-300/8 px-3 py-3">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-emerald-100/58">
                    Did you know?
                  </p>
                  <p className="mt-1 text-sm leading-5 text-white/72">
                    {feature.feature.education.funFact}
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {feature.kind === "landmark" ? (
                feature.feature.image ? (
                  <figure className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={feature.feature.image.src}
                      alt={feature.feature.image.alt}
                      className="h-36 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    {feature.feature.image.credit ? (
                      <figcaption className="border-t border-white/10 px-3 py-2 text-[0.65rem] leading-4 text-white/58">
                        {feature.feature.image.credit}
                        {feature.feature.image.license
                          ? ` · ${feature.feature.image.license}`
                          : ""}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : (
                  <div className="mt-4 grid h-32 place-items-center rounded-2xl border border-dashed border-white/14 bg-gradient-to-br from-sky-300/12 via-white/6 to-emerald-300/10 px-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/58">
                      Landmark image coming soon
                    </p>
                  </div>
                )
              ) : null}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/8 px-3 py-3">
                <p className="text-sm leading-5 text-white/74">
                  {feature.feature.education.description}
                </p>
                {feature.feature.education.funFact ? (
                  <p className="mt-3 text-sm leading-5 text-emerald-100/76">
                    {feature.feature.education.funFact}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </article>
      )}
    </motion.aside>
  );
}
