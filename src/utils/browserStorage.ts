// Preferences and quiz progress are conveniences, never prerequisites for play.
// Keep a tab-local copy if browser policy or quota prevents persistence.
const temporaryValues = new Map<string, string | null>();
const listeners = new Set<() => void>();
let persistent = true;

const markStorageUnavailable = () => {
  if (!persistent) return;
  persistent = false;
  listeners.forEach((listener) => listener());
};

export const browserStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    if (!persistent && temporaryValues.has(key)) return temporaryValues.get(key)!;
    try {
      const value = window.localStorage.getItem(key);
      temporaryValues.set(key, value);
      return value;
    } catch {
      markStorageUnavailable();
      return temporaryValues.get(key) ?? null;
    }
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    temporaryValues.set(key, value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      markStorageUnavailable();
    }
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    temporaryValues.set(key, null);
    try {
      window.localStorage.removeItem(key);
    } catch {
      markStorageUnavailable();
    }
  },
};

export const canPersistProgress = () => persistent;
export const subscribeStorageAvailability = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
