import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
} from "geojson";
import type { Country } from "@/data/countries";

type GuideSurface = "main" | "inset";

type SmallCountryGuide = {
  anchorCoord: [number, number];
  circleCoord?: [number, number];
  radiusPx?: number;
  leaderEndCoord?: [number, number];
  showBeforeGuess?: boolean;
  surfaces?: GuideSurface[];
};

type GuideCircleProperties = {
  iso_a3: string;
  radiusPx: number;
};

type GuideLineProperties = {
  iso_a3: string;
};

export const smallCountryGuides: Record<string, SmallCountryGuide> = {
  AND: { anchorCoord: [1.52, 42.5], leaderEndCoord: [-2.8, 43.6], radiusPx: 7 },
  LIE: { anchorCoord: [9.55, 47.16], leaderEndCoord: [5.5, 47.8], radiusPx: 7 },
  MCO: { anchorCoord: [7.42, 43.73], leaderEndCoord: [10.2, 44.4], radiusPx: 7 },
  SMR: { anchorCoord: [12.45, 43.94], leaderEndCoord: [15.8, 44.8], radiusPx: 7 },
  VAT: { anchorCoord: [12.45, 41.9], leaderEndCoord: [15.8, 41.4], radiusPx: 7 },
  MLT: { anchorCoord: [14.38, 35.94], leaderEndCoord: [17.7, 35.1], radiusPx: 7 },

  CPV: { anchorCoord: [-23.6, 15.1], leaderEndCoord: [-19, 17], radiusPx: 8 },
  COM: { anchorCoord: [43.3, -11.9], leaderEndCoord: [47, -8.5], radiusPx: 8 },
  GMB: { anchorCoord: [-15.3, 13.4], leaderEndCoord: [-19, 13.2], radiusPx: 6 },
  LSO: { anchorCoord: [28.2, -29.6], leaderEndCoord: [25, -31.8], radiusPx: 7 },
  MUS: { anchorCoord: [57.55, -20.3], leaderEndCoord: [61, -20], radiusPx: 8 },
  STP: { anchorCoord: [6.61, 0.2], leaderEndCoord: [2, 1.5], radiusPx: 8 },
  SWZ: { anchorCoord: [31.5, -26.5], leaderEndCoord: [34, -26.3], radiusPx: 7 },
  SYC: { anchorCoord: [55.45, -4.6], leaderEndCoord: [59, -2], radiusPx: 9 },

  BHR: { anchorCoord: [50.55, 26.07], leaderEndCoord: [54.2, 27.4], radiusPx: 7 },
  BRN: { anchorCoord: [114.72, 4.5], leaderEndCoord: [118, 6.1], radiusPx: 8 },
  KWT: { anchorCoord: [47.5, 29.3], leaderEndCoord: [51, 30.6], radiusPx: 7 },
  LBN: { anchorCoord: [35.86, 33.85], leaderEndCoord: [31.8, 34.5], radiusPx: 7 },
  MDV: { anchorCoord: [73.2, 3.2], leaderEndCoord: [68.4, 1], radiusPx: 9 },
  PSE: { anchorCoord: [35.2, 31.9], leaderEndCoord: [39, 31.8], radiusPx: 7 },
  QAT: { anchorCoord: [51.2, 25.3], leaderEndCoord: [54, 24.6], radiusPx: 7 },
  SGP: { anchorCoord: [103.82, 1.35], leaderEndCoord: [108, 2.4], radiusPx: 7 },

  FJI: { anchorCoord: [178.1, -17.8], leaderEndCoord: [181, -18.2], radiusPx: 9 },
  FSM: { anchorCoord: [158.2, 6.9], leaderEndCoord: [154, 8], radiusPx: 9 },
  KIR: { anchorCoord: [187, 1.8], leaderEndCoord: [205, 3], radiusPx: 10 },
  MHL: { anchorCoord: [171.2, 7.1], leaderEndCoord: [168, 9.4], radiusPx: 9 },
  NRU: { anchorCoord: [166.93, -0.52], leaderEndCoord: [165, 0.6], radiusPx: 7 },
  PLW: { anchorCoord: [134.58, 7.5], leaderEndCoord: [130, 9], radiusPx: 8 },
  SLB: { anchorCoord: [160.2, -9.6], leaderEndCoord: [156, -9], radiusPx: 9 },
  TON: { anchorCoord: [184.8, -21.2], leaderEndCoord: [191, -21], radiusPx: 8 },
  TUV: { anchorCoord: [178.7, -7.1], leaderEndCoord: [184, -6.5], radiusPx: 8 },
  VUT: { anchorCoord: [167.7, -16.2], leaderEndCoord: [172, -17], radiusPx: 9 },
  WSM: { anchorCoord: [187.9, -13.76], leaderEndCoord: [190, -13], radiusPx: 8 },
};

const emptyCircleCollection = {
  type: "FeatureCollection",
  features: [],
} satisfies FeatureCollection<Point, GuideCircleProperties>;

const emptyLineCollection = {
  type: "FeatureCollection",
  features: [],
} satisfies FeatureCollection<LineString, GuideLineProperties>;

const wrapOceaniaCoord = (country: Country, coord: [number, number]) =>
  country.continentQuizGroups.includes("oceania") && coord[0] < 0
    ? ([coord[0] + 360, coord[1]] as [number, number])
    : coord;

export const buildSmallCountryGuideCollections = (
  countries: Country[],
  countryIds: string[],
  surface: GuideSurface,
) => {
  const countryIdSet = new Set(countryIds);
  const circleFeatures: Feature<Point, GuideCircleProperties>[] = [];
  const lineFeatures: Feature<LineString, GuideLineProperties>[] = [];

  countries
    .filter((country) => countryIdSet.has(country.iso_a3))
    .forEach((country) => {
      const guide = smallCountryGuides[country.iso_a3];

      if (!guide || guide.showBeforeGuess === false) {
        return;
      }

      if (guide.surfaces && !guide.surfaces.includes(surface)) {
        return;
      }

      const anchorCoord = wrapOceaniaCoord(country, guide.anchorCoord);
      const circleCoord = wrapOceaniaCoord(
        country,
        guide.circleCoord ?? guide.anchorCoord,
      );

      circleFeatures.push({
        type: "Feature",
        properties: {
          iso_a3: country.iso_a3,
          radiusPx: guide.radiusPx ?? 7,
        },
        geometry: {
          type: "Point",
          coordinates: circleCoord,
        },
      });

      if (guide.leaderEndCoord) {
        lineFeatures.push({
          type: "Feature",
          properties: { iso_a3: country.iso_a3 },
          geometry: {
            type: "LineString",
            coordinates: [
              anchorCoord,
              wrapOceaniaCoord(country, guide.leaderEndCoord),
            ],
          },
        });
      }
    });

  return {
    circles: {
      ...emptyCircleCollection,
      features: circleFeatures,
    },
    leaders: {
      ...emptyLineCollection,
      features: lineFeatures,
    },
  };
};
