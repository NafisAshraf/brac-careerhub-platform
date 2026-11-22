"use client";
// One student. Three tabs: Overview (brief, answers, private notes), Plan (write and send it, or
// follow progress once sent), Sessions (next one, history). The plan is one simple list of
// suggestions with tick boxes; the send bar stays at the bottom with what will be sent.
import { useState } from "react";
import { questions, unlockables, type Slot, type Unlockable } from "../../flow/data";
import { asks } from "../../flow/converse";
import { Dialog, I, SlotPicker } from "../../flow/parts";
import { useDesk } from "../store";
import { genericIdea, moreIdeas, today, type Student, type Suggestion } from "../data";
import { Av, FinishDialog, Status, first, me, when, type Go } from "./desk";

export type Tab = "overview" | "plan" | "sessions";
const unlockName = (u: Unlockable) => unlockables.find((x) => x.id === u)!.label;
const needs: Record<Suggestion["kind"], Unlockable | null> = { task: null, course: "courses", job: "jobs" };
const many = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
const kindName = { task: "Tasks", course: "Courses", job: "Jobs & internships" };

export function StudentView({ id, tab: start, go }: { id: string; tab: Tab; go: Go }) {
  const { students, dispatch } = useDesk();
  const s = students.find((x) => x.id === id)!;
  const [tab, setTab] = useState<Tab>(start);
  const [finish, setFinish] = useState(false);
  const [msg, setMsg] = useState(false);
  const isToday = s.next?.date === today;
  return <>
    <button className="fl-btn ghost c2-back" onClick={() => go("students")}><I n="back" s={18} /> All students</button>
    <header className="c2-student">
      <Av s={s} size={60} />
      <div>
        <div className="c2-name"><h1>{s.name}</h1><Status s={s} /></div>
        <p>{s.subject} · {s.year}</p>
        <p className="c2-contact"><span><I n="mail" s={14} /> {s.email}</span><span><I n="phone" s={14} /> {s.phone}</span></p>
      </div>
      <div className="c2-student-actions">
        {isToday && s.sessions.some((r) => r.status === "upcoming") && <>
          <a className="fl-btn fl-primary" href="https://meet.google.com/" target="_blank" rel="noreferrer"><I n="video" s={17} /> Join Meet · {when(s.next!.date, s.next!.time).replace("Today, ", "")}</a>
          <button className="fl-btn" onClick={() => setFinish(true)}><I n="check" s={17} /> Mark done</button></>}
        <button className="fl-btn ghost" onClick={() => setMsg(true)}><I n="chat" s={17} /> Message</button>
      </div>
    </header>
    <div className="fl-tabs" role="tablist">
      {([["overview", "Overview"], ["plan", s.plan ? "Plan & progress" : "Plan"], ["sessions", "Sessions"]] as [Tab, string][]).map(([t, l]) =>
        <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{l}{t === "plan" && !s.plan && s.ai && s.status === "plan" && <span className="c2-dot" aria-label="waiting" />}</button>)}
    </div>
    <div className="c2-enter" key={tab}>
      {tab === "overview" && <Overview s={s} onPlan={() => setTab("plan")} />}
      {tab === "plan" && (s.plan ? <Progress s={s} /> : s.ai ? <Builder s={s} /> : <NoAnswers s={s} />)}
      {tab === "sessions" && <Sessions s={s} />}
    </div>
    {finish && <FinishDialog s={s} onClose={() => setFinish(false)} go={(p, i, t) => { if (t) setTab(t); else go(p, i, t); }} />}
    {msg && <MessageDialog s={s} onClose={() => setMsg(false)} onSend={() => { dispatch({ type: "message", id: s.id, text: "" }); setMsg(false); }} />}
  </>;
}

function NoAnswers({ s }: { s: Student }) {
  const { dispatch } = useDesk();
  return <section className="fl-card c2-blank">
    <h2>{first(s)} hasn’t answered the questions yet</h2>
    <p className="fl-muted">The summary and the suggested plan appear here a minute after they do.</p>
    <button className="fl-btn fl-primary" onClick={() => dispatch({ type: "remind", id: s.id })}><I n="mail" s={17} /> Send a reminder</button>
  </section>;
}

/* ---------- Overview ---------- */
function Overview({ s, onPlan }: { s: Student; onPlan: () => void }) {
  const { dispatch } = useDesk();
  const [note, setNote] = useState(s.privateNote ?? "");
  if (!s.answers) return <NoAnswers s={s} />;
  const show = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : v || "—");
  return <div className="c2-two">
    <div className="c2-col">
      {s.brief && <section className="fl-card">
        <div className="c2-card-head"><span className="fl-kicker">SUMMARY</span><small className="fl-muted"><I n="lock" s={13} /> Only counsellors see this</small></div>
        <p className="c2-sum">{s.brief.summary}</p>
        <div className="c2-brief">
          <div><h3>Strengths</h3><ul>{s.brief.strengths.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>Watch for</h3><ul>{s.brief.concerns.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>Worth asking</h3><ul>{s.brief.ask.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        {!s.plan && s.ai && <div className="c2-plan-cta"><span>A plan with {s.ai.length} suggestions is ready to review.</span><button className="fl-btn fl-primary" onClick={onPlan}>Review plan <I n="arrow" s={17} /></button></div>}
      </section>}
      <section className="fl-card">
        <span className="fl-kicker">THEIR ANSWERS</span>
        <dl className="c2-answers">{questions.map((q) => <div key={q.id}><dt>{asks[q.id]?.label ?? q.prompt}</dt><dd>{show(s.answers![q.id])}</dd></div>)}</dl>
      </section>
    </div>
    <aside className="c2-col">
      <section className="fl-card">
        <span className="fl-kicker">PRIVATE NOTES</span>
        <p className="fl-muted c2-small">Only counsellors see these.</p>
        <textarea className="fl-textarea" rows={6} value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => dispatch({ type: "private", id: s.id, text: note })} placeholder="Anything to remember for next time…" />
      </section>
      <section className="fl-card c2-facts">
        <span className="fl-kicker">AT A GLANCE</span>
        <dl>
          <div><dt>Sessions done</dt><dd>{s.sessions.filter((r) => r.status === "completed").length}</dd></div>
          <div><dt>Next session</dt><dd>{s.next ? when(s.next.date, s.next.time) : "None"}</dd></div>
          <div><dt>Last active</dt><dd>{s.lastActive}</dd></div>
          <div><dt>Time per week</dt><dd>{show(s.answers.hours)}</dd></div>
        </dl>
      </section>
    </aside>
  </div>;
}

/* ---------- Plan: pick, edit, send ---------- */
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
  const [confirm, setConfirm] = useState(false);
  const sessionDone = s.sessions.some((r) => r.status === "completed");
  const [notes, setNotes] = useState(() => `Thanks for talking with me, ${first(s)}. ${s.brief ? "We talked about " + s.brief.concerns.map((c) => c.toLowerCase()).join(" and ") + ", and what you’d like to do after university." : ""} Start with the first task this week, then work through the rest. Book a follow-up in about three weeks so we can see how it’s going.`);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const findMore = () => {
    setThinking(true);
    setTimeout(() => {
      const found = moreIdeas.filter((m) => m.match.test(ask)).flatMap((m) => m.items);
      const add = (found.length ? found : [genericIdea]).filter((x) => !items.some((i) => i.id === x.id));
      setItems((l) => [...l, ...add]); setPicked((p) => [...p, ...add.map((x) => x.id)]);
      setThinking(false); setAsk("");
    }, 1500);
  };
  const chosen = items.filter((x) => picked.includes(x.id) && (!needs[x.kind] || unlock.includes(needs[x.kind]!)));
  const n = (k: string) => chosen.filter((x) => x.kind === k).length;
  const send = () => { dispatch({ type: "sendPlan", id: s.id, unlock, items: chosen, notes }); setConfirm(false); window.scrollTo({ top: 0 }); };

  return <div className="c2-builder">
    {!sessionDone && <p className="c2-hint"><I n="info" s={15} /> You can prepare this before the session. {first(s)} sees nothing until you send it.</p>}

    <section className="fl-card">
      <span className="fl-kicker">1 · WHAT {first(s).toUpperCase()} CAN USE</span>
      <p className="fl-muted c2-small">Anything left off stays hidden from their menu. You can open more later.</p>
      <div className="c2-unlocks">{unlockables.map((u) => {
        const on = unlock.includes(u.id);
        return <label key={u.id} aria-label={u.label} className={on ? "is-on" : ""}><input type="checkbox" checked={on} onChange={() => setUnlock((l) => (on ? l.filter((x) => x !== u.id) : [...l, u.id]))} /><span><b>{u.label}</b><small>{u.hint}</small></span></label>;
      })}</div>
    </section>

    <section className="fl-card">
      <div className="c2-card-head"><span className="fl-kicker">2 · SUGGESTIONS</span><small className="fl-muted">Found online from {first(s)}’s answers. Tick what to send.</small></div>
      {(["task", "course", "job"] as const).map((kind) => {
        const lock = needs[kind] && !unlock.includes(needs[kind]!);
        const list = items.filter((x) => x.kind === kind);
        return <div key={kind} className={"c2-group" + (lock ? " is-locked" : "")}>
          <h3>{kindName[kind]} <small>{list.filter((x) => picked.includes(x.id)).length} of {list.length}</small>{lock && <em> · turn on {unlockName(needs[kind]!)} above to send these</em>}</h3>
          <ul className="c2-sugs">{list.map((x) => editing === x.id
            ? <EditRow key={x.id} x={x} onSave={(v) => { setItems((l) => l.map((i) => (i.id === v.id ? v : i))); setEditing(null); }} onCancel={() => setEditing(null)} />
            : <SugRow key={x.id} x={x} on={picked.includes(x.id) && !lock} disabled={!!lock} onToggle={() => toggle(x.id)} onEdit={() => setEditing(x.id)} />)}</ul>
        </div>;
      })}
      <div className="c2-more">
        <form onSubmit={(e) => { e.preventDefault(); findMore(); }}>
          <I n="spark" s={17} /><input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Find more, e.g. “remote internships”, “free courses”, “scholarships”" aria-label="Find more suggestions" disabled={thinking} />
          <button className="fl-btn" disabled={thinking}>{thinking ? "Searching…" : "Find"}</button>
        </form>
        <button className="fl-link" onClick={() => setAdding(true)}>+ Add your own</button>
      </div>
    </section>

    <section className="fl-card">
      <span className="fl-kicker">3 · NOTE TO {first(s).toUpperCase()}</span>
      <p className="fl-muted c2-small">They see this with their session. Put it in your own words.</p>
      <textarea className="fl-textarea" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
    </section>

    <div className="c2-sendbar">
      <span><b>{many(n("task"), "task")}, {many(n("course"), "course")}, {many(n("job"), "job")}</b><small>Opens {unlock.length ? unlock.map(unlockName).join(", ") : "nothing extra"}</small></span>
      <button className="fl-btn fl-primary" disabled={!chosen.length} onClick={() => setConfirm(true)}>Send plan to {first(s)} <I n="arrow" s={17} /></button>
    </div>

    {adding && <AddDialog onClose={() => setAdding(false)} onAdd={(x) => { setItems((l) => [...l, x]); setPicked((p) => [...p, x.id]); setAdding(false); }} />}
    {confirm && <Dialog title={`Send the plan to ${first(s)}?`} onClose={() => setConfirm(false)}>
      <ul className="c2-confirm">
        <li><I n="check" s={16} /> Opens their Career Hub{unlock.length ? ` with ${unlock.map(unlockName).join(", ")}` : ""}</li>
        <li><I n="check" s={16} /> {many(n("task"), "task")}, {many(n("course"), "course")} and {many(n("job"), "job")}</li>
        <li><I n="check" s={16} /> Your note</li>
        {!sessionDone && <li><I n="check" s={16} /> Marks today’s session as done</li>}
        <li><I n="mail" s={16} /> Tells {first(s)} by email and SMS</li>
      </ul>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setConfirm(false)}>Back</button><button className="fl-btn fl-primary" onClick={send}>Send</button></div>
    </Dialog>}
  </div>;
}

function SugRow({ x, on, disabled, onToggle, onEdit }: { x: Suggestion; on: boolean; disabled?: boolean; onToggle: () => void; onEdit: () => void }) {
  return <li className={"c2-sug" + (on ? " is-on" : "") + (x.fresh ? " is-fresh" : "")}>
    <span className="c2-tick"><input type="checkbox" checked={on} disabled={disabled} onChange={onToggle} aria-label={`Send ${x.title}`} /><span><I n="check" s={13} /></span></span>
    {x.image && <img src={x.image} alt="" />}
    <div>
      <b>{x.title}{x.mine && <em className="c2-tag">Yours</em>}{x.fresh && <em className="c2-tag">New</em>}</b>
      <small>{x.meta ?? (x.due ? `Due in ${x.due} days${x.effort ? ` · ${x.effort}` : ""}` : x.detail)}</small>
      {x.why && <p>{x.why}</p>}
    </div>
    <button className="fl-link" onClick={onEdit}>Edit</button>
  </li>;
}
function EditRow({ x, onSave, onCancel }: { x: Suggestion; onSave: (x: Suggestion) => void; onCancel: () => void }) {
  const [v, setV] = useState(x);
  return <li className="c2-sug is-editing">
    <div className="c2-form">
      <label className="fl-field"><span>Title</span><input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></label>
      <label className="fl-field"><span>{x.kind === "task" ? "What to do" : "Your note to the student"}</span><textarea className="fl-textarea" rows={2} value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} /></label>
      {x.kind === "task" && <label className="fl-field"><span>Due in</span><select value={v.due} onChange={(e) => setV({ ...v, due: Number(e.target.value) })}>{[3, 7, 10, 14, 21, 30].map((d) => <option key={d} value={d}>{d} days</option>)}</select></label>}
      <div className="fl-row"><button className="fl-btn fl-primary" onClick={() => onSave(v)}>Save</button><button className="fl-btn ghost" onClick={onCancel}>Cancel</button></div>
    </div>
  </li>;
}

let own = 0;
function AddDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (x: Suggestion) => void }) {
  const [kind, setKind] = useState<Suggestion["kind"]>("task");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  return <Dialog title="Add your own" onClose={onClose}>
    <div className="c2-form">
      <div className="fl-tabs" role="tablist">{(["task", "course", "job"] as const).map((k) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}>{{ task: "Task", course: "Course", job: "Job" }[k]}</button>)}</div>
      <label className="fl-field"><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "task" ? "e.g. Join the BRACU Finance Club" : kind === "course" ? "Course name" : "Job title and organisation"} /></label>
      <label className="fl-field"><span>{kind === "task" ? "What to do" : "Note to the student"}</span><textarea className="fl-textarea" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} /></label>
    </div>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button>
      <button className="fl-btn fl-primary" disabled={!title.trim()} onClick={() => onAdd({ id: `own-${++own}`, kind, title, detail, why: "", source: "Added by you", mine: true, due: kind === "task" ? 7 : undefined })}>Add</button></div>
  </Dialog>;
}

/* ---------- Plan sent: follow progress ---------- */
function Progress({ s }: { s: Student }) {
  const { dispatch } = useDesk();
  const plan = s.plan!;
  const [more, setMore] = useState(false);
  const [pick, setPick] = useState<string[]>([]);
  const tasks = plan.items.filter((x) => x.kind === "task");
  const done = tasks.filter((x) => x.done).length;
  const pool = [...(s.ai ?? []), ...moreIdeas.flatMap((m) => m.items), genericIdea].filter((x) => !plan.items.some((i) => i.title === x.title));
  return <div className="c2-two">
    <div className="c2-col">
      <section className="fl-card">
        <div className="c2-card-head"><span className="fl-kicker">TASKS</span><span className="c2-bar is-big"><span><span style={{ width: `${(done / Math.max(tasks.length, 1)) * 100}%` }} /></span>{done} of {tasks.length} done</span></div>
        <ul className="c2-tasks">{tasks.map((t) => <li key={t.id} className={t.done ? "is-done" : ""}><span className="c2-tickmark">{t.done && <I n="check" s={13} />}</span><div><b>{t.title}</b><small>{t.done ? "Done" : `Due in ${t.due ?? 7} days`}</small></div></li>)}</ul>
      </section>
      {(["course", "job"] as const).map((k) => {
        const list = plan.items.filter((x) => x.kind === k);
        return list.length > 0 && <section key={k} className="fl-card">
          <span className="fl-kicker">{kindName[k].toUpperCase()}</span>
          <ul className="c2-assigned">{list.map((x) => <li key={x.id}>{x.image && <img src={x.image} alt="" />}<div><b>{x.title}</b><small>{x.meta}</small></div>
            <span className={"c2-status " + (x.state === "In progress" || x.state === "Saved" ? "is-green" : "is-grey")}>{x.state ?? "New"}</span></li>)}</ul>
        </section>;
      })}
    </div>
    <aside className="c2-col">
      <section className="fl-card">
        <span className="fl-kicker">OPEN FOR {first(s).toUpperCase()}</span>
        <ul className="c2-open">{plan.unlock.map((u) => <li key={u}><I n="check" s={14} /> {unlockName(u)}</li>)}</ul>
        <p className="fl-muted c2-small">Plan sent {plan.sentOn === today ? "today" : when(plan.sentOn, "10:00").split(",")[0]}.</p>
        {unlockables.filter((u) => !plan.unlock.includes(u.id)).map((u) =>
          <button key={u.id} className="fl-btn wide" onClick={() => dispatch({ type: "addItems", id: s.id, items: [], unlock: [u.id] })}><I n="lock" s={15} /> Open {u.label}</button>)}
      </section>
      <section className="fl-card c2-stack">
        <span className="fl-kicker">KEEP IT GOING</span>
        <button className="fl-btn fl-primary wide" onClick={() => setMore(true)}>Add to the plan</button>
        <button className="fl-btn wide" onClick={() => dispatch({ type: "nudge", id: s.id })}><I n="bell" s={17} /> Send a check-in</button>
      </section>
    </aside>
    {more && <Dialog title={`Add to ${first(s)}’s plan`} wide onClose={() => setMore(false)}>
      <p className="fl-muted">Suggestions based on {first(s)}’s answers and what they’ve finished. Tick any to add.</p>
      <ul className="c2-sugs">{pool.slice(0, 6).map((x) => <SugRow key={x.id} x={x} on={pick.includes(x.id)} onToggle={() => setPick((p) => (p.includes(x.id) ? p.filter((i) => i !== x.id) : [...p, x.id]))} onEdit={() => {}} />)}</ul>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMore(false)}>Cancel</button>
        <button className="fl-btn fl-primary" disabled={!pick.length} onClick={() => { const items = pool.filter((x) => pick.includes(x.id)); dispatch({ type: "addItems", id: s.id, items, unlock: items.map((x) => needs[x.kind]).filter(Boolean) as Unlockable[] }); setMore(false); }}>Add {pick.length || ""}</button></div>
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
  const label = { completed: "Done", cancelled: "Cancelled", "no-show": "Didn’t join", upcoming: "" };
  return <>
    {up ? <section className="fl-card c2-up">
      <span className="fl-kicker">NEXT SESSION · {up.kind.toUpperCase()}</span>
      <h2>{when(up.date, up.time)}, 30 minutes</h2>
      <p className="fl-muted">On Google Meet. {first(s)} gets the link by email and SMS.</p>
      <div className="fl-row"><button className="fl-btn" onClick={() => setMode("move")}><I n="calendar" s={16} /> Move</button><button className="fl-btn ghost danger" onClick={() => setMode("cancel")}>Cancel session</button></div>
    </section> : <section className="fl-card c2-up">
      <span className="fl-kicker">NEXT SESSION</span>
      <h2>Nothing booked</h2>
      <p className="fl-muted">Book one for {first(s)}, or they can book from their side.</p>
      <button className="fl-btn fl-primary" onClick={() => setMode("book")}><I n="calendar" s={16} /> Book a session</button>
    </section>}
    <section className="fl-card c2-table-card">
      <span className="fl-kicker">HISTORY</span>
      {past.length ? <table className="c2-table">
        <thead><tr><th>Date</th><th>Session</th><th>Status</th><th>Notes</th></tr></thead>
        <tbody>{past.map((r) => <tr key={r.date + r.time}>
          <td><b>{when(r.date, r.time)}</b></td><td>{r.kind}</td>
          <td><span className={"c2-status " + (r.status === "completed" ? "is-green" : r.status === "cancelled" ? "is-red" : "is-amber")}>{label[r.status]}</span></td>
          <td className="c2-notes-cell">{r.notes ?? (r.reason ? `Reason: ${r.reason}` : "—")}</td>
        </tr>)}</tbody>
      </table> : <p className="fl-muted c2-empty">No past sessions yet.</p>}
    </section>
    {(mode === "move" || mode === "book") && <Dialog title={mode === "move" ? `Move ${first(s)}’s session` : `Book a session for ${first(s)}`} wide onClose={() => setMode(null)}>
      <SlotPicker counsellor={me.id} value={slot} onChange={setSlot} />
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>Back</button>
        <button className="fl-btn fl-primary" disabled={!slot} onClick={() => { dispatch({ type: mode === "move" ? "reschedule" : "book", id: s.id, date: slot!.date, time: slot!.time }); setMode(null); setSlot(null); }}>{mode === "move" ? "Move" : "Book"} and tell {first(s)}</button></div>
    </Dialog>}
    {mode === "cancel" && <Dialog title="Cancel this session?" onClose={() => setMode(null)}>
      <label className="fl-field"><span>Reason (shown to {first(s)})</span><select value={reason} onChange={(e) => setReason(e.target.value)}>
        {["I’m not available at that time", "I’m unwell", "A Career Hub event clashes", "The student asked to cancel"].map((r) => <option key={r}>{r}</option>)}</select></label>
      <p className="c2-hint"><I n="info" s={15} /> {first(s)} is told by email and SMS and asked to pick a new time.</p>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>Keep it</button>
        <button className="fl-btn danger" onClick={() => { dispatch({ type: "cancel", id: s.id, reason }); setMode(null); }}>Cancel session</button></div>
    </Dialog>}
  </>;
}

function MessageDialog({ s, onClose, onSend }: { s: Student; onClose: () => void; onSend: () => void }) {
  const templates = [`Hi ${first(s)}, just checking in. How are your tasks going?`, `Hi ${first(s)}, a reminder about our session. The link comes by SMS 15 minutes before.`, `Hi ${first(s)}, I added something new to your plan. Have a look when you can.`];
  const [text, setText] = useState(templates[0]);
  return <Dialog title={`Message ${first(s)}`} onClose={onClose}>
    <p className="fl-muted c2-small">Start from one of these, or write your own.</p>
    <div className="c2-templates">{templates.map((t) => <button key={t} className={text === t ? "is-on" : ""} onClick={() => setText(t)}>{t}</button>)}</div>
    <textarea className="fl-textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
    <p className="fl-muted c2-small">Sent by email and SMS, and shown in their notifications.</p>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button><button className="fl-btn fl-primary" disabled={!text.trim()} onClick={onSend}>Send</button></div>
  </Dialog>;
}
