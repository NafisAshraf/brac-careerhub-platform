"use client";
// One student. The sections can be visited in any order and any number of times: what the
// student told us, their sessions (with every counsellor), what they can use, tasks, courses
// and jobs. Each change saves straight away. "Back" and "Next" at the bottom walk through them.
import { useState } from "react";
import { counsellorById, unlockables, type Unlockable } from "../../flow/data";
import { Avatar, Dialog, I } from "../../flow/parts";
import { useDesk } from "./store";
import { today, type Student } from "./db";
import { Picker } from "./picker";
import { Av, Mode, first, me, when, type Go } from "./desk";

export type Section = "about" | "sessions" | "access" | "tasks" | "courses" | "jobs";
const show = (v: string | string[] | undefined) => (Array.isArray(v) ? (v.length ? v.join(", ") : "—") : v || "—");
export const cname = (id: string) => (id === me.id ? "you" : counsellorById(id).name);

export function StudentPage({ id, start, go }: { id: string; start: Section; go: Go }) {
  const { students, update } = useDesk();
  const s = students.find((x) => x.id === id)!;
  const [sec, setSec] = useState<Section>(start);
  const [finishing, setFinishing] = useState(false);
  const [editing, setEditing] = useState(false);
  const now = s.meetings.find((m) => m.status === "upcoming" && m.date === today && m.counsellor === me.id);
  const done = s.meetings.filter((m) => m.status === "done");
  const byWho = Object.entries(done.reduce<Record<string, number>>((a, m) => ({ ...a, [m.counsellor]: (a[m.counsellor] ?? 0) + 1 }), {}));
  const sections: [Section, string, number?][] = [
    ["about", "What they told us"], ["sessions", "Sessions", s.meetings.length], ["access", "Access", s.unlock.length],
    ["tasks", "Tasks", s.tasks.length], ["courses", "Courses", s.courses.length], ["jobs", "Jobs", s.jobs.length]];
  const k = sections.findIndex((x) => x[0] === sec);
  const move = (to: Section) => { setSec(to); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <>
    <button className="fl-btn ghost c2-back" onClick={() => go("students")}><I n="back" s={18} /> All students</button>
    <header className="c2-student">
      <Av s={s} size={60} />
      <div>
        <div className="c2-name"><h1>{s.name}</h1></div>
        <p>{s.subject} · {s.year} · <button className="fl-link" onClick={() => setEditing(true)}>Edit details</button></p>
        <p className="c3-history">{done.length ? <>{done.length} session{done.length > 1 ? "s" : ""} so far: {byWho.map(([c, n]) => `${n} with ${cname(c)}`).join(", ")}</> : "No sessions yet"}</p>
      </div>
      {now && <div className="c2-student-actions">
        {now.mode === "online" ? <a className="fl-btn fl-primary" href="https://meet.google.com/" target="_blank" rel="noreferrer"><I n="video" s={17} /> Join Meet · {when(now.date, now.time).replace("Today, ", "")}</a>
          : <span className="c3-inperson"><I n="user" s={17} /> In person · {when(now.date, now.time).replace("Today, ", "")}</span>}
        <button className="fl-btn" onClick={() => setFinishing(true)}><I n="check" s={17} /> Session done</button>
      </div>}
    </header>

    <div className="fl-tabs c3-sections" role="tablist">{sections.map(([id, label, n]) => <button key={id} role="tab" aria-selected={sec === id} onClick={() => move(id)}>{label}{n !== undefined && <small className="c2-count">{n}</small>}</button>)}</div>

    <div className="c2-enter" key={sec}>
      {sec === "about" && <About s={s} />}
      {sec === "sessions" && <Sessions s={s} />}
      {sec === "access" && <Access s={s} />}
      {sec === "tasks" && <Tasks s={s} />}
      {sec === "courses" && <Picker s={s} kind="course" />}
      {sec === "jobs" && <Picker s={s} kind="job" />}
    </div>

    <div className="c3-walk">
      {k > 0 ? <button className="fl-btn ghost" onClick={() => move(sections[k - 1][0])}><I n="back" s={17} /> {sections[k - 1][1]}</button> : <span />}
      {k < sections.length - 1 ? <button className="fl-btn" onClick={() => move(sections[k + 1][0])}>{sections[k + 1][1]} <I n="arrow" s={17} /></button>
        : <button className="fl-btn" onClick={() => go("students")}>Back to students</button>}
    </div>

    {finishing && now && <FinishDialog s={s} onClose={() => setFinishing(false)} onSave={(notes) => {
      update(s.id, (x) => ({ ...x, meetings: x.meetings.map((m) => (m.id === now.id ? { ...m, status: "done", notes } : m)) }), "Session saved. Set up or update their plan whenever you’re ready.");
      setFinishing(false); move(s.unlock.length ? "tasks" : "access");
    }} />}
    {editing && <EditDetails s={s} onClose={() => setEditing(false)} />}
  </>;
}

function FinishDialog({ s, onClose, onSave }: { s: Student; onClose: () => void; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState("");
  return <Dialog title={`Session with ${first(s)} done`} onClose={onClose}>
    <label className="fl-field"><span>Notes for {first(s)} <small>(they see these with the session)</small></span>
      <textarea className="fl-textarea" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What you talked about and what you agreed." /></label>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button><button className="fl-btn fl-primary" onClick={() => onSave(notes)}>Save</button></div>
  </Dialog>;
}

function EditDetails({ s, onClose }: { s: Student; onClose: () => void }) {
  const { update } = useDesk();
  const [v, setV] = useState({ name: s.name, subject: s.subject, year: s.year, email: s.email, phone: s.phone });
  const f = (k: keyof typeof v, label: string) => <label className="fl-field"><span>{label}</span><input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>;
  return <Dialog title="Student details" onClose={onClose}>
    <div className="c2-form">{f("name", "Name")}{f("subject", "Subject")}{f("year", "Year")}{f("email", "Email")}{f("phone", "Phone")}</div>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button><button className="fl-btn fl-primary" onClick={() => { update(s.id, (x) => ({ ...x, ...v })); onClose(); }}>Save</button></div>
  </Dialog>;
}

/* ---------- What the student told us, in plain reading order ---------- */
function About({ s }: { s: Student }) {
  if (!s.answers) return <section className="fl-card"><p className="fl-muted">{first(s)} hasn’t answered the questions yet.</p></section>;
  const a = s.answers;
  const group = (title: string, rows: [string, string | string[] | undefined][]) => <section className="fl-card c3-told">
    <span className="fl-kicker">{title}</span>
    <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{show(v)}</dd></div>)}</dl>
  </section>;
  return <div className="c3-about">
    {a.note && <blockquote className="c3-quote"><span className="fl-kicker">IN THEIR OWN WORDS</span><p>“{show(a.note)}”</p></blockquote>}
    <div className="c3-told-grid">
      {group("RIGHT NOW", [["Year", a.year], ["How they feel about their subject", a.studies], ["Work experience", a.work], ["Free time each week", a.hours]])}
      {group("WHAT THEY WANT", [["Enjoys", a.enjoy], ["Curious about", a.fields], ["After university", a.after]])}
      {group("HOW THEY FEEL", [["Clear about their career", a.clarity], ["Confident with new people", a.confidence], ["Biggest worry", a.worry]])}
      <section className="fl-card c3-told"><span className="fl-kicker">CONTACT</span>
        <dl><div><dt>Email</dt><dd>{s.email}</dd></div><div><dt>Phone</dt><dd>{s.phone}</dd></div></dl></section>
    </div>
  </div>;
}

/* ---------- Sessions, with every counsellor ---------- */
function Sessions({ s }: { s: Student }) {
  const { update } = useDesk();
  const list = [...s.meetings].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  return <section className="fl-card c2-table-card">
    <table className="c2-table">
      <thead><tr><th>When</th><th>Counsellor</th><th>Where</th><th>Notes</th></tr></thead>
      <tbody>{list.map((m) => {
        const c = counsellorById(m.counsellor);
        return <tr key={m.id}>
          <td><b>{when(m.date, m.time)}</b><br /><span className={"c2-status " + (m.status === "done" ? "is-green" : m.status === "cancelled" ? "is-red" : "is-blue")}>{m.status === "done" ? "Done" : m.status === "cancelled" ? "Cancelled" : "Booked"}</span></td>
          <td><span className="c2-who-cell"><Avatar c={c} size={30} />{m.counsellor === me.id ? "You" : c.name}</span></td>
          <td><Mode m={m} /></td>
          <td className="c3-notes">{m.status === "done"
            ? <textarea className="fl-textarea" rows={2} defaultValue={m.notes ?? ""} placeholder="Add notes" aria-label="Session notes"
              onBlur={(e) => e.target.value !== (m.notes ?? "") && update(s.id, (x) => ({ ...x, meetings: x.meetings.map((y) => (y.id === m.id ? { ...y, notes: e.target.value } : y)) }))} />
            : <span className="fl-muted">—</span>}</td>
        </tr>;
      })}</tbody>
    </table>
    <p className="fl-fine c3-fine"><I n="info" s={14} /> Any counsellor can edit notes, so the next person always has the full picture.</p>
  </section>;
}

/* ---------- Access: which sections the student can use ---------- */
function Access({ s }: { s: Student }) {
  const { update } = useDesk();
  const toggle = (u: Unlockable) => update(s.id, (x) => ({ ...x, unlock: x.unlock.includes(u) ? x.unlock.filter((y) => y !== u) : [...x.unlock, u] }));
  return <section className="fl-card">
    <span className="fl-kicker">WHAT {first(s).toUpperCase()} CAN USE</span>
    <p className="fl-muted c2-small">Turned-on sections appear in {first(s)}’s menu straight away. Tasks and session notes are always on.</p>
    <div className="c3-switches">{unlockables.map((u) => {
      const on = s.unlock.includes(u.id);
      return <button key={u.id} role="switch" aria-checked={on} className={on ? "is-on" : ""} onClick={() => toggle(u.id)}>
        <span className="c3-switch" aria-hidden="true" /><span><b>{u.label}</b><small>{u.hint}</small></span></button>;
    })}</div>
  </section>;
}

/* ---------- Tasks ---------- */
let seq = 0;
function Tasks({ s }: { s: Student }) {
  const { update } = useDesk();
  const [text, setText] = useState("");
  const add = (title: string) => { const v = title.trim(); if (v) update(s.id, (x) => ({ ...x, tasks: [...x.tasks, { id: `n${++seq}`, title: v, due: 7, by: me.id }] })); };
  const set = (id: string, f: (t: Student["tasks"][number]) => Student["tasks"][number]) => update(s.id, (x) => ({ ...x, tasks: x.tasks.map((t) => (t.id === id ? f(t) : t)) }));
  const ideas = s.ai.tasks.filter((x) => !s.tasks.some((t) => t.title === x));
  return <div className="c3-two">
    <section className="fl-card">
      <span className="fl-kicker">{first(s).toUpperCase()}’S TASKS</span>
      {s.tasks.length ? <ul className="c3-tasks">{s.tasks.map((t) => <li key={t.id} className={t.done ? "is-done" : ""}>
        <span className={"c2-tickmark" + (t.done ? " is-on" : "")}>{t.done && <I n="check" s={13} />}</span>
        <div>
          <input className="c3-task-title" defaultValue={t.title} aria-label="Task" onBlur={(e) => e.target.value.trim() && e.target.value !== t.title && set(t.id, (x) => ({ ...x, title: e.target.value.trim() }))} />
          <small>{t.done ? "Done by the student" : "Not done yet"} · added by {cname(t.by)}</small>
        </div>
        {!t.done && <select value={t.due} onChange={(e) => set(t.id, (x) => ({ ...x, due: Number(e.target.value) }))} aria-label="Due in">{[3, 7, 10, 14, 21, 30].map((d) => <option key={d} value={d}>Due in {d} days</option>)}{![3, 7, 10, 14, 21, 30].includes(t.due) && <option value={t.due}>{t.due < 0 ? "Overdue" : `Due in ${t.due} days`}</option>}</select>}
        <button className="fl-icon-btn" aria-label="Remove task" onClick={() => update(s.id, (x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== t.id) }))}><I n="x" s={16} /></button>
      </li>)}</ul> : <p className="fl-muted c2-empty">No tasks yet.</p>}
      <form className="c3-add" onSubmit={(e) => { e.preventDefault(); add(text); setText(""); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Add a task for ${first(s)}`} aria-label="New task" />
        <button className="fl-btn" disabled={!text.trim()}>Add</button>
      </form>
    </section>
    <aside className="fl-card">
      <span className="fl-kicker">IDEAS FROM AI</span>
      <p className="fl-muted c2-small">Based on what {first(s)} told us. Click to add.</p>
      {ideas.length ? <ul className="c3-ideas">{ideas.map((x) => <li key={x}><button onClick={() => add(x)}><I n="spark" s={15} /> {x}<span>+</span></button></li>)}</ul> : <p className="fl-muted">All added.</p>}
    </aside>
  </div>;
}
