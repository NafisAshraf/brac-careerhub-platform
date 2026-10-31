"use client";
// Study abroad demo state (favorites, drafts, uploads), shared by the hub and the
// /test labs. Kept in sessionStorage so it survives the generate hand-off.
import { useSyncExternalStore } from "react";
import {
  programRequirements,
  type Program,
  type ToolType,
} from "../student/data";

export type LabState = {
  favorites: string[];
  drafts: Record<string, Partial<Record<ToolType, number>>>;
  uploads: Record<string, Record<string, string>>;
  touched: Record<string, number>;
};

const KEY = "careerhub-card-lab";
const empty: LabState = { favorites: [], drafts: {}, uploads: {}, touched: {} };

export function readLab(): LabState {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

export function writeLab(state: LabState) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Demo still works for this page view without storage.
  }
}

export function addDraft(state: LabState, programId: string, tool: ToolType): LabState {
  const current = state.drafts[programId]?.[tool] || 0;
  return {
    ...state,
    drafts: { ...state.drafts, [programId]: { ...state.drafts[programId], [tool]: current + 1 } },
    touched: { ...state.touched, [programId]: Date.now() },
  };
}

// Tiny external store so the list renders empty on the server and picks up
// sessionStorage on the client without a setState-in-effect.
let cache: LabState | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => (cache ??= readLab());
const setState = (update: (s: LabState) => LabState) => {
  cache = update(snapshot());
  writeLab(cache);
  listeners.forEach((listener) => listener());
};

export function useLab() {
  const state = useSyncExternalStore(subscribe, snapshot, () => empty);

  const touch = (s: LabState, id: string) => ({ ...s.touched, [id]: Date.now() });
  return {
    state,
    toggleFavorite: (id: string) =>
      setState((s) => ({
        ...s,
        favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        touched: touch(s, id),
      })),
    upload: (id: string, requirement: string, filename: string) =>
      setState((s) => ({
        ...s,
        uploads: { ...s.uploads, [id]: { ...s.uploads[id], [requirement]: filename } },
        touched: touch(s, id),
      })),
    saveDraft: (id: string, tool: ToolType) => setState((s) => addDraft(s, id, tool)),
    reset: () => setState(() => empty),
  };
}

export type KitItem = ReturnType<typeof programKit>["items"][number];

export function programKit(program: Program, state: LabState) {
  const items = programRequirements(program).map((r) => {
    const drafts = r.tool ? state.drafts[program.id]?.[r.tool] || 0 : 0;
    const current = drafts + (state.uploads[program.id]?.[r.id] ? 1 : 0);
    return {
      ...r,
      drafts,
      current,
      done: current >= r.count,
      started: current > 0,
      file: state.uploads[program.id]?.[r.id],
    };
  });
  const slots = items.reduce((sum, i) => sum + i.count, 0);
  const prepared = items.reduce((sum, i) => sum + Math.min(i.current, i.count), 0);
  return { items, slots, prepared, started: prepared > 0 };
}

export function generateHref(programId: string, tool: ToolType, variant: string, back?: string) {
  return `/test/generate?program=${programId}&tool=${tool}&from=${variant}${back ? `&back=${encodeURIComponent(back)}` : ""}`;
}
