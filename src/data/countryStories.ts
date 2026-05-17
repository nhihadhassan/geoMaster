import { countries, type Country } from "./countries.ts";

export type CountryStory = {
  iso_a3: string;
  title?: string;
  story: string;
  sourceNotes?: string[];
};

const commonSources = ["Britannica", "UN", "World Bank", "local GeoMaster country data"];

const curatedStories: Record<string, Omit<CountryStory, "iso_a3">> = {
  CAN: {
    title: "Indigenous homelands, empire, and a gradual country",
    story: `Canada is often introduced through forests, lakes, cold winters, and multicultural cities, but its deeper story begins long before the country itself existed. The land now called Canada is home to First Nations, Inuit, and Metis peoples, whose languages, trade networks, legal traditions, and relationships to land shaped the continent for thousands of years before European arrival.

Modern Canada was formed through French and British colonization. France established settlements along the St. Lawrence River, while Britain expanded through trade, war, settlement, and treaties. After the Seven Years' War, much of New France came under British rule, creating the French-English tension that still shapes Canadian politics, especially in Quebec.

Unlike countries that became independent through revolution, Canada’s independence happened slowly. Confederation in 1867 created the Dominion of Canada, but full constitutional control came only in 1982. Canada’s global influence is larger than its population might suggest: insulin, peacekeeping diplomacy, immigration, film, finance, technology, and major cities like Toronto, Vancouver, and Montreal all matter. Its unresolved questions are just as important: Indigenous land rights, residential schools, resource extraction, climate responsibility, and dependence on the United States.

In short, Canada is not just a peaceful northern country with beautiful landscapes. It is a place built from Indigenous homelands, French and British empire, gradual independence, mass immigration, natural resources, and unfinished debates over reconciliation and national identity.`,
    sourceNotes: ["Britannica", "Government of Canada history resources", "Truth and Reconciliation Commission context"],
  },
  PSE: {
    title: "Memory, sacred geography, and self-determination",
    story: `Palestine is one of the most historically layered places in the world. It sits between the Mediterranean Sea and the Jordan River, at the crossroads of Africa, Asia, and Europe. For thousands of years, this land has been shaped by Canaanite, Israelite, Roman, Byzantine, Islamic, Crusader, Ottoman, British, Palestinian Arab, and Israeli histories. Cities such as Jerusalem, Hebron, Bethlehem, Gaza, Nablus, and Ramallah carry enormous religious, cultural, and political meaning.

Modern Palestine cannot be understood without empire and displacement. For centuries, the region was part of the Ottoman Empire. After World War I, it came under British control through the British Mandate for Palestine. The 20th century brought rising Palestinian nationalism, Zionist settlement, British colonial governance, the 1948 Nakba, war, exile, and the creation of Israel. Since 1967, the West Bank, East Jerusalem, and Gaza have been central to one of the world’s most unresolved struggles over land, sovereignty, occupation, refugees, and self-determination.

Palestine’s contribution to the world is not only political. Its olive groves, embroidery, poetry, food, stone towns, oral histories, and sacred geography are part of a culture of memory and endurance. Palestine is not just a place on a disputed map; it is a land where people continue trying to hold onto place, identity, and dignity.`,
    sourceNotes: ["Britannica", "UN", "UNRWA historical context"],
  },
  USA: {
    title: "Power, contradiction, and reinvention",
    story: `The United States is often described through power: its economy, military, technology, movies, universities, and global influence. But its deeper story begins with Indigenous nations whose lands stretched across the continent long before the country existed. These societies had their own political systems, trade routes, cities, agricultural knowledge, and relationships to land. The United States was built through settlement, expansion, war, slavery, immigration, and the displacement of Indigenous peoples.

The country began as thirteen British colonies along the Atlantic coast. After the American Revolution, the United States declared independence in 1776 and built a republic around liberty, rights, and self-government. But those ideals existed alongside slavery, settler colonialism, and exclusion. The Civil War ended slavery legally, but racial inequality continued through segregation, discrimination, and unequal access to land, wealth, and power.

The United States became one of the most influential countries in the world through industrialization, immigration, war, capitalism, and culture. It helped shape modern technology, aviation, medicine, finance, music, cinema, the internet, and higher education. Its story is one of extraordinary influence, but also constant struggle over who belongs, who is protected, and what its founding promises are supposed to mean.`,
    sourceNotes: ["Britannica", "Library of Congress", "National Museum of the American Indian context"],
  },
  PER: {
    title: "Andean civilizations and colonial rupture",
    story: `Peru is one of the great historical centers of the Americas. Long before Spanish colonization, the Andes were home to powerful civilizations that built cities, roads, terraces, irrigation systems, temples, and trade networks across some of the most difficult terrain on earth. The Inca Empire, with Cusco at its center, became the largest empire in the pre-Columbian Americas, connecting mountains, deserts, forests, and coastlines through an extraordinary system of roads and administration.

Spanish conquest in the 16th century transformed Peru. The fall of the Inca Empire brought colonial rule, forced labor, Catholic missions, mining, and a new racial and social order. Lima became one of the most important cities in Spain’s American empire, while Indigenous communities continued to preserve languages, farming knowledge, religious practices, and local identities despite violence and exploitation.

Peru’s contribution to the world is immense. It helped give the world the potato, one of the most important food crops in human history. Its culture blends Indigenous, Spanish, African, Asian, and migrant influences in food, music, textiles, architecture, and festivals. Peru is not just Machu Picchu or a beautiful travel destination; it is a country shaped by empire, survival, mountains, food, memory, and cultural fusion.`,
    sourceNotes: ["Britannica", "UNESCO", "local GeoMaster country data"],
  },
  TWN: {
    title: "Island crossroads and contested modernity",
    story: `Taiwan’s story is shaped by island geography, Indigenous peoples, migration, empire, and one of the modern world’s most sensitive political questions. Long before today’s cities and semiconductor factories, Taiwan was home to Austronesian Indigenous communities whose languages and cultures connect the island to a wider Pacific world.

From the 17th century onward, Taiwan was shaped by Dutch and Spanish outposts, migration from coastal China, Qing rule, Japanese colonial rule, and then the arrival of the Republic of China government after the Chinese Civil War. Japanese rule left infrastructure and institutions, while postwar authoritarian rule under the Kuomintang reshaped politics, identity, and memory. Taiwan later became one of Asia’s major democratic transformations.

Taiwan’s global influence is unusually large for its size. It is central to advanced semiconductor manufacturing, democratic politics in East Asia, Mandarin-language culture, Indigenous cultural revival, and global debates over sovereignty. Its unresolved issue is clear but delicate: Taiwan governs itself, while the People’s Republic of China claims it as part of China, and many countries navigate that tension through careful diplomatic ambiguity. Taiwan is a place where technology, democracy, memory, and identity meet under intense pressure.`,
    sourceNotes: ["Britannica", "Council of Indigenous Peoples Taiwan context", "World Bank/UN-style economic context"],
  },
  KOS: {
    title: "A young state with a deep Balkan past",
    story: `Kosovo is one of Europe’s youngest states, but its history is far older than its modern borders. The region sits in the central Balkans, where Illyrian, Roman, Byzantine, Serbian, Ottoman, Albanian, Yugoslav, and modern European histories overlap. For Albanians and Serbs, Kosovo carries powerful historical and cultural meaning, which is one reason its politics remain so sensitive.

For centuries Kosovo was part of the Ottoman Empire. In the 20th century it became part of Yugoslavia, where Albanian demands for autonomy and Serbian national claims collided. The breakup of Yugoslavia, repression under Slobodan Milosevic, the Kosovo War, NATO intervention, and years of international administration led to Kosovo declaring independence in 2008.

Kosovo is recognized by many countries, but not by Serbia and several others, so its international status remains contested. Its story is not only conflict; it is also about young people, diaspora ties, music, sport, religious heritage, and efforts to build institutions after war. Kosovo’s modern identity is still being written, between memory, sovereignty, reconciliation, and the everyday work of making a state function.`,
    sourceNotes: ["Britannica", "UN", "Council of Europe context"],
  },
  UKR: {
    title: "Borderland, culture, and survival",
    story: `Ukraine’s name is often associated with borderlands, but its history is not peripheral. The lands of modern Ukraine have been shaped by steppe routes, Black Sea trade, Kyivan Rus, Cossack communities, Polish-Lithuanian rule, the Russian Empire, the Habsburg world, Soviet power, famine, war, and independence. Its fertile black-earth plains made it strategically and agriculturally important for centuries.

Modern Ukrainian identity grew through language, literature, religion, regional memory, and repeated struggles over autonomy. Under Soviet rule, Ukraine experienced industrialization, repression, the Holodomor famine, World War II devastation, and nuclear disaster at Chornobyl. Independence came in 1991 after the Soviet Union collapsed, but debates over democracy, corruption, language, Europe, and Russia continued.

Since 2014, and especially after Russia’s full-scale invasion in 2022, Ukraine has become a global symbol of resistance to imperial aggression. Its contributions include literature, music, engineering, agriculture, science, and a strong civic culture. Ukraine’s story is not just tragedy or war; it is a story of a society insisting that its language, sovereignty, and future are not for someone else to decide.`,
    sourceNotes: ["Britannica", "UN", "Holodomor historical context"],
  },
  VAT: {
    title: "A tiny state with global religious reach",
    story: `Vatican City is the smallest sovereign state in the world, but its influence is far larger than its size. It exists within Rome as the territorial center of the Roman Catholic Church and the home of the pope. Its story is tied to the long history of Christianity, the Roman Empire, medieval papal power, Italian unification, and modern diplomacy.

For centuries, popes ruled the Papal States across parts of central Italy. That political world largely disappeared during Italian unification in the 19th century. Vatican City became a sovereign state through the Lateran Treaty of 1929, which settled the relationship between the Holy See and Italy. Today the state itself is tiny, but the Holy See maintains diplomatic relations around the world.

Vatican City’s contributions are religious, artistic, architectural, and archival. St. Peter’s Basilica, the Vatican Museums, the Sistine Chapel, and centuries of manuscripts and art make it one of the world’s major cultural repositories. Its tensions involve church authority, reform, abuse scandals, global inequality, and the challenge of leading a worldwide faith from a very small place. Vatican City is a reminder that geography and influence are not always proportional.`,
    sourceNotes: ["Britannica", "Vatican historical resources", "Lateran Treaty context"],
  },
  MDV: {
    title: "An ocean nation on the front line",
    story: `The Maldives is an Indian Ocean country made of low-lying coral islands, where geography shapes almost everything. Its islands sit along old maritime routes linking East Africa, Arabia, South Asia, and Southeast Asia. Long before the modern resort economy, Maldivian society was shaped by fishing, boatbuilding, trade, Islam, and the rhythms of reef and monsoon.

The Maldives became a Muslim sultanate in the medieval period and later navigated Portuguese, Dutch, and British influence. It was a British protectorate before gaining independence in 1965. Modern politics has moved through monarchy, republic, authoritarian rule, democratic reform, and continued debates over institutions and rights.

The country’s global image is often reduced to luxury tourism, but that misses the deeper story. Maldivians have built a distinctive island culture in a fragile ocean environment, and the country has become one of the clearest voices on climate change. Rising seas are not an abstraction here; they are a question of land, homes, freshwater, memory, and sovereignty. The Maldives is not just paradise in the Indian Ocean. It is a nation asking what survival means in a warming world.`,
    sourceNotes: ["Britannica", "UN", "Alliance of Small Island States context"],
  },
  NRU: {
    title: "A small island marked by extraction",
    story: `Nauru is one of the world’s smallest republics, a Pacific island whose modern history shows how a tiny place can be transformed by global demand. For generations, Nauruan life was rooted in island communities, fishing, kinship, and the central plateau. Then phosphate, formed from ancient seabird deposits, made the island valuable to outside powers.

Germany annexed Nauru in the late 19th century. After World War I it came under Australian, British, and New Zealand administration, and during World War II it was occupied by Japan. Nauru became independent in 1968, inheriting both phosphate wealth and severe environmental damage. Mining made the country briefly wealthy, but it also stripped much of the island’s interior and left difficult questions about restoration, debt, and economic survival.

Nauru’s story is not only a cautionary tale. It is also about resilience, sovereignty, Pacific identity, and the difficulty of building a future when land and resources have been reshaped by extraction. Its modern role in regional politics, climate vulnerability, and migration policy is complex. Nauru reminds us that small countries can carry large histories of empire, resource hunger, and survival.`,
    sourceNotes: ["Britannica", "UN", "Pacific Islands Forum context"],
  },
};

const regionLabel = (country: Country) => {
  const primary = country.continentQuizGroups[0];

  if (primary === "north-america") return "the Caribbean, Central America, and North America";
  if (primary === "south-america") return "South America";
  if (primary === "africa") return "Africa";
  if (primary === "europe") return "Europe";
  if (primary === "asia") return "Asia";
  if (primary === "oceania") return "Oceania and the Pacific";

  return "the world";
};

const languagePhrase = (country: Country) => {
  const languages = country.education.languages.slice(0, 3);

  if (languages.length === 0) return "its everyday languages";
  if (languages.length === 1) return languages[0];
  if (languages.length === 2) return `${languages[0]} and ${languages[1]}`;

  return `${languages[0]}, ${languages[1]}, and ${languages[2]}`;
};

const historicalFrame = (country: Country) => {
  const primary = country.continentQuizGroups[0];

  if (primary === "africa") {
    return "Its modern borders sit on top of older kingdoms, communities, trade routes, and colonial boundaries, a pattern that still shapes politics and identity across much of the continent.";
  }

  if (primary === "asia") {
    return "Its history is tied to older civilizations, regional trade, religious change, imperial pressure, and modern nation-building rather than to a single simple origin story.";
  }

  if (primary === "europe") {
    return "Its modern statehood grew out of older European worlds of kingdoms, cities, empires, religious change, war, diplomacy, and changing borders.";
  }

  if (primary === "south-america") {
    return "Its modern identity was shaped by Indigenous histories, Iberian empire, struggles over independence, land, resources, and the long work of building a state after colonial rule.";
  }

  if (primary === "north-america") {
    return country.isSmall
      ? "Its modern story was shaped by Indigenous presence, Atlantic slavery, European empire, plantation economies, migration, and the difficult work of turning island society into sovereign statehood."
      : "Its modern identity was shaped by Indigenous histories, European empire, migration, trade, and debates over land, power, language, and belonging.";
  }

  return "Its modern statehood grew from older Pacific societies, ocean navigation, colonial pressure, mission history, migration, and the challenge of governing across water.";
};

const tensionFrame = (country: Country) => {
  if (country.iso_a3 === "RUS") {
    return "Its modern power is inseparable from debates over empire, central authority, resource wealth, political freedom, and its wars and influence beyond its borders.";
  }

  if (country.iso_a3 === "TUR") {
    return "Its unresolved questions include secularism and religion, minority rights, democratic institutions, regional power, and how to hold together European, Middle Eastern, and Anatolian identities.";
  }

  if (country.isSmall) {
    return "Its biggest pressures often come from outside its size: climate risk, migration, debt, tourism dependence, resource limits, and the need to keep local identity strong in a global economy.";
  }

  const primary = country.continentQuizGroups[0];

  if (primary === "africa") {
    return "Like many states shaped by colonial borders, it continues to negotiate questions of governance, resources, language, regional inequality, and how to make inherited institutions serve local realities.";
  }

  if (primary === "asia") {
    return "Its modern tensions often involve development, regional power, minority rights, environmental pressure, memory of empire, and the balance between tradition and rapid change.";
  }

  if (primary === "europe") {
    return "Its present is shaped by questions familiar across Europe: sovereignty, migration, regional identity, democratic pressure, economic change, and how to remember difficult history honestly.";
  }

  if (primary === "south-america") {
    return "Its unresolved issues often involve inequality, Indigenous rights, land, resource extraction, political trust, and the environmental future of rivers, forests, mountains, and coasts.";
  }

  if (primary === "north-america") {
    return "Its modern challenges include inequality, migration, climate risk, public trust, cultural identity, and the long shadow of colonialism and race.";
  }

  return "Its future is closely tied to climate change, ocean governance, migration, cultural continuity, and the need for small states to be heard in global decisions.";
};

const buildGeneratedStory = (country: Country): string => {
  const place = regionLabel(country);
  const languages = languagePhrase(country);
  const opening = country.isSmall
    ? `${country.name} may be small on the map, but its story reaches far beyond its size. Set in ${place}, it has been shaped by water, movement, trade, empire, and the daily work of keeping a distinct community alive.`
    : `${country.name} matters because geography and history meet there in ways that still shape the present. Located in ${place}, it is more than a capital, borders, and statistics; it is a country built from older communities, changing power, and the choices of people who kept adapting.`;

  return `${opening}

${historicalFrame(country)} ${country.capital} is the capital, but the country’s identity is also carried through smaller towns, local landscapes, family histories, foodways, faith, work, and language. ${languages} helps tell that story, because language often preserves memory even when governments, borders, and economies change.

${country.education.funFact} That detail is not just trivia; it points to the way ${country.name} contributes to the wider world through culture, environment, resources, ideas, sport, music, food, labor, diplomacy, or strategic location. Countries are rarely important for only one reason, and ${country.name} is no exception.

${tensionFrame(country)} In short, ${country.name} is not just a name to memorize for a quiz. It is a place where geography, memory, pressure, creativity, and modern ambition all meet, leaving a story that is still being written.`;
};

export const countryStories: Record<string, CountryStory> = Object.fromEntries(
  countries.map((country) => {
    const curated = curatedStories[country.iso_a3];

    return [
      country.iso_a3,
      {
        iso_a3: country.iso_a3,
        title: curated?.title ?? `${country.name} in context`,
        story: curated?.story ?? buildGeneratedStory(country),
        sourceNotes: curated?.sourceNotes ?? commonSources,
      },
    ];
  }),
);

export const getCountryStory = (isoA3: string): CountryStory | null =>
  countryStories[isoA3] ?? null;
