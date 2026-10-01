import { createClient } from "@supabase/supabase-js";
import type { Case } from "./data";
import { seedCases } from "./data";
const url = import.meta.env.VITE_US4C_SUPABASE_URL;
const key = import.meta.env.VITE_US4C_SUPABASE_KEY;
export const database = url && key ? createClient(url, key) : null;
const storageKey = "us4c-training-v2";
export function loadDemo(): Case[] {
  try {
    const cached = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      Array.isArray(cached) &&
      cached.length &&
      cached.every((c) => c.id && c.timeline && c.actions)
    )
      return cached;
  } catch {
    /* Recover corrupted local demo storage. */
  }
  return structuredClone(seedCases);
}
export function saveDemo(cases: Case[]) {
  localStorage.setItem(storageKey, JSON.stringify(cases));
}
export function hasDemoCache() {
  return localStorage.getItem(storageKey) !== null;
}
export async function loadPublic() {
  const { data, error } = await database!
    .from("us4c_cases")
    .select("*")
    .eq("is_demo", true)
    .order("id", { ascending: false });
  if (error)
    throw new Error(
      "Supabase is unavailable. Showing cached training records.",
    );
  return data.map(fromRow);
}
export function fromRow(row: {
  id: string;
  owner_id: string;
  payload: Case;
  is_demo: boolean;
}): Case {
  return {
    ...row.payload,
    id: row.id,
    owner: row.owner_id,
    isDemo: row.is_demo,
  };
}
export async function loadRemote(owner: string) {
  const { data, error } = await database!
    .from("us4c_cases")
    .select("*")
    .eq("owner_id", owner)
    .order("created_at", { ascending: false });
  if (error)
    throw new Error(
      "Database unavailable. Check the US4C schema and connection settings.",
    );
  return data.map(fromRow);
}
export async function saveRemote(item: Case, owner: string) {
  const copy = {
    ...item,
    owner,
    isDemo: false,
    timeline: [...item.timeline],
    investigation: item.investigation
      ? { ...item.investigation, audit: [...item.investigation.audit] }
      : undefined,
  };
  const size = () => new TextEncoder().encode(JSON.stringify(copy)).byteLength;
  // Keep the newest event in the case snapshot. The server audit retains the history independently.
  while (size() > 50000 && (copy.investigation?.audit.length || 0) > 1)
    copy.investigation!.audit.shift();
  while (size() > 50000 && copy.timeline.length > 1) copy.timeline.shift();
  if (size() > 50000)
    throw new Error(
      "The case has reached its record capacity. Import fewer source records or shorten the source extracts before saving.",
    );
  const { data, error } = await database!
    .from("us4c_cases")
    .upsert({ id: copy.id, owner_id: owner, is_demo: false, payload: copy })
    .select()
    .single();
  if (error)
    throw new Error(
      "Case could not be saved. Your previous record is unchanged.",
    );
  return fromRow(data);
}
