"use client";
// Jobs for one student. Not picked from a database: the AI writes a short list of openings from
// the student's answers (already in the list), and the counsellor edits, removes or adds their own.
import { useState } from "react";
import { I } from "../../flow/parts";
import type { Job, Student } from "./db";
import { cname, type Edit } from "./student";
import { first, me } from "./desk";

let seq = 0;
const blank = (): Job => ({ id: `new${++seq}`, title: "", org: "", details: "", link: "", by: me.id });

export function Jobs({ s, edit }: { s: Student; edit: Edit }) {
  const [open, setOpen] = useState<string | null>(null);
  const set = (id: string, f: (j: Job) => Job) => edit((x) => ({ ...x, jobs: x.jobs.map((j) => (j.id === id ? f(j) : j)) }));
  const add = (j: Job) => { edit((x) => ({ ...x, jobs: [...x.jobs, j] })); setOpen(j.id); };
  const ideas = s.ai.jobs.filter((a) => !s.jobs.some((j) => j.title === a.title && j.org === a.org));
  return <div className="c3-two">
    <section className="fl-card">
      <div className="c2-card-head"><span className="fl-kicker">JOBS FOR {first(s).toUpperCase()}</span><small className="fl-muted">Written by AI from the intake form. Edit any of them, remove or add your own.</small></div>
      {s.jobs.length ? <ul className="c3-joblist">{s.jobs.map((j) => {
        const on = open === j.id;
        return <li key={j.id} className={on ? "is-open" : ""}>
          <div className="c3-job-row">
            <span className="c3-job-ico"><I n="briefcase" s={18} /></span>
            <div className="c3-job-main">
              <b>{j.title || "Untitled job"}</b>
              <small>{[j.org, j.details].filter(Boolean).join(" · ") || "Add the organisation and details"}</small>
              <span className="c3-item-by">{j.ai ? <span className="c3-ai-tag">AI</span> : `Added by ${cname(j.by)}`}{j.note ? " · note added" : ""}</span>
            </div>
            <button className="c3-act" aria-expanded={on} onClick={() => setOpen(on ? null : j.id)}>{on ? "Done" : "Edit"}</button>
            <button className="fl-icon-btn" aria-label="Remove job" onClick={() => edit((x) => ({ ...x, jobs: x.jobs.filter((y) => y.id !== j.id) }))}><I n="x" s={16} /></button>
          </div>
          {on && <div className="c3-job-edit">
            {j.why && <p className="c3-why"><I n="spark" s={13} /> {j.why}</p>}
            <div className="c3-job-grid">
              <label className="fl-field"><span>Job title</span><input value={j.title} onChange={(e) => set(j.id, (x) => ({ ...x, title: e.target.value }))} placeholder="e.g. Business Analyst Intern" /></label>
              <label className="fl-field"><span>Organisation</span><input value={j.org} onChange={(e) => set(j.id, (x) => ({ ...x, org: e.target.value }))} placeholder="e.g. bKash" /></label>
              <label className="fl-field"><span>Details</span><input value={j.details} onChange={(e) => set(j.id, (x) => ({ ...x, details: e.target.value }))} placeholder="Place · length · pay" /></label>
              <label className="fl-field"><span>Link to apply</span><input value={j.link} onChange={(e) => set(j.id, (x) => ({ ...x, link: e.target.value }))} placeholder="https://" /></label>
            </div>
            <label className="fl-field"><span>Note for {first(s)} <small>(optional)</small></span><textarea className="fl-textarea" rows={2} value={j.note ?? ""} onChange={(e) => set(j.id, (x) => ({ ...x, note: e.target.value }))} placeholder="e.g. Apply after your CV draft." /></label>
          </div>}
        </li>;
      })}</ul> : <p className="fl-muted c2-empty">No jobs yet.</p>}
      <button className="fl-btn c3-addjob" onClick={() => add(blank())}>+ Add a job</button>
    </section>
    <aside className="fl-card">
      <span className="fl-kicker">MORE FROM AI</span>
      <p className="fl-muted c2-small">Other openings the AI found for {first(s)}. Click to add one.</p>
      {ideas.length ? <ul className="c3-ideas">{ideas.map((a) => <li key={a.id}><button onClick={() => add({ ...a, id: `re${++seq}` })}><I n="spark" s={15} /> <span className="c3-idea-text"><b>{a.title}</b><small>{a.org}</small></span><span>+</span></button></li>)}</ul>
        : <p className="fl-muted">All of the AI’s ideas are in the list.</p>}
    </aside>
  </div>;
}
