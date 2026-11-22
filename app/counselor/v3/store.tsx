"use client";
// Counsellor portal v3 state. Everything saves as it changes: there is no "send" step, because
// a counsellor sets a student up once and comes back to change things whenever needed.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { students as seed, type Student } from "./db";

type Ctx = { students: Student[]; update: (id: string, f: (s: Student) => Student, msg?: string) => void; saved: { text: string; n: number } | null };
const C = createContext<Ctx | null>(null);

export function DeskProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(seed);
  const [saved, setSaved] = useState<Ctx["saved"]>(null);
  const update = useCallback((id: string, f: (s: Student) => Student, msg = "Saved. The student sees it straight away.") => {
    setStudents((l) => l.map((s) => (s.id === id ? f(s) : s)));
    setSaved((x) => ({ text: msg, n: (x?.n ?? 0) + 1 }));
  }, []);
  const value = useMemo(() => ({ students, update, saved }), [students, update, saved]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useDesk = () => { const v = useContext(C); if (!v) throw new Error("DeskProvider missing"); return v; };
