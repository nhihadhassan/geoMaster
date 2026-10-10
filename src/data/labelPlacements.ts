import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
} from "geojson";
import type { Country } from "@/data/countries";

type TextAnchor = "center" | "left" | "right" | "top" | "bottom";
type LabelSize = "small" | "normal" | "large";
type PlacementKind = "manual" | "fallback";
export type LearningLabelMode = "major" | "standard" | "small" | "callout";

type LabelSurface = "main" | "inset";

type Placement = {
  label?: string;
  labelCoord: [number, number];
  leaderAnchorCoord?: [number, number];
  textAnchor?: TextAnchor;
  labelSize?: LabelSize;
  hideOnMainWhenInset?: boolean;
};

export type LabelPlacement = {
  main?: Placement;
  inset?: Placement;
  results?: Placement;
};

export type LabelProperties = {
  iso_a3: string;
  name: string;
  label: string;
  textAnchor: TextAnchor;
  labelSize: LabelSize;
  placementKind: PlacementKind;
  labelPriority?: 1 | 2 | 3 | 4;
  learningMinZoom?: number;
  learningLabelMode?: LearningLabelMode;
};

export type LeaderProperties = {
  iso_a3: string;
};

export const labelPlacements: Record<string, LabelPlacement> = {
  ARG: { main: { labelCoord: [-64.6, -37.4] } },
  BOL: { main: { labelCoord: [-64.7, -16.9] } },
  BRA: { main: { labelCoord: [-53.8, -12.8] } },
  CHL: {
    main: {
      labelCoord: [-74.2, -30.4],
      leaderAnchorCoord: [-71.2, -30.4],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  COL: { main: { labelCoord: [-74.7, 4.6], textAnchor: "right" } },
  ECU: {
    main: {
      labelCoord: [-82.8, -1.2],
      leaderAnchorCoord: [-78.6, -1.4],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  GUY: {
    main: {
      labelCoord: [-61.9, 7.1],
      leaderAnchorCoord: [-58.9, 5.1],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  PRY: { main: { labelCoord: [-58.3, -23.5] } },
  PER: { main: { labelCoord: [-75.4, -9.8] } },
  SUR: {
    main: {
      labelCoord: [-52.3, 6.6],
      leaderAnchorCoord: [-55.8, 4.1],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  URY: {
    main: {
      labelCoord: [-53.0, -34.2],
      leaderAnchorCoord: [-56.1, -32.5],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  VEN: { main: { labelCoord: [-66.2, 8.3], labelSize: "normal" } },
  ATG: {
    main: {
      label: "Antigua",
      labelCoord: [-64.6, 18.5],
      leaderAnchorCoord: [-61.8, 17.1],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "Antigua &\nBarbuda",
      labelCoord: [-77.6, 23.1],
      leaderAnchorCoord: [-61.8, 17.1],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  BHS: {
    main: { labelCoord: [-75.3, 24.6], labelSize: "small" },
    inset: { labelCoord: [-77.4, 25.3], labelSize: "small" },
  },
  BRB: {
    main: {
      label: "Barbados",
      labelCoord: [-62.6, 14.2],
      leaderAnchorCoord: [-59.55, 13.2],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "Barbados",
      labelCoord: [-61.9, 15.1],
      leaderAnchorCoord: [-59.55, 13.2],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  BLZ: {
    main: {
      labelCoord: [-91.4, 17.7],
      leaderAnchorCoord: [-88.7, 17.3],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  CAN: { main: { labelCoord: [-101.5, 57.2], labelSize: "large" } },
  CRI: {
    main: {
      label: "Costa Rica",
      labelCoord: [-84.2, 7.3],
      leaderAnchorCoord: [-84.3, 9.8],
      textAnchor: "top",
      labelSize: "small",
    },
  },
  CUB: {
    main: { labelCoord: [-79.5, 21.7], labelSize: "normal" },
    inset: { labelCoord: [-79.5, 21.8], labelSize: "small" },
  },
  DMA: {
    main: {
      label: "Dominica",
      labelCoord: [-66.4, 15.7],
      leaderAnchorCoord: [-61.37, 15.42],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "Dominica",
      labelCoord: [-66.6, 18.7],
      leaderAnchorCoord: [-61.37, 15.42],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  DOM: {
    main: {
      label: "Dominican\nRepublic",
      labelCoord: [-69.3, 20.1],
      labelSize: "small",
    },
    inset: {
      label: "Dominican\nRepublic",
      labelCoord: [-69.0, 20.4],
      labelSize: "small",
    },
  },
  SLV: {
    main: {
      label: "El Salvador",
      labelCoord: [-91.2, 12.6],
      leaderAnchorCoord: [-88.9, 13.7],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  GRD: {
    main: {
      label: "Grenada",
      labelCoord: [-64.2, 12.6],
      leaderAnchorCoord: [-61.68, 12.12],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "Grenada",
      labelCoord: [-76.8, 12.2],
      leaderAnchorCoord: [-61.68, 12.12],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  GTM: {
    main: {
      labelCoord: [-91.8, 15.6],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  HTI: {
    main: { labelCoord: [-73.6, 18.7], labelSize: "small" },
    inset: { labelCoord: [-73.8, 18.5], labelSize: "small" },
  },
  HND: {
    main: {
      labelCoord: [-84.8, 15.7],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  JAM: {
    main: { labelCoord: [-77.6, 17.3], labelSize: "small" },
    inset: { labelCoord: [-78.4, 17.1], labelSize: "small" },
  },
  MEX: { main: { labelCoord: [-102.8, 23.0], labelSize: "large" } },
  NIC: {
    main: {
      labelCoord: [-84.2, 12.4],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  PAN: {
    main: {
      labelCoord: [-78.2, 7.4],
      leaderAnchorCoord: [-80.5, 8.9],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  KNA: {
    main: {
      label: "St Kitts",
      labelCoord: [-65.2, 17.5],
      leaderAnchorCoord: [-62.78, 17.36],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "St Kitts\n& Nevis",
      labelCoord: [-79.6, 19.2],
      leaderAnchorCoord: [-62.78, 17.36],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  LCA: {
    main: {
      label: "St Lucia",
      labelCoord: [-64.3, 14.1],
      leaderAnchorCoord: [-60.98, 13.91],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "St Lucia",
      labelCoord: [-78.4, 15.3],
      leaderAnchorCoord: [-60.98, 13.91],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  VCT: {
    main: {
      label: "St Vincent",
      labelCoord: [-64.4, 13.2],
      leaderAnchorCoord: [-61.29, 12.98],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "St Vincent\n& Grenadines",
      labelCoord: [-65.0, 13.7],
      leaderAnchorCoord: [-61.29, 12.98],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  TTO: {
    main: {
      label: "Trinidad",
      labelCoord: [-63.8, 10.8],
      leaderAnchorCoord: [-61.22, 10.69],
      textAnchor: "right",
      labelSize: "small",
      hideOnMainWhenInset: true,
    },
    inset: {
      label: "Trinidad\n& Tobago",
      labelCoord: [-64.2, 10.5],
      leaderAnchorCoord: [-61.22, 10.69],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  USA: {
    main: {
      label: "United States",
      labelCoord: [-98.5, 39.5],
      labelSize: "large",
    },
  },
  AND: {
    main: {
      labelCoord: [-2.8, 43.6],
      leaderAnchorCoord: [1.52, 42.51],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  LIE: {
    main: {
      labelCoord: [5.5, 47.8],
      leaderAnchorCoord: [9.56, 47.17],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  MCO: {
    main: {
      labelCoord: [10.2, 44.4],
      leaderAnchorCoord: [7.42, 43.73],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  SMR: {
    main: {
      labelCoord: [15.8, 44.8],
      leaderAnchorCoord: [12.46, 43.94],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  VAT: {
    main: {
      labelCoord: [16.4, 41.4],
      leaderAnchorCoord: [12.45, 41.9],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  MLT: {
    main: {
      labelCoord: [17.7, 35.1],
      leaderAnchorCoord: [14.38, 35.94],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  RUS: { main: { labelCoord: [39.0, 56.0], labelSize: "large" } },
  BHR: {
    main: {
      labelCoord: [54.2, 27.4],
      leaderAnchorCoord: [50.55, 26.07],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  BRN: {
    main: {
      labelCoord: [118.0, 6.1],
      leaderAnchorCoord: [114.73, 4.54],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  ISR: {
    main: {
      labelCoord: [31.7, 31.5],
      leaderAnchorCoord: [34.85, 31.05],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  KWT: {
    main: {
      labelCoord: [51.0, 30.6],
      leaderAnchorCoord: [47.48, 29.31],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  LBN: {
    main: {
      labelCoord: [31.8, 34.5],
      leaderAnchorCoord: [35.86, 33.85],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  MDV: {
    main: {
      labelCoord: [68.4, 1.0],
      leaderAnchorCoord: [73.22, 3.2],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  PSE: {
    main: {
      labelCoord: [39.0, 31.8],
      leaderAnchorCoord: [35.23, 31.95],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  QAT: {
    main: {
      labelCoord: [54.0, 24.6],
      leaderAnchorCoord: [51.18, 25.35],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  SGP: {
    main: {
      labelCoord: [108.0, 2.4],
      leaderAnchorCoord: [103.82, 1.35],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  CPV: {
    main: {
      label: "Cabo Verde",
      labelCoord: [-19.0, 17.0],
      leaderAnchorCoord: [-23.6, 15.1],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  COM: {
    main: {
      labelCoord: [47.0, -8.5],
      leaderAnchorCoord: [43.33, -11.65],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  GMB: {
    main: {
      label: "Gambia",
      labelCoord: [-19.0, 13.2],
      leaderAnchorCoord: [-15.31, 13.44],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  LSO: {
    main: {
      labelCoord: [25.0, -31.8],
      leaderAnchorCoord: [28.23, -29.61],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  MUS: {
    main: {
      labelCoord: [61.0, -20.0],
      leaderAnchorCoord: [57.55, -20.35],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  STP: {
    main: {
      label: "Sao Tome",
      labelCoord: [2.0, 1.5],
      leaderAnchorCoord: [6.61, 0.19],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  SWZ: {
    main: {
      labelCoord: [34.0, -26.3],
      leaderAnchorCoord: [31.47, -26.52],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  SYC: {
    main: {
      labelCoord: [59.0, -2.0],
      leaderAnchorCoord: [55.45, -4.68],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  KIR: {
    main: {
      labelCoord: [205.0, 3.0],
      leaderAnchorCoord: [202.8, 1.8],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  MHL: {
    main: {
      labelCoord: [168.0, 9.4],
      leaderAnchorCoord: [171.18, 7.13],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  FSM: {
    main: {
      labelCoord: [154.0, 8.0],
      leaderAnchorCoord: [158.22, 6.89],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  NRU: {
    main: {
      labelCoord: [165.0, 0.6],
      leaderAnchorCoord: [166.93, -0.52],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  PLW: {
    main: {
      labelCoord: [130.0, 9.0],
      leaderAnchorCoord: [134.58, 7.5],
      textAnchor: "right",
      labelSize: "small",
    },
  },
  WSM: {
    main: {
      labelCoord: [190.0, -13.0],
      leaderAnchorCoord: [187.9, -13.76],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  TON: {
    main: {
      labelCoord: [191.0, -21.0],
      leaderAnchorCoord: [184.8, -21.18],
      textAnchor: "left",
      labelSize: "small",
    },
  },
  TUV: {
    main: {
      labelCoord: [184.0, -6.5],
      leaderAnchorCoord: [179.2, -8.5],
      textAnchor: "left",
      labelSize: "small",
    },
  },
};

// The end-of-quiz Europe view uses a dedicated callout layout. The dense
// central states keep their authoritative anchors while their labels sit in
// nearby open water, where Mapbox can show every selected-region name.
const resultsLabelPlacements: Record<string, Placement> = {
  GBR: { labelCoord: [-13, 61], leaderAnchorCoord: [-2, 54], textAnchor: "right", labelSize: "small" },
  ESP: { labelCoord: [-16, 45], leaderAnchorCoord: [-3.5, 40], textAnchor: "right", labelSize: "small" },
  FRA: { labelCoord: [-9, 52], leaderAnchorCoord: [2, 46], textAnchor: "right", labelSize: "small" },
  AND: { labelCoord: [-14, 39], leaderAnchorCoord: [1.5, 42.5], textAnchor: "right", labelSize: "small" },
  BEL: { labelCoord: [-2, 56], leaderAnchorCoord: [4, 50.83], textAnchor: "right", labelSize: "small" },
  CYP: { labelCoord: [38, 36], leaderAnchorCoord: [33, 35], textAnchor: "left", labelSize: "small" },
  DNK: { labelCoord: [7, 62], leaderAnchorCoord: [10, 56], textAnchor: "right", labelSize: "small" },
  NLD: { labelCoord: [-1, 60], leaderAnchorCoord: [5.75, 52.5], textAnchor: "right", labelSize: "small" },
  LUX: { labelCoord: [-1, 47], leaderAnchorCoord: [6.17, 49.75], textAnchor: "right", labelSize: "small" },
  CHE: { labelCoord: [-4, 44], leaderAnchorCoord: [8, 47], textAnchor: "right", labelSize: "small" },
  LIE: { labelCoord: [14, 45], leaderAnchorCoord: [9.53, 47.27], textAnchor: "left", labelSize: "small" },
  AUT: { labelCoord: [18, 52], leaderAnchorCoord: [13.33, 47.33], textAnchor: "left", labelSize: "small" },
  CZE: { labelCoord: [7, 52], leaderAnchorCoord: [15.5, 49.75], textAnchor: "right", labelSize: "small" },
  SVK: { labelCoord: [26, 55], leaderAnchorCoord: [19.5, 48.67], textAnchor: "left", labelSize: "small" },
  SVN: { labelCoord: [6, 47], leaderAnchorCoord: [14.82, 46.12], textAnchor: "right", labelSize: "small" },
  HRV: { labelCoord: [4, 45], leaderAnchorCoord: [15.5, 45.17], textAnchor: "right", labelSize: "small" },
  BIH: { labelCoord: [10, 44], leaderAnchorCoord: [18, 44], textAnchor: "right", labelSize: "small" },
  ITA: { labelCoord: [0, 40], leaderAnchorCoord: [12.83, 42.83], textAnchor: "right", labelSize: "small" },
  MCO: { labelCoord: [16, 48], leaderAnchorCoord: [7.4, 43.73], textAnchor: "left", labelSize: "small" },
  SMR: { labelCoord: [17, 46], leaderAnchorCoord: [12.42, 43.77], textAnchor: "left", labelSize: "small" },
  VAT: { labelCoord: [18, 39], leaderAnchorCoord: [12.45, 41.9], textAnchor: "left", labelSize: "small" },
  HUN: { labelCoord: [26, 51], leaderAnchorCoord: [20, 47], textAnchor: "left", labelSize: "small" },
  POL: { labelCoord: [17, 57], leaderAnchorCoord: [20, 52], textAnchor: "left", labelSize: "small" },
  SRB: { labelCoord: [27, 42], leaderAnchorCoord: [21, 44], textAnchor: "left", labelSize: "small" },
  KOS: { labelCoord: [16, 40], leaderAnchorCoord: [20.9, 42.6], textAnchor: "right", labelSize: "small" },
  MNE: { labelCoord: [14, 42], leaderAnchorCoord: [19.3, 42.5], textAnchor: "right", labelSize: "small" },
  MKD: { labelCoord: [24, 38], leaderAnchorCoord: [22, 41.83], textAnchor: "left", labelSize: "small" },
  ALB: { labelCoord: [10, 38], leaderAnchorCoord: [20, 41], textAnchor: "right", labelSize: "small" },
  GRC: { labelCoord: [27, 36], leaderAnchorCoord: [22, 39], textAnchor: "left", labelSize: "small" },
  PRT: { labelCoord: [-16, 35], leaderAnchorCoord: [-8, 39.5], textAnchor: "right", labelSize: "small" },
  ROU: { labelCoord: [36, 52], leaderAnchorCoord: [25, 46], textAnchor: "left", labelSize: "small" },
  MDA: { labelCoord: [40, 46], leaderAnchorCoord: [29, 47], textAnchor: "left", labelSize: "small" },
  LVA: { labelCoord: [34, 63], leaderAnchorCoord: [24.6, 56.9], textAnchor: "left", labelSize: "small" },
  LTU: { labelCoord: [34, 58], leaderAnchorCoord: [24, 56], textAnchor: "left", labelSize: "small" },
  EST: { labelCoord: [34, 68], leaderAnchorCoord: [26, 59], textAnchor: "left", labelSize: "small" },
};

const emptyLabelCollection = {
  type: "FeatureCollection",
  features: [],
} satisfies FeatureCollection<Point, LabelProperties>;

const emptyLeaderCollection = {
  type: "FeatureCollection",
  features: [],
} satisfies FeatureCollection<LineString, LeaderProperties>;

const majorLearningLabelIds = new Set([
  "ARG",
  "AUS",
  "BRA",
  "CAN",
  "CHL",
  "CHN",
  "COD",
  "COL",
  "DZA",
  "EGY",
  "FRA",
  "GBR",
  "DEU",
  "IDN",
  "IND",
  "IRN",
  "JPN",
  "KAZ",
  "MEX",
  "NGA",
  "PER",
  "RUS",
  "SAU",
  "TUR",
  "USA",
  "ZAF",
]);

const denseLearningLabelIds = new Set([
  "ALB",
  "AND",
  "AUT",
  "BEL",
  "BIH",
  "BHR",
  "BLZ",
  "BRB",
  "CHE",
  "CRI",
  "CYP",
  "CZE",
  "DNK",
  "DOM",
  "ECU",
  "GTM",
  "HND",
  "HTI",
  "IRL",
  "ISR",
  "JAM",
  "JOR",
  "KNA",
  "KWT",
  "LBN",
  "LIE",
  "LUX",
  "MCO",
  "MLT",
  "MNE",
  "NLD",
  "NIC",
  "PAN",
  "PSE",
  "QAT",
  "SMR",
  "SLV",
  "SVK",
  "SVN",
  "VAT",
]);

const getLearningLabelProfile = (
  country: Country,
  placement: Placement | undefined,
) => {
  const hasCallout = Boolean(placement?.leaderAnchorCoord);

  if (majorLearningLabelIds.has(country.iso_a3)) {
    return {
      labelPriority: 1 as const,
      learningMinZoom: 1.45,
      learningLabelMode: "major" as const,
    };
  }

  if (
    country.isSmall ||
    hasCallout ||
    placement?.labelSize === "small" ||
    denseLearningLabelIds.has(country.iso_a3)
  ) {
    return {
      labelPriority: 4 as const,
      learningMinZoom: 4.15,
      learningLabelMode: "callout" as const,
    };
  }

  if (
    country.education.population !== null &&
    country.education.population >= 50_000_000
  ) {
    return {
      labelPriority: 2 as const,
      learningMinZoom: 2.35,
      learningLabelMode: "standard" as const,
    };
  }

  return {
    labelPriority: 3 as const,
    learningMinZoom: country.continentQuizGroups.includes("europe") ? 3.15 : 2.75,
    learningLabelMode: "small" as const,
  };
};

const buildLabelFeature = (
  country: Country,
  placement: Placement | undefined,
  learningProfile?: ReturnType<typeof getLearningLabelProfile>,
): {
  labelFeature: Feature<Point, LabelProperties>;
  leaderFeature: Feature<LineString, LeaderProperties> | null;
} => {
  const fallbackLng =
    country.continentQuizGroups.includes("oceania") && country.center.lng < 0
      ? country.center.lng + 360
      : country.center.lng;
  const fallbackPlacement: Placement = {
    labelCoord: [fallbackLng, country.center.lat],
    labelSize: country.isSmall ? "small" : "normal",
  };
  const resolvedPlacement = placement ?? fallbackPlacement;
  const placementKind: PlacementKind = placement ? "manual" : "fallback";

  const labelFeature: Feature<Point, LabelProperties> = {
    type: "Feature",
    properties: {
      iso_a3: country.iso_a3,
      name: country.name,
      label: resolvedPlacement.label ?? country.name,
      textAnchor: resolvedPlacement.textAnchor ?? "center",
      labelSize: resolvedPlacement.labelSize ?? "normal",
      placementKind,
      ...(learningProfile ?? {}),
    },
    geometry: {
      type: "Point",
      coordinates: resolvedPlacement.labelCoord,
    },
  };

  const leaderFeature = resolvedPlacement.leaderAnchorCoord
    ? {
        type: "Feature" as const,
        properties: {
          iso_a3: country.iso_a3,
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            resolvedPlacement.leaderAnchorCoord,
            resolvedPlacement.labelCoord,
          ],
        },
      }
    : null;

  return {
    labelFeature,
    leaderFeature,
  };
};

export const buildLabelCollections = (
  countries: Country[],
  countryIds: string[],
  surface: LabelSurface,
  options: { hideMainInsetLabels?: boolean; results?: boolean } = {},
) => {
  const countryIdSet = new Set(countryIds);
  const labelFeatures: Feature<Point, LabelProperties>[] = [];
  const leaderFeatures: Feature<LineString, LeaderProperties>[] = [];

  countries
    .filter((country) => countryIdSet.has(country.iso_a3))
    .forEach((country) => {
      const placement =
        (options.results && resultsLabelPlacements[country.iso_a3]) ||
        (options.results && labelPlacements[country.iso_a3]?.results) ||
        labelPlacements[country.iso_a3]?.[surface] ||
        labelPlacements[country.iso_a3]?.main;

      if (
        (surface === "main" &&
          options.hideMainInsetLabels &&
          placement?.hideOnMainWhenInset)
      ) {
        return;
      }

      const { labelFeature, leaderFeature } = buildLabelFeature(
        country,
        placement,
      );

      labelFeatures.push(labelFeature);

      if (leaderFeature) {
        leaderFeatures.push(leaderFeature);
      }
    });

  return {
    labels: {
      ...emptyLabelCollection,
      features: labelFeatures,
    },
    leaders: {
      ...emptyLeaderCollection,
      features: leaderFeatures,
    },
  };
};

export const buildLearningLabelCollections = (
  countries: Country[],
  zoom: number,
  surface: LabelSurface,
  options: { hideMainInsetLabels?: boolean } = {},
) => {
  const labelFeatures: Feature<Point, LabelProperties>[] = [];
  const leaderFeatures: Feature<LineString, LeaderProperties>[] = [];

  countries.forEach((country) => {
    const placement =
      labelPlacements[country.iso_a3]?.[surface] ??
      labelPlacements[country.iso_a3]?.main;

    if (
      surface === "main" &&
      options.hideMainInsetLabels &&
      placement?.hideOnMainWhenInset
    ) {
      return;
    }

    const learningProfile = getLearningLabelProfile(country, placement);

    if (zoom < learningProfile.learningMinZoom) {
      return;
    }

    const { labelFeature, leaderFeature } = buildLabelFeature(
      country,
      placement,
      learningProfile,
    );

    labelFeatures.push(labelFeature);

    if (leaderFeature && zoom >= 4.15) {
      leaderFeatures.push(leaderFeature);
    }
  });

  return {
    labels: {
      ...emptyLabelCollection,
      features: labelFeatures,
    },
    leaders: {
      ...emptyLeaderCollection,
      features: leaderFeatures,
    },
  };
};
