export type SubdivisionType = "state" | "province" | "territory" | "district";

export type Subdivision = {
  id: string;
  name: string;
  countryIsoA3: "USA" | "CAN";
  type: SubdivisionType;
  center: [number, number];
  education?: {
    capital?: string;
    population?: number | null;
    funFact?: string;
  };
};

export const subdivisions: Subdivision[] = [
  { id: "us-al", name: "Alabama", countryIsoA3: "USA", type: "state", center: [-86.8, 32.8], education: { capital: "Montgomery", funFact: "Alabama sits between the Appalachian foothills and the Gulf Coastal Plain." } },
  { id: "us-ak", name: "Alaska", countryIsoA3: "USA", type: "state", center: [-152.4, 64.2], education: { capital: "Juneau", funFact: "Alaska is the largest U.S. state by area." } },
  { id: "us-az", name: "Arizona", countryIsoA3: "USA", type: "state", center: [-111.7, 34.3], education: { capital: "Phoenix", funFact: "Arizona includes much of the Grand Canyon." } },
  { id: "us-ar", name: "Arkansas", countryIsoA3: "USA", type: "state", center: [-92.4, 35.1], education: { capital: "Little Rock", funFact: "Arkansas includes the Ozark and Ouachita mountain regions." } },
  { id: "us-ca", name: "California", countryIsoA3: "USA", type: "state", center: [-119.5, 36.6], education: { capital: "Sacramento", funFact: "California spans Pacific coastline, deserts, valleys, and the Sierra Nevada." } },
  { id: "us-co", name: "Colorado", countryIsoA3: "USA", type: "state", center: [-105.5, 39.0], education: { capital: "Denver", funFact: "Colorado contains many of the highest peaks in the Rocky Mountains." } },
  { id: "us-ct", name: "Connecticut", countryIsoA3: "USA", type: "state", center: [-72.7, 41.6], education: { capital: "Hartford", funFact: "Connecticut lies along Long Island Sound in New England." } },
  { id: "us-de", name: "Delaware", countryIsoA3: "USA", type: "state", center: [-75.5, 39.0], education: { capital: "Dover", funFact: "Delaware was the first state to ratify the U.S. Constitution." } },
  { id: "us-dc", name: "District of Columbia", countryIsoA3: "USA", type: "district", center: [-77.0, 38.9], education: { capital: "Washington", funFact: "Washington, D.C. is the capital district of the United States." } },
  { id: "us-fl", name: "Florida", countryIsoA3: "USA", type: "state", center: [-82.5, 28.5], education: { capital: "Tallahassee", funFact: "Florida is a peninsula between the Atlantic Ocean and Gulf of Mexico." } },
  { id: "us-ga", name: "Georgia", countryIsoA3: "USA", type: "state", center: [-83.4, 32.6], education: { capital: "Atlanta", funFact: "Georgia stretches from the Appalachians to the Atlantic Coastal Plain." } },
  { id: "us-hi", name: "Hawaii", countryIsoA3: "USA", type: "state", center: [-157.5, 20.8], education: { capital: "Honolulu", funFact: "Hawaii is an island chain formed by volcanic activity in the Pacific." } },
  { id: "us-id", name: "Idaho", countryIsoA3: "USA", type: "state", center: [-114.6, 44.2], education: { capital: "Boise", funFact: "Idaho includes parts of the Rocky Mountains and Snake River Plain." } },
  { id: "us-il", name: "Illinois", countryIsoA3: "USA", type: "state", center: [-89.2, 40.0], education: { capital: "Springfield", funFact: "Illinois borders Lake Michigan and the Mississippi River." } },
  { id: "us-in", name: "Indiana", countryIsoA3: "USA", type: "state", center: [-86.3, 39.9], education: { capital: "Indianapolis", funFact: "Indiana lies in the American Midwest near the Great Lakes." } },
  { id: "us-ia", name: "Iowa", countryIsoA3: "USA", type: "state", center: [-93.5, 42.1], education: { capital: "Des Moines", funFact: "Iowa sits between the Missouri and Mississippi rivers." } },
  { id: "us-ks", name: "Kansas", countryIsoA3: "USA", type: "state", center: [-98.4, 38.5], education: { capital: "Topeka", funFact: "Kansas lies in the Great Plains near the geographic center of the contiguous U.S." } },
  { id: "us-ky", name: "Kentucky", countryIsoA3: "USA", type: "state", center: [-84.7, 37.5], education: { capital: "Frankfort", funFact: "Kentucky includes Appalachian highlands and Bluegrass country." } },
  { id: "us-la", name: "Louisiana", countryIsoA3: "USA", type: "state", center: [-91.9, 31.0], education: { capital: "Baton Rouge", funFact: "Louisiana contains the Mississippi River delta." } },
  { id: "us-me", name: "Maine", countryIsoA3: "USA", type: "state", center: [-69.0, 45.3], education: { capital: "Augusta", funFact: "Maine is the northeasternmost U.S. state." } },
  { id: "us-md", name: "Maryland", countryIsoA3: "USA", type: "state", center: [-76.7, 39.0], education: { capital: "Annapolis", funFact: "Maryland surrounds much of Chesapeake Bay." } },
  { id: "us-ma", name: "Massachusetts", countryIsoA3: "USA", type: "state", center: [-71.8, 42.3], education: { capital: "Boston", funFact: "Massachusetts is a coastal New England state on the Atlantic." } },
  { id: "us-mi", name: "Michigan", countryIsoA3: "USA", type: "state", center: [-85.5, 44.3], education: { capital: "Lansing", funFact: "Michigan is split into two peninsulas surrounded by the Great Lakes." } },
  { id: "us-mn", name: "Minnesota", countryIsoA3: "USA", type: "state", center: [-94.3, 46.3], education: { capital: "Saint Paul", funFact: "Minnesota is known for its many lakes and its border with Lake Superior." } },
  { id: "us-ms", name: "Mississippi", countryIsoA3: "USA", type: "state", center: [-89.7, 32.7], education: { capital: "Jackson", funFact: "Mississippi takes its name from the river along its western border." } },
  { id: "us-mo", name: "Missouri", countryIsoA3: "USA", type: "state", center: [-92.5, 38.5], education: { capital: "Jefferson City", funFact: "Missouri sits where the Great Plains, Midwest, and Ozarks meet." } },
  { id: "us-mt", name: "Montana", countryIsoA3: "USA", type: "state", center: [-110.4, 46.9], education: { capital: "Helena", funFact: "Montana includes part of the Rocky Mountains and northern Great Plains." } },
  { id: "us-ne", name: "Nebraska", countryIsoA3: "USA", type: "state", center: [-99.8, 41.5], education: { capital: "Lincoln", funFact: "Nebraska lies in the Great Plains along the Platte River." } },
  { id: "us-nv", name: "Nevada", countryIsoA3: "USA", type: "state", center: [-116.6, 39.3], education: { capital: "Carson City", funFact: "Nevada is largely within the Basin and Range region." } },
  { id: "us-nh", name: "New Hampshire", countryIsoA3: "USA", type: "state", center: [-71.6, 43.7], education: { capital: "Concord", funFact: "New Hampshire includes the White Mountains." } },
  { id: "us-nj", name: "New Jersey", countryIsoA3: "USA", type: "state", center: [-74.7, 40.1], education: { capital: "Trenton", funFact: "New Jersey lies between New York City, Philadelphia, and the Atlantic coast." } },
  { id: "us-nm", name: "New Mexico", countryIsoA3: "USA", type: "state", center: [-106.1, 34.4], education: { capital: "Santa Fe", funFact: "New Mexico includes desert basins, mesas, and southern Rocky Mountain ranges." } },
  { id: "us-ny", name: "New York", countryIsoA3: "USA", type: "state", center: [-75.0, 43.0], education: { capital: "Albany", funFact: "New York stretches from the Atlantic coast to the Great Lakes." } },
  { id: "us-nc", name: "North Carolina", countryIsoA3: "USA", type: "state", center: [-79.0, 35.5], education: { capital: "Raleigh", funFact: "North Carolina spans the Atlantic coast, Piedmont, and Appalachian Mountains." } },
  { id: "us-nd", name: "North Dakota", countryIsoA3: "USA", type: "state", center: [-100.5, 47.5], education: { capital: "Bismarck", funFact: "North Dakota sits on the northern Great Plains." } },
  { id: "us-oh", name: "Ohio", countryIsoA3: "USA", type: "state", center: [-82.8, 40.3], education: { capital: "Columbus", funFact: "Ohio borders Lake Erie and the Ohio River." } },
  { id: "us-ok", name: "Oklahoma", countryIsoA3: "USA", type: "state", center: [-97.5, 35.6], education: { capital: "Oklahoma City", funFact: "Oklahoma lies between the Great Plains and the Ozark Plateau." } },
  { id: "us-or", name: "Oregon", countryIsoA3: "USA", type: "state", center: [-120.5, 44.0], education: { capital: "Salem", funFact: "Oregon includes Pacific coastline, the Cascades, and high desert." } },
  { id: "us-pa", name: "Pennsylvania", countryIsoA3: "USA", type: "state", center: [-77.8, 40.9], education: { capital: "Harrisburg", funFact: "Pennsylvania contains part of the Appalachian Mountains." } },
  { id: "us-ri", name: "Rhode Island", countryIsoA3: "USA", type: "state", center: [-71.5, 41.7], education: { capital: "Providence", funFact: "Rhode Island is the smallest U.S. state by area." } },
  { id: "us-sc", name: "South Carolina", countryIsoA3: "USA", type: "state", center: [-80.9, 33.8], education: { capital: "Columbia", funFact: "South Carolina stretches from Atlantic beaches to the Blue Ridge foothills." } },
  { id: "us-sd", name: "South Dakota", countryIsoA3: "USA", type: "state", center: [-100.0, 44.4], education: { capital: "Pierre", funFact: "South Dakota includes the Black Hills and northern Great Plains." } },
  { id: "us-tn", name: "Tennessee", countryIsoA3: "USA", type: "state", center: [-86.4, 35.8], education: { capital: "Nashville", funFact: "Tennessee runs from the Mississippi River to the Great Smoky Mountains." } },
  { id: "us-tx", name: "Texas", countryIsoA3: "USA", type: "state", center: [-99.3, 31.5], education: { capital: "Austin", funFact: "Texas is the second-largest U.S. state by area." } },
  { id: "us-ut", name: "Utah", countryIsoA3: "USA", type: "state", center: [-111.7, 39.3], education: { capital: "Salt Lake City", funFact: "Utah includes the Great Basin, Colorado Plateau, and Wasatch Range." } },
  { id: "us-vt", name: "Vermont", countryIsoA3: "USA", type: "state", center: [-72.7, 44.0], education: { capital: "Montpelier", funFact: "Vermont is known for the Green Mountains." } },
  { id: "us-va", name: "Virginia", countryIsoA3: "USA", type: "state", center: [-78.7, 37.5], education: { capital: "Richmond", funFact: "Virginia spans Chesapeake Bay, Piedmont, and Appalachian landscapes." } },
  { id: "us-wa", name: "Washington", countryIsoA3: "USA", type: "state", center: [-120.7, 47.4], education: { capital: "Olympia", funFact: "Washington includes Puget Sound, the Cascades, and Pacific coastline." } },
  { id: "us-wv", name: "West Virginia", countryIsoA3: "USA", type: "state", center: [-80.6, 38.6], education: { capital: "Charleston", funFact: "West Virginia lies almost entirely within the Appalachian region." } },
  { id: "us-wi", name: "Wisconsin", countryIsoA3: "USA", type: "state", center: [-89.7, 44.6], education: { capital: "Madison", funFact: "Wisconsin borders both Lake Superior and Lake Michigan." } },
  { id: "us-wy", name: "Wyoming", countryIsoA3: "USA", type: "state", center: [-107.6, 43.0], education: { capital: "Cheyenne", funFact: "Wyoming includes Yellowstone, high plains, and Rocky Mountain ranges." } },

  { id: "ca-ab", name: "Alberta", countryIsoA3: "CAN", type: "province", center: [-115.0, 54.5], education: { capital: "Edmonton", funFact: "Alberta includes prairie, boreal forest, and the Canadian Rockies." } },
  { id: "ca-bc", name: "British Columbia", countryIsoA3: "CAN", type: "province", center: [-125.0, 54.0], education: { capital: "Victoria", funFact: "British Columbia combines Pacific coastline with major mountain ranges." } },
  { id: "ca-mb", name: "Manitoba", countryIsoA3: "CAN", type: "province", center: [-97.0, 55.0], education: { capital: "Winnipeg", funFact: "Manitoba stretches from prairie farmland to Hudson Bay coast." } },
  { id: "ca-nb", name: "New Brunswick", countryIsoA3: "CAN", type: "province", center: [-66.4, 46.6], education: { capital: "Fredericton", funFact: "New Brunswick borders the Bay of Fundy, famous for extreme tides." } },
  { id: "ca-nl", name: "Newfoundland and Labrador", countryIsoA3: "CAN", type: "province", center: [-61.6, 53.1], education: { capital: "St. John's", funFact: "Newfoundland and Labrador includes an island and a large mainland region." } },
  { id: "ca-ns", name: "Nova Scotia", countryIsoA3: "CAN", type: "province", center: [-63.0, 45.0], education: { capital: "Halifax", funFact: "Nova Scotia is a peninsula on Canada's Atlantic coast." } },
  { id: "ca-nt", name: "Northwest Territories", countryIsoA3: "CAN", type: "territory", center: [-119.0, 64.8], education: { capital: "Yellowknife", funFact: "The Northwest Territories include Great Slave Lake and Arctic landscapes." } },
  { id: "ca-nu", name: "Nunavut", countryIsoA3: "CAN", type: "territory", center: [-92.0, 69.0], education: { capital: "Iqaluit", funFact: "Nunavut is Canada's largest territory by area." } },
  { id: "ca-on", name: "Ontario", countryIsoA3: "CAN", type: "province", center: [-85.0, 50.0], education: { capital: "Toronto", funFact: "Ontario contains Ottawa, Toronto, and part of the Great Lakes shoreline." } },
  { id: "ca-pe", name: "Prince Edward Island", countryIsoA3: "CAN", type: "province", center: [-63.4, 46.4], education: { capital: "Charlottetown", funFact: "Prince Edward Island is Canada's smallest province." } },
  { id: "ca-qc", name: "Quebec", countryIsoA3: "CAN", type: "province", center: [-72.0, 52.0], education: { capital: "Quebec City", funFact: "Quebec is Canada's largest province by area." } },
  { id: "ca-sk", name: "Saskatchewan", countryIsoA3: "CAN", type: "province", center: [-106.0, 54.5], education: { capital: "Regina", funFact: "Saskatchewan is known for prairie landscapes and many lakes." } },
  { id: "ca-yt", name: "Yukon", countryIsoA3: "CAN", type: "territory", center: [-135.0, 63.5], education: { capital: "Whitehorse", funFact: "Yukon includes Mount Logan, Canada's highest peak." } },
];
