"use client";
// Building blocks shared by the three counsellor-first versions.
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  counsellorById, counsellors, dayLabel, endTime, openTimes, questions, shortDate, shortWeekday, slotLabel, time12, unlockables, upcomingDays,
  type Answers, type Counsellor, type Note, type Question, type Slot, type Unlockable,
} from "./data";
import { useFlow } from "./store";

/* ---------- Icons ---------- */
const paths: Record<string, string> = {
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4Z M10 20a2 2 0 0 0 4 0",
  calendar: "M4 6h16v15H4Z M8 3v5 M16 3v5 M4 10h16",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 2",
  mail: "M3 6h18v12H3Z M3 7l9 7 9-7",
  phone: "M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z M11 18h2",
  video: "M3 7h12v10H3Z M15 10l6-3v10l-6-3",
  check: "M5 12l5 5L20 7",
  x: "M6 6l12 12 M18 6 6 18",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  back: "M20 12H4 M10 6l-6 6 6 6",
  play: "M8 5v14l11-7Z",
  pause: "M7 5h3v14H7Z M14 5h3v14h-3Z",
  replay: "M4 12a8 8 0 1 0 2.3-5.7 M4 4v5h5",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4Z",
  tasks: "M9 6h11 M9 12h11 M9 18h11 M4 6l1 1 2-2 M4 12l1 1 2-2 M4 18l1 1 2-2",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z M4 21V5 M8 7h7",
  briefcase: "M3 8h18v12H3Z M8 8V5h8v3 M3 13h18",
  doc: "M6 3h8l4 4v14H6Z M14 3v5h4 M9 12h6 M9 16h6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9 M12 3C9.5 5.6 8.3 8.6 8.3 12s1.2 6.4 3.7 9",
  chat: "M4 5h16v11H9l-5 4Z",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2",
  lock: "M6 11h12v10H6Z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  spark: "m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2Z",
  edit: "M4 20h4L19 9l-4-4L4 16v4Z",
  notes: "M6 3h12v18H6Z M9 8h6 M9 12h6 M9 16h3",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 11v6 M12 7.5v.5",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  wand: "M4 20 15 9 M14 4v3 M19 9h-3 M17.5 5.5l-2 2 M20 4l-1 1",
};
export function I({ n, s = 20 }: { n: string; s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[n] || paths.info} /></svg>;
}

export function Avatar({ c, size = 48 }: { c: Counsellor; size?: number }) {
  return <span className="fl-avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(140deg, ${c.tone}, ${c.tone}cc)` }} aria-hidden="true">{c.initials}</span>;
}

/* ---------- Dialog ---------- */
export function Dialog({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    d?.showModal();
    const out = (e: MouseEvent) => { if (e.target === d) onClose(); };
    d?.addEventListener("click", out);
    return () => { d?.removeEventListener("click", out); d?.close(); document.body.style.overflow = old; };
  }, [onClose]);
  return <dialog ref={ref} className={"fl-dialog" + (wide ? " is-wide" : "")} aria-label={title} onCancel={(e) => { e.preventDefault(); onClose(); }}>
    <header><h2>{title}</h2><button className="fl-icon-btn" aria-label="Close" onClick={onClose}><I n="x" /></button></header>
    <div className="fl-dialog-body">{children}</div>
  </dialog>;
}

/* ---------- Notifications ---------- */
const ago = (at: number) => {
  const m = Math.round((Date.now() - at) / 60000);
  return m < 1 ? "Just now" : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
};
const noteIcon: Record<Note["kind"], string> = { booking: "calendar", reminder: "mail", test: "notes", counsellor: "chat", unlock: "spark", task: "tasks", system: "info" };
export function Bell({ onGo }: { onGo?: (target: string) => void }) {
  const { notes, unread, dispatch } = useFlow();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return <div className="fl-bell" ref={box}>
    <button className="fl-bell-btn" aria-expanded={open} aria-label={`Notifications${unread ? `, ${unread} new` : ""}`} onClick={() => setOpen((o) => !o)}>
      <I n="bell" />{unread > 0 && <span className="fl-bell-count">{unread}</span>}
    </button>
    {open && <div className="fl-bell-panel" role="region" aria-label="Notifications">
      <header><strong>Notifications</strong>{unread > 0 && <button className="fl-link" onClick={() => dispatch({ type: "read" })}>Mark all as read</button>}</header>
      {notes.length === 0 ? <p className="fl-bell-empty">Nothing yet. Updates about your sessions will show up here.</p> :
        <ul>{notes.map((n) => <li key={n.id} className={n.read ? "" : "is-new"}>
          <button onClick={() => { dispatch({ type: "read", id: n.id }); if (n.go && onGo) { onGo(n.go); setOpen(false); } }}>
            <span className={"fl-note-icon k-" + n.kind}><I n={noteIcon[n.kind]} s={17} /></span>
            <span><strong>{n.title}</strong>{n.body && <small>{n.body}</small>}<em>{ago(n.at)}</em></span>
          </button></li>)}</ul>}
    </div>}
  </div>;
}

/* ---------- Slot picker for one counsellor ---------- */
export function SlotPicker({ counsellor, value, onChange, compact }: { counsellor: string; value: Slot | null; onChange: (s: Slot) => void; compact?: boolean }) {
  const days = upcomingDays(compact ? 6 : 8);
  const firstWithTimes = days.find((d) => openTimes(counsellor, d).length) ?? days[0];
  const [day, setDay] = useState(value && value.counsellor === counsellor ? value.date : firstWithTimes.date);
  const current = days.find((d) => d.date === day) ?? firstWithTimes;
  const times = openTimes(counsellor, current);
  const morning = times.filter((t) => t < "13:00"), afternoon = times.filter((t) => t >= "13:00");
  return <div className="fl-slots">
    <div className="fl-days" role="radiogroup" aria-label="Day">
      {days.map((d) => { const n = openTimes(counsellor, d).length; return <button key={d.date} role="radio" aria-checked={d.date === current.date} disabled={!n} className={d.date === current.date ? "is-on" : ""} onClick={() => setDay(d.date)}>
        <small>{dayLabel(d.date) === "Tomorrow" ? "Tomorrow" : shortWeekday(d.date)}</small><strong>{shortDate(d.date)}</strong><em>{n ? `${n} open` : "Off"}</em>
      </button>; })}
    </div>
    {[["Before lunch", morning], ["After lunch", afternoon]].map(([label, list]) => (list as string[]).length > 0 && <div key={label as string} className="fl-times">
      <span>{label as string}</span>
      <div role="radiogroup" aria-label={`${label} times`}>{(list as string[]).map((t) => { const on = value?.counsellor === counsellor && value.date === current.date && value.time === t;
        return <button key={t} role="radio" aria-checked={on} className={on ? "is-on" : ""} onClick={() => onChange({ counsellor, date: current.date, time: t })}>{time12(t)}</button>; })}</div>
    </div>)}
    <p className="fl-fine"><I n="clock" s={15} /> Each session is 30 minutes.</p>
  </div>;
}

export function CounsellorCard({ c, selected, onSelect, cta = "Choose" }: { c: Counsellor; selected?: boolean; onSelect: () => void; cta?: string }) {
  return <button className={"fl-counsellor" + (selected ? " is-on" : "")} aria-pressed={selected} onClick={onSelect}>
    <Avatar c={c} size={56} />
    <span className="fl-counsellor-text">
      <strong>{c.name}</strong><small>{c.title}</small>
      <span className="fl-tags">{c.focus.map((f) => <em key={f}>{f}</em>)}</span>
      <span className="fl-counsellor-about">{c.about}</span>
      <span className="fl-counsellor-meta">Speaks {c.languages} · {c.sessions} sessions held</span>
    </span>
    <span className="fl-counsellor-cta">{selected ? <><I n="check" s={16} /> Chosen</> : cta}</span>
  </button>;
}

/* ---------- Booked session: how to join, change, cancel ---------- */
export function JoinSteps({ email, phone }: { email: string; phone: string }) {
  return <ol className="fl-join">
    <li><span><I n="mail" s={18} /></span><div><strong>Check your email and SMS</strong><small>We’ll send the meeting link to {email} and {phone}, the day before and 15 minutes before.</small></div></li>
    <li><span><I n="video" s={18} /></span><div><strong>Join from your phone or laptop</strong><small>Tap the link at the session time. It opens Google Meet, outside this app. No need to install anything on a laptop.</small></div></li>
    <li><span><I n="chat" s={18} /></span><div><strong>Talk for 30 minutes</strong><small>Find a quiet place. Your counsellor will already have read your answers.</small></div></li>
  </ol>;
}

export function ChangeSession({ onDone }: { onDone?: () => void }) {
  const { upcoming, dispatch } = useFlow();
  const [mode, setMode] = useState<null | "move" | "cancel">(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState("");
  if (!upcoming) return null;
  const c = counsellorById(upcoming.slot.counsellor);
  return <>
    <div className="fl-change">
      <button className="fl-btn" onClick={() => { setSlot(null); setMode("move"); }}><I n="calendar" s={17} /> Change time</button>
      <button className="fl-btn ghost danger" onClick={() => setMode("cancel")}>Cancel session</button>
    </div>
    {mode === "move" && <Dialog title={`Pick a new time with ${c.name}`} wide onClose={() => setMode(null)}>
      <p className="fl-muted">Current time: <b>{slotLabel(upcoming.slot)}</b></p>
      <SlotPicker counsellor={c.id} value={slot} onChange={setSlot} />
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>Keep current time</button>
        <button className="fl-btn fl-primary" disabled={!slot} onClick={() => { dispatch({ type: "reschedule", slot: slot! }); setMode(null); onDone?.(); }}>{slot ? `Move to ${dayLabel(slot.date)}, ${time12(slot.time)}` : "Pick a time first"}</button></div>
    </Dialog>}
    {mode === "cancel" && <Dialog title="Cancel this session?" onClose={() => setMode(null)}>
      <p className="fl-muted">{slotLabel(upcoming.slot)} with {c.name}. You can book a new time afterwards.</p>
      <label className="fl-field"><span>Reason <small>(optional, helps your counsellor)</small></span>
        <select value={reason} onChange={(e) => setReason(e.target.value)}><option value="">Choose one</option><option>I have a class or exam</option><option>I’m not feeling well</option><option>I want a different counsellor</option><option>Something else came up</option></select></label>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>Keep my session</button>
        <button className="fl-btn danger" onClick={() => { dispatch({ type: "cancel", reason }); setMode(null); onDone?.(); }}>Yes, cancel it</button></div>
    </Dialog>}
  </>;
}

/* ---------- One questionnaire answer ---------- */
export function Answer({ q, answers, onChange, big }: { q: Question; answers: Answers; onChange: (a: Answers) => void; big?: boolean }) {
  const value = answers[q.id];
  const set = (v: string | string[]) => onChange({ ...answers, [q.id]: v });
  if (q.kind === "text") return <textarea className="fl-textarea" rows={big ? 5 : 3} aria-label={q.prompt} placeholder="Type here…" value={(value as string) || ""} onChange={(e) => set(e.target.value)} />;
  if (q.kind === "scale") return <div className={"fl-scale" + (big ? " is-big" : "")} role="radiogroup" aria-label={q.prompt}>
    {q.options!.map((o, i) => <button key={o} role="radio" aria-checked={value === o} className={value === o ? "is-on" : ""} onClick={() => set(o)}><b>{i + 1}</b><span>{o}</span></button>)}
  </div>;
  const many = q.kind === "many";
  const list = many ? ((value as string[]) || []) : [];
  return <div className={"fl-options" + (big ? " is-big" : "") + (many ? " is-many" : "")} role={many ? "group" : "radiogroup"} aria-label={q.prompt}>
    {q.options!.map((o) => {
      const on = many ? list.includes(o) : value === o;
      const full = many && !on && list.length >= (q.max ?? 99);
      return <button key={o} role={many ? "checkbox" : "radio"} aria-checked={on} disabled={full} className={on ? "is-on" : ""}
        onClick={() => set(many ? (on ? list.filter((x) => x !== o) : [...list, o]) : o)}><span className="fl-tick">{on && <I n="check" s={14} />}</span>{o}</button>;
    })}
  </div>;
}
export const questionCount = questions.length;

/* ---------- “How it works” animated explainer ---------- */
const scenes = [
  { title: "Pick a counsellor", body: "Choose the person who fits you best. Everyone is free for students." },
  { title: "Choose a time", body: "Sessions are 30 minutes. Pick any open time that suits your classes." },
  { title: "Answer 11 quick questions", body: "About 3 minutes. It helps your counsellor get to know you before you meet." },
  { title: "Get the link by email and SMS", body: "The day before, and again 15 minutes before your session." },
  { title: "Talk online for 30 minutes", body: "Join from your phone or laptop. The call happens on Google Meet." },
  { title: "Your Career Hub opens", body: "Your counsellor sets your tasks, courses and jobs. They show up here." },
];
const SCENE_MS = 4200;
export function Explainer({ autoPlay = true, onFinish }: { autoPlay?: boolean; onFinish?: () => void }) {
  const [i, setI] = useState(0);
  const [t, setT] = useState(0);
  // No autoplay for people who asked for less motion.
  const [playing, setPlaying] = useState(() => autoPlay && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - t * SCENE_MS;
    let raf = 0;
    const tick = (now: number) => {
      const p = (now - start) / SCENE_MS;
      if (p >= 1) {
        if (i === scenes.length - 1) { setT(1); setPlaying(false); setEnded(true); onFinish?.(); return; }
        setI((x) => x + 1); setT(0); return;
      }
      setT(p); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, i]);
  const [started, setStarted] = useState(autoPlay);
  const go = (n: number) => { setStarted(true); setI(n); setT(0); setEnded(false); setPlaying(true); };
  const total = (i + t) / scenes.length;
  return <figure className="fl-video" aria-label="How it works, a short animation">
    <div className={"fl-video-stage" + (playing ? "" : " is-paused")} key={i}>
      {!started && <button className="fl-video-poster" onClick={() => go(0)}>
        <span className="fl-video-play"><I n="play" s={30} /></span>
        <strong>How Career Hub works</strong><small>A 25-second animation · no sound</small>
        <ol>{scenes.map((s) => <li key={s.title}>{s.title}</li>)}</ol>
      </button>}
      <Scene n={i} />
      <figcaption><b>{i + 1}/{scenes.length}</b> <strong>{scenes[i].title}</strong><span>{scenes[i].body}</span></figcaption>
      {ended && <button className="fl-video-replay" onClick={() => go(0)}><I n="replay" /> Watch again</button>}
    </div>
    <div className="fl-video-bar">
      <button className="fl-icon-btn" aria-label={playing ? "Pause" : "Play"} onClick={() => (ended || !started ? go(0) : setPlaying((p) => !p))}><I n={playing ? "pause" : "play"} s={18} /></button>
      <div className="fl-video-track" style={{ ["--p" as string]: total }}>
        {scenes.map((s, n) => <button key={n} aria-label={`Step ${n + 1}: ${s.title}`} aria-current={n === i} onClick={() => go(n)} />)}
      </div>
      <span className="fl-video-time">0:{String(Math.floor(total * scenes.length * SCENE_MS / 1000)).padStart(2, "0")} / 0:{Math.round(scenes.length * SCENE_MS / 1000)}</span>
    </div>
  </figure>;
}
function Scene({ n }: { n: number }) {
  const c = counsellors;
  if (n === 0) return <div className="sc sc-pick">{c.slice(0, 3).map((x, k) => <div key={x.id} className={"sc-card" + (k === 1 ? " is-pick" : "")} style={{ ["--d" as string]: `${k * 0.18}s` }}><Avatar c={x} size={44} /><b>{x.name}</b><small>{x.focus[0]}</small></div>)}<span className="sc-cursor" /></div>;
  if (n === 1) return <div className="sc sc-time"><div className="sc-days">{["Sun", "Mon", "Tue", "Wed", "Thu"].map((d, k) => <span key={d} className={k === 2 ? "is-pick" : ""} style={{ ["--d" as string]: `${k * 0.1}s` }}>{d}<b>{12 + k}</b></span>)}</div>
    <div className="sc-hours">{["10:00 AM", "10:45 AM", "11:30 AM", "2:30 PM", "3:15 PM", "4:00 PM"].map((t, k) => <span key={t} className={k === 4 ? "is-pick" : ""} style={{ ["--d" as string]: `${0.5 + k * 0.08}s` }}>{t}</span>)}</div></div>;
  if (n === 2) return <div className="sc sc-quiz"><div className="sc-sheet">{["Which year are you in?", "What do you enjoy doing?", "What worries you most?", "What do you want after graduation?"].map((q, k) => <div key={q} style={{ ["--d" as string]: `${0.2 + k * 0.6}s` }}><span className="sc-check" />{q}</div>)}</div></div>;
  if (n === 3) return <div className="sc sc-msg"><div className="sc-phone"><span className="sc-notch" /><div className="sc-sms"><b>BRAC Career Hub</b>Your session with Nusrat starts in 15 min. Join: meet.google.com/abc-defg-hij</div></div>
    <div className="sc-mail"><I n="mail" s={26} /><span><b>Your session is tomorrow</b><small>Join link inside</small></span></div></div>;
  if (n === 4) return <div className="sc sc-call"><div className="sc-tile"><Avatar c={c[0]} size={84} /><small>Nusrat</small></div><div className="sc-tile is-you"><span className="sc-you">You</span><small>Ayesha</small></div><div className="sc-callbar"><span /><span /><span className="end" /></div><span className="sc-timer">29:41</span></div>;
  return <div className="sc sc-open"><div className="sc-side">{["Home", "My tasks", "Courses", "Jobs", "CV Studio"].map((x, k) => <span key={x} style={{ ["--d" as string]: `${0.2 + k * 0.25}s` }}>{x}</span>)}</div>
    <div className="sc-main"><b>Hi Ayesha 👋</b>{["Start the Excel course", "Make your first CV", "Save two internships"].map((x, k) => <span key={x} style={{ ["--d" as string]: `${1.2 + k * 0.3}s` }}><i />{x}</span>)}</div></div>;
}

/* ---------- Demo controls: stand in for the counsellor's side ---------- */
export function DemoPanel() {
  const flow = useFlow();
  const { upcoming, phase, dispatch } = flow;
  const [open, setOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [unlock, setUnlock] = useState<Unlockable[]>(["courses", "jobs", "cv"]);
  const first = flow.unlocked === null;
  return <div className={"fl-demo" + (open ? " is-open" : "")}>
    <button className="fl-demo-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}><I n="wand" s={16} /> Demo controls</button>
    {open && <div className="fl-demo-panel">
      <p>These buttons stand in for things that happen outside the student’s screen.</p>
      {upcoming ? <>
        <button onClick={() => dispatch({ type: "remind" })}><I n="mail" s={16} /> Send the meeting-link reminder</button>
        <button className="is-main" onClick={() => (first ? setCompleting(true) : dispatch({ type: "complete", unlock: [] }))}><I n="check" s={16} /> Counsellor marks session complete</button>
      </> : phase !== "signup" && <small>Book a session to try the counsellor actions.</small>}
      {phase === "signup" && <small>Create an account (or use the sample student) to begin.</small>}
      <hr />
      <button onClick={() => dispatch({ type: "returning" })}><I n="user" s={16} /> Jump to a returning student</button>
      <button onClick={() => dispatch({ type: "reset" })}><I n="replay" s={16} /> Start over</button>
    </div>}
    {completing && <Dialog title="Counsellor view: finish the session" onClose={() => setCompleting(false)}>
      <p className="fl-muted">Choose what this student can use. Their task list follows these choices. Anything left unticked stays hidden from their menu.</p>
      <div className="fl-unlocks">{unlockables.map((u) => <label key={u.id}><input type="checkbox" aria-label={u.label} checked={unlock.includes(u.id)} onChange={() => setUnlock((l) => (l.includes(u.id) ? l.filter((x) => x !== u.id) : [...l, u.id]))} />
        <span><strong>{u.label}</strong><small>{u.hint}</small></span></label>)}</div>
      <p className="fl-fine">Session notes and five starter tasks are added automatically in this demo.</p>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setCompleting(false)}>Back</button>
        <button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "complete", unlock }); setCompleting(false); setOpen(false); }}>Mark complete and open the hub</button></div>
    </Dialog>}
  </div>;
}

export const sessionLine = (s: Slot) => `${dayLabel(s.date)}, ${shortDate(s.date)} · ${time12(s.time)}–${endTime(s.time)}`;

/* ---------- Change answers before the session ---------- */
export function AnswersDialog({ onClose }: { onClose: () => void }) {
  const { answers, dispatch } = useFlow();
  const [a, setA] = useState<Answers>(answers);
  return <Dialog title="Change your answers" wide onClose={onClose}>
    <div className="fl-q-part">{questions.map((q) => <div key={q.id} className="fl-q"><strong>{q.prompt}</strong><Answer q={q} answers={a} onChange={setA} /></div>)}</div>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button><button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "answers", answers: a, done: true }); onClose(); }}>Save changes</button></div>
  </Dialog>;
}
