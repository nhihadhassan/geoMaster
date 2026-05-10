import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
} from "geojson";
import type { Country } from "@/data/countries";

type TextAnchor = "center" | "left" | "right" | "top" | "bottom";
type LabelSize = "small" | "normal" | "large";

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
};

export type LabelProperties = {
  iso_a3: string;
  name: string;
  label: string;
  textAnchor: TextAnchor;
  labelSize: LabelSize;
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
};

const emptyLabelCollection = {
  type: "FeatureCollection",
  features: [],
} satisfies FeatureCollection<Point, LabelProperties>;

const emptyLeaderCollection = {
  type: "FeatureCollection",
  features: [],
} satisfies FeatureCollection<LineString, LeaderProperties>;

export const buildLabelCollections = (
  countries: Country[],
  countryIds: string[],
  surface: LabelSurface,
  options: { hideMainInsetLabels?: boolean } = {},
) => {
  const countryIdSet = new Set(countryIds);
  const labelFeatures: Feature<Point, LabelProperties>[] = [];
  const leaderFeatures: Feature<LineString, LeaderProperties>[] = [];

  countries
    .filter((country) => countryIdSet.has(country.iso_a3))
    .forEach((country) => {
      const placement =
        labelPlacements[country.iso_a3]?.[surface] ??
        labelPlacements[country.iso_a3]?.main;

      if (
        !placement ||
        (surface === "main" &&
          options.hideMainInsetLabels &&
          placement.hideOnMainWhenInset)
      ) {
        return;
      }

      labelFeatures.push({
        type: "Feature",
        properties: {
          iso_a3: country.iso_a3,
          name: country.name,
          label: placement.label ?? country.name,
          textAnchor: placement.textAnchor ?? "center",
          labelSize: placement.labelSize ?? "normal",
        },
        geometry: {
          type: "Point",
          coordinates: placement.labelCoord,
        },
      });

      if (placement.leaderAnchorCoord) {
        leaderFeatures.push({
          type: "Feature",
          properties: {
            iso_a3: country.iso_a3,
          },
          geometry: {
            type: "LineString",
            coordinates: [placement.leaderAnchorCoord, placement.labelCoord],
          },
        });
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
