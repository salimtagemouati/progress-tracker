import { describe, expect, it, vi } from "vitest";
import { useActivities } from "./activities";

vi.mock("localforage", () => {
  const values = new Map();
  return { default: {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: unknown) => values.set(key, value),
  } };
});

describe("activity persistence", () => {
  it("retains concurrent additions and toggles across reloads", async () => {
    const state = useActivities.getState();
    await Promise.all(["walk", "run"].map(name => state.add({ name, category: "Physical" })));
    const items = useActivities.getState().items;
    expect(items).toHaveLength(2);
    await Promise.all(items.map(item => state.toggle(item.id)));
    await state.load();
    expect(useActivities.getState().items.map(item => item.status)).toEqual(["Done", "Done"]);
  });
});
