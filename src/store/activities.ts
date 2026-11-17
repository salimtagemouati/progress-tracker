import { create } from "zustand";
import localforage from "localforage";

export type Category = "Physical" | "Mental" | "Career" | "Languages" | "Knowledge" | "Prayers" | "Organization";
export type Status = "Pending" | "Done";

export interface Activity {
  id: string;
  name: string;
  category: Category;
  amount?: string;
  status: Status;
  createdAt: number;
}

interface State {
  items: Activity[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (a: Omit<Activity, "id" | "status" | "createdAt">) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const KEY = "activities.v1";

let pending = Promise.resolve();

function updateItems(change?: (items: Activity[]) => Activity[]) {
  const update = async () => {
    const stored = await localforage.getItem<Activity[]>(KEY);
    if (stored !== null && !Array.isArray(stored)) throw new Error("Invalid activity storage");
    const items = change ? change(stored ?? []) : stored ?? [];
    if (change) await localforage.setItem(KEY, items);
    useActivities.setState({ items, loaded: true });
  };
  const run = () => navigator.locks ? navigator.locks.request(KEY, update) : update();
  pending = pending.then(run, run);
  return pending;
}

export const useActivities = create<State>(() => ({
  items: [],
  loaded: false,
  load: () => updateItems(),
  add: activity => updateItems(items => [{
    ...activity, id: crypto.randomUUID(), status: "Pending", createdAt: Date.now(),
  }, ...items]),
  toggle: id => updateItems(items => items.map(item => item.id === id
    ? { ...item, status: item.status === "Done" ? "Pending" : "Done" } : item)),
  remove: id => updateItems(items => items.filter(item => item.id !== id)),
  clearAll: () => updateItems(() => []),
}));
