"use client";
// v4 · “One step at a time”: a numbered path with one clear job per screen.
import { useEffect, useState } from "react";
import Image from "next/image";
import { counsellorById, counsellors, dayLabel, nextOpen, questions, shortDate, time12, answered, type Slot } from "./data";
import { FlowProvider, useFlow } from "./store";
import { Answer, Avatar, Bell, CounsellorCard, DemoPanel, Dialog, Explainer, I, SlotPicker } from "./parts";
import { LangToggle, SessionCard } from "./v4-parts";
import { SignupForm } from "./signup";
import { MainApp } from "./main-app";
import { AskChat } from "./ask-chat";
import { AskVoice } from "./ask-voice";
import "./flow.css";
import "./v4.css";

export default function HubV4({ exit }: { active: boolean; exit: () => void }) {
  return <FlowProvider><V4 exit={exit} /></FlowProvider>;
}

// v7 reuses this flow with the top-menu layout once the hub opens.
// v9 and v10 swap the question form for a chat or a voice call (`ask`).
export type AskMode = "form" | "chat" | "voice";
export function V4({ exit, layout = "side", guide, ask = "form" }: { exit: () => void; layout?: "side" | "top"; guide?: boolean; ask?: AskMode }) {
  const flow = useFlow();
  const [view, setView] = useState<"auto" | "confirmed" | "questions">("auto");
  const booked = !!flow.upcoming;
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view, flow.phase, booked]);
  if (flow.phase === "app") return <MainApp exit={exit} layout={layout} guide={guide} />;
  const step = !flow.upcoming ? 1 : !flow.testDone || view === "questions" ? 2 : 3;
  const screen = flow.phase === "signup" ? "signup" : !flow.upcoming ? "book" : view === "questions" ? "questions" : view === "confirmed" || !flow.testDone ? "confirmed" : "ready";
  return <div className="fl v4">
    <header className="fl-bar">
      <button className="fl-logo" onClick={exit} aria-label="Back to home page"><Image src="/careerhub-logo.png" width={74} height={51} alt="BRAC Career Hub" /></button>
      <div className="fl-bar-mid">{flow.phase !== "signup" && <Stepper step={step} />}</div>
      <div className="fl-bar-end"><LangToggle /><Bell onGo={(g) => { if (g === "session") setView("auto"); }} /></div>
    </header>
    {screen === "signup" && <div className="fl-signup">
      <div className="fl-signup-intro"><span className="fl-kicker">BRAC CAREER HUB</span><h1>Get help choosing your career, from a real person.</h1>
        <p>Start with a free 30-minute chat with a career counsellor. They’ll set up a plan that fits you.</p>
        <ol className="fl-signup-steps">{["Create your account", "Book a free session", { form: "Answer 11 quick questions", chat: "Have a short chat with our assistant", voice: "Have a 3-minute call with our assistant" }[ask], "Meet your counsellor online"].map((x, k) => <li key={x}><span>{k + 1}</span>{x}</li>)}</ol></div>
      <SignupForm />
    </div>}
    {screen === "book" && <Book onBooked={() => setView("confirmed")} />}
    {screen === "confirmed" && <Confirmed fresh={view === "confirmed"} onNext={() => setView("questions")} onLater={() => setView("auto")} later={!flow.testDone} ask={ask} />}
    {screen === "questions" && (ask === "chat" ? <AskChat onDone={() => setView("auto")} onLater={() => setView("auto")} />
      : ask === "voice" ? <AskVoice onDone={() => setView("auto")} onLater={() => setView("auto")} />
      : <Questions onDone={() => setView("auto")} />)}
    {screen === "ready" && <Ready onEdit={() => setView("questions")} ask={ask} />}
    <DemoPanel />
  </div>;
}

function Stepper({ step }: { step: number }) {
  const steps = ["Book a session", "About you", "Meet your counsellor"];
  return <ol className="v4-steps" aria-label="Your progress">
    {steps.map((s, k) => <li key={s} className={k + 1 < step ? "is-done" : k + 1 === step ? "is-now" : ""} aria-current={k + 1 === step ? "step" : undefined}>
      <span>{k + 1 < step ? <I n="check" s={14} /> : k + 1}</span><b>{s}</b></li>)}
    <li className="is-lock"><span><I n="lock" s={13} /></span><b>Your Career Hub</b></li>
  </ol>;
}

/* Step 1: the video first, then two focused choices (who, then when). */
type Stage = "intro" | "who" | "when";
function Book({ onBooked }: { onBooked: () => void }) {
  const { dispatch, sessions } = useFlow();
  const [stage, setStage] = useState<Stage>("intro");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [who, setWho] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const cancelled = sessions.at(-1)?.status === "cancelled";
  const soonest = counsellors.map((c) => nextOpen(c.id)!).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const order: Stage[] = ["intro", "who", "when"];
  const go = (next: Stage) => { setDir(order.indexOf(next) < order.indexOf(stage) ? "back" : "fwd"); setStage(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const choose = (id: string) => { if (id !== who) setSlot(null); setWho(id); setTimeout(() => go("when"), 260); };
  const c = who ? counsellorById(who) : null;

  if (stage === "intro") return <main className="v4-main v4-hero" key="intro">
    {cancelled && <p className="v4-notice" role="status"><I n="info" s={20} /> Your session was cancelled. Book a new one below. You need one session before your Career Hub opens.</p>}
    <span className="fl-kicker">STEP 1 OF 3</span>
    <h1>Book a free chat with a career counsellor</h1>
    <p className="v4-lead">Watch this short video first. It shows you everything that happens next.</p>
    <div className="v4-hero-video"><Explainer autoPlay={false} /></div>
    <button className="fl-btn fl-primary v4-cta" onClick={() => go("who")}>Book my free session <I n="arrow" s={22} /></button>
    <ul className="v4-facts">
      <li><I n="clock" s={20} /><span><b>30 minutes</b> on Google Meet</span></li>
      <li><I n="mail" s={20} /><span>Link by <b>SMS and email</b></span></li>
      <li><I n="check" s={20} /><span><b>Free</b> for students</span></li>
    </ul>
  </main>;

  return <main className="v4-main v4-booking">
    <div className="v4-book-top">
      <button className="fl-btn ghost v4-back" onClick={() => go(stage === "when" ? "who" : "intro")}><I n="back" s={20} /> {stage === "when" ? "Back to counsellors" : "Back to the video"}</button>
    </div>
    <div className="v4-ticket" aria-label="Your booking so far">
      <button className={"v4-ticket-part" + (stage === "who" ? " is-now" : " is-set")} onClick={() => go("who")} disabled={stage === "who"}>
        <small>1 · Counsellor</small>
        {c ? <span className="v4-ticket-val"><Avatar c={c} size={40} /><b>{c.name}</b></span> : <span className="v4-ticket-val is-empty">Choosing now</span>}
        {stage !== "who" && <em>Change</em>}
      </button>
      <span className="v4-ticket-cut" aria-hidden="true" />
      <div className={"v4-ticket-part" + (stage === "when" ? (slot ? " is-set is-now" : " is-now") : "")}>
        <small>2 · Day and time</small>
        {slot ? <span className="v4-ticket-val"><I n="calendar" s={22} /><b>{dayLabel(slot.date)}, {shortDate(slot.date)} · {time12(slot.time)}</b></span>
          : <span className="v4-ticket-val is-empty">{stage === "when" ? "Choosing now" : "Next"}</span>}
      </div>
    </div>

    <section className={"v4-stage is-" + dir} key={stage}>
      {stage === "who" ? <>
        <h1>Who would you like to talk to?</h1>
        <p className="v4-stage-lead">Every counsellor can help with any question. Pick whoever feels right to you.</p>
        <button className="v4-quick" onClick={() => { setWho(soonest.counsellor); setSlot(soonest); go("when"); }}>
          <I n="spark" s={22} /><span><b>Not sure? Take the earliest time.</b><small>{counsellorById(soonest.counsellor).name}, {dayLabel(soonest.date)} {shortDate(soonest.date)} at {time12(soonest.time)}</small></span><I n="arrow" s={22} /></button>
        <div className="fl-counsellors">{counsellors.map((x) => <CounsellorCard key={x.id} c={x} selected={who === x.id} onSelect={() => choose(x.id)} />)}</div>
      </> : c && <>
        <div className="v4-when-head"><Avatar c={c} size={72} /><div><h1>When can you talk to {c.name.split(" ")[0]}?</h1>
          <p className="v4-stage-lead">First pick a day, then a time when you’re free from classes.</p></div></div>
        <SlotPicker counsellor={c.id} value={slot} onChange={setSlot} />
      </>}
    </section>

    {stage === "when" && <div className={"v4-confirm" + (slot ? " is-ready" : "")}>
      <div>{slot ? <><strong>{dayLabel(slot.date)}, {shortDate(slot.date)} at {time12(slot.time)}</strong><span>30 minutes with {c?.name}</span></>
        : <span>Pick a time above</span>}</div>
      <button className="fl-btn fl-primary big" disabled={!slot} onClick={() => { dispatch({ type: "book", slot: slot! }); onBooked(); }}>Book this session <I n="arrow" s={20} /></button>
    </div>}
  </main>;
}

const nextCopy = {
  form: { kicker: "STEP 2 OF 3 · ABOUT 3 MINUTES", body: "Answer 11 short questions about where you are now and what you want next. Your counsellor reads them before you meet, so you can skip the basics.", cta: "Start the questions" },
  chat: { kicker: "STEP 2 OF 3 · A SHORT CHAT", body: "No form to fill. Our assistant asks a few questions in a chat and you answer in your own words. It sends the answers to your counsellor before you meet.", cta: "Start the chat" },
  voice: { kicker: "STEP 2 OF 3 · A 3-MINUTE CALL", body: "No form to fill. Our assistant calls you right here in the browser, asks a few questions out loud, and you just talk. Your answers go to your counsellor before you meet.", cta: "Start the call" },
};
function Confirmed({ onNext, onLater, later, fresh, ask }: { onNext: () => void; onLater: () => void; later: boolean; fresh: boolean; ask: AskMode }) {
  const { upcoming, account } = useFlow();
  if (!upcoming) return null;
  return <main className="v4-main v4-narrow">
    {fresh ? <div className="v4-success"><span><I n="check" s={30} /></span><h1>You’re booked!</h1><p>We’ve sent a confirmation to {account!.email}.</p></div>
      : <div className="v4-ready-head"><span className="fl-kicker">ONE THING LEFT</span><h1>Answer the questions before your session</h1></div>}
    {later && <section className="v4-next-up">
      <div><span className="fl-kicker">{nextCopy[ask].kicker}</span><h2>Help {counsellorById(upcoming.slot.counsellor).name.split(" ")[0]} get to know you</h2>
        <p>{nextCopy[ask].body}</p></div>
      <div className="v4-next-actions"><button className="fl-btn fl-primary big" onClick={onNext}>{nextCopy[ask].cta} <I n={ask === "voice" ? "phone" : ask === "chat" ? "chat" : "arrow"} s={18} /></button>{fresh && <button className="fl-link" onClick={onLater}>I’ll do it later</button>}</div>
    </section>}
    <SessionCard s={upcoming} email={account!.email} phone={account!.phone} />
  </main>;
}

/* Step 2: one question per screen */
function Questions({ onDone }: { onDone: () => void }) {
  const { answers, dispatch, testDone, upcoming } = useFlow();
  const [a, setA] = useState(answers);
  const [i, setI] = useState(0);
  const q = questions[i];
  const last = i === questions.length - 1;
  const finish = () => { dispatch({ type: "answers", answers: a, done: true }); onDone(); };
  const change = (next: typeof a) => {
    setA(next);
    if (q.kind === "one" || q.kind === "scale") setTimeout(() => setI((x) => Math.min(x + 1, questions.length - 1)), 280);
  };
  const c = upcoming ? counsellorById(upcoming.slot.counsellor) : null;
  return <main className="v4-main v4-quiz">
    <div className="v4-quiz-top">
      <button className="fl-btn ghost" onClick={() => (i ? setI(i - 1) : onDone())}><I n="back" s={17} /> {i ? "Back" : testDone ? "Cancel" : "Later"}</button>
      <span>Question {i + 1} of {questions.length}</span>
    </div>
    <div className="fl-progress v4-quiz-bar"><span style={{ width: `${((i + (answered(q, a) ? 1 : 0)) / questions.length) * 100}%` }} /></div>
    <section className="v4-q" key={q.id}>
      <span className="fl-kicker">{q.part === "now" ? "ABOUT YOU RIGHT NOW" : "LOOKING AHEAD"}</span>
      <h1>{q.prompt}</h1>
      {q.help && <p>{q.help}</p>}
      <Answer q={q} answers={a} onChange={change} big />
    </section>
    <div className="v4-quiz-foot">
      <small><I n="lock" s={14} /> Only {c ? c.name : "your counsellor"} sees your answers.</small>
      {last ? <button className="fl-btn fl-primary big" onClick={finish}>{testDone ? "Save changes" : `Send to ${c?.name.split(" ")[0] ?? "counsellor"}`}</button>
        : <button className="fl-btn fl-primary big" disabled={!answered(q, a)} onClick={() => setI(i + 1)}>{q.kind === "many" || q.kind === "text" ? "Next" : "Next"} <I n="arrow" s={18} /></button>}
    </div>
  </main>;
}

/* Step 3: waiting for the session */
function Ready({ onEdit, ask }: { onEdit: () => void; ask: AskMode }) {
  const { upcoming, account } = useFlow();
  const [video, setVideo] = useState(false);
  if (!upcoming) return null;
  const c = counsellorById(upcoming.slot.counsellor);
  return <main className="v4-main">
    <div className="v4-ready-head"><span className="fl-kicker">STEP 3 OF 3</span><h1>You’re all set, {account!.name.split(" ")[0]}</h1><p>Now just join your session. Your Career Hub opens after {c.name.split(" ")[0]} marks it complete.</p></div>
    <SessionCard s={upcoming} email={account!.email} phone={account!.phone} />
    <div className="v4-ready">
        <section className="fl-card">
          <h2>Your checklist</h2>
          <ul className="v4-check">
            <li className="is-done"><span><I n="check" s={16} /></span>Session booked</li>
            <li className="is-done"><span><I n="check" s={16} /></span>Answers sent to {c.name.split(" ")[0]} <button className="fl-link" onClick={onEdit}>{ask === "form" ? "Edit" : "Review"}</button></li>
            <li><span /> Join on time and talk for 30 minutes</li>
          </ul>
        </section>
        <section className="fl-card v4-after">
          <h2>After your session</h2>
          <p>{c.name.split(" ")[0]} will open the parts of Career Hub that suit you, such as:</p>
          <ul className="v4-after-list">{[["tasks", "A short task list"], ["book", "Courses"], ["briefcase", "Jobs & internships"], ["doc", "CV Studio"], ["globe", "Study Abroad"]].map(([i, l]) => <li key={l}><I n={i} s={20} />{l}<I n="lock" s={16} /></li>)}</ul>
          <button className="fl-link" onClick={() => setVideo(true)}>Watch how it works again</button>
        </section>
    </div>
    {video && <Dialog title="How Career Hub works" wide onClose={() => setVideo(false)}><Explainer /></Dialog>}
  </main>;
}
