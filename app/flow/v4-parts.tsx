"use client";
// v4 only: desk calendar, plain step icons, the booked-session card, the meeting link and the language toggle.
import { useEffect, useState } from "react";
import { counsellorById, dayLabel, endTime, fromIso, time12 } from "./data";
import type { Session } from "./store";
import { Avatar, ChangeSession, I } from "./parts";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* A desk calendar open on the session day, with the time on a small note. */
export function DeskCalendar({ date, time }: { date: string; time: string }) {
  const d = fromIso(date);
  return <div className="v4-cal" aria-label={`${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}, ${time12(time)}`} role="img">
    <i /><i />
    <div className="v4-cal-page">
      <span className="v4-cal-month">{months[d.getMonth()]}</span>
      <b className="v4-cal-day">{d.getDate()}</b>
      <span className="v4-cal-week">{weekdays[d.getDay()]}</span>
    </div>
    <span className="v4-cal-note">{time12(time)}</span>
  </div>;
}

/* Two-tone line icons: one outline colour and one soft fill. */
function Icon({ n }: { n: "link" | "join" | "talk" }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg className="v4-ico" viewBox="0 0 32 32" aria-hidden="true">
    {n === "link" && <><rect x="9" y="3" width="14" height="26" rx="3" {...p} /><rect x="12" y="9" width="11" height="8" rx="2" fill="var(--ico-fill)" /><path d="M14.5 13h6M14.5 15.5h3.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /><path d="M14 25h4" {...p} /></>}
    {n === "join" && <><rect x="4" y="7" width="24" height="15" rx="2" {...p} /><rect x="7" y="10" width="18" height="9" rx="1" fill="var(--ico-fill)" /><path d="M2 26h28" {...p} /><path d="M14 13.5l4 2-4 2Z" fill="#fff" /></>}
    {n === "talk" && <><path d="M5 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7l-4 4v-4a3 3 0 0 1-3-3Z" fill="var(--ico-fill)" stroke="none" /><path d="M24 11h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3v4l-4-4h-6a3 3 0 0 1-3-3v-1" {...p} /></>}
  </svg>;
}

// The meeting link is made when the session is booked, so it can be shown right away.
export const meetLink = (s: Session) => {
  const a = "abcdefghijkmnopqrstuvwxyz";
  const h = [...(s.id + s.slot.date + s.slot.time)].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 11);
  const pick = (n: number, k: number) => Array.from({ length: n }, (_, i) => a[(h >> ((i + k) % 24)) % a.length]).join("");
  return `meet.google.com/${pick(3, 0)}-${pick(4, 3)}-${pick(3, 7)}`;
};
export function LinkBox({ s }: { s: Session }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); } }, [copied]);
  const link = meetLink(s);
  return <div className="v4-link">
    <span><small>Your meeting link</small><b>{link}</b></span>
    <button className="fl-btn" onClick={() => { navigator.clipboard?.writeText("https://" + link).catch(() => {}); setCopied(true); }}>{copied ? <><I n="check" s={18} /> Copied</> : "Copy link"}</button>
  </div>;
}

/* The booked session: when, with whom, the link, and what happens on the day. */
export function SessionCard({ s, email, phone }: { s: Session; email: string; phone: string }) {
  const c = counsellorById(s.slot.counsellor);
  const d = fromIso(s.slot.date);
  const when = dayLabel(s.slot.date);
  const day = when === "Today" || when === "Tomorrow" ? when : weekdays[d.getDay()];
  const first = c.name.split(" ")[0];
  const steps = [
    { n: "link" as const, tag: "Done", title: "Your link is ready", body: <>Also sent to <b>{phone}</b> and <b>{email}</b>.</> },
    { n: "join" as const, tag: `${day}, ${time12(s.slot.time)}`, title: "Tap the link to join", body: <>We’ll remind you the day before and 15 minutes before. It opens Google Meet.</> },
    { n: "talk" as const, tag: `${time12(s.slot.time)} – ${endTime(s.slot.time)}`, title: `Talk with ${first}`, body: <>Find a quiet place. {first} will have read your answers.</> },
  ];
  return <section className="fl-card v4-session">
    <div className="v4-session-head">
      <DeskCalendar date={s.slot.date} time={s.slot.time} />
      <div className="v4-session-when">
        <span className="fl-kicker">YOUR SESSION</span>
        <h2>{day}, {d.getDate()} {months[d.getMonth()]}<span>at {time12(s.slot.time)}</span></h2>
        <div className="v4-session-who"><Avatar c={c} size={44} /><span>30 minutes with <b>{c.name}</b><small>{c.title}</small></span></div>
      </div>
    </div>
    <ol className="v4-next">{steps.map((x) => <li key={x.n}>
      <Icon n={x.n} />
      <div><em>{x.tag}</em><strong>{x.title}</strong><p>{x.body}</p>{x.n === "link" && <LinkBox s={s} />}</div>
    </li>)}</ol>
    <ChangeSession />
  </section>;
}

/* English / Bangla switch. Only the switch for now: Bangla text comes later. */
export function LangToggle() {
  const [note, setNote] = useState(false);
  useEffect(() => { if (note) { const t = setTimeout(() => setNote(false), 2600); return () => clearTimeout(t); } }, [note]);
  return <div className="v4-lang">
    <div role="group" aria-label="Language">
      <button aria-pressed="true">English</button>
      <button aria-pressed="false" lang="bn" onClick={() => setNote(true)}>বাংলা</button>
    </div>
    {note && <span className="v4-lang-note" role="status">বাংলা শিগগিরই আসছে · Bangla is coming soon</span>}
  </div>;
}
