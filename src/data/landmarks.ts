export type LandmarkType =
  | "landmark"
  | "heritage_site"
  | "mountain"
  | "monument"
  | "natural_site";

export type Landmark = {
  id: string;
  name: string;
  type: LandmarkType;
  countryIsoA3?: string;
  center: [number, number];
  zoomMin: number;
  education: {
    description: string;
    funFact?: string;
  };
};

export const landmarks: Landmark[] = [
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    type: "heritage_site",
    countryIsoA3: "PER",
    center: [-72.545, -13.163],
    zoomMin: 4.8,
    education: {
      description:
        "A 15th-century Inca citadel in Peru, located high in the Andes.",
      funFact: "Machu Picchu sits on a mountain ridge above the Urubamba River valley.",
    },
  },
  {
    id: "mount-everest",
    name: "Mount Everest",
    type: "mountain",
    countryIsoA3: "NPL",
    center: [86.925, 27.988],
    zoomMin: 4.8,
    education: {
      description:
        "The highest mountain above sea level, located in the Himalayas on the Nepal-China border.",
      funFact: "Everest is part of the Mahalangur Himal subrange.",
    },
  },
  {
    id: "pyramids-of-giza",
    name: "Pyramids of Giza",
    type: "heritage_site",
    countryIsoA3: "EGY",
    center: [31.134, 29.979],
    zoomMin: 4.8,
    education: {
      description:
        "Ancient pyramid monuments on the Giza Plateau near Cairo, Egypt.",
      funFact: "The Great Pyramid of Giza is the oldest of the Seven Wonders of the Ancient World.",
    },
  },
  {
    id: "great-wall-of-china",
    name: "Great Wall of China",
    type: "heritage_site",
    countryIsoA3: "CHN",
    center: [116.57, 40.43],
    zoomMin: 4.8,
    education: {
      description:
        "A historic system of walls and fortifications across northern China.",
      funFact: "The Great Wall was built and rebuilt across multiple dynasties and regions.",
    },
  },
];
