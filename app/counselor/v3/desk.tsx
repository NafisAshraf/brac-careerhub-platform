"use client";
// Counsellor portal v3 (/counselor/v3). A counsellor's job here is simple: meet the student
// (online or in person), then set up what the student gets — access, tasks, courses, jobs —
// and come back to change it any time. Two places: Sessions and Students.
import { useEffect, useState } from "react";
import Image from "next/image";
import { counsellorById, dayLabel, shortDate, time12 } from "../../flow/data";
import { Avatar, I } from "../../flow/parts";
import { DeskProvider, useDesk } from "./store";
import { today, type Meeting, type Student } from "./db";
import { StudentPage, type Section } from "./student";
import "../../flow/flow.css";
import "../v2/v2.css";
import "./v3.css";

export const me = counsellorById("nusrat");
type Page = "sessions" | "students" | "student";
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
  const [page, setPage] = useState<Page>("sessions");
  const [sid, setSid] = useState("ayesha");
  const [section, setSection] = useState<Section>("about");
  const [menu, setMenu] = useState(false);
  const [visit, setVisit] = useState(0);
  const go: Go = (p, id, s) => { setPage(p); if (id) setSid(id); setSection(s ?? "about"); setMenu(false); setVisit((v) => v + 1); window.scrollTo({ top: 0 }); };
  const side = <>
    <div className="fl-brand"><Image src="/careerhub-logo.png" width={96} height={86} alt="BRAC Career Hub" /></div>
    <nav aria-label="Counsellor portal">
      <span className="fl-nav-label">Counsellor</span>
      {([["sessions", "Sessions", "calendar"], ["students", "Students", "user"]] as [Page, string, string][]).map(([id, label, icon]) =>
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
          {page === "sessions" && <Sessions go={go} />}
          {page === "students" && <Students go={go} />}
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
  useEffect(() => { if (!saved) return; const t = setTimeout(() => setHidden(saved.n), 2400); return () => clearTimeout(t); }, [saved]);
  if (!saved || hidden === saved.n) return null;
  return <div className="c2-toast" role="status" key={saved.n}><I n="check" s={16} />{saved.text}</div>;
}

/* ---------- Sessions: today, coming up, and recent ---------- */
function Sessions({ go }: { go: Go }) {
  const { students } = useDesk();
  const mine = students.flatMap((s) => s.meetings.filter((m) => m.counsellor === me.id).map((m) => ({ s, m })));
  const todays = mine.filter((x) => x.m.date === today && x.m.status !== "cancelled").sort((a, b) => a.m.time.localeCompare(b.m.time));
  const later = mine.filter((x) => x.m.date > today && x.m.status === "upcoming").sort((a, b) => (a.m.date + a.m.time).localeCompare(b.m.date + b.m.time));
  const past = mine.filter((x) => x.m.date < today).sort((a, b) => (b.m.date + b.m.time).localeCompare(a.m.date + a.m.time));
  const table = (rows: typeof mine, withDate: boolean) => <table className="c2-table">
    <thead><tr><th>{withDate ? "When" : "Time"}</th><th>Student</th><th>Where</th><th>Before with you</th><th /></tr></thead>
    <tbody>{rows.map(({ s, m }) => {
      const prev = s.meetings.filter((x) => x.status === "done" && x.id !== m.id).length;
      return <tr key={m.id} className={"is-click" + (m.status === "done" ? " is-done" : "")} onClick={() => go("student", s.id)}>
        <td><b>{withDate ? when(m.date, m.time) : time12(m.time)}</b></td>
        <td><span className="c2-who-cell"><Av s={s} size={32} /><span><b>{s.name}</b><small>{s.subject} · {s.year}</small></span></span></td>
        <td><Mode m={m} /></td>
        <td className="fl-muted">{prev ? `${prev} session${prev > 1 ? "s" : ""}` : "First session"}</td>
        <td className="c3-row-act">{m.status === "done" ? <span className="c2-status is-green">Done</span> : <span className="c3-open">Open <I n="arrow" s={15} /></span>}</td>
      </tr>;
    })}</tbody>
  </table>;
  return <>
    <Head kicker={shortDate(today).toUpperCase()} title={`Good morning, ${first(me)}`} body={`${todays.length} session${todays.length === 1 ? "" : "s"} today. Open a student to see what they told us and set up their plan.`} />
    <section className="fl-card c2-table-card"><span className="fl-kicker">TODAY</span>{todays.length ? table(todays, false) : <p className="fl-muted c2-empty">No sessions today.</p>}</section>
    {later.length > 0 && <section className="fl-card c2-table-card"><span className="fl-kicker">COMING UP</span>{table(later, true)}</section>}
    {past.length > 0 && <section className="fl-card c2-table-card"><span className="fl-kicker">RECENT</span>{table(past, true)}</section>}
  </>;
}

/* ---------- Students ---------- */
function Students({ go }: { go: Go }) {
  const { students } = useDesk();
  return <>
    <Head kicker="STUDENTS" title="Students" body="Everyone who has booked with you or another counsellor. Click a student to see and update their plan." />
    <section className="fl-card c2-table-card">
      <table className="c2-table">
        <thead><tr><th>Student</th><th>Sessions</th><th>Next session</th><th>Plan</th></tr></thead>
        <tbody>{students.map((s) => {
          const done = s.meetings.filter((m) => m.status === "done");
          const who = [...new Set(done.map((m) => counsellorById(m.counsellor).name.split(" ")[0]))];
          const next = s.meetings.find((m) => m.status === "upcoming");
          return <tr key={s.id} className="is-click" onClick={() => go("student", s.id)}>
            <td><span className="c2-who-cell"><Av s={s} size={34} /><span><b>{s.name}</b><small>{s.subject} · {s.year}</small></span></span></td>
            <td>{done.length ? <>{done.length} <span className="fl-muted">with {who.join(", ")}</span></> : <span className="fl-muted">None yet</span>}</td>
            <td>{next ? <>{when(next.date, next.time)} <span className="fl-muted">· {counsellorById(next.counsellor).name.split(" ")[0]}</span></> : <span className="fl-muted">None</span>}</td>
            <td>{s.unlock.length || s.tasks.length ? <span className="fl-muted">{s.tasks.length} tasks · {s.courses.length} courses · {s.jobs.length} jobs</span> : <span className="c2-status is-amber">Not set up yet</span>}</td>
          </tr>;
        })}</tbody>
      </table>
    </section>
  </>;
}
