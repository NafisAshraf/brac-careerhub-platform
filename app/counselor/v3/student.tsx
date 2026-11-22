"use client";
// One student. Sections can be visited in any order and as often as needed: profile, sessions,
// courses, jobs, tasks, meeting summary, access. Changes are kept as a draft until the counsellor
// presses "Save and update", which is what the student then sees.
import { useState } from "react";
import { counsellorById, type Unlockable } from "../../flow/data";
import { Avatar, Dialog, I } from "../../flow/parts";
import { useDesk } from "./store";
import { aiSummary, today, type Meeting, type Student } from "./db";
import { Picker } from "./picker";
import { Av, Mode, first, me, statusLabel, statusTone, when, type Go } from "./desk";

export type Section = "profile" | "sessions" | "courses" | "jobs" | "tasks" | "summary" | "access";
export type Edit = (f: (s: Student) => Student) => void;
const show = (v: string | string[] | undefined) => (Array.isArray(v) ? (v.length ? v.join(", ") : "—") : v || "—");
export const cname = (id: string) => (id === "ai" ? "AI" : id === me.id ? "you" : counsellorById(id).name);

export function StudentPage({ id, start, go }: { id: string; start: Section; go: Go }) {
  const { students, update } = useDesk();
  const saved = students.find((x) => x.id === id)!;
  const [s, setS] = useState<Student>(saved);
  const [sec, setSec] = useState<Section>(start);
  const [editing, setEditing] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const edit: Edit = (f) => setS((x) => f(x));
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);
  // The meeting this counsellor is handling now: today's, otherwise their latest.
  const mine = [...s.meetings].filter((m) => m.counsellor === me.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const current = mine.find((m) => m.date === today) ?? mine.find((m) => m.status === "upcoming") ?? mine[0];
  const done = s.meetings.filter((m) => m.status === "done");
  const byWho = Object.entries(done.reduce<Record<string, number>>((a, m) => ({ ...a, [m.counsellor]: (a[m.counsellor] ?? 0) + 1 }), {}));
  const sections: [Section, string, number?][] = [
    ["profile", "Profile"], ["sessions", "Sessions", s.meetings.length], ["courses", "Courses", s.courses.length], ["jobs", "Jobs", s.jobs.length],
    ["tasks", "Tasks", s.tasks.length], ["summary", "Meeting summary"], ["access", "Access"]];
  const k = sections.findIndex((x) => x[0] === sec);
  const move = (to: Section) => { setSec(to); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const setStatus = (m: Meeting, status: Meeting["status"]) => edit((x) => ({ ...x, meetings: x.meetings.map((y) => (y.id === m.id
    ? { ...y, status, ...(status === "done" && !y.notes ? { notes: aiSummary(x), aiNotes: true } : {}) } : y)) }));
  // Saving: anything with items in it is switched on for the student automatically.
  const save = () => {
    const unlock = new Set<Unlockable>([...s.unlock, "cv"]);
    if (s.courses.length) unlock.add("courses");
    if (s.jobs.length) unlock.add("jobs");
    const next = { ...s, unlock: [...unlock] };
    update(s.id, () => next, `Saved. ${first(s)}’s Career Hub is up to date.`);
    setS(next);
  };

  return <div className="c3-studentpage">
    <button className="fl-btn ghost c2-back" onClick={() => (dirty ? setLeaving(true) : go("students"))}><I n="back" s={18} /> All students</button>
    <header className="c2-student">
      <Av s={s} size={60} />
      <div>
        <div className="c2-name"><h1>{s.name}</h1></div>
        <p>{s.subject} · {s.year} · <button className="fl-link" onClick={() => setEditing(true)}>Edit details</button></p>
        <p className="c3-history">{done.length ? <>{done.length} session{done.length > 1 ? "s" : ""} so far: {byWho.map(([c, n]) => `${n} with ${cname(c)}`).join(", ")}</> : "No sessions yet"}</p>
      </div>
      {current && <div className="c3-now">
        <small>{current.date === today ? "Today’s session" : current.status === "upcoming" ? "Next session" : "Last session"} · {when(current.date, current.time)}</small>
        <div className="c3-now-row">
          {current.status === "upcoming" && (current.mode === "online"
            ? <a className="fl-btn fl-primary" href="https://meet.google.com/" target="_blank" rel="noreferrer"><I n="video" s={17} /> Join Meet</a>
            : <span className="c3-inperson"><I n="user" s={16} /> In person</span>)}
          <label className={"c3-status-select " + statusTone[current.status]}><span className="sr">Session status</span>
            <select value={current.status} onChange={(e) => setStatus(current, e.target.value as Meeting["status"])}>
              {(Object.keys(statusLabel) as Meeting["status"][]).map((x) => <option key={x} value={x}>{statusLabel[x]}</option>)}
            </select></label>
        </div>
      </div>}
    </header>

    <div className="fl-tabs c3-sections" role="tablist">{sections.map(([sid, label, n]) => <button key={sid} role="tab" aria-selected={sec === sid} onClick={() => move(sid)}>{label}{n !== undefined && <small className="c2-count">{n}</small>}</button>)}</div>

    <div className="c2-enter" key={sec}>
      {sec === "profile" && <Profile s={s} />}
      {sec === "sessions" && <Sessions s={s} setStatus={setStatus} />}
      {sec === "courses" && <Picker s={s} edit={edit} kind="course" />}
      {sec === "jobs" && <Picker s={s} edit={edit} kind="job" />}
      {sec === "tasks" && <Tasks s={s} edit={edit} />}
      {sec === "summary" && <Summary s={s} edit={edit} m={current} />}
      {sec === "access" && <Access s={s} edit={edit} />}
    </div>

    <div className="c3-walk">
      {k > 0 ? <button className="fl-btn ghost" onClick={() => move(sections[k - 1][0])}><I n="back" s={17} /> {sections[k - 1][1]}</button> : <span />}
      {k < sections.length - 1 && <button className="fl-btn ghost" onClick={() => move(sections[k + 1][0])}>{sections[k + 1][1]} <I n="arrow" s={17} /></button>}
    </div>

    <div className={"c3-savebar" + (dirty ? " is-dirty" : "")} role="region" aria-label="Save changes">
      <span>{dirty ? <><b>Unsaved changes</b> · {first(s)} sees them after you save.</> : <>All changes saved</>}</span>
      {dirty && <button className="fl-btn ghost" onClick={() => setS(saved)}>Discard</button>}
      <button className="fl-btn fl-primary" disabled={!dirty} onClick={save}><I n="check" s={16} /> Save and update</button>
    </div>

    {editing && <EditDetails s={s} edit={edit} onClose={() => setEditing(false)} />}
    {leaving && <Dialog title="Leave without saving?" onClose={() => setLeaving(false)}>
      <p className="fl-muted">Your changes to {first(s)}’s plan haven’t been saved.</p>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => go("students")}>Leave without saving</button>
        <button className="fl-btn fl-primary" onClick={() => { save(); go("students"); }}>Save and leave</button></div>
    </Dialog>}
  </div>;
}

function EditDetails({ s, edit, onClose }: { s: Student; edit: Edit; onClose: () => void }) {
  const [v, setV] = useState({ name: s.name, subject: s.subject, year: s.year, email: s.email, phone: s.phone });
  const f = (k: keyof typeof v, label: string) => <label className="fl-field"><span>{label}</span><input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>;
  return <Dialog title="Student details" onClose={onClose}>
    <div className="c2-form">{f("name", "Name")}{f("subject", "Subject")}{f("year", "Year")}{f("email", "Email")}{f("phone", "Phone")}</div>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button><button className="fl-btn fl-primary" onClick={() => { edit((x) => ({ ...x, ...v })); onClose(); }}>Apply</button></div>
  </Dialog>;
}

/* ---------- Profile: the student's intake answers ---------- */
function Profile({ s }: { s: Student }) {
  if (!s.answers) return <section className="fl-card"><p className="fl-muted">{first(s)} hasn’t completed the intake form yet.</p></section>;
  const a = s.answers;
  const group = (title: string, rows: [string, string | string[] | undefined][]) => <section className="fl-card c3-told">
    <span className="fl-kicker">{title}</span>
    <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{show(v)}</dd></div>)}</dl>
  </section>;
  return <div className="c3-about">
    <p className="c3-intro">From the intake form {first(s)} completed before their first session.</p>
    {a.note && <blockquote className="c3-quote"><span className="fl-kicker">STUDENT’S NOTE</span><p>“{show(a.note)}”</p></blockquote>}
    <div className="c3-told-grid">
      {group("ACADEMIC BACKGROUND", [["Year of study", a.year], ["Attitude to their subject", a.studies], ["Work experience", a.work], ["Time available per week", a.hours]])}
      {group("INTERESTS AND GOALS", [["Enjoys", a.enjoy], ["Fields of interest", a.fields], ["Plan after graduation", a.after]])}
      {group("CAREER READINESS", [["Clarity about career direction", a.clarity], ["Confidence with new people", a.confidence], ["Main concern", a.worry]])}
      <section className="fl-card c3-told"><span className="fl-kicker">CONTACT</span>
        <dl><div><dt>Email</dt><dd>{s.email}</dd></div><div><dt>Phone</dt><dd>{s.phone}</dd></div></dl></section>
    </div>
  </div>;
}

/* ---------- Sessions, with every counsellor ---------- */
function Sessions({ s, setStatus }: { s: Student; setStatus: (m: Meeting, st: Meeting["status"]) => void }) {
  const list = [...s.meetings].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  return <section className="fl-card c2-table-card">
    <table className="c2-table">
      <thead><tr><th>When</th><th>Counsellor</th><th>Where</th><th>Status</th><th>Summary</th></tr></thead>
      <tbody>{list.map((m) => {
        const c = counsellorById(m.counsellor);
        return <tr key={m.id}>
          <td><b>{when(m.date, m.time)}</b></td>
          <td><span className="c2-who-cell"><Avatar c={c} size={30} />{m.counsellor === me.id ? "You" : c.name}</span></td>
          <td><Mode m={m} /></td>
          <td>{m.counsellor === me.id
            ? <label className={"c3-status-select is-small " + statusTone[m.status]}><span className="sr">Status</span><select value={m.status} onChange={(e) => setStatus(m, e.target.value as Meeting["status"])}>{(Object.keys(statusLabel) as Meeting["status"][]).map((x) => <option key={x} value={x}>{statusLabel[x]}</option>)}</select></label>
            : <span className={"c2-status " + statusTone[m.status]}>{statusLabel[m.status]}</span>}</td>
          <td className="c2-notes-cell">{m.notes ?? <span className="fl-muted">—</span>}</td>
        </tr>;
      })}</tbody>
    </table>
  </section>;
}

/* ---------- Tasks: one to-do list, AI's suggestions already in it ---------- */
let seq = 0;
function Tasks({ s, edit }: { s: Student; edit: Edit }) {
  const [text, setText] = useState("");
  const set = (tid: string, f: (t: Student["tasks"][number]) => Student["tasks"][number]) => edit((x) => ({ ...x, tasks: x.tasks.map((t) => (t.id === tid ? f(t) : t)) }));
  const add = () => { const v = text.trim(); if (v) { edit((x) => ({ ...x, tasks: [...x.tasks, { id: `n${++seq}`, title: v, due: 7, by: me.id }] })); setText(""); } };
  const dues = [3, 7, 10, 14, 21, 30];
  return <section className="fl-card">
    <div className="c2-card-head"><span className="fl-kicker">{first(s).toUpperCase()}’S TASKS</span><small className="fl-muted">Tasks marked AI were suggested from the intake form. Edit, remove or add your own.</small></div>
    {s.tasks.length ? <ul className="c3-tasks">{s.tasks.map((t) => <li key={t.id} className={t.done ? "is-done" : ""}>
      <span className={"c2-tickmark" + (t.done ? " is-on" : "")}>{t.done && <I n="check" s={13} />}</span>
      <div>
        <input className="c3-task-title" value={t.title} aria-label="Task" onChange={(e) => set(t.id, (x) => ({ ...x, title: e.target.value }))} />
        <small>{t.done ? "Done by the student" : "Not done yet"} · {t.ai ? <span className="c3-ai-tag">AI</span> : `added by ${cname(t.by)}`}</small>
      </div>
      {!t.done && <select value={t.due} onChange={(e) => set(t.id, (x) => ({ ...x, due: Number(e.target.value) }))} aria-label="Due in">
        {dues.map((d) => <option key={d} value={d}>Due in {d} days</option>)}{!dues.includes(t.due) && <option value={t.due}>{t.due < 0 ? "Overdue" : `Due in ${t.due} days`}</option>}</select>}
      <button className="fl-icon-btn" aria-label="Remove task" onClick={() => edit((x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== t.id) }))}><I n="x" s={16} /></button>
    </li>)}</ul> : <p className="fl-muted c2-empty">No tasks yet.</p>}
    <form className="c3-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Add a task for ${first(s)}`} aria-label="New task" />
      <button className="fl-btn" disabled={!text.trim()}>Add task</button>
    </form>
  </section>;
}

/* ---------- Meeting summary ---------- */
function Summary({ s, edit, m }: { s: Student; edit: Edit; m?: Meeting }) {
  if (!m) return <section className="fl-card"><p className="fl-muted">No session with you yet.</p></section>;
  const setNotes = (notes: string) => edit((x) => ({ ...x, meetings: x.meetings.map((y) => (y.id === m.id ? { ...y, notes, aiNotes: false } : y)) }));
  return <section className="fl-card c3-summary">
    <div className="c2-card-head"><span className="fl-kicker">MEETING SUMMARY · {when(m.date, m.time).toUpperCase()}</span>{m.aiNotes && <span className="c3-ai-tag">AI draft</span>}</div>
    <p className="c2-hint"><I n="info" s={15} /> {m.status === "done"
      ? `AI drafted this from the meeting. Edit it or write your own; ${first(s)} sees it with the session.`
      : `AI will fill this in once the meeting is marked as done. You can also write your own now.`}</p>
    <textarea className="fl-textarea" rows={8} value={m.notes ?? ""} onChange={(e) => setNotes(e.target.value)} placeholder="What you talked about and what you agreed." />
    {m.status === "done" && <button className="fl-link c3-regen" onClick={() => edit((x) => ({ ...x, meetings: x.meetings.map((y) => (y.id === m.id ? { ...y, notes: aiSummary(x), aiNotes: true } : y)) }))}><I n="spark" s={14} /> Replace with a fresh AI draft</button>}
  </section>;
}

/* ---------- Access: big cards; anything with items is switched on when you save ---------- */
function Access({ s, edit }: { s: Student; edit: Edit }) {
  const cards: { id: Unlockable; title: string; body: string; icon: string; count?: string }[] = [
    { id: "courses", title: "Courses", body: "The courses you picked, with your notes.", icon: "book", count: s.courses.length ? `${s.courses.length} course${s.courses.length > 1 ? "s" : ""} added` : undefined },
    { id: "jobs", title: "Jobs & internships", body: "The openings you picked, with how to apply.", icon: "briefcase", count: s.jobs.length ? `${s.jobs.length} job${s.jobs.length > 1 ? "s" : ""} added` : undefined },
    { id: "abroad", title: "Study Abroad", body: "Programs, documents and the AI program match.", icon: "globe" },
  ];
  return <>
    <p className="c3-intro">Choose what {first(s)} can open in their Career Hub. Courses and jobs switch on by themselves once you add any. CV Studio is always on.</p>
    <div className="c3-access">{cards.map((c) => {
      const on = s.unlock.includes(c.id) || !!c.count;
      const forced = !!c.count;
      return <button key={c.id} role="switch" aria-checked={on} disabled={forced} className={"c3-access-card" + (on ? " is-on" : "")}
        onClick={() => edit((x) => ({ ...x, unlock: x.unlock.includes(c.id) ? x.unlock.filter((u) => u !== c.id) : [...x.unlock, c.id] }))}>
        <span className="c3-access-top"><span className="c3-access-ico"><I n={c.icon} s={26} /></span><span className="c3-access-state">{on ? <><I n="check" s={14} /> On</> : "Off"}</span></span>
        <b>{c.title}</b>
        <small>{c.body}</small>
        <em>{forced ? c.count : on ? "Click to turn off" : "Click to turn on"}</em>
      </button>;
    })}</div>
  </>;
}
