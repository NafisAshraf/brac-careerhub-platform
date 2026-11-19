"use client";
// State for the counsellor panel demo. Everything stays in memory.
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { students as seed, today, type Assigned, type Student, type Suggestion } from "./data";
import type { Unlockable } from "../flow/data";

export type CNote = { id: string; title: string; body?: string; when: string; read?: boolean; student?: string; tab?: string };
type State = { students: Student[]; notes: CNote[]; blocked: string[]; days: number[]; toast: string | null; toastId: number };

const first = (n: string) => n.split(" ")[0];
const initial: State = {
  students: seed, blocked: [`${today}|16:00`], days: [0, 1, 2, 3, 4], toast: null, toastId: 0,
  notes: [
    { id: "n1", title: "Session with Ayesha Rahman at 10:45 AM", body: "First session. Her AI brief and suggestions are ready.", when: "Now", student: "ayesha", tab: "overview" },
    { id: "n2", title: "AI suggestions ready for Arif Khan", body: "12 suggestions from his answers. Only you can see them.", when: "1 h ago", student: "arif", tab: "plan" },
    { id: "n3", title: "Tahmid Chowdhury is waiting for his plan", body: "Session was yesterday. Students get their plan within 2 days.", when: "Yesterday", student: "tahmid", tab: "plan" },
    { id: "n4", title: "Nabila Sultana cancelled", body: "Reason: Mid-term exam that day.", when: "2 days ago", student: "nabila", tab: "sessions", read: true },
    { id: "n5", title: "Sadia Islam finished “Make your first CV draft”", when: "3 days ago", student: "sadia", tab: "progress", read: true },
  ],
};

type Action =
  | { type: "sendPlan"; id: string; unlock: Unlockable[]; items: Suggestion[]; notes: string }
  | { type: "complete"; id: string; outcome: "completed" | "no-show"; notes?: string }
  | { type: "reschedule"; id: string; date: string; time: string }
  | { type: "cancel"; id: string; reason: string }
  | { type: "book"; id: string; date: string; time: string }
  | { type: "remind" | "nudge"; id: string }
  | { type: "message"; id: string; text: string }
  | { type: "block"; key: string }
  | { type: "day"; weekday: number }
  | { type: "private"; id: string; text: string }
  | { type: "addItems"; id: string; items: Suggestion[]; unlock: Unlockable[] }
  | { type: "read" }
  | { type: "toast"; text: string | null };

let seq = 100;
const upd = (s: State, id: string, f: (x: Student) => Student) => s.students.map((x) => (x.id === id ? f(x) : x));
const say = (s: State, text: string): State => ({ ...s, toast: text, toastId: s.toastId + 1 });
const find = (s: State, id: string) => s.students.find((x) => x.id === id)!;

function reduce(s: State, a: Action): State {
  switch (a.type) {
    case "sendPlan": {
      const st = find(s, a.id);
      const plan: Assigned = { unlock: a.unlock, items: a.items.map((x) => ({ ...x, state: x.kind === "task" ? undefined : x.kind === "job" ? "New" : "Not started" })), sentOn: today };
      const students = upd(s, a.id, (x) => ({
        ...x, status: "active", plan, next: undefined, lastActive: "Today",
        sessions: x.sessions.map((r) => (r.status === "upcoming" && r.date <= today ? { ...r, status: "completed", notes: a.notes } : r.status === "completed" && !r.notes ? { ...r, notes: a.notes } : r)),
      }));
      return say({ ...s, students }, `Plan sent to ${first(st.name)}. Their Career Hub is open now, and they’ve been told by email and SMS.`);
    }
    case "complete": {
      const st = find(s, a.id);
      const students = upd(s, a.id, (x) => ({
        ...x, status: a.outcome === "no-show" ? "cancelled" : x.plan ? "active" : "plan", next: undefined,
        sessions: x.sessions.map((r) => (r.status === "upcoming" ? { ...r, status: a.outcome, notes: a.notes } : r)),
      }));
      return say({ ...s, students }, a.outcome === "no-show" ? `Marked as missed. ${first(st.name)} was invited to book again.` : `Session marked complete.${st.plan ? "" : " Next: send the plan."}`);
    }
    case "reschedule":
      return say({ ...s, students: upd(s, a.id, (x) => ({ ...x, next: { date: a.date, time: a.time }, sessions: x.sessions.map((r) => (r.status === "upcoming" ? { ...r, date: a.date, time: a.time } : r)) })) },
        `Moved. ${first(find(s, a.id).name)} was told by email and SMS.`);
    case "book":
      return say({ ...s, students: upd(s, a.id, (x) => ({ ...x, status: x.plan ? "active" : x.status === "cancelled" ? "booked" : x.status, next: { date: a.date, time: a.time },
        sessions: [...x.sessions, { date: a.date, time: a.time, kind: x.sessions.some((r) => r.status === "completed") ? "Follow-up" : "First session", status: "upcoming" }] })) },
        `Booked. ${first(find(s, a.id).name)} gets the details by email and SMS.`);
    case "cancel":
      return say({ ...s, students: upd(s, a.id, (x) => ({ ...x, status: x.plan ? "active" : "cancelled", next: undefined, sessions: x.sessions.map((r) => (r.status === "upcoming" ? { ...r, status: "cancelled", reason: a.reason } : r)) })) },
        `Cancelled. ${first(find(s, a.id).name)} was told and asked to pick a new time.`);
    case "remind":
      return say(s, `Reminder sent to ${first(find(s, a.id).name)} by email and SMS.`);
    case "nudge":
      return say({ ...s, students: upd(s, a.id, (x) => ({ ...x, status: x.status === "quiet" ? "active" : x.status })) }, `Friendly check-in sent to ${first(find(s, a.id).name)}.`);
    case "message":
      return say(s, `Message sent to ${first(find(s, a.id).name)} by email and SMS.`);
    case "block":
      return { ...s, blocked: s.blocked.includes(a.key) ? s.blocked.filter((k) => k !== a.key) : [...s.blocked, a.key] };
    case "day":
      return { ...s, days: s.days.includes(a.weekday) ? s.days.filter((d) => d !== a.weekday) : [...s.days, a.weekday].sort() };
    case "private":
      return { ...s, students: upd(s, a.id, (x) => ({ ...x, privateNote: a.text })) };
    case "addItems":
      return say({ ...s, students: upd(s, a.id, (x) => (x.plan ? { ...x, plan: { ...x.plan, unlock: [...new Set([...x.plan.unlock, ...a.unlock])], items: [...x.plan.items, ...a.items.map((i) => ({ ...i, id: i.id + ++seq }))] } } : x)) },
        `Added to ${first(find(s, a.id).name)}’s plan. They’ll get a notification.`);
    case "read":
      return { ...s, notes: s.notes.map((n) => ({ ...n, read: true })) };
    case "toast":
      return { ...s, toast: a.text, toastId: s.toastId + 1 };
  }
}

type Ctx = State & { dispatch: (a: Action) => void; unread: number };
const C = createContext<Ctx | null>(null);
export function CounselorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, initial);
  const value = useMemo(() => ({ ...state, dispatch, unread: state.notes.filter((n) => !n.read).length }), [state]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useDesk = () => { const v = useContext(C); if (!v) throw new Error("CounselorProvider missing"); return v; };
