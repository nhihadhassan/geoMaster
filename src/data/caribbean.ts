// The islands the Caribbean inset map covers. Kept in the data layer rather
// than inside CaribbeanInsetMap so MapContainer can consult the set without
// pulling the inset component (and mapbox-gl with it) into the initial bundle.
export const caribbeanCountryIds = new Set([
  "ATG",
  "BHS",
  "BRB",
  "CUB",
  "DMA",
  "DOM",
  "GRD",
  "HTI",
  "JAM",
  "KNA",
  "LCA",
  "VCT",
  "TTO",
]);
