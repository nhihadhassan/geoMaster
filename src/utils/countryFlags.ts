import type { Country } from "@/data/countries";

const emojiFromFlagCode = (code: string | undefined) => {
  if (!code || !/^[a-z]{2}$/i.test(code)) {
    return null;
  }

  return code
    .toUpperCase()
    .split("")
    .map((letter) =>
      String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65),
    )
    .join("");
};

export const getCountryFlagDisplay = (country: Country) => ({
  src: country.flag || null,
  fallback: country.flagEmoji || emojiFromFlagCode(country.flagCode) || "◇",
});
