// Mapbox GL v3 removed the `mapboxgl.supported()` helper, so probe directly.
// Cached because creating a throwaway context is not free, and the answer
// cannot change within a page session.
let cachedSupport: boolean | null = null;

export const isWebglAvailable = () => {
  if (cachedSupport !== null) {
    return cachedSupport;
  }

  if (typeof document === "undefined") {
    return true;
  }

  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    cachedSupport = Boolean(context);
  } catch {
    cachedSupport = false;
  }

  return cachedSupport;
};
