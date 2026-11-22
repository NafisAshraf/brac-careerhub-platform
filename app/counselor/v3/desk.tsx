"use client";
// Counsellor portal v3 (/counselor/v3). A counsellor meets the student (online or in person),
// then sets up what the student gets — courses, jobs, tasks, the meeting summary, access — and
// comes back to change it any time. Three places: Today, Students, Calendar.
import { useEffect, useState } from "react";
import Image from "next/image";
import { counsellorById, dayLabel, endTime, fromIso, isTaken, longDate, shortDate, slotTimes, time12, upcomingDays } from "../../flow/data";
import { Avatar, Dialog, I } from "../../flow/parts";
import { DeskProvider, useDesk } from "./store";
import { day, today, type Meeting, type Student } from "./db";
import { StudentPage, type Section } from "./student";
import "../../flow/flow.css";
import "../v2/v2.css";
import "./v3.css";

export const me = counsellorById("nusrat");
type Page = "today" | "students" | "calendar" | "student";
export type Go = (page: Page, id?: string, section?: Section) => void;
export const first = (s: { name: string }) => s.name.split(" ")[0];
export const when = (d: string, t: string) => `${dayLabel(d)}${["Today", "Tomorrow"].includes(dayLabel(d)) ? "" : " " + shortDate(d)}, ${time12(t)}`;

export default function CounselorV3() {
  const [signedIn, setSignedIn] = useState(false);
  return <DeskProvider>{signedIn ? <Desk out={() => setSignedIn(false)} /> : <SignIn onIn={() => setSignedIn(true)} />}</DeskProvider>;
}

function SignIn({ onIn }: { onIn: () => void }) {
  return <div className="fl c2-sign">
    <form className="fl-card c2-sign-card" onSubmit={(e) => { e.preventDefault(); onIn(); }}>
      <Image src="/careerhub-logo.png" width={96} height={86} alt="BRAC Career Hub" />
      <span className="fl-kicker">COUNSELLOR PORTAL</span>
      <h1>Sign in</h1>
      <p>For BRAC Career Hub counsellors. Students sign in on the main site.</p>
      <label className="fl-field"><span>Work email</span><input type="email" defaultValue="nusrat.jahan@brac.net" /></label>
      <button className="fl-btn fl-primary wide">Continue <I n="arrow" s={18} /></button>
      <small className="fl-muted">Demo: no password needed. You’ll be signed in as {me.name}.</small>
    </form>
  </div>;
}

function Desk({ out }: { out: () => void }) {
  const [page, setPage] = useState<Page>("today");
  const [sid, setSid] = useState("ayesha");
  const [section, setSection] = useState<Section>("profile");
  const [menu, setMenu] = useState(false);
  const [visit, setVisit] = useState(0);
  const go: Go = (p, id, s) => { setPage(p); if (id) setSid(id); setSection(s ?? "profile"); setMenu(false); setVisit((v) => v + 1); window.scrollTo({ top: 0 }); };
  const side = <>
    <div className="fl-brand"><Image src="/careerhub-logo.png" width={96} height={86} alt="BRAC Career Hub" /></div>
    <nav aria-label="Counsellor portal">
      <span className="fl-nav-label">Counsellor</span>
      {([["today", "Today", "home"], ["students", "Students", "user"], ["calendar", "Calendar", "calendar"]] as [Page, string, string][]).map(([id, label, icon]) =>
        <button key={id} className={"fl-nav" + (page === id || (id === "students" && page === "student") ? " is-on" : "")} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}><I n={icon} /><span>{label}</span></button>)}
    </nav>
    <div className="fl-side-foot">
      <div className="fl-me"><Avatar c={me} size={38} /><div><strong>{me.name}</strong><small>{me.title}</small></div></div>
      <button className="fl-link" onClick={out}>← Sign out</button>
    </div>
  </>;
  return <div className="fl fl-app c2 c3">
    <aside className="fl-side">{side}</aside>
    {menu && <div className="fl-drawer" role="dialog" aria-modal="true" aria-label="Menu"><div className="fl-drawer-in"><button className="fl-icon-btn fl-drawer-x" aria-label="Close menu" onClick={() => setMenu(false)}><I n="x" /></button>{side}</div><button className="fl-drawer-scrim" aria-label="Close menu" onClick={() => setMenu(false)} /></div>}
    <div className="fl-app-main">
      <header className="fl-top">
        <button className="fl-btn ghost fl-menu-btn" onClick={() => setMenu(true)}><I n="menu" /> Menu</button>
        <Search go={go} />
      </header>
      <main className="fl-page">
        <div className="c2-enter" key={page + visit}>
          {page === "today" && <Today go={go} />}
          {page === "students" && <Students go={go} />}
          {page === "calendar" && <Calendar go={go} />}
          {page === "student" && <StudentPage id={sid} start={section} go={go} />}
        </div>
      </main>
    </div>
    <Saved />
  </div>;
}

export function Head({ kicker, title, body, children }: { kicker: string; title: string; body?: string; children?: React.ReactNode }) {
  return <header className="fl-head"><div><span className="fl-kicker">{kicker}</span><h1>{title}</h1>{body && <p>{body}</p>}</div>{children}</header>;
}
export function Av({ s, size = 40 }: { s: Student; size?: number }) {
  return <span className="fl-avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: s.tone }} aria-hidden="true">{s.initials}</span>;
}
export const Mode = ({ m }: { m: Meeting }) => <span className={"c3-mode" + (m.mode === "online" ? " is-online" : "")}><I n={m.mode === "online" ? "video" : "user"} s={14} /> {m.mode === "online" ? "Google Meet" : "In person"}</span>;
export const statusLabel = { upcoming: "Booked", done: "Done", missed: "Didn’t join", cancelled: "Cancelled" } as const;
export const statusTone = { upcoming: "is-blue", done: "is-green", missed: "is-amber", cancelled: "is-red" } as const;

function Search({ go }: { go: Go }) {
  const { students } = useDesk();
  const [q, setQ] = useState("");
  const hits = q ? students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) : [];
  return <div className="c2-search">
    <I n="user" s={17} />
    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a student" aria-label="Find a student" />
    {hits.length > 0 && <ul>{hits.map((s) => <li key={s.id}><button onClick={() => { setQ(""); go("student", s.id); }}><Av s={s} size={28} /><span><b>{s.name}</b><small>{s.subject}</small></span></button></li>)}</ul>}
  </div>;
}

function Saved() {
  const { saved } = useDesk();
  const [hidden, setHidden] = useState(-1);
  useEffect(() => { if (!saved) return; const t = setTimeout(() => setHidden(saved.n), 2600); return () => clearTimeout(t); }, [saved]);
  if (!saved || hidden === saved.n) return null;
  return <div className="c2-toast" role="status" key={saved.n}><I n="check" s={16} />{saved.text}</div>;
}

/* ---------- Today: the next session, the day's schedule, what's coming ---------- */
function Today({ go }: { go: Go }) {
  const { students } = useDesk();
  const mine = students.flatMap((s) => s.meetings.filter((m) => m.counsellor === me.id).map((m) => ({ s, m })));
  const todays = mine.filter((x) => x.m.date === today && x.m.status !== "cancelled").sort((a, b) => a.m.time.localeCompare(b.m.time));
  const later = mine.filter((x) => x.m.date > today && x.m.status === "upcoming").sort((a, b) => (a.m.date + a.m.time).localeCompare(b.m.date + b.m.time));
  const next = todays.find((x) => x.m.status === "upcoming");
  const table = (rows: typeof mine, withDate: boolean) => <table className="c2-table">
    <thead><tr><th>{withDate ? "When" : "Time"}</th><th>Student</th><th>Where</th><th>Sessions before</th><th>Status</th></tr></thead>
    <tbody>{rows.map(({ s, m }) => {
      const prev = s.meetings.filter((x) => x.status === "done" && x.id !== m.id && x.date <= m.date).length;
      return <tr key={m.id} className="is-click" onClick={() => go("student", s.id)}>
        <td><b>{withDate ? when(m.date, m.time) : time12(m.time)}</b></td>
        <td><span className="c2-who-cell"><Av s={s} size={32} /><span><b>{s.name}</b><small>{s.subject} · {s.year}</small></span></span></td>
        <td><Mode m={m} /></td>
        <td className="fl-muted">{prev ? `${prev}` : "First session"}</td>
        <td><span className={"c2-status " + statusTone[m.status]}>{statusLabel[m.status]}</span></td>
      </tr>;
    })}</tbody>
  </table>;
  return <>
    <Head kicker={longDate(today).toUpperCase()} title={`Good morning, ${first(me)}`} body={`${todays.length} session${todays.length === 1 ? "" : "s"} today.`} />
    {next ? <section className="fl-card fl-upcoming c2-next c3-next">
      <div className="fl-upcoming-head">
        <div className="fl-date-tile"><small>NEXT</small><b>{time12(next.m.time).split(" ")[0]}</b><small>{time12(next.m.time).split(" ")[1]}</small></div>
        <div><span className="fl-kicker">UP NEXT · UNTIL {endTime(next.m.time)}</span><h2>{next.s.name}</h2><p>{next.s.subject} · {next.s.year}</p></div>
        <Av s={next.s} size={52} />
      </div>
      <div className="fl-row">
        {next.m.mode === "online" ? <a className="fl-btn fl-primary" href="https://meet.google.com/" target="_blank" rel="noreferrer"><I n="video" s={18} /> Join Google Meet</a>
          : <span className="c3-inperson"><I n="user" s={17} /> In person at Career Hub, Mohakhali</span>}
        <button className="fl-btn" onClick={() => go("student", next.s.id)}>Open {first(next.s)}’s profile</button>
      </div>
    </section> : <section className="fl-card c3-next"><span className="fl-kicker">UP NEXT</span><h2>No more sessions today</h2></section>}
    <section className="fl-card c2-table-card"><span className="fl-kicker">TODAY’S SCHEDULE</span>{todays.length ? table(todays, false) : <p className="fl-muted c2-empty">No sessions today.</p>}</section>
    {later.length > 0 && <section className="fl-card c2-table-card"><span className="fl-kicker">COMING UP</span>{table(later, true)}</section>}
  </>;
}

/* ---------- Students ---------- */
function Students({ go }: { go: Go }) {
  const { students } = useDesk();
  return <>
    <Head kicker="STUDENTS" title="Students" body="Everyone who has booked with you or another counsellor. Open a student to see and update their plan." />
    <section className="fl-card c2-table-card">
      <table className="c2-table">
        <thead><tr><th>Student</th><th>Sessions</th><th>Next session</th><th>Plan</th></tr></thead>
        <tbody>{students.map((s) => {
          const done = s.meetings.filter((m) => m.status === "done");
          const who = [...new Set(done.map((m) => (m.counsellor === me.id ? "you" : counsellorById(m.counsellor).name.split(" ")[0])))];
          const next = s.meetings.find((m) => m.status === "upcoming");
          return <tr key={s.id} className="is-click" onClick={() => go("student", s.id)}>
            <td><span className="c2-who-cell"><Av s={s} size={34} /><span><b>{s.name}</b><small>{s.subject} · {s.year}</small></span></span></td>
            <td>{done.length ? <>{done.length} <span className="fl-muted">with {who.join(", ")}</span></> : <span className="fl-muted">None yet</span>}</td>
            <td>{next ? <>{when(next.date, next.time)} <span className="fl-muted">· {next.counsellor === me.id ? "you" : counsellorById(next.counsellor).name.split(" ")[0]}</span></> : <span className="fl-muted">None</span>}</td>
            <td><span className="fl-muted">{s.courses.length} courses · {s.jobs.length} jobs · {s.tasks.length} tasks</span></td>
          </tr>;
        })}</tbody>
      </table>
    </section>
  </>;
}

/* ---------- Calendar: open, block, see who's booked ---------- */
const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calDays = upcomingDays(6, fromIso(day(-1)));
const others = ["Rumana A.", "Fahim R.", "Tasnim H.", "Shafin K.", "Lamia C.", "Omar F.", "Priya D.", "Nafisa J."];
function Calendar({ go }: { go: Go }) {
  const { students } = useDesk();
  const [blocked, setBlocked] = useState<string[]>([`${today}|16:00`]);
  const [working, setWorking] = useState<number[]>([0, 1, 2, 3, 4]);
  const [daysOpen, setDaysOpen] = useState(false);
  const cell = (date: string, t: string) => {
    const s = students.find((x) => x.meetings.some((m) => m.counsellor === me.id && m.date === date && m.time === t && m.status !== "cancelled"));
    if (s) return { kind: "mine" as const, s, done: s.meetings.find((m) => m.date === date && m.time === t)!.status === "done" };
    if (blocked.includes(`${date}|${t}`)) return { kind: "blocked" as const };
    if (isTaken("nusrat", date, t) && date > today) return { kind: "other" as const, name: others[(date.charCodeAt(9) + t.charCodeAt(1)) % others.length] };
    return { kind: "free" as const };
  };
  const flip = (k: string) => setBlocked((b) => (b.includes(k) ? b.filter((x) => x !== k) : [...b, k]));
  return <>
    <Head kicker="CALENDAR" title="Your availability" body="Students can book any open slot. Click an open slot to block it; click again to open it.">
      <button className="fl-btn" onClick={() => setDaysOpen(true)}><I n="calendar" s={17} /> Working days</button>
    </Head>
    <div className="c2-legend"><span className="is-mine">Your students</span><span className="is-other">Booked</span><span className="is-free">Open</span><span className="is-blocked">Blocked</span></div>
    <section className="fl-card c2-cal-card">
      <div className="c2-cal" style={{ gridTemplateColumns: `76px repeat(${calDays.length}, minmax(110px, 1fr))` }}>
        <span />
        {calDays.map((d) => <b key={d.date} className={d.date === today ? "is-today" : ""}>{wd[d.weekday]}<small>{shortDate(d.date)}</small></b>)}
        {slotTimes.map((t) => <div key={t} className="c2-cal-row">
          <time>{time12(t)}</time>
          {calDays.map((d) => {
            if (!working.includes(d.weekday)) return <span key={d.date} className="c2-cell is-off">Off</span>;
            const c = cell(d.date, t);
            if (c.kind === "mine") return <button key={d.date} className={"c2-cell is-mine" + (c.done ? " is-done" : "")} onClick={() => go("student", c.s.id)}>{first(c.s)} {c.s.name.split(" ")[1][0]}.</button>;
            if (c.kind === "other") return <span key={d.date} className="c2-cell is-other">{c.name}</span>;
            const past = d.date < today || (d.date === today && t < "11:00");
            return <button key={d.date} disabled={past} className={"c2-cell is-" + c.kind} onClick={() => flip(`${d.date}|${t}`)}>{past ? "" : c.kind === "blocked" ? "Blocked" : "Open"}</button>;
          })}
        </div>)}
      </div>
    </section>
    <p className="fl-fine"><I n="info" s={14} /> Sessions are 30 minutes with a 15-minute break after, the same for every counsellor.</p>
    {daysOpen && <Dialog title="Your working days" onClose={() => setDaysOpen(false)}>
      <p className="fl-muted">Students only see times on the days you work. Friday is off for everyone.</p>
      <div className="c2-days">{[6, 0, 1, 2, 3, 4].map((w) => <label key={w} className={working.includes(w) ? "is-on" : ""}><input type="checkbox" checked={working.includes(w)} onChange={() => setWorking((l) => (l.includes(w) ? l.filter((x) => x !== w) : [...l, w]))} />{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "", "Saturday"][w]}</label>)}</div>
      <div className="fl-dialog-actions"><button className="fl-btn fl-primary" onClick={() => setDaysOpen(false)}>Done</button></div>
    </Dialog>}
  </>;
}
