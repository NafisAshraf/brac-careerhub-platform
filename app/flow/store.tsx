"use client";
// One state machine shared by v4, v5 and v6. Only the screens differ between versions.
//   signup → book a counsellor → answer the short questionnaire → wait for the session
//   → the counsellor marks it complete and chooses what to unlock → the full app opens.
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import {
  assignedCourses, assignedJobs, counsellorById, firstMinutes, firstTasks, pastMinutes, sampleAnswers, slotLabel, upcomingDays, openTimes,
  type Answers, type Minutes, type Note, type Slot, type Task, type Unlockable,
} from "./data";

export type Account = { name: string; email: string; phone: string; university: string; subject: string };
export type Session = { id: string; slot: Slot; status: "upcoming" | "completed" | "cancelled"; minutes?: Minutes; reason?: string; number: number };
export type FlowState = {
  account: Account | null;
  sessions: Session[];
  answers: Answers;
  testDone: boolean;
  unlocked: Unlockable[] | null; // null until the first session is marked complete
  tasks: Task[];
  courses: Record<string, "new" | "started" | "done">;
  savedJobs: string[];
  notes: Note[];
};

const initial: FlowState = { account: null, sessions: [], answers: {}, testDone: false, unlocked: null, tasks: [], courses: {}, savedJobs: [], notes: [] };
let seq = 0;
const note = (n: Omit<Note, "id" | "at">): Note => ({ ...n, id: `n${++seq}`, at: Date.now() + seq });

type Action =
  | { type: "signup"; account: Account }
  | { type: "book"; slot: Slot }
  | { type: "reschedule"; slot: Slot }
  | { type: "cancel"; reason?: string }
  | { type: "answers"; answers: Answers; done?: boolean }
  | { type: "complete"; unlock: Unlockable[] }
  | { type: "remind" }
  | { type: "read"; id?: string }
  | { type: "task"; id: string }
  | { type: "course"; id: string; status: "new" | "started" | "done" }
  | { type: "job"; id: string }
  | { type: "account"; account: Account }
  | { type: "returning" }
  | { type: "reset" };

const upcoming = (s: FlowState) => s.sessions.find((x) => x.status === "upcoming");
const firstName = (name: string) => name.split(" ")[0];

function reduce(s: FlowState, a: Action): FlowState {
  switch (a.type) {
    case "signup":
      return { ...s, account: a.account, notes: [note({ kind: "system", title: `Welcome, ${firstName(a.account.name)}!`, body: "Your first step is a free 30-minute session with a career counsellor." }), ...s.notes] };
    case "book": {
      if (upcoming(s)) return s; // only one upcoming session at a time
      const c = counsellorById(a.slot.counsellor);
      const number = s.sessions.filter((x) => x.status === "completed").length + 1;
      return {
        ...s,
        sessions: [...s.sessions, { id: `s${++seq}`, slot: a.slot, status: "upcoming", number }],
        notes: [note({ kind: "booking", title: `Session booked with ${c.name}`, body: slotLabel(a.slot), go: "session" }),
          note({ kind: "reminder", title: "How you’ll join", body: `We’ll send the meeting link to ${s.account?.email} and ${s.account?.phone} by SMS, the day before and 15 minutes before.` }), ...s.notes],
      };
    }
    case "reschedule": {
      const u = upcoming(s);
      if (!u) return s;
      return { ...s, sessions: s.sessions.map((x) => (x === u ? { ...x, slot: a.slot } : x)),
        notes: [note({ kind: "booking", title: "Session moved", body: `New time: ${slotLabel(a.slot)}`, go: "session" }), ...s.notes] };
    }
    case "cancel": {
      const u = upcoming(s);
      if (!u) return s;
      return { ...s, sessions: s.sessions.map((x) => (x === u ? { ...x, status: "cancelled", reason: a.reason } : x)),
        notes: [note({ kind: "booking", title: "Session cancelled", body: `${slotLabel(u.slot)} with ${counsellorById(u.slot.counsellor).name}. You can book a new time whenever you’re ready.` }), ...s.notes] };
    }
    case "answers": {
      const first = a.done && !s.testDone;
      const u = upcoming(s);
      return { ...s, answers: a.answers, testDone: s.testDone || !!a.done,
        notes: first ? [note({ kind: "test", title: "Answers sent to your counsellor", body: u ? `${counsellorById(u.slot.counsellor).name} will read them before your session.` : "Your counsellor will read them before your session." }), ...s.notes]
          : a.done ? [note({ kind: "test", title: "Your answers were updated", body: "Your counsellor will see the new answers." }), ...s.notes] : s.notes };
    }
    case "remind": {
      const u = upcoming(s);
      if (!u) return s;
      return { ...s, notes: [note({ kind: "reminder", title: "Your meeting link has been sent", body: `Check your email and SMS. Session with ${counsellorById(u.slot.counsellor).name}, ${slotLabel(u.slot)}.`, go: "session" }), ...s.notes] };
    }
    case "complete": {
      const u = upcoming(s);
      if (!u) return s;
      const c = counsellorById(u.slot.counsellor);
      const first = s.unlocked === null;
      const minutes = first ? firstMinutes : pastMinutes;
      const sessions = s.sessions.map((x) => (x === u ? { ...x, status: "completed" as const, minutes } : x));
      if (!first) return { ...s, sessions, notes: [note({ kind: "counsellor", title: `${c.name} shared notes from your session`, go: "sessions" }), ...s.notes] };
      const unlocked = a.unlock;
      const tasks = firstTasks.filter((t) => !t.link || t.link === "profile" || unlocked.includes(t.link));
      const names = unlocked.map((id) => ({ courses: "Courses", jobs: "Jobs", cv: "CV Studio", abroad: "Study Abroad" })[id]);
      return {
        ...s, sessions, unlocked, tasks,
        courses: unlocked.includes("courses") ? Object.fromEntries(assignedCourses.map((x) => [x.id, "new"])) : {},
        notes: [
          note({ kind: "unlock", title: "Your Career Hub is open", body: names.length ? `${c.name} unlocked: ${names.join(", ")}.` : `${c.name} set up your plan.`, go: "home" }),
          note({ kind: "task", title: `${tasks.length} tasks from ${firstName(c.name)}`, body: "See them in My tasks.", go: "tasks" }),
          note({ kind: "counsellor", title: `${c.name} shared notes from your session`, go: "sessions" }),
          ...s.notes],
      };
    }
    case "read":
      return { ...s, notes: s.notes.map((n) => (!a.id || n.id === a.id ? { ...n, read: true } : n)) };
    case "task":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, done: !t.done } : t)) };
    case "course":
      return { ...s, courses: { ...s.courses, [a.id]: a.status } };
    case "job":
      return { ...s, savedJobs: s.savedJobs.includes(a.id) ? s.savedJobs.filter((x) => x !== a.id) : [...s.savedJobs, a.id] };
    case "account":
      return { ...s, account: a.account };
    case "returning":
      return returning();
    case "reset":
      return initial;
  }
}

export const sampleAccount: Account = { name: "Ayesha Rahman", email: "ayesha.rahman@g.bracu.ac.bd", phone: "01712-345678", university: "BRAC University", subject: "Computer Science and Engineering" };

// A student who finished one session three weeks ago and has a follow-up booked.
function returning(): FlowState {
  const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const next = upcomingDays(8).find((d) => openTimes("nusrat", d).length)!;
  const t = (n: Omit<Note, "id" | "at">, read = true) => ({ ...note(n), read });
  return {
    account: sampleAccount,
    answers: sampleAnswers, testDone: true,
    sessions: [
      { id: "s-old1", number: 1, status: "completed", slot: { counsellor: "nusrat", date: day(-21), time: "10:45" }, minutes: firstMinutes },
      { id: "s-old2", number: 2, status: "cancelled", slot: { counsellor: "nusrat", date: day(-9), time: "14:30" }, reason: "Mid-term exam that day" },
      { id: "s-up", number: 2, status: "upcoming", slot: { counsellor: "nusrat", date: next.date, time: openTimes("nusrat", next)[0] } },
    ],
    unlocked: ["courses", "jobs", "cv"],
    tasks: firstTasks.filter((x) => x.link !== "abroad").map((x, i) => ({ ...x, done: i < 2 })),
    courses: { "c-excel": "started", "c-sql": "new", "c-writing": "new" },
    savedJobs: [assignedJobs[0].id],
    notes: [
      t({ kind: "reminder", title: "Session tomorrow? Check your SMS", body: "The meeting link is sent the day before and 15 minutes before.", go: "session" }, false),
      t({ kind: "task", title: "Nusrat added a note to “Make your first CV draft”", body: "“Put the robotics club first, it’s your strongest example.”", go: "tasks" }, false),
      t({ kind: "booking", title: "Follow-up booked with Nusrat Jahan", go: "session" }),
      t({ kind: "counsellor", title: "Nusrat Jahan shared notes from your session", go: "sessions" }),
      t({ kind: "unlock", title: "Your Career Hub is open", body: "Nusrat Jahan unlocked: Courses, Jobs, CV Studio.", go: "home" }),
    ],
  };
}

type Flow = FlowState & {
  dispatch: (a: Action) => void;
  upcoming?: Session;
  phase: "signup" | "pre" | "app";
  unread: number;
};
const Ctx = createContext<Flow | null>(null);
export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, initial);
  const value = useMemo<Flow>(() => ({
    ...state, dispatch, upcoming: upcoming(state),
    phase: !state.account ? "signup" : state.unlocked === null ? "pre" : "app",
    unread: state.notes.filter((n) => !n.read).length,
  }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useFlow() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFlow needs FlowProvider");
  return v;
}
