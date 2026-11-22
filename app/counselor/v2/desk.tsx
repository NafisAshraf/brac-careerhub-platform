"use client";
// Counsellor portal v2 (/counselor/v2). Same data and actions as v1, simpler to use:
// three places in the sidebar (Today, Students, Calendar), one clear next step on each screen,
// plain cards and tables in the student site's v4/v14 look. Plans are sent from the student page.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { counsellorById, dayLabel, endTime, fromIso, isTaken, longDate, shortDate, slotTimes, time12, upcomingDays } from "../../flow/data";
import { Avatar, Dialog, I } from "../../flow/parts";
import { CounselorProvider, useDesk } from "../store";
import { day, statusInfo, today, type Student } from "../data";
import { StudentView, type Tab } from "./student";
import "../../flow/flow.css";
import "./v2.css";

export const me = counsellorById("nusrat");
type Page = "today" | "students" | "calendar" | "student";
export type Go = (page: Page, id?: string, tab?: Tab) => void;
export const first = (s: Student) => s.name.split(" ")[0];
export const when = (d: string, t: string) => `${dayLabel(d)}${["Today", "Tomorrow"].includes(dayLabel(d)) ? "" : " " + shortDate(d)}, ${time12(t)}`;
export const planWaiting = (s: Student) => !!s.ai && !s.plan && s.status !== "cancelled";

export default function CounselorV2() {
  const [signedIn, setSignedIn] = useState(false);
  return <CounselorProvider>{signedIn ? <Desk out={() => setSignedIn(false)} /> : <SignIn onIn={() => setSignedIn(true)} />}</CounselorProvider>;
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

/* ---------- Shell: v4's sidebar and top bar ---------- */
function Desk({ out }: { out: () => void }) {
  const { students } = useDesk();
  const [page, setPage] = useState<Page>("today");
  const [sid, setSid] = useState("ayesha");
  const [tab, setTab] = useState<Tab>("overview");
  const [menu, setMenu] = useState(false);
  const [visit, setVisit] = useState(0);
  const go: Go = (p, id, t) => { setPage(p); if (id) setSid(id); setTab(t ?? "overview"); setMenu(false); setVisit((v) => v + 1); window.scrollTo({ top: 0 }); };
  const waiting = students.filter(planWaiting).length;
  const nav: [Page, string, string, number?][] = [["today", "Today", "home"], ["students", "Students", "user", waiting], ["calendar", "Calendar", "calendar"]];
  const side = <>
    <div className="fl-brand"><Image src="/careerhub-logo.png" width={96} height={86} alt="BRAC Career Hub" /></div>
    <nav aria-label="Counsellor portal">
      <span className="fl-nav-label">Counsellor</span>
      {nav.map(([id, label, icon, n]) => <button key={id} className={"fl-nav" + (page === id || (id === "students" && page === "student") ? " is-on" : "")} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}>
        <I n={icon} /><span>{label}</span>{!!n && <em title={`${n} plan${n > 1 ? "s" : ""} to send`}>{n}</em>}</button>)}
    </nav>
    <div className="fl-side-foot">
      <div className="fl-me"><Avatar c={me} size={38} /><div><strong>{me.name}</strong><small>{me.title}</small></div></div>
      <button className="fl-link" onClick={out}>← Sign out</button>
    </div>
  </>;
  return <div className="fl fl-app c2">
    <aside className="fl-side">{side}</aside>
    {menu && <div className="fl-drawer" role="dialog" aria-modal="true" aria-label="Menu"><div className="fl-drawer-in"><button className="fl-icon-btn fl-drawer-x" aria-label="Close menu" onClick={() => setMenu(false)}><I n="x" /></button>{side}</div><button className="fl-drawer-scrim" aria-label="Close menu" onClick={() => setMenu(false)} /></div>}
    <div className="fl-app-main">
      <header className="fl-top">
        <button className="fl-btn ghost fl-menu-btn" onClick={() => setMenu(true)}><I n="menu" /> Menu</button>
        <Search go={go} />
        <Bell go={go} />
      </header>
      <main className="fl-page">
        <div className="c2-enter" key={page + visit}>
          {page === "today" && <Today go={go} />}
          {page === "students" && <Students go={go} />}
          {page === "calendar" && <Calendar go={go} />}
          {page === "student" && <StudentView id={sid} tab={tab} go={go} />}
        </div>
      </main>
    </div>
    <Toast />
  </div>;
}

export function Head({ kicker, title, body, children }: { kicker: string; title: string; body?: string; children?: ReactNode }) {
  return <header className="fl-head"><div><span className="fl-kicker">{kicker}</span><h1>{title}</h1>{body && <p>{body}</p>}</div>{children}</header>;
}
export function Av({ s, size = 40 }: { s: Student; size?: number }) {
  return <span className="fl-avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: s.tone }} aria-hidden="true">{s.initials}</span>;
}
export function Status({ s }: { s: Student }) {
  const i = statusInfo[s.status];
  return <span className={"c2-status is-" + i.tone}>{i.label}</span>;
}

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

function Toast() {
  const { toast, toastId, dispatch } = useDesk();
  useEffect(() => { if (!toast) return; const t = setTimeout(() => dispatch({ type: "toast", text: null }), 4200); return () => clearTimeout(t); }, [toast, toastId, dispatch]);
  if (!toast) return null;
  return <div className="c2-toast" role="status" key={toastId}><I n="check" s={16} />{toast}</div>;
}

function Bell({ go }: { go: Go }) {
  const { notes, unread, dispatch } = useDesk();
  const [open, setOpen] = useState(false);
  return <div className="c2-bell">
    <button className="fl-icon-btn" aria-label={`Notifications, ${unread} new`} aria-expanded={open} onClick={() => { setOpen((o) => !o); if (!open) setTimeout(() => dispatch({ type: "read" }), 1500); }}>
      <I n="bell" />{unread > 0 && <em>{unread}</em>}</button>
    {open && <div className="c2-bell-list">
      <strong>Notifications</strong>
      <ul>{notes.map((n) => <li key={n.id} className={n.read ? "" : "is-new"}><button onClick={() => { setOpen(false); if (n.student) go("student", n.student, n.tab === "plan" ? "plan" : n.tab === "sessions" ? "sessions" : "overview"); }}>
        <b>{n.title}</b>{n.body && <span>{n.body}</span>}<small>{n.when}</small></button></li>)}</ul>
    </div>}
  </div>;
}

/* ---------- Today: the next session, what needs doing, the day's schedule ---------- */
function Today({ go }: { go: Go }) {
  const { students, blocked, dispatch } = useDesk();
  const [finish, setFinish] = useState<Student | null>(null);
  const rows = useMemo(() => slotTimes.map((t) => {
    const s = students.find((x) => x.sessions.some((r) => r.date === today && r.time === t && r.status !== "cancelled"));
    return { t, s, r: s?.sessions.find((x) => x.date === today && x.time === t), blocked: blocked.includes(`${today}|${t}`) };
  }), [students, blocked]);
  const next = rows.find((x) => x.r?.status === "upcoming");
  const todo: { s: Student; text: string; act: string; run: () => void; main?: boolean }[] = [
    ...students.filter((s) => s.status === "plan").map((s) => ({ s, text: "Session done. Their plan is waiting for you.", act: "Send plan", run: () => go("student", s.id, "plan"), main: true })),
    ...students.filter((s) => s.status === "booked" && !s.answers).map((s) => ({ s, text: `No answers yet. Session ${when(s.next!.date, s.next!.time).toLowerCase()}.`, act: "Remind", run: () => dispatch({ type: "remind", id: s.id }) })),
    ...students.filter((s) => s.status === "quiet").map((s) => ({ s, text: `Quiet for ${s.lastActive.replace(" ago", "")}.`, act: "Check in", run: () => dispatch({ type: "nudge", id: s.id }) })),
    ...students.filter((s) => s.status === "cancelled").map((s) => ({ s, text: `Cancelled (${(s.sessions.at(-1)?.reason ?? "no reason").toLowerCase()}). Not rebooked.`, act: "Invite to rebook", run: () => dispatch({ type: "message", id: s.id, text: "rebook" }) })),
  ];
  const count = rows.filter((x) => x.s).length;
  return <>
    <Head kicker={longDate(today).toUpperCase()} title={`Good morning, ${me.name.split(" ")[0]}`} body={`${count} session${count === 1 ? "" : "s"} today${todo.length ? `, and ${todo.length} thing${todo.length === 1 ? "" : "s"} to follow up` : ""}.`} />
    <div className="c2-two">
      {next?.s ? <section className="fl-card fl-upcoming c2-next">
        <div className="fl-upcoming-head">
          <div className="fl-date-tile"><small>NEXT</small><b>{time12(next.t).split(" ")[0]}</b><small>{time12(next.t).split(" ")[1]}</small></div>
          <div><span className="fl-kicker">UP NEXT · {next.r!.kind.toUpperCase()}</span><h2>{next.s.name}</h2><p>{next.s.subject} · {next.s.year} · until {endTime(next.t)}</p></div>
          <Av s={next.s} size={52} />
        </div>
        {next.s.brief ? <div className="c2-ask"><h3>Worth asking</h3><ul>{next.s.brief.ask.slice(0, 3).map((a) => <li key={a}>{a}</li>)}</ul></div>
          : <p className="fl-muted">{first(next.s)} hasn’t answered the questions yet.</p>}
        <div className="fl-row">
          <a className="fl-btn fl-primary" href="https://meet.google.com/" target="_blank" rel="noreferrer"><I n="video" s={18} /> Join Google Meet</a>
          <button className="fl-btn" onClick={() => go("student", next.s!.id)}>Open {first(next.s)}</button>
          <button className="fl-btn ghost" onClick={() => setFinish(next.s!)}><I n="check" s={17} /> Mark done</button>
        </div>
      </section> : <section className="fl-card c2-next"><span className="fl-kicker">UP NEXT</span><h2>No more sessions today</h2><p className="fl-muted">Use the time to send plans and follow up below.</p></section>}

      <section className="fl-card c2-todo">
        <span className="fl-kicker">TO FOLLOW UP</span>
        {todo.length ? <ul>{todo.map((x) => <li key={x.s.id + x.act}>
          <button className="c2-who" onClick={() => go("student", x.s.id)}><Av s={x.s} size={34} /><span><b>{x.s.name}</b><small>{x.text}</small></span></button>
          <button className={"fl-btn" + (x.main ? " fl-primary" : "")} onClick={x.run}>{x.act}</button>
        </li>)}</ul> : <p className="fl-muted">All caught up.</p>}
      </section>
    </div>

    <section className="fl-card c2-table-card">
      <div className="c2-card-head"><div><span className="fl-kicker">TODAY’S SCHEDULE</span><h2>{longDate(today)}</h2></div><button className="fl-link" onClick={() => go("calendar")}>Open calendar</button></div>
      <table className="c2-table">
        <thead><tr><th>Time</th><th>Student</th><th>Session</th><th>Status</th></tr></thead>
        <tbody>{rows.map(({ t, s, r, blocked: b }) => <tr key={t} className={(s ? "is-click " : "is-free ") + (r?.status === "completed" ? "is-done" : "")} onClick={() => s && go("student", s.id)}>
          <td><b>{time12(t)}</b></td>
          <td>{s ? <span className="c2-who-cell"><Av s={s} size={28} />{s.name}</span> : <span className="fl-muted">{b ? "Blocked" : "Open"}</span>}</td>
          <td>{r?.kind ?? ""}</td>
          <td>{r ? <span className={"c2-status " + (r.status === "completed" ? "is-green" : s!.answers ? "is-blue" : "is-amber")}>{r.status === "completed" ? "Done" : s!.answers ? "Answers in" : "No answers yet"}</span> : ""}</td>
        </tr>)}</tbody>
      </table>
    </section>
    {finish && <FinishDialog s={finish} onClose={() => setFinish(null)} go={go} />}
  </>;
}

/** Mark a session done (or missed). First sessions lead straight on to the plan. */
export function FinishDialog({ s, onClose, go }: { s: Student; onClose: () => void; go: Go }) {
  const { dispatch } = useDesk();
  const [joined, setJoined] = useState(true);
  const [notes, setNotes] = useState("");
  const firstTime = !s.plan;
  const save = () => { dispatch({ type: "complete", id: s.id, outcome: joined ? "completed" : "no-show", notes }); onClose(); if (joined && firstTime) go("student", s.id, "plan"); };
  return <Dialog title={`How did the session with ${first(s)} go?`} onClose={onClose}>
    <div className="c2-choice" role="radiogroup">
      <button role="radio" aria-checked={joined} className={joined ? "is-on" : ""} onClick={() => setJoined(true)}><b>It happened</b><small>We talked for the session.</small></button>
      <button role="radio" aria-checked={!joined} className={!joined ? "is-on" : ""} onClick={() => setJoined(false)}><b>{first(s)} didn’t join</b><small>They’ll be invited to book again.</small></button>
    </div>
    {joined && <label className="fl-field"><span>Quick notes <small>(optional, you can tidy them in the plan)</small></span><textarea className="fl-textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Likes data, parents want an MBA. Agreed: Excel course, CV draft." /></label>}
    {joined && firstTime && <p className="c2-hint"><I n="info" s={15} /> {first(s)}’s Career Hub opens when you send the plan. That’s the next step.</p>}
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button>
      <button className="fl-btn fl-primary" onClick={save}>{joined && firstTime ? <>Save and write the plan <I n="arrow" s={17} /></> : "Save"}</button></div>
  </Dialog>;
}

/* ---------- Students: one table, a few filters ---------- */
const filters: [string, string, (s: Student) => boolean][] = [
  ["all", "All", () => true],
  ["plan", "Plan to send", planWaiting],
  ["soon", "Upcoming", (s) => !!s.next],
  ["help", "Needs a nudge", (s) => s.status === "quiet" || s.status === "cancelled" || (s.status === "booked" && !s.answers)],
];
function Students({ go }: { go: Go }) {
  const { students } = useDesk();
  const [f, setF] = useState("all");
  const list = students.filter(filters.find((x) => x[0] === f)![2]);
  return <>
    <Head kicker="STUDENTS" title="Your students" body="Everyone who booked with you. Click a row to open the student." />
    <div className="fl-tabs" role="tablist">{filters.map(([id, label, fn]) => <button key={id} role="tab" aria-selected={f === id} onClick={() => setF(id)}>{label} <small className="c2-count">{students.filter(fn).length}</small></button>)}</div>
    <section className="fl-card c2-table-card">
      <table className="c2-table">
        <thead><tr><th>Student</th><th>Status</th><th>Next session</th><th>Tasks</th><th>Last active</th></tr></thead>
        <tbody>{list.map((s) => {
          const tasks = s.plan?.items.filter((i) => i.kind === "task") ?? [];
          const done = tasks.filter((t) => t.done).length;
          return <tr key={s.id} className="is-click" onClick={() => go("student", s.id, planWaiting(s) && s.status === "plan" ? "plan" : "overview")}>
            <td><span className="c2-who-cell"><Av s={s} size={34} /><span><b>{s.name}</b><small>{s.subject} · {s.year}</small></span></span></td>
            <td><Status s={s} /></td>
            <td>{s.next ? when(s.next.date, s.next.time) : <span className="fl-muted">None</span>}</td>
            <td>{s.plan ? <span className="c2-bar"><span><span style={{ width: `${(done / Math.max(tasks.length, 1)) * 100}%` }} /></span>{done}/{tasks.length}</span> : <span className="fl-muted">{s.answers ? "No plan yet" : "No answers yet"}</span>}</td>
            <td className="fl-muted">{s.lastActive}</td>
          </tr>;
        })}</tbody>
      </table>
      {!list.length && <p className="fl-muted c2-empty">Nobody here right now.</p>}
    </section>
  </>;
}

/* ---------- Calendar: open, block, see who's booked ---------- */
const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calDays = upcomingDays(6, fromIso(day(-1)));
const others = ["Rumana A.", "Fahim R.", "Tasnim H.", "Shafin K.", "Lamia C.", "Omar F.", "Priya D.", "Nafisa J."];
function Calendar({ go }: { go: Go }) {
  const { students, blocked, days: working, dispatch } = useDesk();
  const [daysOpen, setDaysOpen] = useState(false);
  const cell = (date: string, t: string) => {
    const s = students.find((x) => x.sessions.some((r) => r.date === date && r.time === t && r.status !== "cancelled"));
    if (s) return { kind: "mine" as const, s, done: s.sessions.find((r) => r.date === date && r.time === t)!.status === "completed" };
    if (blocked.includes(`${date}|${t}`)) return { kind: "blocked" as const };
    if (isTaken("nusrat", date, t) && date > today) return { kind: "other" as const, name: others[(date.charCodeAt(9) + t.charCodeAt(1)) % others.length] };
    return { kind: "free" as const };
  };
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
            return <button key={d.date} disabled={past} className={"c2-cell is-" + c.kind} onClick={() => dispatch({ type: "block", key: `${d.date}|${t}` })}>{past ? "" : c.kind === "blocked" ? "Blocked" : "Open"}</button>;
          })}
        </div>)}
      </div>
    </section>
    <p className="fl-fine"><I n="info" s={14} /> Sessions are 30 minutes with a 15-minute break after, the same for every counsellor.</p>
    {daysOpen && <Dialog title="Your working days" onClose={() => setDaysOpen(false)}>
      <p className="fl-muted">Students only see times on the days you work. Friday is off for everyone.</p>
      <div className="c2-days">{[6, 0, 1, 2, 3, 4].map((w) => <label key={w} className={working.includes(w) ? "is-on" : ""}><input type="checkbox" checked={working.includes(w)} onChange={() => dispatch({ type: "day", weekday: w })} />{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "", "Saturday"][w]}</label>)}</div>
      <div className="fl-dialog-actions"><button className="fl-btn fl-primary" onClick={() => setDaysOpen(false)}>Done</button></div>
    </Dialog>}
  </>;
}
