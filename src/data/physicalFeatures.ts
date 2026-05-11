export type PhysicalFeatureType =
  | "sea"
  | "lake"
  | "river"
  | "mountain_range"
  | "desert"
  | "rainforest";

export type PhysicalFeature = {
  id: string;
  name: string;
  type: PhysicalFeatureType;
  center: [number, number];
  zoomMin: number;
  education: {
    description: string;
    funFact?: string;
  };
};

export const physicalFeatures: PhysicalFeature[] = [
  {
    id: "great-lakes",
    name: "Great Lakes",
    type: "lake",
    center: [-84.8, 45.2],
    zoomMin: 3.2,
    education: {
      description:
        "A connected system of freshwater lakes on the Canada-United States border.",
      funFact: "The Great Lakes contain about one-fifth of the world's surface fresh water.",
    },
  },
  {
    id: "lake-superior",
    name: "Lake Superior",
    type: "lake",
    center: [-87.5, 47.7],
    zoomMin: 4.1,
    education: {
      description:
        "The largest of the Great Lakes by surface area, shared by Canada and the United States.",
      funFact: "Lake Superior is the world's largest freshwater lake by surface area.",
    },
  },
  {
    id: "lake-victoria",
    name: "Lake Victoria",
    type: "lake",
    center: [33.0, -1.0],
    zoomMin: 3.5,
    education: {
      description:
        "A major African lake bordered by Tanzania, Uganda, and Kenya.",
      funFact: "Lake Victoria is Africa's largest lake by area.",
    },
  },
  {
    id: "mediterranean-sea",
    name: "Mediterranean Sea",
    type: "sea",
    center: [18.0, 36.0],
    zoomMin: 2.9,
    education: {
      description:
        "A sea between Europe, North Africa, and Western Asia connected to the Atlantic Ocean.",
      funFact: "The Mediterranean has linked trade and cultures for thousands of years.",
    },
  },
  {
    id: "caribbean-sea",
    name: "Caribbean Sea",
    type: "sea",
    center: [-75.0, 15.5],
    zoomMin: 3.1,
    education: {
      description:
        "A tropical sea bordered by Central America, South America, and the Caribbean islands.",
      funFact: "The Caribbean Sea contains many island arcs formed by tectonic activity.",
    },
  },
  {
    id: "caspian-sea",
    name: "Caspian Sea",
    type: "lake",
    center: [51.0, 42.0],
    zoomMin: 3.2,
    education: {
      description:
        "The world's largest inland body of water, bordered by Europe and Asia.",
      funFact: "Despite its name, the Caspian Sea is an enclosed inland basin.",
    },
  },
  {
    id: "amazon-river",
    name: "Amazon River",
    type: "river",
    center: [-61.0, -3.0],
    zoomMin: 3.4,
    education: {
      description:
        "A vast South American river system flowing through the Amazon Basin.",
      funFact: "The Amazon carries more water than any other river system.",
    },
  },
  {
    id: "nile-river",
    name: "Nile River",
    type: "river",
    center: [31.5, 18.0],
    zoomMin: 3.4,
    education: {
      description:
        "A major river flowing north through northeastern Africa to the Mediterranean Sea.",
      funFact: "The Nile has supported farming and settlement for millennia.",
    },
  },
  {
    id: "sahara-desert",
    name: "Sahara Desert",
    type: "desert",
    center: [13.0, 23.5],
    zoomMin: 2.8,
    education: {
      description:
        "The world's largest hot desert, spanning much of North Africa.",
      funFact: "The Sahara includes dunes, rocky plateaus, mountains, and dry valleys.",
    },
  },
  {
    id: "andes",
    name: "Andes",
    type: "mountain_range",
    center: [-70.0, -18.0],
    zoomMin: 3.0,
    education: {
      description:
        "A long mountain range running along the western edge of South America.",
      funFact: "The Andes are the longest continental mountain range on Earth.",
    },
  },
  {
    id: "alps",
    name: "Alps",
    type: "mountain_range",
    center: [10.5, 46.5],
    zoomMin: 3.8,
    education: {
      description:
        "A major mountain range across south-central Europe.",
      funFact: "The Alps arc across countries including France, Switzerland, Italy, Austria, and Slovenia.",
    },
  },
  {
    id: "himalayas",
    name: "Himalayas",
    type: "mountain_range",
    center: [84.0, 28.0],
    zoomMin: 3.5,
    education: {
      description:
        "A high mountain system across Asia, separating the Tibetan Plateau from the Indian subcontinent.",
      funFact: "The Himalayas include many of the world's highest peaks.",
    },
  },
];
