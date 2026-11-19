"use client";
// v4 only: the desk calendar, the three spot illustrations, the session card and the language toggle.
import { useEffect, useState } from "react";
import { counsellorById, dayLabel, endTime, fromIso, time12 } from "./data";
import type { Session } from "./store";
import { Avatar, ChangeSession, I } from "./parts";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* A tear-off desk calendar, open on the session day, with the time on a sticky note. */
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

/* Spot illustrations: flat shapes with a dark outline, in the Career Hub colours. */
const ink = "#2a1a35";
function ArtMessage() {
  return <svg viewBox="0 0 96 96" aria-hidden="true">
    <circle cx="48" cy="50" r="40" fill="#f1e6f7" />
    <rect x="22" y="12" width="36" height="66" rx="8" fill="#fff" stroke={ink} strokeWidth="2.2" />
    <rect x="34" y="17" width="12" height="3.5" rx="1.75" fill={ink} />
    <rect x="27" y="28" width="26" height="17" rx="5" fill="#fde3ef" />
    <path d="M31 34h17M31 39h11" stroke="#d4146e" strokeWidth="2.2" strokeLinecap="round" />
    <rect x="46" y="50" width="38" height="26" rx="4" fill="#ffc94d" stroke={ink} strokeWidth="2.2" />
    <path d="M47 52l18 13 18-13" fill="none" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="82" cy="47" r="7" fill="#d4146e" stroke="#fff" strokeWidth="2.5" />
  </svg>;
}
function ArtJoin() {
  return <svg viewBox="0 0 96 96" aria-hidden="true">
    <circle cx="48" cy="50" r="40" fill="#fff1d1" />
    <rect x="14" y="20" width="68" height="46" rx="5" fill="#fff" stroke={ink} strokeWidth="2.2" />
    <rect x="19" y="25" width="28" height="25" rx="3" fill="#59217a" />
    <rect x="49" y="25" width="28" height="25" rx="3" fill="#ffb3d2" />
    <circle cx="33" cy="34" r="4.5" fill="#ffd9b8" /><path d="M25 50c0-8 16-8 16 0Z" fill="#ffd9b8" />
    <circle cx="63" cy="34" r="4.5" fill="#8a5a3c" /><path d="M55 50c0-8 16-8 16 0Z" fill="#59217a" />
    <circle cx="40" cy="58" r="2.6" fill="#cfc2d9" /><circle cx="48" cy="58" r="3.2" fill="#e5484d" /><circle cx="56" cy="58" r="2.6" fill="#cfc2d9" />
    <path d="M6 70h84l-6 8H12Z" fill="#e6dcef" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" />
    <rect x="58" y="6" width="32" height="13" rx="6.5" fill="#d4146e" />
    <path d="M65 12.5h4M73 12.5h11" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
}
function ArtTalk() {
  return <svg viewBox="0 0 96 96" aria-hidden="true">
    <circle cx="48" cy="50" r="40" fill="#e2f4ea" />
    <path d="M30 44c-3-4 0-7 0-11M40 44c-3-4 0-7 0-11" fill="none" stroke="#59217a" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M18 52h34v9a13 13 0 0 1-13 13h-8a13 13 0 0 1-13-13Z" fill="#fff" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M52 56a6 6 0 0 1 0 12" fill="none" stroke={ink} strokeWidth="2.2" />
    <path d="M12 80h46" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 61h22" stroke="#17845f" strokeWidth="2.2" strokeLinecap="round" />
    <rect x="50" y="14" width="38" height="22" rx="9" fill="#59217a" />
    <path d="M58 36l-3 8 10-8Z" fill="#59217a" />
    <circle cx="61" cy="25" r="2.3" fill="#fff" /><circle cx="69" cy="25" r="2.3" fill="#fff" /><circle cx="77" cy="25" r="2.3" fill="#fff" />
    <rect x="62" y="42" width="26" height="15" rx="7" fill="#fff" stroke={ink} strokeWidth="2" />
    <path d="M68 49.5h14" stroke="#d4146e" strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
}

// The day before the session, said the way a person would say it.
function dayBefore(date: string) {
  const d = fromIso(date);
  d.setDate(d.getDate() - 1);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const l = dayLabel(iso);
  return l === "Today" || l === "Tomorrow" ? l : `${weekdays[d.getDay()]}`;
}

/* The booked session: when, with whom, and what happens next, in order. */
export function SessionCard({ s, email, phone }: { s: Session; email: string; phone: string }) {
  const c = counsellorById(s.slot.counsellor);
  const d = fromIso(s.slot.date);
  const when = dayLabel(s.slot.date);
  const steps = [
    { art: <ArtMessage />, tag: `${dayBefore(s.slot.date)}, the day before`, title: "We send you the link", body: <>By SMS to <b>{phone}</b> and by email to <b>{email}</b>. Again 15 minutes before.</> },
    { art: <ArtJoin />, tag: `${when === "Today" || when === "Tomorrow" ? when : weekdays[d.getDay()]} at ${time12(s.slot.time)}`, title: "Tap the link to join", body: <>It opens Google Meet on your phone or laptop. Nothing to install.</> },
    { art: <ArtTalk />, tag: `${time12(s.slot.time)} to ${endTime(s.slot.time)}`, title: `Talk with ${c.name.split(" ")[0]}`, body: <>Find a quiet place. {c.name.split(" ")[0]} will have read your answers already.</> },
  ];
  return <section className="v4-session">
    <div className="v4-session-head">
      <DeskCalendar date={s.slot.date} time={s.slot.time} />
      <div className="v4-session-when">
        <span className="fl-kicker">YOUR SESSION</span>
        <h2>{when === "Today" || when === "Tomorrow" ? when : weekdays[d.getDay()]}, {d.getDate()} {months[d.getMonth()]}<br /><span>at {time12(s.slot.time)}</span></h2>
        <p><I n="clock" s={18} /> 30 minutes, online on Google Meet</p>
        <div className="v4-session-who">
          <Avatar c={c} size={60} />
          <div><small>With your counsellor</small><strong>{c.name}</strong><span>{c.title}</span></div>
        </div>
      </div>
    </div>
    <h3 className="v4-session-sub">What happens next</h3>
    <ol className="v4-next">{steps.map((x, k) => <li key={k} style={{ ["--d" as string]: `${k * 0.12}s` }}>
      <div className="v4-next-art">{x.art}<span>{k + 1}</span></div>
      <em>{x.tag}</em><strong>{x.title}</strong><p>{x.body}</p>
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
