"use client";
// v6 · “Journey board”: the whole path is visible on one page from the start.
// Only the current stage is open; later stages show what they will unlock.
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { counsellorById, counsellors, dayLabel, fromIso, nextOpen, openTimes, questions, shortDate, shortWeekday, time12, upcomingDays, answered, type Answers, type Slot } from "./data";
import { FlowProvider, useFlow } from "./store";
import { Answer, Avatar, Bell, ChangeSession, DemoPanel, Dialog, Explainer, I, JoinSteps, SlotPicker, sessionLine } from "./parts";
import { SignupForm } from "./signup";
import { MainApp } from "./main-app";
import "./flow.css";
import "./v6.css";

export default function HubV6({ exit }: { active: boolean; exit: () => void }) {
  return <FlowProvider><V6 exit={exit} /></FlowProvider>;
}

const stages = [
  { title: "Book a session", body: "Pick a counsellor and a time", icon: "calendar" },
  { title: "Tell us about you", body: "11 quick questions · 3 min", icon: "notes" },
  { title: "Meet online", body: "30 minutes on Google Meet", icon: "video" },
  { title: "Your Career Hub", body: "Tasks, courses, jobs and more", icon: "spark" },
];

function V6({ exit }: { exit: () => void }) {
  const flow = useFlow();
  if (flow.phase === "app") return <MainApp exit={exit} />;
  const stage = !flow.upcoming ? 0 : !flow.testDone ? 1 : 2;
  return <div className="fl v6">
    <header className="fl-bar">
      <button className="fl-logo" onClick={exit} aria-label="Back to home page"><Image src="/careerhub-logo.png" width={74} height={51} alt="BRAC Career Hub" /></button>
      <div className="fl-bar-mid" />
      <div className="fl-bar-end">{flow.account && <span className="v6-hello">Hi, {flow.account.name.split(" ")[0]}</span>}<Bell /></div>
    </header>
    {flow.phase === "signup" ? <Signup /> : <main className="v6-main">
      <Journey stage={stage} />
      {stage === 0 && <BookStage />}
      {stage === 1 && <AboutStage />}
      {stage === 2 && <MeetStage />}
    </main>}
    <DemoPanel />
  </div>;
}

function Signup() {
  return <div className="fl-signup v6-signup">
    <div className="fl-signup-intro">
      <span className="fl-kicker">BRAC CAREER HUB</span>
      <h1>Your career journey, one clear step at a time.</h1>
      <p>Here’s the whole path. It starts with a free conversation with a career counsellor.</p>
      <ol className="v6-mini-journey">{stages.map((s) => <li key={s.title}><span><I n={s.icon} s={18} /></span><div><strong>{s.title}</strong><small>{s.body}</small></div></li>)}</ol>
    </div>
    <SignupForm />
  </div>;
}

/* The four stages, always visible */
function Journey({ stage }: { stage: number }) {
  return <ol className="v6-journey" aria-label="Your journey">
    {stages.map((s, k) => {
      const state = k < stage ? "done" : k === stage ? "now" : k === 3 ? "lock" : "next";
      return <li key={s.title} className={"is-" + state} aria-current={state === "now" ? "step" : undefined}>
        <span className="v6-j-icon">{state === "done" ? <I n="check" s={18} /> : state === "lock" ? <I n="lock" s={17} /> : <I n={s.icon} s={18} />}</span>
        <div><small>{state === "done" ? "Done" : state === "now" ? "Now" : state === "lock" ? "Opens after your session" : `Step ${k + 1}`}</small><strong>{s.title}</strong><span>{s.body}</span></div>
      </li>;
    })}
  </ol>;
}

/* ---------- Stage 1: book ---------- */
const topics = [
  { id: "jobs", label: "Getting a job or internship", match: ["nusrat", "tanvir"] },
  { id: "tech", label: "Tech or engineering careers", match: ["tanvir"] },
  { id: "abroad", label: "Studying abroad", match: ["farhana"] },
  { id: "unsure", label: "I don’t know where to start", match: ["rafiq", "nusrat"] },
];
function BookStage() {
  const { dispatch, sessions } = useFlow();
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"person" | "time">("person");
  const [who, setWho] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const cancelled = sessions.at(-1)?.status === "cancelled";
  const ranked = useMemo(() => {
    const m = topics.find((t) => t.id === topic)?.match ?? [];
    return [...counsellors].sort((a, b) => (m.includes(b.id) ? 1 : 0) - (m.includes(a.id) ? 1 : 0));
  }, [topic]);
  const match = topics.find((t) => t.id === topic)?.match ?? [];
  const book = (s: Slot) => { dispatch({ type: "book", slot: s }); setWho(null); };
  return <>
    {cancelled && <p className="v6-notice" role="status"><I n="info" s={18} /> Your last session was cancelled. Book a new one to keep going.</p>}
    <section className="v6-hero">
      <div>
        <span className="fl-kicker">STEP 1 · NOW</span>
        <h1>Start with a free 30-minute talk</h1>
        <p>A career counsellor will get to know you, then open the parts of Career Hub that suit you. You can’t skip this step. It’s what makes your plan personal.</p>
      </div>
      <Explainer autoPlay={false} />
    </section>

    <section className="fl-card v6-book">
      <div className="v6-book-head">
        <h2>Book your session</h2>
        <div className="v6-switch" role="tablist" aria-label="How do you want to book?">
          <button role="tab" aria-selected={mode === "person"} onClick={() => setMode("person")}><I n="user" s={16} /> Choose a person</button>
          <button role="tab" aria-selected={mode === "time"} onClick={() => setMode("time")}><I n="clock" s={16} /> Find a time</button>
        </div>
      </div>

      {mode === "person" ? <>
        <fieldset className="v6-topics"><legend>What do you want help with? <small>Optional. We’ll suggest someone.</small></legend>
          {topics.map((t) => <button key={t.id} aria-pressed={topic === t.id} className={topic === t.id ? "is-on" : ""} onClick={() => setTopic(topic === t.id ? "" : t.id)}>{t.label}</button>)}
        </fieldset>
        <ul className="v6-people">{ranked.map((c) => {
          const n = nextOpen(c.id);
          return <li key={c.id} className={match.includes(c.id) ? "is-match" : ""}>
            <Avatar c={c} size={52} />
            <div className="v6-person">
              <div className="v6-person-top"><strong>{c.name}</strong>{match.includes(c.id) && <em>Good match</em>}</div>
              <small>{c.title} · Speaks {c.languages}</small>
              <p>{c.about}</p>
              <span className="fl-tags">{c.focus.map((f) => <em key={f}>{f}</em>)}</span>
            </div>
            <div className="v6-person-cta">{n && <small>Next open<br /><b>{dayLabel(n.date)}, {time12(n.time)}</b></small>}<button className="fl-btn fl-primary" onClick={() => { setWho(c.id); setSlot(null); }}>See times</button></div>
          </li>;
        })}</ul>
      </> : <ByTime onBook={book} />}
    </section>

    {who && <Dialog title={`Pick a time with ${counsellorById(who).name}`} wide onClose={() => setWho(null)}>
      <SlotPicker counsellor={who} value={slot} onChange={setSlot} />
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setWho(null)}>Back</button>
        <button className="fl-btn fl-primary" disabled={!slot} onClick={() => book(slot!)}>{slot ? `Book ${dayLabel(slot.date)}, ${time12(slot.time)}` : "Pick a time"}</button></div>
    </Dialog>}
  </>;
}

// Pick a day, then see every counsellor who is free that day.
function ByTime({ onBook }: { onBook: (s: Slot) => void }) {
  const days = upcomingDays(8);
  const [day, setDay] = useState(days[0].date);
  const [pick, setPick] = useState<Slot | null>(null);
  const d = days.find((x) => x.date === day)!;
  const free = counsellors.map((c) => ({ c, times: openTimes(c.id, d) })).filter((x) => x.times.length);
  return <div className="v6-bytime">
    <div className="fl-days" role="radiogroup" aria-label="Day">{days.map((x) => { const n = counsellors.reduce((s, c) => s + openTimes(c.id, x).length, 0);
      return <button key={x.date} role="radio" aria-checked={x.date === day} className={x.date === day ? "is-on" : ""} onClick={() => { setDay(x.date); setPick(null); }}>
        <small>{dayLabel(x.date) === "Tomorrow" ? "Tomorrow" : shortWeekday(x.date)}</small><strong>{shortDate(x.date)}</strong><em>{n} open</em></button>; })}</div>
    <ul className="v6-free">{free.map(({ c, times }) => <li key={c.id}>
      <div className="v6-free-who"><Avatar c={c} size={40} /><div><strong>{c.name}</strong><small>{c.focus.join(" · ")}</small></div></div>
      <div className="v6-free-times">{times.map((t) => { const on = pick?.counsellor === c.id && pick.time === t;
        return <button key={t} aria-pressed={on} className={on ? "is-on" : ""} onClick={() => setPick({ counsellor: c.id, date: d.date, time: t })}>{time12(t)}</button>; })}</div>
    </li>)}</ul>
    {pick && <div className="v6-bytime-confirm"><span><b>{counsellorById(pick.counsellor).name}</b> · {dayLabel(pick.date)}, {shortDate(pick.date)} at {time12(pick.time)}</span><button className="fl-btn fl-primary" onClick={() => onBook(pick)}>Book this time</button></div>}
  </div>;
}

/* Compact banner for the booked session, shown in stages 2 and 3 */
function SessionStrip() {
  const { upcoming, account } = useFlow();
  const [open, setOpen] = useState(false);
  if (!upcoming) return null;
  const c = counsellorById(upcoming.slot.counsellor);
  return <section className="fl-card v6-strip">
    <div className="v6-strip-main"><Avatar c={c} size={46} /><div><small>Your session</small><strong>{sessionLine(upcoming.slot)}</strong><span>with {c.name} · online</span></div>
      <button className="fl-link" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "Hide" : "How to join"}</button></div>
    {open && <div className="v6-strip-join"><JoinSteps email={account!.email} phone={account!.phone} /></div>}
    <ChangeSession />
  </section>;
}

/* ---------- Stage 2: questions, all on one page ---------- */
function AboutStage() {
  const { answers, dispatch, upcoming } = useFlow();
  const [a, setA] = useState<Answers>(answers);
  const required = questions.filter((q) => !q.optional);
  const done = required.filter((q) => answered(q, a)).length;
  const c = counsellorById(upcoming!.slot.counsellor);
  const [tried, setTried] = useState(false);
  const send = () => { if (done < required.length) { setTried(true); requestAnimationFrame(() => document.querySelector(".v6-q.is-missing")?.scrollIntoView({ behavior: "smooth", block: "center" })); return; } dispatch({ type: "answers", answers: a, done: true }); };
  return <div className="v6-two">
    <div>
      <div className="v6-stage-head"><span className="fl-kicker">STEP 2 · NOW</span><h1>Help {c.name.split(" ")[0]} get to know you</h1>
        <p>11 short questions, about 3 minutes. {c.name.split(" ")[0]} reads them before your session so you can spend the 30 minutes on what matters.</p></div>
      {(["now", "next"] as const).map((part, pi) => <section key={part} className="fl-card v6-part">
        <h2><span>{pi + 1}</span>{part === "now" ? "Where you are right now" : "Where you want to go"}</h2>
        {questions.filter((q) => q.part === part).map((q) => <div key={q.id} className={"v6-q" + (tried && !answered(q, a) ? " is-missing" : "") + (answered(q, a) && !q.optional ? " is-done" : "")}>
          <strong>{q.prompt}</strong>{q.help && <small>{q.help}</small>}
          <Answer q={q} answers={a} onChange={setA} />
          {tried && !answered(q, a) && <span className="v6-missing">Please answer this one</span>}
        </div>)}
      </section>)}
    </div>
    <aside className="v6-aside">
      <section className="fl-card v6-meter">
        <div className="v6-ring" style={{ ["--p" as string]: done / required.length }}><b>{done}</b><small>of {required.length}</small></div>
        <p>{done === required.length ? "All done. Ready to send!" : "Answer each question. The last one is optional."}</p>
        <button className="fl-btn fl-primary wide" onClick={send}>Send to {c.name.split(" ")[0]}</button>
        <small className="fl-fine"><I n="lock" s={14} /> Only your counsellor sees this. You can change it later.</small>
      </section>
      <SessionStrip />
    </aside>
  </div>;
}

/* ---------- Stage 3: get ready to meet ---------- */
function MeetStage() {
  const { upcoming } = useFlow();
  const c = counsellorById(upcoming!.slot.counsellor);
  const [edit, setEdit] = useState(false);
  const [qs, setQs] = useState(["", "", ""]);
  const [now] = useState(() => Date.now());
  const days = Math.max(0, Math.round((fromIso(upcoming!.slot.date).getTime() - now) / 86400000));
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return <div className="v6-two">
    <div>
      <div className="v6-stage-head"><span className="fl-kicker">STEP 3 · NOW</span><h1>{days <= 1 ? "Your session is coming up" : `Your session is in ${days} days`}</h1>
        <p>There’s nothing else to do in the app until then. When {c.name.split(" ")[0]} marks the session complete, your Career Hub opens and you’ll get a notification.</p></div>
      <section className="fl-card v6-prep">
        <h2>Get the most from 30 minutes</h2>
        <p>Write down up to three questions you want to ask. They’ll be ready for you when you join.</p>
        {qs.map((q, k) => <label key={k} className="fl-field"><span>Question {k + 1}</span><input value={q} placeholder={["e.g. Which jobs suit a CSE student who likes people?", "e.g. Should I do an internship in 3rd year?", "e.g. Is an MBA worth it for me?"][k]} onChange={(e) => setQs(qs.map((x, i) => (i === k ? e.target.value : x)))} /></label>)}
      </section>
      <section className="fl-card v6-locked">
        <h2><I n="lock" s={18} /> Opens after your session</h2>
        <div className="v6-locked-grid">{[["tasks", "Your tasks", "A short to-do list from your counsellor"], ["book", "Courses", "Picked to fit your goals"], ["briefcase", "Jobs & internships", "Openings worth applying to"], ["doc", "CV Studio", "Build a one-page CV"], ["globe", "Study Abroad", "If it’s right for you"], ["notes", "Session notes", "What you discussed and agreed"]].map(([i, t, b]) =>
          <div key={t}><I n={i} s={20} /><strong>{t}</strong><small>{b}</small></div>)}</div>
        <p className="fl-fine">Your counsellor chooses what to open, based on your conversation.</p>
      </section>
    </div>
    <aside className="v6-aside">
      <SessionStrip />
      <section className="fl-card v6-answers">
        <div className="v6-answers-row"><span className="v6-done-dot"><I n="check" s={14} /></span><div><strong>Answers sent</strong><small>{c.name.split(" ")[0]} will read them before you meet.</small></div></div>
        <button className="fl-btn wide" onClick={() => setEdit(true)}><I n="edit" s={16} /> Change my answers</button>
      </section>
    </aside>
    {edit && <EditAnswers onClose={() => setEdit(false)} />}
  </div>;
}
function EditAnswers({ onClose }: { onClose: () => void }) {
  const { answers, dispatch } = useFlow();
  const [a, setA] = useState<Answers>(answers);
  return <Dialog title="Change your answers" wide onClose={onClose}>
    <div className="v6-edit">{questions.map((q) => <div key={q.id} className="v6-q"><strong>{q.prompt}</strong><Answer q={q} answers={a} onChange={setA} /></div>)}</div>
    <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={onClose}>Cancel</button><button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "answers", answers: a, done: true }); onClose(); }}>Save changes</button></div>
  </Dialog>;
}
