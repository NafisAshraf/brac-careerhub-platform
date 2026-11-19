"use client";
// One student, seen by their counsellor: AI brief, answers, sessions, and the AI-drafted plan
// the counsellor edits and sends. Nothing here reaches a real student; it's a demo.
import { useState } from "react";
import { questions, type Slot, type Unlockable, unlockables } from "../flow/data";
import { asks } from "../flow/converse";
import { Dialog, I, SlotPicker } from "../flow/parts";
import { useDesk } from "./store";
import { genericIdea, moreIdeas, today, type Student, type Suggestion } from "./data";
import { Av, FinishDialog, Pill, me, when, type Go } from "./panel";

export type Tab = "overview" | "plan" | "sessions" | "progress";
const first = (s: Student) => s.name.split(" ")[0];
const unlockName = (u: Unlockable) => unlockables.find((x) => x.id === u)!.label;
const needs: Record<Suggestion["kind"], Unlockable | null> = { task: null, course: "courses", job: "jobs" };

export function StudentPage({ id, tab: start, go }: { id: string; tab: Tab; go: Go }) {
  const { students, dispatch } = useDesk();
  const s = students.find((x) => x.id === id)!;
  const [tab, setTab] = useState<Tab>(start === "progress" && !s.plan ? "plan" : start === "progress" ? "plan" : start);
  const [finish, setFinish] = useState(false);
  const [msg, setMsg] = useState(false);
  const isToday = s.next?.date === today;
  return <>
    <button className="cp-back" onClick={() => go("students")}><I n="back" s={16} /> All students</button>
    <header className="cp-student">
      <Av s={s} size={64} />
      <div className="cp-student-id">
        <div className="cp-row"><h1>{s.name}</h1><Pill s={s} /></div>
        <p>{s.subject} · {s.year} · BRAC University</p>
        <p className="cp-contact"><span><I n="mail" s={14} /> {s.email}</span><span><I n="phone" s={14} /> {s.phone}</span></p>
      </div>
      <div className="cp-student-actions">
        {isToday && <a className="fl-btn fl-primary" href="https://meet.google.com/" target="_blank" rel="noreferrer"><I n="video" s={17} /> Start Meet · {when(s.next!.date, s.next!.time).replace("Today, ", "")}</a>}
        {isToday && <button className="fl-btn" onClick={() => setFinish(true)}><I n="check" s={17} /> Mark complete</button>}
        <button className="fl-btn ghost" onClick={() => setMsg(true)}><I n="chat" s={17} /> Message</button>
      </div>
    </header>
    <div className="cp-tabs" role="tablist">
      {([["overview", "Overview"], ["plan", s.plan ? "Plan & progress" : "AI plan draft"], ["sessions", "Sessions"]] as [Tab, string][]).map(([t, l]) =>
        <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t === "plan" && !s.plan && s.ai && <I n="spark" s={15} />}{l}</button>)}
    </div>
    {tab === "overview" && <Overview s={s} onPlan={() => setTab("plan")} />}
    {tab === "plan" && (s.plan ? <Progress s={s} /> : s.ai ? <Builder s={s} /> : <Empty s={s} />)}
    {tab === "sessions" && <Sessions s={s} />}
    {finish && <FinishDialog s={s} onClose={() => setFinish(false)} go={go} />}
    {msg && <MessageDialog s={s} onClose={() => setMsg(false)} onSend={() => { dispatch({ type: "message", id: s.id, text: "" }); setMsg(false); }} />}
  </>;
}

function Empty({ s }: { s: Student }) {
  const { dispatch } = useDesk();
  return <section className="fl-card cp-empty-card">
    <span><I n="notes" s={26} /></span>
    <h2>{first(s)} hasn’t answered the questions yet</h2>
    <p>The AI brief and the draft plan appear here a minute after they do. You can send a reminder now.</p>
    <button className="fl-btn fl-primary" onClick={() => dispatch({ type: "remind", id: s.id })}><I n="mail" s={17} /> Send a reminder</button>
  </section>;
}

/* ---------- Overview ---------- */
function Overview({ s, onPlan }: { s: Student; onPlan: () => void }) {
  const { dispatch } = useDesk();
  const [note, setNote] = useState(s.privateNote ?? "");
  if (!s.answers) return <Empty s={s} />;
  const show = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : v || "—");
  return <div className="cp-two">
    <div className="cp-col">
      {s.brief && <section className="fl-card cp-brief">
        <div className="cp-sec-head"><h2><I n="spark" s={18} /> AI brief</h2><span className="cp-hidden"><I n="lock" s={13} /> Only you see this</span></div>
        <p className="cp-brief-sum">{s.brief.summary}</p>
        <div className="cp-brief-cols">
          <div><h3>Strengths</h3><ul>{s.brief.strengths.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>Watch for</h3><ul>{s.brief.concerns.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>Ask in the session</h3><ul>{s.brief.ask.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        {!s.plan && s.ai && <button className="cp-brief-cta" onClick={onPlan}><I n="spark" s={17} /><span><b>AI drafted a plan for {first(s)}</b><small>{s.ai.length} suggestions found online. Review before you send.</small></span><I n="arrow" s={17} /></button>}
      </section>}
      <section className="fl-card">
        <div className="cp-sec-head"><h2>Their answers</h2><small className="cp-dim">Sent before the first session</small></div>
        <dl className="cp-answers">{questions.map((q) => <div key={q.id}><dt>{asks[q.id].label}</dt><dd>{show(s.answers![q.id])}</dd></div>)}</dl>
      </section>
    </div>
    <aside className="cp-col">
      <section className="fl-card">
        <h2>Private notes</h2>
        <p className="cp-dim cp-small">Only counsellors see these. Not shared with {first(s)}.</p>
        <textarea className="fl-textarea" rows={6} value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => dispatch({ type: "private", id: s.id, text: note })} placeholder="Anything to remember for next time…" />
      </section>
      <section className="fl-card cp-facts">
        <h2>At a glance</h2>
        <ul>
          <li><span>Sessions</span><b>{s.sessions.filter((r) => r.status === "completed").length} done</b></li>
          <li><span>Next session</span><b>{s.next ? when(s.next.date, s.next.time) : "None"}</b></li>
          <li><span>Last active</span><b>{s.lastActive}</b></li>
          <li><span>Can give</span><b>{show(s.answers.hours)} / week</b></li>
        </ul>
      </section>
    </aside>
  </div>;
}

/* ---------- AI plan builder ---------- */
function Builder({ s }: { s: Student }) {
  const { dispatch } = useDesk();
  const abroad = s.answers?.after === "Study abroad";
  const [unlock, setUnlock] = useState<Unlockable[]>(["courses", "jobs", "cv", ...(abroad ? ["abroad" as const] : [])]);
  const [items, setItems] = useState<Suggestion[]>(s.ai!);
  const [picked, setPicked] = useState<string[]>(() => {
    const by = (k: string, n: number) => s.ai!.filter((x) => x.kind === k).slice(0, n).map((x) => x.id);
    return [...by("task", 4), ...by("course", 2), ...by("job", 2)];
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [ask, setAsk] = useState("");
  const [thinking, setThinking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const sessionDone = s.sessions.some((r) => r.status === "completed");
  const [notes, setNotes] = useState(() => `Thanks for talking with me, ${first(s)}. ${s.brief ? "We talked about " + s.brief.concerns.map((c) => c.toLowerCase()).join(" and ") + ", and what you’d like to do after university." : ""} Start with the first task this week, then work through the rest one by one. Book a follow-up in about three weeks so we can check how it’s going.`);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const save = (x: Suggestion) => { setItems((l) => l.map((i) => (i.id === x.id ? x : i))); setEditing(null); };
  const regenerate = () => {
    setThinking(true);
    setTimeout(() => {
      const found = moreIdeas.filter((m) => m.match.test(ask)).flatMap((m) => m.items);
      const add = (found.length ? found : [genericIdea]).filter((x) => !items.some((i) => i.id === x.id));
      setItems((l) => [...l, ...add]);
      setPicked((p) => [...p, ...add.map((x) => x.id)]);
      setThinking(false); setAsk("");
      setTimeout(() => document.querySelector(".cp-sug.is-fresh")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    }, 1800);
  };
  const chosen = items.filter((x) => picked.includes(x.id) && (!needs[x.kind] || unlock.includes(needs[x.kind]!)));
  const n = (k: string) => chosen.filter((x) => x.kind === k).length;
  const send = () => { dispatch({ type: "sendPlan", id: s.id, unlock, items: chosen, notes }); setConfirm(false); window.scrollTo({ top: 0 }); };

  const section = (kind: Suggestion["kind"], title: string, sub: string) => {
    const lock = needs[kind] && !unlock.includes(needs[kind]!);
    const list = items.filter((x) => x.kind === kind);
    return <section className={"cp-build-sec" + (lock ? " is-locked" : "")}>
      <div className="cp-sec-head"><h2>{title} <small>{list.filter((x) => picked.includes(x.id)).length} of {list.length} picked</small></h2>
        {lock ? <span className="cp-dim cp-small">Turn on {unlockName(needs[kind]!)} above to assign these</span> : <span className="cp-dim cp-small">{sub}</span>}</div>
      <div className="cp-sugs">{list.map((x) => editing === x.id
        ? <EditCard key={x.id} x={x} onSave={save} onCancel={() => setEditing(null)} />
        : <SugCard key={x.id} x={x} on={picked.includes(x.id)} disabled={!!lock} onToggle={() => toggle(x.id)} onEdit={() => setEditing(x.id)}
          warn={x.link && !unlock.includes(x.link) ? `Needs ${unlockName(x.link)}` : undefined} />)}</div>
    </section>;
  };

  return <div className="cp-build">
    <div className="cp-col">
      <section className="cp-ai-bar">
        <div className="cp-ai-top">
          <span className="cp-ai-icon"><I n="spark" s={20} /></span>
          <div><b>AI drafted this from {first(s)}’s answers</b><small>Searched 46 pages on Coursera, bdjobs, LinkedIn and university sites · 8 min ago</small></div>
          <span className="cp-hidden"><I n="lock" s={13} /> Hidden from {first(s)}</span>
        </div>
        <form className="cp-ai-ask" onSubmit={(e) => { e.preventDefault(); regenerate(); }}>
          <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Ask AI for more, e.g. “remote internships”, “free courses”, “scholarships”" aria-label="Ask AI for more suggestions" disabled={thinking} />
          <button className="fl-btn" disabled={thinking}>{thinking ? <><span className="cp-spin" /> Searching…</> : <><I n="wand" s={16} /> Find more</>}</button>
        </form>
        {thinking && <div className="cp-shimmer"><i /><i /><i /></div>}
      </section>

      {!sessionDone && <p className="cp-hint"><I n="info" s={15} /> You can prepare this before the session. {first(s)} sees nothing until you press Send.</p>}

      <section className="cp-build-sec">
        <div className="cp-sec-head"><h2>1. What should {first(s)} be able to use?</h2><span className="cp-dim cp-small">Anything left off stays hidden from their menu.</span></div>
        <div className="cp-unlocks">{unlockables.map((u) => {
          const on = unlock.includes(u.id);
          const rec = u.id !== "abroad" || abroad;
          return <label key={u.id} className={on ? "is-on" : ""}>
            <input type="checkbox" checked={on} onChange={() => setUnlock((l) => (on ? l.filter((x) => x !== u.id) : [...l, u.id]))} />
            <span className="cp-switch" aria-hidden="true" />
            <span><b>{u.label}</b><small>{u.hint}</small>{rec && <em><I n="spark" s={11} /> AI suggests</em>}</span>
          </label>;
        })}</div>
      </section>
      {section("task", "2. Tasks", "In order. The first one shows on their home screen.")}
      {section("course", "3. Courses", "Your note shows on each course card.")}
      {section("job", "4. Jobs & internships", "Check deadlines before you send.")}
      <button className="cp-add" onClick={() => setAdding(true)}><I n="edit" s={17} /> Add your own task, course or job</button>

      <section className="cp-build-sec">
        <div className="cp-sec-head"><h2>5. Session notes for {first(s)}</h2><span className="cp-pill is-violet"><I n="spark" s={11} /> AI draft</span></div>
        <textarea className="fl-textarea" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <p className="cp-dim cp-small">{first(s)} sees these under Sessions. Edit them in your own words.</p>
      </section>
    </div>

    <aside className="cp-send">
      <div className="fl-card">
        <h2>{first(s)} will get</h2>
        <div className="cp-send-unlock">{unlock.length ? unlock.map((u) => <span key={u}><I n="check" s={13} /> {unlockName(u)}</span>) : <i className="cp-dim">Nothing unlocked</i>}</div>
        <ul className="cp-send-counts">
          <li><b>{n("task")}</b> tasks</li><li><b>{n("course")}</b> courses</li><li><b>{n("job")}</b> jobs</li><li><b>1</b> session note</li>
        </ul>
        <button className="fl-btn wide" onClick={() => setPreview(true)}><I n="phone" s={17} /> Preview as {first(s)}</button>
        <button className="fl-btn fl-primary big wide" disabled={!chosen.length} onClick={() => setConfirm(true)}>Send plan & unlock</button>
        <small className="cp-dim cp-small">They’re told by email and SMS. You can change the plan any time.</small>
      </div>
    </aside>

    {adding && <AddDialog onClose={() => setAdding(false)} onAdd={(x) => { setItems((l) => [...l, x]); setPicked((p) => [...p, x.id]); setAdding(false); }} />}
    {preview && <Dialog title={`What ${first(s)} will see`} onClose={() => setPreview(false)}><PhonePreview s={s} items={chosen} unlock={unlock} /></Dialog>}
    {confirm && <Dialog title={`Send the plan to ${first(s)}?`} onClose={() => setConfirm(false)}>
      <ul className="cp-confirm">
        <li><I n="check" s={16} /> Opens {unlock.length ? unlock.map(unlockName).join(", ") : "their Career Hub"}</li>
        <li><I n="check" s={16} /> Adds {n("task")} tasks, {n("course")} courses and {n("job")} jobs</li>
        <li><I n="check" s={16} /> Shares your session notes</li>
        {!sessionDone && <li><I n="check" s={16} /> Marks today’s session as complete</li>}
        <li><I n="mail" s={16} /> Tells {first(s)} by email ({s.email}) and SMS</li>
      </ul>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setConfirm(false)}>Back</button><button className="fl-btn fl-primary" onClick={send}>Send to {first(s)}</button></div>
    </Dialog>}
  </div>;
}

function SugCard({ x, on, disabled, onToggle, onEdit, warn }: { x: Suggestion; on: boolean; disabled?: boolean; onToggle: () => void; onEdit: () => void; warn?: string }) {
  const [why, setWhy] = useState(false);
  return <article className={"cp-sug" + (on && !disabled ? " is-on" : "") + (x.fresh ? " is-fresh" : "")}>
    <label className="cp-check"><input type="checkbox" checked={on && !disabled} disabled={disabled} onChange={onToggle} aria-label={`Assign ${x.title}`} /><span><I n="check" s={14} /></span></label>
    {x.image && <img src={x.image} alt="" className="cp-sug-img" />}
    <div className="cp-sug-body">
      <div className="cp-row">{x.fresh && <em className="cp-pill is-violet">New</em>}{x.mine && <em className="cp-pill is-blue">Yours</em>}{warn && <em className="cp-pill is-amber">{warn}</em>}</div>
      <h3>{x.title}</h3>
      {x.meta && <small className="cp-meta">{x.meta}</small>}
      <p>{x.detail}</p>
      <div className="cp-sug-foot">
        {x.kind === "task" && x.due && <span><I n="calendar" s={13} /> Due in {x.due} days{x.effort ? ` · ${x.effort}` : ""}</span>}
        {!x.mine && <button className="cp-why" onClick={() => setWhy((w) => !w)} aria-expanded={why}><I n="spark" s={13} /> Why this?</button>}
        <span className="cp-src"><I n="external" s={12} /> {x.source}</span>
        <button className="fl-link" onClick={onEdit}>Edit</button>
      </div>
      {why && <p className="cp-why-text">{x.why}</p>}
    </div>
  </article>;
}

function EditCard({ x, onSave, onCancel }: { x: Suggestion; onSave: (x: Suggestion) => void; onCancel: () => void }) {
  const [v, setV] = useState(x);
  return <article className="cp-sug is-editing">
    <div className="cp-sug-body cp-form">
      <label>Title<input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></label>
      <label>{x.kind === "task" ? "What to do" : "Your note to the student"}<textarea rows={2} value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} /></label>
      {x.kind === "task" && <label>Due in<select value={v.due} onChange={(e) => setV({ ...v, due: Number(e.target.value) })}>{[3, 7, 10, 14, 21, 30].map((d) => <option key={d} value={d}>{d} days</option>)}</select></label>}
      <div className="cp-row"><button className="fl-btn fl-primary" onClick={() => onSave(v)}>Save</button><button className="fl-btn ghost" onClick={onCancel}>Cancel</button></div>
    </div>
  </article>;
}

let own = 0;
function AddDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (x: Suggestion) => void }) {
  const [kind, setKind] = useState<Suggestion["kind"]>("task");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [link, setLink] = useState("");
  return <Dialog title="Add your own" onClose={onClose}>
    <div className="cp-form">
      <div className="cp-seg">{(["task", "course", "job"] as const).map((k) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{{ task: "Task", course: "Course", job: "Job" }[k]}</button>)}</div>
      <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "task" ? "e.g. Join the BRACU Finance Club" : kind === "course" ? "Course name" : "Job title and organisation"} /></label>
      <label>{kind === "task" ? "What to do" : "Note to the student"}<textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} /></label>
      {kind !== "task" && <label>Link<input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" /></label>}
    </div>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button>
      <button className="fl-btn fl-primary" disabled={!title.trim()} onClick={() => onAdd({ id: `own-${++own}`, kind, title, detail, why: "", source: link.replace(/^https?:\/\//, "").split("/")[0] || "Added by you", mine: true, due: kind === "task" ? 7 : undefined })}>Add</button></div>
  </Dialog>;
}

function PhonePreview({ s, items, unlock }: { s: Student; items: Suggestion[]; unlock: Unlockable[] }) {
  return <div className="cp-phone"><div className="cp-phone-screen">
    <small>CAREER HUB</small>
    <h3>Your Career Hub is open, {first(s)}!</h3>
    <p>{me.name} picked these for you.</p>
    <div className="cp-phone-menu">{["Home", "My tasks", ...unlock.map(unlockName), "Sessions"].map((m) => <span key={m}>{m}</span>)}</div>
    <b className="cp-phone-h">Your tasks</b>
    <ul>{items.filter((x) => x.kind === "task").map((x, i) => <li key={x.id} className={i === 0 ? "is-first" : ""}><span />{x.title}<small>Due in {x.due ?? 7} days</small></li>)}</ul>
  </div></div>;
}

/* ---------- After the plan is sent ---------- */
function Progress({ s }: { s: Student }) {
  const { dispatch } = useDesk();
  const plan = s.plan!;
  const [more, setMore] = useState(false);
  const tasks = plan.items.filter((x) => x.kind === "task");
  const done = tasks.filter((x) => x.done).length;
  const pool = [...(s.ai ?? []), ...moreIdeas.flatMap((m) => m.items), genericIdea].filter((x) => !plan.items.some((i) => i.title === x.title));
  const [pick, setPick] = useState<string[]>([]);
  return <div className="cp-two">
    <div className="cp-col">
      <section className="fl-card">
        <div className="cp-sec-head"><h2>Tasks</h2><span className="cp-progress is-big"><span><span style={{ width: `${(done / Math.max(tasks.length, 1)) * 100}%` }} /></span>{done} of {tasks.length} done</span></div>
        <ul className="cp-tasks">{tasks.map((t) => <li key={t.id} className={t.done ? "is-done" : ""}><span className="cp-tick">{t.done && <I n="check" s={13} />}</span><div><b>{t.title}</b><small>{t.done ? "Done" : `Due in ${t.due ?? 7} days`}</small></div></li>)}</ul>
      </section>
      {(["course", "job"] as const).map((k) => {
        const list = plan.items.filter((x) => x.kind === k);
        return list.length > 0 && <section key={k} className="fl-card">
          <h2>{k === "course" ? "Courses" : "Jobs & internships"}</h2>
          <ul className="cp-assigned">{list.map((x) => <li key={x.id}>{x.image && <img src={x.image} alt="" />}<div><b>{x.title}</b><small>{x.meta}</small></div>
            <span className={"cp-pill " + (x.state === "In progress" || x.state === "Saved" ? "is-green" : "is-grey")}>{x.state ?? "New"}</span></li>)}</ul>
        </section>;
      })}
    </div>
    <aside className="cp-col">
      <section className="fl-card">
        <h2>Unlocked for {first(s)}</h2>
        <div className="cp-send-unlock">{plan.unlock.map((u) => <span key={u}><I n="check" s={13} /> {unlockName(u)}</span>)}</div>
        <p className="cp-dim cp-small">Plan sent {plan.sentOn === today ? "today" : when(plan.sentOn, "10:00").split(",")[0]}.</p>
        <div className="cp-locked-list">{unlockables.filter((u) => !plan.unlock.includes(u.id)).map((u) =>
          <button key={u.id} className="fl-btn wide" onClick={() => dispatch({ type: "addItems", id: s.id, items: [], unlock: [u.id] })}><I n="lock" s={15} /> Unlock {u.label}</button>)}</div>
      </section>
      <section className="fl-card">
        <h2>Keep it going</h2>
        <button className="fl-btn fl-primary wide" onClick={() => setMore(true)}><I n="spark" s={17} /> Add more from AI</button>
        <button className="fl-btn wide" onClick={() => dispatch({ type: "nudge", id: s.id })}><I n="bell" s={17} /> Send a check-in</button>
      </section>
    </aside>
    {more && <Dialog title={`More for ${first(s)}`} wide onClose={() => setMore(false)}>
      <p className="fl-muted">AI looked at {first(s)}’s answers and what they’ve finished so far. Pick anything to add.</p>
      <div className="cp-sugs">{pool.slice(0, 6).map((x) => <SugCard key={x.id} x={x} on={pick.includes(x.id)} onToggle={() => setPick((p) => (p.includes(x.id) ? p.filter((i) => i !== x.id) : [...p, x.id]))} onEdit={() => {}} />)}</div>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMore(false)}>Cancel</button>
        <button className="fl-btn fl-primary" disabled={!pick.length} onClick={() => { const items = pool.filter((x) => pick.includes(x.id)); dispatch({ type: "addItems", id: s.id, items, unlock: items.map((x) => needs[x.kind]).filter(Boolean) as Unlockable[] }); setMore(false); }}>Add {pick.length || ""} to plan</button></div>
    </Dialog>}
  </div>;
}

/* ---------- Sessions ---------- */
function Sessions({ s }: { s: Student }) {
  const { dispatch } = useDesk();
  const [mode, setMode] = useState<"move" | "cancel" | "book" | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState("I’m not available at that time");
  const up = s.sessions.find((r) => r.status === "upcoming");
  const past = s.sessions.filter((r) => r.status !== "upcoming").reverse();
  return <div className="cp-two">
    <div className="cp-col">
      {up ? <section className="fl-card cp-up">
        <span className="fl-kicker">NEXT SESSION</span>
        <h2>{when(up.date, up.time)} · 30 min</h2>
        <p>{up.kind} on Google Meet. {first(s)} gets the link by email and SMS the day before and 15 minutes before.</p>
        <div className="cp-row"><button className="fl-btn" onClick={() => setMode("move")}><I n="calendar" s={16} /> Move</button><button className="fl-btn ghost danger" onClick={() => setMode("cancel")}><I n="x" s={16} /> Cancel</button></div>
      </section> : <section className="fl-card cp-up">
        <h2>No session booked</h2>
        <p>Book one for {first(s)}, or they can book from their side. Only one upcoming session at a time.</p>
        <button className="fl-btn fl-primary" onClick={() => setMode("book")}><I n="calendar" s={16} /> Book a session</button>
      </section>}
      <section className="fl-card">
        <h2>History</h2>
        {past.length ? <ol className="cp-history">{past.map((r) => <li key={r.date + r.time} className={"is-" + r.status}>
          <b>{when(r.date, r.time)} · {r.kind}</b>
          <span className={"cp-pill " + (r.status === "completed" ? "is-green" : r.status === "cancelled" ? "is-red" : "is-amber")}>{{ completed: "Done", cancelled: "Cancelled", "no-show": "Didn’t join", upcoming: "" }[r.status]}</span>
          {r.notes && <p>{r.notes}</p>}{r.reason && <p>Reason: {r.reason}</p>}
        </li>)}</ol> : <p className="cp-dim">No past sessions yet.</p>}
      </section>
    </div>
    <aside className="cp-col"><section className="fl-card cp-facts"><h2>How sessions work</h2><ul>
      <li><span>Length</span><b>30 minutes</b></li><li><span>Break after</span><b>15 minutes</b></li><li><span>Where</span><b>Google Meet</b></li><li><span>Reminders</span><b>Email + SMS</b></li></ul></section></aside>

    {(mode === "move" || mode === "book") && <Dialog title={mode === "move" ? `Move ${first(s)}’s session` : `Book a session for ${first(s)}`} wide onClose={() => setMode(null)}>
      <SlotPicker counsellor="nusrat" value={slot} onChange={setSlot} />
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>Back</button>
        <button className="fl-btn fl-primary" disabled={!slot} onClick={() => { dispatch({ type: mode === "move" ? "reschedule" : "book", id: s.id, date: slot!.date, time: slot!.time }); setMode(null); setSlot(null); }}>{mode === "move" ? "Move and tell" : "Book and tell"} {first(s)}</button></div>
    </Dialog>}
    {mode === "cancel" && <Dialog title="Cancel this session?" onClose={() => setMode(null)}>
      <label className="cp-field">Reason (shown to {first(s)})<select value={reason} onChange={(e) => setReason(e.target.value)}>
        {["I’m not available at that time", "I’m unwell", "A Career Hub event clashes", "The student asked to cancel"].map((r) => <option key={r}>{r}</option>)}</select></label>
      <p className="cp-hint"><I n="info" s={15} /> {first(s)} is told by email and SMS and asked to pick a new time.</p>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>Keep it</button>
        <button className="fl-btn danger" onClick={() => { dispatch({ type: "cancel", id: s.id, reason }); setMode(null); }}>Cancel session</button></div>
    </Dialog>}
  </div>;
}

function MessageDialog({ s, onClose, onSend }: { s: Student; onClose: () => void; onSend: () => void }) {
  const templates = [`Hi ${first(s)}, just checking in. How are your tasks going?`, `Hi ${first(s)}, a reminder about our session. The link comes by SMS 15 minutes before.`, `Hi ${first(s)}, I added something new to your plan. Have a look when you can.`];
  const [text, setText] = useState(templates[0]);
  return <Dialog title={`Message ${first(s)}`} onClose={onClose}>
    <div className="cp-templates">{templates.map((t) => <button key={t} className={text === t ? "is-on" : ""} onClick={() => setText(t)}>{t}</button>)}</div>
    <textarea className="fl-textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
    <p className="cp-dim cp-small">Sent by email and SMS. It also shows in their notifications.</p>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button><button className="fl-btn fl-primary" disabled={!text.trim()} onClick={onSend}>Send</button></div>
  </Dialog>;
}
