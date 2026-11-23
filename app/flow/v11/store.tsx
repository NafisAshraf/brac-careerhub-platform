"use client";
// v11 state. The same journey as v4 (sign up → book → answer → meet → hub), plus:
// booking later sessions with the same or another counsellor, a gentle prompt to update
// your answers after each booking, simple to-dos, and notifications in both languages.
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { assignedCourses, assignedJobs, counsellorById, openTimes, upcomingDays, type Slot, type Unlockable } from "../data";
import { num } from "./lang";
import { cf, cn, counsellorTasks, minutesFirst, minutesSecond, sampleAnswers, tx, type Answers, type Minutes, type Task, type Txt } from "./content";

export type Account = { name: string; email: string; phone: string; university: string; subject: string };
export type Session = { id: string; slot: Slot; status: "upcoming" | "completed" | "cancelled"; minutes?: Minutes; number: number };
export type Note = { id: string; kind: "booking" | "reminder" | "counsellor" | "unlock" | "task" | "system"; title: Txt; body?: Txt; at: number; read?: boolean; go?: string };
export type State = {
  account: Account | null;
  sessions: Session[];
  answers: Answers;
  testDone: boolean;
  unlocked: Unlockable[] | null; // null until the first session is marked complete
  tasks: Task[];
  courses: Record<string, "new" | "started" | "done">;
  savedJobs: string[];
  notes: Note[];
  askUpdate: boolean; // after booking a later session: "anything new to tell your counsellor?"
};
const initial: State = { account: null, sessions: [], answers: {}, testDone: false, unlocked: null, tasks: [], courses: {}, savedJobs: [], notes: [], askUpdate: false };

let seq = 0;
const note = (n: Omit<Note, "id" | "at">, read = false): Note => ({ ...n, id: `n${++seq}`, at: Date.now() + seq, read });
const iso = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export type Action =
  | { type: "signup"; account: Account }
  | { type: "book"; slot: Slot }
  | { type: "reschedule"; slot: Slot }
  | { type: "cancel" }
  | { type: "answers"; answers: Answers; done?: boolean }
  | { type: "complete"; unlock: Unlockable[] }
  | { type: "remind" }
  | { type: "read"; id?: string }
  | { type: "task"; id: string }
  | { type: "addTask"; title: string }
  | { type: "removeTask"; id: string }
  | { type: "course"; id: string; status: "new" | "started" | "done" }
  | { type: "job"; id: string }
  | { type: "account"; account: Account }
  | { type: "dismissUpdate" }
  | { type: "unlock"; id: Unlockable }
  | { type: "returning" }
  | { type: "reset" };

const upcomingOf = (s: State) => s.sessions.find((x) => x.status === "upcoming");

function reduce(s: State, a: Action): State {
  switch (a.type) {
    case "signup":
      return { ...s, account: a.account, notes: [note({ kind: "system", title: tx("স্বাগতম!", "Welcome!"), body: tx("প্রথম ধাপ: একজন কাউন্সেলরের সাথে ৩০ মিনিটের ফ্রি সেশন।", "Your first step is a free 30-minute session with a counsellor.") }), ...s.notes] };
    case "book": {
      if (upcomingOf(s)) return s;
      const c = counsellorById(a.slot.counsellor);
      const later = s.unlocked !== null; // a follow-up, not the first session
      const number = s.sessions.filter((x) => x.status === "completed").length + 1;
      return { ...s, askUpdate: later,
        sessions: [...s.sessions, { id: `s${++seq}`, slot: a.slot, status: "upcoming", number }],
        notes: [note({ kind: "booking", title: tx(`${cn(c, "bn")}ের সাথে সেশন বুক হয়েছে`, `Session booked with ${c.name}`), body: tx("মিটিং লিংক SMS ও ইমেইলে পাঠানো হয়েছে।", "The meeting link was sent by SMS and email."), go: "home" }), ...s.notes] };
    }
    case "reschedule": {
      const u = upcomingOf(s);
      if (!u) return s;
      return { ...s, sessions: s.sessions.map((x) => (x === u ? { ...x, slot: a.slot } : x)), notes: [note({ kind: "booking", title: tx("সেশনের সময় বদলানো হয়েছে", "Session moved"), go: "home" }), ...s.notes] };
    }
    case "cancel": {
      const u = upcomingOf(s);
      if (!u) return s;
      return { ...s, askUpdate: false, sessions: s.sessions.map((x) => (x === u ? { ...x, status: "cancelled" } : x)), notes: [note({ kind: "booking", title: tx("সেশন বাতিল হয়েছে", "Session cancelled"), body: tx("যখন সুবিধা, নতুন সময় বুক করুন।", "Book a new time whenever you’re ready.") }), ...s.notes] };
    }
    case "answers":
      return { ...s, answers: a.answers, testDone: s.testDone || !!a.done, askUpdate: false };
    case "remind": {
      const u = upcomingOf(s);
      if (!u) return s;
      return { ...s, notes: [note({ kind: "reminder", title: tx("সেশনের রিমাইন্ডার পাঠানো হয়েছে", "Session reminder sent"), body: tx("মিটিং লিংক SMS ও ইমেইলে আছে।", "The meeting link is in your SMS and email."), go: "home" }), ...s.notes] };
    }
    case "complete": {
      const u = upcomingOf(s);
      if (!u) return s;
      const c = counsellorById(u.slot.counsellor);
      const first = s.unlocked === null;
      const sessions = s.sessions.map((x) => (x === u ? { ...x, status: "completed" as const, minutes: first ? minutesFirst : minutesSecond } : x));
      const sharedNotes = note({ kind: "counsellor", title: tx(`${cn(c, "bn")} সেশনের নোট শেয়ার করেছেন`, `${c.name} shared notes from your session`), go: "home" });
      if (!first) return { ...s, sessions, notes: [sharedNotes, ...s.notes] };
      return { ...s, sessions, unlocked: a.unlock, tasks: counsellorTasks.map((t) => ({ ...t })),
        courses: a.unlock.includes("courses") ? Object.fromEntries(assignedCourses.map((x) => [x.id, "new"])) : {},
        notes: [note({ kind: "unlock", title: tx("আপনার ক্যারিয়ার হাব খুলে গেছে", "Your Career Hub is open"), go: "home" }),
          note({ kind: "task", title: tx(`${cf(c, "bn")} ${num(counsellorTasks.length, "bn")}টি কাজ দিয়েছেন`, `${counsellorTasks.length} tasks from ${c.name.split(" ")[0]}`), go: "tasks" }), sharedNotes, ...s.notes] };
    }
    case "read":
      return { ...s, notes: s.notes.map((n) => (!a.id || n.id === a.id ? { ...n, read: true } : n)) };
    case "task":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, done: !t.done } : t)) };
    case "addTask":
      return { ...s, tasks: [...s.tasks, { id: `m${++seq}`, title: tx(a.title, a.title), due: 7, mine: true }] };
    case "removeTask":
      return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id) };
    case "course":
      return { ...s, courses: { ...s.courses, [a.id]: a.status } };
    case "job":
      return { ...s, savedJobs: s.savedJobs.includes(a.id) ? s.savedJobs.filter((x) => x !== a.id) : [...s.savedJobs, a.id] };
    case "account":
      return { ...s, account: a.account };
    case "dismissUpdate":
      return { ...s, askUpdate: false };
    case "unlock":
      return { ...s, unlocked: [...new Set([...(s.unlocked ?? []), a.id])], notes: [note({ kind: "unlock", title: tx("নতুন বিভাগ খুলেছে: বিদেশে পড়াশোনা", "New section open: Study Abroad"), go: "abroad" }), ...s.notes] };
    case "returning":
      return returning();
    case "reset":
      return initial;
  }
}

export const sampleAccount: Account = { name: "Ayesha Rahman", email: "ayesha.rahman@g.bracu.ac.bd", phone: "01712-345678", university: "BRAC University", subject: "Computer Science and Engineering" };

// A student two sessions in, with nothing booked yet: the moment to book the next one.
function returning(): State {
  const tasks = counsellorTasks.map((t, i) => ({ ...t, done: i === 0 || i === 1 }));
  return {
    account: sampleAccount, answers: sampleAnswers, testDone: true, askUpdate: false,
    sessions: [
      { id: "r1", number: 1, status: "completed", slot: { counsellor: "nusrat", date: iso(-42), time: "10:45" }, minutes: minutesFirst },
      { id: "r2", number: 2, status: "cancelled", slot: { counsellor: "nusrat", date: iso(-24), time: "14:30" } },
      { id: "r3", number: 2, status: "completed", slot: { counsellor: "nusrat", date: iso(-17), time: "15:15" }, minutes: minutesSecond },
    ],
    unlocked: ["courses", "jobs", "cv", "abroad"],
    tasks: [...tasks, { id: "m-own", title: tx("BRAC Career Fair-এ নাম লেখানো", "Register for the BRAC Career Fair"), due: 4, mine: true }],
    courses: { "c-excel": "started", "c-sql": "new", "c-writing": "done" },
    savedJobs: [assignedJobs[0].id],
    notes: [
      note({ kind: "counsellor", title: tx("নুসরাত সেশনের নোট শেয়ার করেছেন", "Nusrat shared notes from your session"), go: "home" }),
      note({ kind: "task", title: tx("নতুন কাজ: রবিবারের মধ্যে bKash-এ আবেদন", "New task: apply to bKash by Sunday"), go: "tasks" }, true),
      note({ kind: "unlock", title: tx("আপনার ক্যারিয়ার হাব খুলে গেছে", "Your Career Hub is open"), go: "home" }, true),
    ],
  };
}
// The first open time for a counsellor, used by "earliest" shortcuts.
export const firstOpen = (counsellor: string) => { for (const d of upcomingDays(8)) { const t = openTimes(counsellor, d)[0]; if (t) return { counsellor, date: d.date, time: t } as Slot; } return null; };

type Flow = State & { dispatch: (a: Action) => void; upcoming?: Session; phase: "signup" | "pre" | "app"; unread: number; last?: Session };
const Ctx = createContext<Flow | null>(null);
export function Store({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, initial);
  const value = useMemo<Flow>(() => ({
    ...state, dispatch, upcoming: upcomingOf(state),
    last: [...state.sessions].reverse().find((x) => x.status === "completed"),
    phase: !state.account ? "signup" : state.unlocked === null ? "pre" : "app",
    unread: state.notes.filter((n) => !n.read).length,
  }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useHub() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHub needs Store");
  return v;
}
