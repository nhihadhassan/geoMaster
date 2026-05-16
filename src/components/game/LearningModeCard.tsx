"use client";

import { motion } from "framer-motion";
import { CountryEducationCard } from "@/components/game/CountryEducationCard";
import {
  getParentCountryName,
  type LearningFeature,
} from "@/data/learningFeatures";
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

const DetailRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
      <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/42">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-white/84">{value}</dd>
    </div>
  ) : null;

export function LearningModeCard({ feature, onClose }: LearningModeCardProps) {
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

  return (
    <motion.aside
      key={`${feature.kind}-${name}`}
      initial={{ opacity: 0, x: 28, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 18, y: 8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute inset-x-4 bottom-28 z-30 mx-auto max-h-[min(66vh,34rem)] overflow-y-auto rounded-3xl border border-white/14 bg-black/58 p-4 text-white shadow-2xl shadow-black/42 backdrop-blur-3xl md:inset-x-auto md:bottom-auto md:right-5 md:top-28 md:w-[22rem]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-sky-100/56">
            Learning Mode
          </p>
          <p className="mt-1 text-sm text-white/52">{label} profile</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-white/12 bg-white/8 text-lg leading-none text-white/64 transition hover:bg-white/14 hover:text-white"
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
                      <figcaption className="border-t border-white/10 px-3 py-2 text-[0.65rem] leading-4 text-white/46">
                        {feature.feature.image.credit}
                        {feature.feature.image.license ? ` · ${feature.feature.image.license}` : ""}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : (
                  <div className="mt-4 grid h-32 place-items-center rounded-2xl border border-dashed border-white/14 bg-gradient-to-br from-sky-300/12 via-white/6 to-emerald-300/10 px-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/44">
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
