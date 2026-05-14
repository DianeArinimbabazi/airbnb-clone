import { useState } from "react";

const KEY = "saved_listings";

function getIds(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function useFavorites() {
  const [savedIds, setSavedIds] = useState<string[]>(getIds);

  function toggle(id: string, _title?: string) {
    const current = getIds();
    const updated = current.includes(id)
      ? current.filter((i: string) => i !== id)
      : [...current, id];
    localStorage.setItem(KEY, JSON.stringify(updated));
    setSavedIds(updated);
  }

  function isSaved(id: string) { return savedIds.includes(id); }

  return { savedIds, isSaved, toggle, count: savedIds.length };
}
