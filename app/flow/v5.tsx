"use client";
// v5 · “Your guide”: a friendly guide talks the student through each step, one message at a time.
// The right-hand panel always shows where they are and lets them manage the booking.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { counsellorById, counsellors, dayLabel, questions, shortDate, time12, answered, type Answers, type Slot } from "./data";
import { FlowProvider, useFlow } from "./store";
import { Answer, AnswersDialog, Avatar, Bell, ChangeSession, CounsellorCard, DemoPanel, Dialog, Explainer, I, JoinSteps, SlotPicker, sessionLine } from "./parts";
import { SignupForm } from "./signup";
import { MainApp } from "./main-app";
import "./flow.css";
import "./v5.css";

export default function HubV5({ exit }: { active: boolean; exit: () => void }) {
  return <FlowProvider><V5 exit={exit} /></FlowProvider>;
}

function V5({ exit }: { exit: () => void }) {
  const flow = useFlow();
  const [video, setVideo] = useState(false);
  if (flow.phase === "app") return <MainApp exit={exit} />;
  return <div className="fl v5">
    <header className="fl-bar">
      <button className="fl-logo" onClick={exit} aria-label="Back to home page"><Image src="/careerhub-logo.png" width={74} height={51} alt="BRAC Career Hub" /></button>
      <div className="fl-bar-mid" />
      <div className="fl-bar-end"><button className="fl-btn ghost v5-watch-top" onClick={() => setVideo(true)}><I n="play" s={16} /> How it works</button><Bell /></div>
    </header>
    {flow.phase === "signup" ? <div className="fl-signup v5-signup">
      <div className="fl-signup-intro"><Guide size={64} /><h1>Hi! I’ll walk you through getting started.</h1><p>First, a free 30-minute chat with a career counsellor. After that, your counsellor opens a plan made for you.</p>
        <button className="v5-video-card" onClick={() => setVideo(true)}><span><I n="play" s={22} /></span><div><strong>Watch how it works</strong><small>25-second animation, no sound</small></div></button></div>
      <SignupForm title="Let’s start with your details" />
    </div> : <Chat key={flow.sessions.filter((s) => s.status === "cancelled").length} onVideo={() => setVideo(true)} />}
    {video && <Dialog title="How Career Hub works" wide onClose={() => setVideo(false)}><Explainer /></Dialog>}
    <DemoPanel />
  </div>;
}

function Guide({ size = 36 }: { size?: number }) {
  return <span className="v5-guide" style={{ width: size, height: size }} aria-hidden="true"><Image src="/careerhub-logo.png" width={size} height={size} alt="" /></span>;
}

/* ---------- The conversation ---------- */
type Stage = "intro" | "pick" | "time" | "booked" | "quiz" | "done" | "rebook";
function Chat({ onVideo }: { onVideo: () => void }) {
  const flow = useFlow();
  const { account, upcoming, testDone, dispatch, sessions } = flow;
  const first = account!.name.split(" ")[0];
  const [who, setWho] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [answers, setAnswers] = useState<Answers>(flow.answers);
  const [qi, setQi] = useState(0);
  const [started, setStarted] = useState(false);
  const [later, setLater] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const cancelled = !upcoming && sessions.some((s) => s.status === "cancelled");
  // Work out where the conversation is from the shared state.
  const stage: Stage = upcoming ? (testDone ? "done" : started ? "quiz" : "booked") : cancelled ? (who ? "time" : "rebook") : !started ? "intro" : who ? "time" : "pick";

  const msgs: ReactNode[] = [];
  const bot = (key: string, body: ReactNode) => msgs.push(<Bot key={key}>{body}</Bot>);
  const me = (key: string, body: ReactNode) => msgs.push(<Me key={key}>{body}</Me>);

  bot("hi", <><p>Hi {first}! 👋 Welcome to Career Hub.</p><p>Here’s how it works: you’ll have a <b>free 30-minute chat</b> with a career counsellor first. After that, your counsellor opens the parts of Career Hub that will help you most.</p></>);
  if (stage === "intro") bot("ask", <><p>Shall we find you a time?</p>
    <div className="v5-quick"><button className="fl-btn fl-primary" onClick={() => setStarted(true)}>Yes, let’s book</button><button className="fl-btn" onClick={onVideo}><I n="play" s={16} /> Show me how it works first</button></div></>);
  if (cancelled) { me("cx", "I cancelled my session."); bot("rb", <><p>No problem. You need one session before your Career Hub opens, so let’s find a new time. Who would you like to talk to?</p>{stage === "rebook" && <Pick onPick={setWho} />}</>); }
  if (stage !== "intro" && stage !== "rebook" && !cancelled) {
    me("yes", "Yes, let’s book");
    bot("pick", <><p>Great. Who would you like to talk to? Any of them can help with any question, so just go with whoever feels right.</p>{stage === "pick" && <Pick onPick={setWho} />}</>);
  }
  const chosen = (upcoming?.slot.counsellor ?? who) && counsellorById(upcoming?.slot.counsellor ?? who);
  if (chosen && stage !== "rebook") {
    me("who", <span className="v5-me-who"><Avatar c={chosen} size={26} /> {chosen.name}</span>);
    if (stage === "time") bot("time", <><p>Good choice. {chosen.name.split(" ")[0]} has these times open. Each session is 30 minutes.</p>
      <div className="v5-widget"><SlotPicker counsellor={chosen.id} value={slot} onChange={setSlot} compact /></div>
      <div className="v5-quick"><button className="fl-btn fl-primary" disabled={!slot} onClick={() => { dispatch({ type: "book", slot: slot! }); setSlot(null); }}>{slot ? `Book ${dayLabel(slot.date)}, ${time12(slot.time)}` : "Pick a time above"}</button>
        <button className="fl-btn ghost" onClick={() => { setWho(""); setSlot(null); }}>Choose someone else</button></div></>);
  }
  if (upcoming) {
    me("when", `${dayLabel(upcoming.slot.date)}, ${shortDate(upcoming.slot.date)} at ${time12(upcoming.slot.time)}`);
    bot("booked", <><p><b>You’re booked! 🎉</b> Here’s how you’ll join. The call happens on Google Meet, not in this app:</p><div className="v5-widget"><JoinSteps email={account!.email} phone={account!.phone} /></div></>);
    if (stage === "booked") bot("q?", <><p>One more thing. Can you answer <b>11 quick questions</b>? It takes about 3 minutes and helps {counsellorById(upcoming.slot.counsellor).name.split(" ")[0]} understand you before you meet.</p>
      <div className="v5-quick"><button className="fl-btn fl-primary" onClick={() => { setStarted(true); setLater(false); setQi(0); }}>Sure, let’s do it</button>{!later && <button className="fl-btn" onClick={() => setLater(true)}>Later</button>}</div>
      {later && <p className="v5-later">No problem. You’ll find it on the right whenever you’re ready.</p>}</>);
    if (stage === "quiz" || stage === "done") {
      me("sure", "Sure, let’s do it");
      const shown = stage === "done" ? questions.length : qi + 1;
      questions.slice(0, shown).forEach((q, k) => {
        bot("q" + q.id, <><p className="v5-qn">{k + 1} of {questions.length}</p><p><b>{q.prompt}</b>{q.help && <small> {q.help}</small>}</p>
          {stage === "quiz" && k === qi && <div className="v5-widget"><Answer q={q} answers={answers} onChange={(a) => { setAnswers(a); if ((q.kind === "one" || q.kind === "scale") && k < questions.length - 1) setTimeout(() => setQi(k + 1), 250); }} />
            <div className="v5-quick">{qi > 0 && <button className="fl-btn ghost" onClick={() => setQi(qi - 1)}><I n="back" s={16} /> Back</button>}
              {k === questions.length - 1 ? <button className="fl-btn fl-primary" onClick={() => dispatch({ type: "answers", answers, done: true })}>Send my answers</button>
                : (q.kind === "many" || q.kind === "text") && <button className="fl-btn fl-primary" disabled={!answered(q, answers)} onClick={() => setQi(k + 1)}>{q.kind === "text" && !answers[q.id] ? "Skip" : "Next"}</button>}</div></div>}</>);
        if (k < qi || stage === "done") { const v = answers[q.id]; me("a" + q.id, Array.isArray(v) ? v.join(", ") : v || <i>Skipped</i>); }
      });
    }
    if (stage === "done") bot("done", <><p><b>Thank you, {first}!</b> I’ve sent your answers to {counsellorById(upcoming.slot.counsellor).name}.</p>
      <p>That’s everything for now. Join your session at {time12(upcoming.slot.time)} on {dayLabel(upcoming.slot.date).toLowerCase() === "tomorrow" ? "tomorrow" : dayLabel(upcoming.slot.date)}. After it, your counsellor will open your Career Hub and you’ll get a notification. 🔔</p></>);
  }

  useEffect(() => { const t = setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 620); return () => clearTimeout(t); }, [stage, qi, who, msgs.length]);

  return <div className="v5-layout">
    <main className="v5-chat" aria-live="polite">{msgs}<div ref={end} /></main>
    <Side stage={stage} onQuiz={() => { setStarted(true); setLater(false); }} onVideo={onVideo} />
  </div>;
}

function Bot({ children }: { children: ReactNode }) {
  const [typing, setTyping] = useState(true);
  useEffect(() => { const t = setTimeout(() => setTyping(false), 550); return () => clearTimeout(t); }, []);
  return <div className="v5-msg is-bot"><Guide />{typing ? <div className="v5-bubble v5-typing" aria-label="Typing"><span /><span /><span /></div> : <div className="v5-bubble">{children}</div>}</div>;
}
function Me({ children }: { children: ReactNode }) {
  return <div className="v5-msg is-me"><div className="v5-bubble">{children}</div></div>;
}
function Pick({ onPick }: { onPick: (id: string) => void }) {
  return <div className="v5-widget v5-pick">{counsellors.map((c) => <CounsellorCard key={c.id} c={c} onSelect={() => onPick(c.id)} cta="Pick" />)}</div>;
}

/* ---------- Progress and booking panel ---------- */
function Side({ stage, onQuiz, onVideo }: { stage: Stage; onQuiz: () => void; onVideo: () => void }) {
  const { upcoming, testDone, account } = useFlow();
  const [details, setDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const steps = [
    { label: "Create your account", done: true },
    { label: "Book a session", done: !!upcoming },
    { label: "Answer 11 questions", done: testDone, action: upcoming && !testDone && stage !== "quiz" ? <button className="fl-link" onClick={onQuiz}>Start</button> : null },
    { label: "Meet your counsellor", done: false },
  ];
  return <aside className="v5-side">
    <section className="fl-card">
      <span className="fl-kicker">YOUR PROGRESS</span>
      <ol className="v5-steps">{steps.map((s, k) => <li key={s.label} className={s.done ? "is-done" : steps.findIndex((x) => !x.done) === k ? "is-now" : ""}><span>{s.done ? <I n="check" s={13} /> : k + 1}</span>{s.label}{s.action}</li>)}
        <li className="is-lock"><span><I n="lock" s={12} /></span>Your Career Hub opens</li></ol>
    </section>
    {testDone && <button className="fl-btn wide" onClick={() => setEditing(true)}><I n="edit" s={16} /> Change my answers</button>}
    {editing && <AnswersDialog onClose={() => setEditing(false)} />}
    {upcoming && <section className="fl-card v5-session">
      <span className="fl-kicker">YOUR SESSION</span>
      <div className="fl-who"><Avatar c={counsellorById(upcoming.slot.counsellor)} /><div><strong>{counsellorById(upcoming.slot.counsellor).name}</strong><small>{sessionLine(upcoming.slot)}</small></div></div>
      <button className="fl-link" onClick={() => setDetails((d) => !d)} aria-expanded={details}>{details ? "Hide joining steps" : "How do I join?"}</button>
      {details && <div className="v5-side-join"><JoinSteps email={account!.email} phone={account!.phone} /></div>}
      <ChangeSession />
    </section>}
    <button className="v5-video-card" onClick={onVideo}><span><I n="play" s={20} /></span><div><strong>How it works</strong><small>25-second animation</small></div></button>
  </aside>;
}
