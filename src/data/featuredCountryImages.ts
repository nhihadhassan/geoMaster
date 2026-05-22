import type { CountryEducation } from "./countries";

type FeaturedCountryImage = NonNullable<CountryEducation["featuredImage"]>;

export const featuredCountryImages: Record<string, FeaturedCountryImage> = {
  BRA: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Rio_de_Janeiro%2C_Christ_the_Redeemer_%2815744447380%29.jpg?width=480",
    alt: "Christ the Redeemer overlooking Rio de Janeiro, Brazil",
    credit: "Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rio_de_Janeiro,_Christ_the_Redeemer_(15744447380).jpg",
  },
  CAN: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Parliament_Hill%2C_Ottawa_%28DSC04312%29.jpg?width=480",
    alt: "Parliament Hill in Ottawa, Canada",
    credit: "Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Parliament_Hill,_Ottawa_(DSC04312).jpg",
  },
  EGY: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/All_Gizah_Pyramids.jpg?width=480",
    alt: "The pyramids of Giza in Egypt",
    credit: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg",
  },
  FRA: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Eiffel_Tower_by_the_Seine_river%2C_Paris%2C_2_March_2014.jpg?width=480",
    alt: "The Eiffel Tower beside the Seine in Paris, France",
    credit: "Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Eiffel_Tower_by_the_Seine_river,_Paris,_2_March_2014.jpg",
  },
  JPN: {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mt._Fuji_%2814747223668%29.jpg?width=480",
    alt: "Mount Fuji in Japan",
    credit: "Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Mt._Fuji_(14747223668).jpg",
  },
};
