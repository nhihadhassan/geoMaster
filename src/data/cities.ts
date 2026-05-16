export type City = {
  id: string;
  name: string;
  countryIsoA3: "CAN";
  subdivision: string;
  center: [number, number];
  zoomMin: number;
  education: {
    population?: number | null;
    description: string;
    funFact?: string;
  };
};

export const cities: City[] = [
  {
    id: "ca-on-toronto",
    name: "Toronto",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-79.3832, 43.6532],
    zoomMin: 4.8,
    education: {
      population: 2794356,
      description:
        "Ontario's capital and Canada's largest city, set on the northwestern shore of Lake Ontario.",
      funFact: "Toronto is one of the world's most multicultural large cities.",
    },
  },
  {
    id: "ca-on-ottawa",
    name: "Ottawa",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-75.6972, 45.4215],
    zoomMin: 4.8,
    education: {
      population: 1017449,
      description:
        "Canada's capital city, located where the Ottawa, Rideau, and Gatineau rivers meet.",
      funFact: "Ottawa sits directly across the river from Gatineau, Quebec.",
    },
  },
  {
    id: "ca-on-mississauga",
    name: "Mississauga",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-79.6441, 43.589],
    zoomMin: 6,
    education: {
      population: 717961,
      description:
        "A major city west of Toronto on Lake Ontario and part of the Greater Toronto Area.",
      funFact: "Toronto Pearson International Airport is located largely in Mississauga.",
    },
  },
  {
    id: "ca-on-brampton",
    name: "Brampton",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-79.7624, 43.7315],
    zoomMin: 6,
    education: {
      population: 656480,
      description:
        "A fast-growing city northwest of Toronto in Peel Region.",
      funFact: "Brampton is known for a large South Asian community and a lively arts scene.",
    },
  },
  {
    id: "ca-on-hamilton",
    name: "Hamilton",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-79.8711, 43.2557],
    zoomMin: 5.6,
    education: {
      population: 569353,
      description:
        "A port city at the western end of Lake Ontario, below the Niagara Escarpment.",
      funFact: "Hamilton has dozens of waterfalls along the Niagara Escarpment.",
    },
  },
  {
    id: "ca-on-london",
    name: "London",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-81.2453, 42.9849],
    zoomMin: 5.6,
    education: {
      population: 422324,
      description:
        "A southwestern Ontario city along the Thames River.",
      funFact: "London is home to Western University.",
    },
  },
  {
    id: "ca-on-kitchener",
    name: "Kitchener",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-80.4925, 43.4516],
    zoomMin: 6,
    education: {
      population: 256885,
      description:
        "A Waterloo Region city west of Toronto with a strong technology and manufacturing base.",
      funFact: "Kitchener and Waterloo form one of Ontario's best-known urban pairs.",
    },
  },
  {
    id: "ca-on-waterloo",
    name: "Waterloo",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-80.5164, 43.4643],
    zoomMin: 6.4,
    education: {
      population: 121436,
      description:
        "A university and technology city in Waterloo Region.",
      funFact: "Waterloo is home to the University of Waterloo and Wilfrid Laurier University.",
    },
  },
  {
    id: "ca-on-windsor",
    name: "Windsor",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-83.0364, 42.3149],
    zoomMin: 5.6,
    education: {
      population: 229660,
      description:
        "A border city on the Detroit River across from Detroit, Michigan.",
      funFact: "Windsor is one of the southernmost cities in Canada.",
    },
  },
  {
    id: "ca-on-kingston",
    name: "Kingston",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-76.4859, 44.2312],
    zoomMin: 5.8,
    education: {
      population: 132485,
      description:
        "A historic city where Lake Ontario meets the St. Lawrence River.",
      funFact: "Kingston was briefly the capital of the Province of Canada in the 1840s.",
    },
  },
  {
    id: "ca-on-markham",
    name: "Markham",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-79.337, 43.8561],
    zoomMin: 6.4,
    education: {
      population: 338503,
      description:
        "A city north of Toronto in York Region.",
      funFact: "Markham is part of the Greater Toronto Area's major technology corridor.",
    },
  },
  {
    id: "ca-on-vaughan",
    name: "Vaughan",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-79.5083, 43.8563],
    zoomMin: 6.4,
    education: {
      population: 323103,
      description:
        "A York Region city directly north of Toronto.",
      funFact: "Vaughan is home to Canada's Wonderland.",
    },
  },
  {
    id: "ca-on-oshawa",
    name: "Oshawa",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-78.8658, 43.8971],
    zoomMin: 6,
    education: {
      population: 175383,
      description:
        "A city east of Toronto on Lake Ontario in Durham Region.",
      funFact: "Oshawa has long been associated with Canada's automotive industry.",
    },
  },
  {
    id: "ca-on-barrie",
    name: "Barrie",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-79.6903, 44.3894],
    zoomMin: 5.8,
    education: {
      population: 147829,
      description:
        "A city on Kempenfelt Bay, part of Lake Simcoe, north of Toronto.",
      funFact: "Barrie is a gateway to cottage country and ski areas north of the GTA.",
    },
  },
  {
    id: "ca-on-sudbury",
    name: "Sudbury",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-80.993, 46.4917],
    zoomMin: 5.4,
    education: {
      population: 166004,
      description:
        "A northern Ontario city built around mining, lakes, and boreal landscapes.",
      funFact: "Sudbury is known for the Big Nickel landmark.",
    },
  },
  {
    id: "ca-on-thunder-bay",
    name: "Thunder Bay",
    countryIsoA3: "CAN",
    subdivision: "Ontario",
    center: [-89.2477, 48.3809],
    zoomMin: 5.2,
    education: {
      population: 108843,
      description:
        "A northwestern Ontario port city on Lake Superior.",
      funFact: "Thunder Bay sits near the Sleeping Giant landform on Lake Superior.",
    },
  },
];
