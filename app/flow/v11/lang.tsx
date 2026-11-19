"use client";
// v11 is Bangla first, English second. Every string is written as t(bangla, english).
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { fromIso, sessionMinutes } from "../data";

export type Lang = "bn" | "en";
type L = { lang: Lang; setLang: (l: Lang) => void; t: (bn: string, en: string) => string };
const Ctx = createContext<L | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("bn");
  const value = useMemo<L>(() => ({ lang, setLang, t: (bn, en) => (lang === "bn" ? bn : en) }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useL() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useL needs LangProvider");
  return v;
}

/* ---------- Numbers, dates and times in either language ---------- */
const bnDigits = "০১২৩৪৫৬৭৮৯";
export const num = (n: number | string, lang: Lang) => (lang === "bn" ? String(n).replace(/\d/g, (d) => bnDigits[+d]) : String(n));

const wd = { bn: ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"], en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] };
const wdShort = { bn: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
const mo = { bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"], en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] };
const moShort = { bn: mo.bn, en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };

const daysFromToday = (date: string) => {
  const d = fromIso(date), n = new Date();
  return Math.round((d.getTime() - new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()) / 86400000);
};
export const weekday = (date: string, lang: Lang, short = false) => (short ? wdShort : wd)[lang][fromIso(date).getDay()];
// "Today", "Tomorrow", or the weekday.
export function dayWord(date: string, lang: Lang) {
  const diff = daysFromToday(date);
  if (diff === 0) return lang === "bn" ? "আজ" : "Today";
  if (diff === 1) return lang === "bn" ? "আগামীকাল" : "Tomorrow";
  if (diff === -1) return lang === "bn" ? "গতকাল" : "Yesterday";
  return weekday(date, lang);
}
export const dayMonth = (date: string, lang: Lang, short = false) => { const d = fromIso(date); return `${num(d.getDate(), lang)} ${(short ? moShort : mo)[lang][d.getMonth()]}`; };
export const monthOf = (date: string, lang: Lang) => moShort[lang][fromIso(date).getMonth()];
export const dateNum = (date: string, lang: Lang) => num(fromIso(date).getDate(), lang);
// Sunday, 22 November
export const longDay = (date: string, lang: Lang) => `${weekday(date, lang)}, ${dayMonth(date, lang)}`;

export function clock(t: string, lang: Lang) {
  const [h, m] = t.split(":").map(Number);
  const hh = ((h + 11) % 12) + 1, mm = String(m).padStart(2, "0");
  if (lang === "en") return `${hh}:${mm} ${h < 12 ? "AM" : "PM"}`;
  const part = h < 12 ? "সকাল" : h < 15 ? "দুপুর" : h < 18 ? "বিকাল" : "সন্ধ্যা";
  return `${part} ${num(`${hh}:${mm}`, "bn")}`;
}
export function clockEnd(t: string, lang: Lang) {
  const [h, m] = t.split(":").map(Number);
  const e = h * 60 + m + sessionMinutes;
  return clock(`${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`, lang);
}
export const ago = (date: string, lang: Lang) => {
  const d = -daysFromToday(date);
  if (d <= 0) return lang === "bn" ? "আজ" : "today";
  if (d < 7) return lang === "bn" ? `${num(d, "bn")} দিন আগে` : `${d} day${d > 1 ? "s" : ""} ago`;
  const w = Math.round(d / 7);
  return lang === "bn" ? `${num(w, "bn")} সপ্তাহ আগে` : `${w} week${w > 1 ? "s" : ""} ago`;
};
export const inDays = (date: string) => daysFromToday(date);
