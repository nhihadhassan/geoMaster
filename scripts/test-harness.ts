// Minimal assertion harness so the store tests match the existing script style
// (plain node + tsx, no test-runner dependency).
type Case = { name: string; run: () => void | Promise<void> };

const cases: Case[] = [];

export const test = (name: string, run: Case["run"]) => {
  cases.push({ name, run });
};

export const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const assertEqual = <T>(actual: T, expected: T, message: string) => {
  const same = JSON.stringify(actual) === JSON.stringify(expected);

  if (!same) {
    throw new Error(
      `${message}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    );
  }
};

/** A localStorage stand-in so persistence paths can run outside a browser. */
export const installMemoryStorage = () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };

  const globalObject = globalThis as Record<string, unknown>;

  globalObject.localStorage = storage;
  globalObject.window ??= globalObject;

  return storage;
};

export const runTests = async (suiteName: string) => {
  const failures: string[] = [];

  for (const testCase of cases) {
    try {
      await testCase.run();
    } catch (error) {
      failures.push(
        `  ✗ ${testCase.name}\n    ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(`\n${suiteName} failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`${suiteName} passed (${cases.length} cases).`);
};
