"use client";
// v4 only: the booked-session card, the meeting link and the language toggle.
import { useEffect, useState } from "react";
import { counsellorById, dayLabel, fromIso, time12 } from "./data";
import type { Session } from "./store";
import { Avatar, ChangeSession, I } from "./parts";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

/* The booked session, said once: when, with whom, and the link. */
export function SessionCard({ s, phone }: { s: Session; email?: string; phone: string }) {
  const c = counsellorById(s.slot.counsellor);
  const d = fromIso(s.slot.date);
  const when = dayLabel(s.slot.date);
  const day = when === "Today" || when === "Tomorrow" ? when : weekdays[d.getDay()];
  return <section className="fl-card v4-session">
    <span className="fl-kicker">YOUR SESSION</span>
    <div className="v4-session-head">
      <Avatar c={c} size={64} />
      <div>
        <h2>{day}, {d.getDate()} {months[d.getMonth()]} at {time12(s.slot.time)}</h2>
        <p>30 minutes with <b>{c.name}</b> on Google Meet</p>
      </div>
    </div>
    <LinkBox s={s} />
    <p className="v4-session-note">Also sent to your phone ({phone}) and email. We’ll remind you before it starts.</p>
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
