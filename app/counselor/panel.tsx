"use client";
// Counsellor panel (/counselor/v1). A separate staff portal, not linked from the student site.
// Counsellors see their day, their students, the AI brief and AI-drafted plan for each student
// (hidden from the student), and send the plan that unlocks the student's Career Hub.
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { counsellorById, dayLabel, endTime, fromIso, isTaken, shortDate, slotTimes, time12, upcomingDays, longDate } from "../flow/data";
import { Dialog, I } from "../flow/parts";
import { CounselorProvider, useDesk } from "./store";
import { day, statusInfo, today, type Student } from "./data";
import { StudentPage, type Tab } from "./student";
import "../flow/flow.css";
import "./panel.css";

export const me = counsellorById("nusrat");
export type Go = (page: Page, id?: string, tab?: Tab) => void;
type Page = "today" | "students" | "plans" | "calendar" | "student";

export default function CounselorApp() {
  const [signedIn, setSignedIn] = useState(false);
  return <CounselorProvider>{signedIn ? <Desk out={() => setSignedIn(false)} /> : <SignIn onIn={() => setSignedIn(true)} />}</CounselorProvider>;
}

function SignIn({ onIn }: { onIn: () => void }) {
  return <div className="fl cp-sign">
    <div className="cp-sign-card">
      <Image src="/careerhub-logo.png" width={96} height={66} alt="BRAC Career Hub" />
      <span className="cp-staff">Counsellor portal</span>
      <h1>Sign in to your desk</h1>
      <p>For BRAC Career Hub counsellors only. Students sign in on the main site.</p>
      <form onSubmit={(e) => { e.preventDefault(); onIn(); }}>
        <label>Work email<input type="email" defaultValue="nusrat.jahan@brac.net" /></label>
        <button className="fl-btn fl-primary big wide">Continue with BRAC account <I n="arrow" s={18} /></button>
      </form>
      <small><I n="lock" s={13} /> Demo: no password needed. You’ll be signed in as {me.name}.</small>
    </div>
  </div>;
}

/* ---------- Shell ---------- */
function Desk({ out }: { out: () => void }) {
  const desk = useDesk();
  const [page, setPage] = useState<Page>("today");
  const [sid, setSid] = useState("ayesha");
  const [tab, setTab] = useState<Tab>("overview");
  const [q, setQ] = useState("");
  const go: Go = (p, id, t) => { setPage(p); if (id) setSid(id); setTab(t ?? "overview"); setQ(""); window.scrollTo({ top: 0 }); };
  const plans = desk.students.filter((s) => s.ai && !s.plan && s.status !== "cancelled").length;
  const nav: [Page, string, string, number?][] = [
    ["today", "Today", "home"], ["students", "Students", "user", desk.students.length], ["plans", "Plans to review", "spark", plans], ["calendar", "Calendar", "calendar"],
  ];
  const hits = q ? desk.students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) : [];
  return <div className="fl cp">
    <aside className="cp-side">
      <div className="cp-brand"><Image src="/careerhub-logo.png" width={74} height={51} alt="BRAC Career Hub" /><span>Counsellor</span></div>
      <nav>{nav.map(([id, label, icon, n]) => <button key={id} className={page === id || (id === "students" && page === "student") ? "is-on" : ""} onClick={() => go(id)}>
        <I n={icon} s={19} /><span>{label}</span>{!!n && <em className={id === "plans" ? "is-hot" : ""}>{n}</em>}</button>)}</nav>
      <div className="cp-me">
        <span className="fl-avatar" style={{ width: 36, height: 36, fontSize: 13, background: me.tone }}>{me.initials}</span>
        <div><b>{me.name}</b><small>{me.title}</small></div>
        <button className="fl-icon-btn" onClick={out} aria-label="Sign out" title="Sign out"><I n="back" s={17} /></button>
      </div>
    </aside>
    <div className="cp-body">
      <header className="cp-top">
        <div className="cp-search">
          <I n="user" s={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a student…" aria-label="Find a student" />
          {hits.length > 0 && <ul>{hits.map((s) => <li key={s.id}><button onClick={() => go("student", s.id)}><Av s={s} size={28} /> {s.name}<small>{s.subject}</small></button></li>)}</ul>}
        </div>
        <Bell go={go} />
      </header>
      <main className="cp-main">
        {page === "today" && <Today go={go} />}
        {page === "students" && <Students go={go} />}
        {page === "plans" && <Plans go={go} />}
        {page === "calendar" && <Calendar go={go} />}
        {page === "student" && <StudentPage key={sid + tab} id={sid} tab={tab} go={go} />}
      </main>
    </div>
    <Toast />
  </div>;
}

function Toast() {
  const { toast, toastId, dispatch } = useDesk();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch({ type: "toast", text: null }), 4200);
    return () => clearTimeout(t);
  }, [toast, toastId, dispatch]);
  if (!toast) return null;
  return <div className="cp-toast" role="status" key={toastId}><span><I n="check" s={16} /></span>{toast}</div>;
}

function Bell({ go }: { go: Go }) {
  const { notes, unread, dispatch } = useDesk();
  const [open, setOpen] = useState(false);
  return <div className="cp-bell">
    <button className="fl-icon-btn" aria-label={`Notifications, ${unread} new`} aria-expanded={open} onClick={() => { setOpen((o) => !o); if (!open) setTimeout(() => dispatch({ type: "read" }), 1500); }}>
      <I n="bell" />{unread > 0 && <em>{unread}</em>}</button>
    {open && <div className="cp-bell-list">
      <strong>Notifications</strong>
      <ul>{notes.map((n) => <li key={n.id} className={n.read ? "" : "is-new"}><button onClick={() => { setOpen(false); if (n.student) go("student", n.student, n.tab as Tab); }}>
        <b>{n.title}</b>{n.body && <span>{n.body}</span>}<small>{n.when}</small></button></li>)}</ul>
    </div>}
  </div>;
}

export function Av({ s, size = 40 }: { s: Student; size?: number }) {
  return <span className="fl-avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(140deg, ${s.tone}, ${s.tone}cc)` }} aria-hidden="true">{s.initials}</span>;
}
export function Pill({ s }: { s: Student }) {
  const i = statusInfo[s.status];
  return <span className={"cp-pill is-" + i.tone}>{i.label}</span>;
}
export const when = (d: string, t: string) => `${dayLabel(d)}${dayLabel(d) === "Today" || dayLabel(d) === "Tomorrow" ? "" : " " + shortDate(d)}, ${time12(t)}`;

/* ---------- Today ---------- */
function Today({ go }: { go: Go }) {
  const { students, blocked, dispatch } = useDesk();
  const [finish, setFinish] = useState<Student | null>(null);
  const todays = useMemo(() => slotTimes.map((t) => {
    const s = students.find((x) => x.sessions.some((r) => r.date === today && r.time === t && r.status !== "cancelled"));
    const r = s?.sessions.find((x) => x.date === today && x.time === t);
    return { t, s, r, blocked: blocked.includes(`${today}|${t}`) };
  }), [students, blocked]);
  const next = todays.find((x) => x.r?.status === "upcoming");
  const plans = students.filter((s) => s.status === "plan");
  const attention: { s: Student; text: string; act: string; run: () => void }[] = [
    ...plans.map((s) => ({ s, text: "Session done. Waiting for their plan (AI draft ready).", act: "Review plan", run: () => go("student", s.id, "plan") })),
    ...students.filter((s) => s.status === "booked" && !s.answers).map((s) => ({ s, text: `Hasn’t answered the questions yet. Session ${when(s.next!.date, s.next!.time).toLowerCase()}.`, act: "Send reminder", run: () => dispatch({ type: "remind", id: s.id }) })),
    ...students.filter((s) => s.status === "quiet").map((s) => ({ s, text: `No activity for ${s.lastActive.replace(" ago", "")}.`, act: "Send a check-in", run: () => dispatch({ type: "nudge", id: s.id }) })),
    ...students.filter((s) => s.status === "cancelled").map((s) => ({ s, text: `Cancelled: “${s.sessions.at(-1)?.reason ?? "no reason"}”. No new booking yet.`, act: "Invite to rebook", run: () => dispatch({ type: "message", id: s.id, text: "rebook" }) })),
  ];
  const booked = todays.filter((x) => x.s).length;
  return <>
    <div className="cp-head">
      <div><span className="fl-kicker">{longDate(today).toUpperCase()}</span><h1>Good morning, {me.name.split(" ")[0]}</h1>
        <p>You have {booked} sessions today{plans.length ? ` and ${plans.length} plan${plans.length > 1 ? "s" : ""} to send` : ""}.</p></div>
    </div>
    <div className="cp-stats">
      <Stat n={booked} label="Sessions today" icon="calendar" />
      <Stat n={students.filter((s) => s.ai && !s.plan && s.status !== "cancelled").length} label="AI plans to review" icon="spark" hot onClick={() => go("plans")} />
      <Stat n={students.filter((s) => s.status === "active").length + 21} label="Active students" icon="user" onClick={() => go("students")} />
      <Stat n="86%" label="Tasks on track this month" icon="tasks" />
    </div>
    <div className="cp-two">
      <div className="cp-col">
        {next?.s && <section className="cp-next">
          <div className="cp-next-top">
            <span className="cp-live">UP NEXT · {time12(next.t)}–{endTime(next.t)}</span>
            <span className="cp-tag">{next.r!.kind}</span>
          </div>
          <div className="cp-next-who"><Av s={next.s} size={52} /><div><h2>{next.s.name}</h2><p>{next.s.subject} · {next.s.year}</p></div></div>
          {next.s.brief && <div className="cp-next-brief"><b><I n="spark" s={15} /> AI brief</b><p>{next.s.brief.summary}</p>
            <ul>{next.s.brief.ask.slice(0, 3).map((a) => <li key={a}>{a}</li>)}</ul></div>}
          <div className="cp-next-actions">
            <a className="fl-btn fl-primary" href="https://meet.google.com/" target="_blank" rel="noreferrer"><I n="video" s={18} /> Start Google Meet</a>
            <button className="fl-btn" onClick={() => go("student", next.s!.id)}>Open full brief</button>
            <button className="fl-btn ghost" onClick={() => setFinish(next.s!)}><I n="check" s={17} /> Mark complete</button>
          </div>
        </section>}
        <section className="fl-card cp-schedule">
          <div className="cp-sec-head"><h2>Today’s schedule</h2><button className="fl-link" onClick={() => go("calendar")}>Open calendar</button></div>
          <ol>{todays.map(({ t, s, r, blocked: b }) => <li key={t} className={r?.status === "completed" ? "is-done" : r ? "is-booked" : b ? "is-blocked" : "is-free"}>
            <time>{time12(t)}</time>
            {s && r ? <button onClick={() => go("student", s.id)}><Av s={s} size={30} /><span><b>{s.name}</b><small>{r.kind}{r.status === "completed" ? " · done" : ""}</small></span>
              {r.status === "upcoming" && !s.answers && <em className="cp-pill is-amber">No answers yet</em>}
              {r.status === "upcoming" && s.answers && <em className="cp-pill is-green">Answers in</em>}</button>
              : <span className="cp-free">{b ? "Blocked" : "Open slot"}</span>}
          </li>)}</ol>
          <p className="fl-fine"><I n="clock" s={14} /> 30-minute sessions with a 15-minute break after each.</p>
        </section>
      </div>
      <section className="fl-card cp-attention">
        <h2>Needs your attention</h2>
        {attention.length ? <ul>{attention.map((x) => <li key={x.s.id + x.act}>
          <button className="cp-att-who" onClick={() => go("student", x.s.id)}><Av s={x.s} size={36} /><span><b>{x.s.name}</b><small>{x.text}</small></span></button>
          <button className="fl-btn" onClick={x.run}>{x.act}</button>
        </li>)}</ul> : <p className="cp-empty">All caught up.</p>}
      </section>
    </div>
    {finish && <FinishDialog s={finish} onClose={() => setFinish(null)} go={go} />}
  </>;
}

function Stat({ n, label, icon, hot, onClick }: { n: number | string; label: string; icon: string; hot?: boolean; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return <Tag className={"cp-stat" + (hot ? " is-hot" : "")} onClick={onClick}><span><I n={icon} s={19} /></span><b>{n}</b><small>{label}</small></Tag>;
}

/** Mark a session as done (or missed). The plan is sent separately from the Plan tab. */
export function FinishDialog({ s, onClose, go }: { s: Student; onClose: () => void; go: Go }) {
  const { dispatch } = useDesk();
  const [outcome, setOutcome] = useState<"completed" | "no-show">("completed");
  const [notes, setNotes] = useState("");
  const firstTime = !s.plan;
  return <Dialog title={`Finish session with ${s.name.split(" ")[0]}`} onClose={onClose}>
    <div className="cp-radio">
      <label className={outcome === "completed" ? "is-on" : ""} aria-label="It happened"><input type="radio" checked={outcome === "completed"} onChange={() => setOutcome("completed")} /><span><b>It happened</b><small>We talked for the session.</small></span></label>
      <label className={outcome === "no-show" ? "is-on" : ""} aria-label="The student didn’t join"><input type="radio" checked={outcome === "no-show"} onChange={() => setOutcome("no-show")} /><span><b>{s.name.split(" ")[0]} didn’t join</b><small>We’ll invite them to book again.</small></span></label>
    </div>
    {outcome === "completed" && <label className="cp-field">Quick notes (you can tidy them up in the plan)<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Likes data, parents want MBA. Agreed: Excel course, CV draft." /></label>}
    {outcome === "completed" && firstTime && <p className="cp-hint"><I n="info" s={15} /> {s.name.split(" ")[0]}’s Career Hub stays locked until you send the plan. The AI draft is ready.</p>}
    <div className="fl-dialog-actions">
      <button className="fl-btn ghost" onClick={onClose}>Cancel</button>
      {outcome === "completed" && firstTime
        ? <button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "complete", id: s.id, outcome, notes }); onClose(); go("student", s.id, "plan"); }}>Save and build the plan <I n="arrow" s={17} /></button>
        : <button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "complete", id: s.id, outcome, notes }); onClose(); }}>Save</button>}
    </div>
  </Dialog>;
}

/* ---------- Students ---------- */
const filters: [string, string, (s: Student) => boolean][] = [
  ["all", "All", () => true],
  ["soon", "Upcoming", (s) => !!s.next],
  ["plan", "Plan to send", (s) => !!s.ai && !s.plan && s.status !== "cancelled"],
  ["active", "Active", (s) => s.status === "active"],
  ["help", "Needs a nudge", (s) => s.status === "quiet" || s.status === "cancelled" || (s.status === "booked" && !s.answers)],
];
function Students({ go }: { go: Go }) {
  const { students } = useDesk();
  const [f, setF] = useState("all");
  const list = students.filter(filters.find((x) => x[0] === f)![2]);
  return <>
    <div className="cp-head"><div><span className="fl-kicker">YOUR STUDENTS</span><h1>Students</h1><p>Everyone who booked with you. Click a student to see their brief, plan and progress.</p></div></div>
    <div className="cp-filters" role="tablist">{filters.map(([id, label, fn]) => <button key={id} role="tab" aria-selected={f === id} onClick={() => setF(id)}>{label}<em>{students.filter(fn).length}</em></button>)}</div>
    <div className="cp-table" role="table">
      <div className="cp-tr is-head" role="row"><span>Student</span><span>Status</span><span>Next session</span><span>Progress</span><span>Last active</span></div>
      {list.map((s) => {
        const tasks = s.plan?.items.filter((i) => i.kind === "task") ?? [];
        const done = tasks.filter((t) => t.done).length;
        return <button key={s.id} className="cp-tr" role="row" onClick={() => go("student", s.id)}>
          <span className="cp-who"><Av s={s} size={38} /><span><b>{s.name}</b><small>{s.subject} · {s.year}</small></span></span>
          <span><Pill s={s} /></span>
          <span>{s.next ? when(s.next.date, s.next.time) : <i className="cp-dim">None booked</i>}</span>
          <span>{s.plan ? <span className="cp-progress"><span><span style={{ width: `${(done / Math.max(tasks.length, 1)) * 100}%` }} /></span>{done}/{tasks.length} tasks</span> : <i className="cp-dim">{s.answers ? "No plan yet" : "No answers yet"}</i>}</span>
          <span className="cp-dim">{s.lastActive}</span>
        </button>;
      })}
    </div>
  </>;
}

/* ---------- Plans to review ---------- */
function Plans({ go }: { go: Go }) {
  const { students } = useDesk();
  const list = students.filter((s) => s.ai && !s.plan && s.status !== "cancelled");
  return <>
    <div className="cp-head"><div><span className="fl-kicker">AI ASSIST</span><h1>Plans to review</h1><p>As soon as a student sends their answers, AI searches for tasks, courses and jobs that fit them. Students never see these drafts. You choose, edit and send.</p></div></div>
    <ol className="cp-how">
      {[["notes", "Student answers the questions"], ["globe", "AI searches courses, jobs and programs online"], ["spark", "A draft plan appears here, for you only"], ["edit", "You pick, edit and add your own"], ["check", "You send it, and their Career Hub opens"]].map(([i, t], k) =>
        <li key={t}><span><I n={i} s={18} /></span><b>{k + 1}</b>{t}</li>)}
    </ol>
    {list.length ? <div className="cp-plan-list">{list.map((s) => {
      const c = (k: string) => s.ai!.filter((x) => x.kind === k).length;
      const done = s.sessions.some((r) => r.status === "completed");
      return <article key={s.id} className="fl-card cp-plan-card">
        <div className="cp-who"><Av s={s} size={46} /><span><b>{s.name}</b><small>{s.subject} · {s.year}</small></span></div>
        <p>{s.brief?.summary}</p>
        <div className="cp-counts">{(["task", "course", "job"] as const).map((k) => <span key={k}><b>{c(k)}</b> {k}{c(k) === 1 ? "" : "s"}</span>)}</div>
        <div className="cp-plan-foot">
          <span className={"cp-pill " + (done ? "is-amber" : "is-blue")}>{done ? "Session done · send soon" : s.next ? `Session ${when(s.next.date, s.next.time).toLowerCase()}` : "No session"}</span>
          <button className="fl-btn fl-primary" onClick={() => go("student", s.id, "plan")}>Review plan <I n="arrow" s={17} /></button>
        </div>
      </article>;
    })}</div> : <p className="cp-empty fl-card">No plans waiting. Nice work.</p>}
  </>;
}

/* ---------- Calendar ---------- */
const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calDays = upcomingDays(6, fromIso(day(-1))); // today plus the next five working days
const others = ["Rumana A.", "Fahim R.", "Tasnim H.", "Shafin K.", "Lamia C.", "Omar F.", "Priya D.", "Nafisa J."];
function Calendar({ go }: { go: Go }) {
  const { students, blocked, days: working, dispatch } = useDesk();
  const days = calDays;
  const [moving, setMoving] = useState(false);
  const cell = (date: string, t: string) => {
    const s = students.find((x) => x.sessions.some((r) => r.date === date && r.time === t && r.status !== "cancelled"));
    if (s) return { kind: "mine" as const, s, done: s.sessions.find((r) => r.date === date && r.time === t)!.status === "completed" };
    if (blocked.includes(`${date}|${t}`)) return { kind: "blocked" as const };
    if (isTaken("nusrat", date, t) && date > today) return { kind: "other" as const, name: others[(date.charCodeAt(9) + t.charCodeAt(1)) % others.length] };
    return { kind: "free" as const };
  };
  return <>
    <div className="cp-head">
      <div><span className="fl-kicker">AVAILABILITY</span><h1>Calendar</h1><p>Students can only book your open slots. Click an open slot to block it, or a blocked slot to open it again.</p></div>
      <button className="fl-btn" onClick={() => setMoving(true)}><I n="calendar" s={17} /> Working days</button>
    </div>
    <div className="cp-legend"><span className="is-mine">Your students</span><span className="is-other">Booked</span><span className="is-free">Open</span><span className="is-blocked">Blocked</span></div>
    <div className="cp-cal" style={{ gridTemplateColumns: `72px repeat(${days.length}, minmax(120px, 1fr))` }}>
      <span />
      {days.map((d) => <b key={d.date} className={d.date === today ? "is-today" : ""}>{wd[d.weekday]}<small>{shortDate(d.date)}</small></b>)}
      {slotTimes.map((t) => <div key={t} className="cp-cal-row">
        <time>{time12(t)}</time>
        {days.map((d) => {
          if (!working.includes(d.weekday)) return <span key={d.date} className="cp-cell is-off">Day off</span>;
          const c = cell(d.date, t);
          if (c.kind === "mine") return <button key={d.date} className={"cp-cell is-mine" + (c.done ? " is-done" : "")} onClick={() => go("student", c.s.id)}><b>{c.s.name.split(" ")[0]} {c.s.name.split(" ")[1][0]}.</b><small>{c.done ? "Done" : "30 min"}</small></button>;
          if (c.kind === "other") return <span key={d.date} className="cp-cell is-other"><b>{c.name}</b><small>30 min</small></span>;
          const past = d.date === today && t < "11:00";
          return <button key={d.date} disabled={past} className={"cp-cell is-" + c.kind} onClick={() => dispatch({ type: "block", key: `${d.date}|${t}` })}>{c.kind === "blocked" ? "Blocked" : past ? "" : "Open"}</button>;
        })}
      </div>)}
    </div>
    <p className="fl-fine"><I n="info" s={14} /> Session length (30 min) and the 15-minute break are set by Career Hub for everyone.</p>
    {moving && <Dialog title="Your working days" onClose={() => setMoving(false)}>
      <p className="fl-muted">Students only see times on the days you work. Friday is off for everyone.</p>
      <div className="cp-days">{[6, 0, 1, 2, 3, 4].map((w) => <label key={w} className={working.includes(w) ? "is-on" : ""}><input type="checkbox" checked={working.includes(w)} onChange={() => dispatch({ type: "day", weekday: w })} />{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "", "Saturday"][w]}</label>)}</div>
      <div className="fl-dialog-actions"><button className="fl-btn fl-primary" onClick={() => setMoving(false)}>Done</button></div>
    </Dialog>}
  </>;
}
