export type LandmarkType =
  | "landmark"
  | "heritage_site"
  | "mountain"
  | "monument"
  | "natural_site"
  | "museum"
  | "tower"
  | "park"
  | "station"
  | "historic_site";

export type Landmark = {
  id: string;
  name: string;
  type: LandmarkType;
  countryIsoA3?: string;
  subdivision?: string;
  city?: string;
  center: [number, number];
  zoomMin: number;
  education: {
    description: string;
    funFact?: string;
  };
  image?: {
    src: string;
    alt: string;
    credit?: string;
    sourceUrl?: string;
    license?: string;
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
  {
    id: "cn-tower",
    name: "CN Tower",
    type: "tower",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3871, 43.6426],
    zoomMin: 9.5,
    education: {
      description:
        "A communications and observation tower beside Toronto's downtown waterfront.",
      funFact: "The CN Tower is one of Toronto's most recognizable skyline landmarks.",
    },
  },
  {
    id: "royal-ontario-museum",
    name: "Royal Ontario Museum",
    type: "museum",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3948, 43.6677],
    zoomMin: 10.4,
    education: {
      description:
        "A major museum of art, culture, and natural history in downtown Toronto.",
      funFact: "The museum's modern crystal entrance sits beside its historic stone facade.",
    },
  },
  {
    id: "casa-loma",
    name: "Casa Loma",
    type: "historic_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.4094, 43.678],
    zoomMin: 10.6,
    education: {
      description:
        "A Gothic Revival-style mansion and garden north of downtown Toronto.",
      funFact: "Casa Loma is often used as a filming location.",
    },
  },
  {
    id: "nathan-phillips-square",
    name: "Nathan Phillips Square",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3839, 43.6525],
    zoomMin: 10.8,
    education: {
      description:
        "Toronto's civic square in front of City Hall.",
      funFact: "Its reflecting pool becomes a public skating rink in winter.",
    },
  },
  {
    id: "toronto-city-hall",
    name: "Toronto City Hall",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.384, 43.6534],
    zoomMin: 11,
    education: {
      description:
        "Toronto's modernist city hall complex beside Nathan Phillips Square.",
      funFact: "Its twin curved towers are a distinctive part of Toronto's civic architecture.",
    },
  },
  {
    id: "rogers-centre",
    name: "Rogers Centre",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3891, 43.6414],
    zoomMin: 10.8,
    education: {
      description:
        "A domed stadium near the CN Tower and Toronto waterfront.",
      funFact: "It was one of the first stadiums with a fully retractable motorized roof.",
    },
  },
  {
    id: "scotiabank-arena",
    name: "Scotiabank Arena",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3791, 43.6435],
    zoomMin: 10.8,
    education: {
      description:
        "A downtown Toronto arena beside Union Station.",
      funFact: "It hosts major basketball, hockey, and concert events.",
    },
  },
  {
    id: "ripleys-aquarium-canada",
    name: "Ripley's Aquarium of Canada",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3867, 43.6424],
    zoomMin: 10.8,
    education: {
      description:
        "A large public aquarium beside the CN Tower.",
      funFact: "Its underwater tunnel gives visitors a close view of marine life overhead.",
    },
  },
  {
    id: "st-lawrence-market",
    name: "St. Lawrence Market",
    type: "historic_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3715, 43.6487],
    zoomMin: 10.8,
    education: {
      description:
        "A historic public market in Toronto's Old Town.",
      funFact: "The market area has been a food and civic gathering place for generations.",
    },
  },
  {
    id: "distillery-district",
    name: "Distillery District",
    type: "historic_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3597, 43.6503],
    zoomMin: 10.8,
    education: {
      description:
        "A pedestrian district of preserved Victorian industrial buildings.",
      funFact: "Its brick lanes now host galleries, shops, restaurants, and seasonal events.",
    },
  },
  {
    id: "university-of-toronto",
    name: "University of Toronto",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3957, 43.6629],
    zoomMin: 10.6,
    education: {
      description:
        "A major research university with a historic downtown campus.",
      funFact: "The St. George campus sits near Queen's Park and the Royal Ontario Museum.",
    },
  },
  {
    id: "high-park",
    name: "High Park",
    type: "park",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.4637, 43.6465],
    zoomMin: 10.4,
    education: {
      description:
        "A large urban park in Toronto's west end.",
      funFact: "High Park is known for trails, gardens, and spring cherry blossoms.",
    },
  },
  {
    id: "toronto-islands",
    name: "Toronto Islands",
    type: "natural_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3786, 43.6221],
    zoomMin: 10.2,
    education: {
      description:
        "A chain of small islands just offshore from downtown Toronto.",
      funFact: "The islands offer one of the best skyline views of Toronto.",
    },
  },
  {
    id: "harbourfront-centre",
    name: "Harbourfront Centre",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3815, 43.6389],
    zoomMin: 10.8,
    education: {
      description:
        "A cultural venue and public waterfront area on Lake Ontario.",
      funFact: "Harbourfront is part of Toronto's central waterfront promenade.",
    },
  },
  {
    id: "art-gallery-of-ontario",
    name: "Art Gallery of Ontario",
    type: "museum",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3925, 43.6536],
    zoomMin: 10.8,
    education: {
      description:
        "A major art museum in downtown Toronto.",
      funFact: "Architect Frank Gehry redesigned major parts of the gallery building.",
    },
  },
  {
    id: "ontario-place",
    name: "Ontario Place",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.4142, 43.6282],
    zoomMin: 10.6,
    education: {
      description:
        "A waterfront site on artificial islands along Lake Ontario.",
      funFact: "Ontario Place opened as a public showcase and recreation site in the 1970s.",
    },
  },
  {
    id: "exhibition-place",
    name: "Exhibition Place",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.4177, 43.6332],
    zoomMin: 10.6,
    education: {
      description:
        "A large event and exhibition district west of downtown Toronto.",
      funFact: "It is home to the Canadian National Exhibition grounds.",
    },
  },
  {
    id: "union-station-toronto",
    name: "Union Station",
    type: "station",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Toronto",
    center: [-79.3806, 43.6452],
    zoomMin: 10.8,
    education: {
      description:
        "Toronto's central rail station and a major regional transit hub.",
      funFact: "Union Station is one of Canada's busiest transportation hubs.",
    },
  },
  {
    id: "parliament-hill",
    name: "Parliament Hill",
    type: "historic_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Ottawa",
    center: [-75.6993, 45.4248],
    zoomMin: 8,
    education: {
      description:
        "The seat of Canada's federal Parliament in Ottawa.",
      funFact: "Parliament Hill overlooks the Ottawa River.",
    },
  },
  {
    id: "niagara-falls",
    name: "Niagara Falls",
    type: "natural_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Niagara Falls",
    center: [-79.0742, 43.0962],
    zoomMin: 7,
    education: {
      description:
        "A group of powerful waterfalls on the Canada-United States border.",
      funFact: "Horseshoe Falls carries most of the Niagara River's flow.",
    },
  },
  {
    id: "rideau-canal",
    name: "Rideau Canal",
    type: "heritage_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Ottawa",
    center: [-75.6933, 45.4215],
    zoomMin: 8,
    education: {
      description:
        "A historic canal system connecting Ottawa and Lake Ontario.",
      funFact: "In winter, part of the canal in Ottawa can become a long skating route.",
    },
  },
  {
    id: "algonquin-provincial-park",
    name: "Algonquin Provincial Park",
    type: "park",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-78.379, 45.837],
    zoomMin: 6.4,
    education: {
      description:
        "A large provincial park of forests, lakes, and canoe routes in central Ontario.",
      funFact: "Algonquin is one of Ontario's best-known protected natural areas.",
    },
  },
  {
    id: "point-pelee-national-park",
    name: "Point Pelee National Park",
    type: "park",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-82.518, 41.96],
    zoomMin: 7.2,
    education: {
      description:
        "A national park on a narrow peninsula extending into Lake Erie.",
      funFact: "Point Pelee is one of mainland Canada's southernmost points.",
    },
  },
  {
    id: "bruce-peninsula-flowerpot-island",
    name: "Bruce Peninsula",
    type: "natural_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-81.376, 45.257],
    zoomMin: 6.8,
    education: {
      description:
        "A scenic peninsula between Georgian Bay and Lake Huron, near Flowerpot Island.",
      funFact: "The area is known for cliffs, clear water, and limestone formations.",
    },
  },
  {
    id: "thousand-islands",
    name: "Thousand Islands",
    type: "natural_site",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-76.0, 44.34],
    zoomMin: 7,
    education: {
      description:
        "An island region in the St. Lawrence River between Ontario and New York.",
      funFact: "The region contains far more than one thousand islands.",
    },
  },
  {
    id: "stratford-festival",
    name: "Stratford Festival",
    type: "landmark",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    city: "Stratford",
    center: [-80.9822, 43.3706],
    zoomMin: 7,
    education: {
      description:
        "A major theatre festival in Stratford, Ontario.",
      funFact: "The festival is especially known for Shakespeare productions.",
    },
  },
];
