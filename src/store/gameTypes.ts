// Shared game-state types. Kept in their own module so persistence helpers can
// reference them without importing the store (and creating an import cycle).
import type { GeoSoundEvent } from "@/utils/soundEffects";
import type { Country } from "@/data/countries";

export type GameStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "gave-up";

export type GameMode =
  | "type-to-fill"
  | "identify-shaded"
  | "click-country"
  | "capital-challenge";

export type CountryResultStatus = "correct" | "assisted" | "missed";

export type CountryResult = {
  status: CountryResultStatus;
  attemptsUsed: number;
};

export type IdentifyGuessResult = {
  outcome: "correct" | "assisted" | "wrong" | "missed" | "ignored";
  country?: Country;
  clickedCountry?: Country | null;
};

export type TypeGuessOutcome =
  | "accepted"
  | "duplicate"
  | "out-of-quiz"
  | "no-match"
  | "ignored";

export type HintReveal = {
  countryId: string;
  text: string;
  level: number;
};

export type QuizFeedbackEvent = {
  kind: GeoSoundEvent;
  sequence: number;
  countryId?: string;
  completed?: boolean;
  perfect?: boolean;
};
