"use client";
// v4 · “One step at a time”: a numbered path with one clear job per screen.
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { counsellorById, counsellors, dayLabel, nextOpen, questions, shortDate, time12, answered, type Slot } from "./data";
import { FlowProvider, useFlow } from "./store";
import { Answer, Bell, CounsellorCard, DemoPanel, Dialog, Explainer, I, SlotPicker } from "./parts";
import { SignupForm } from "./signup";
import { MainApp, UpcomingCard } from "./main-app";
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
      <div className="fl-bar-end"><Bell onGo={(g) => { if (g === "session") setView("auto"); }} /></div>
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

/* Step 1 */
function Book({ onBooked }: { onBooked: () => void }) {
  const { dispatch, sessions } = useFlow();
  const [who, setWho] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [video, setVideo] = useState(false);
  const timeRef = useRef<HTMLElement>(null);
  const cancelled = sessions.at(-1)?.status === "cancelled";
  const soonest = counsellors.map((c) => nextOpen(c.id)!).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const choose = (id: string) => { setWho(id); setSlot(null); requestAnimationFrame(() => timeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  return <main className="v4-main">
    {cancelled && <p className="v4-notice" role="status"><I n="info" s={18} /> Your session was cancelled. Pick a new time below. You’ll need one session before your Career Hub opens.</p>}
    <section className="v4-intro">
      <div>
        <span className="fl-kicker">STEP 1 OF 3</span>
        <h1>Book a free chat with a career counsellor</h1>
        <p className="v4-lead">Everyone starts here. In 30 minutes, a counsellor gets to know you and then opens the parts of Career Hub that will help you most.</p>
        <ul className="v4-facts">
          <li><I n="clock" s={18} /><span><b>30 minutes</b> online, on Google Meet</span></li>
          <li><I n="mail" s={18} /><span>Link sent by <b>email and SMS</b></span></li>
          <li><I n="check" s={18} /><span><b>Free</b> for students</span></li>
        </ul>
        <button className="v4-watch" onClick={() => setVideo(true)}><span><I n="play" s={18} /></span><b>Watch how it works</b><small>25 seconds</small></button>
      </div>
      <div className="v4-video-desktop"><Explainer autoPlay={false} /></div>
    </section>

    <section className="v4-block">
      <div className="v4-block-head"><span className="v4-num">A</span><div><h2>Who would you like to talk to?</h2><p>All counsellors can help with any question. Pick whoever feels right.</p></div></div>
      <button className="v4-quick" onClick={() => choose(soonest.counsellor)}><I n="spark" s={18} /><span><b>Not sure? Take the earliest time.</b> {counsellorById(soonest.counsellor).name}, {dayLabel(soonest.date)} {shortDate(soonest.date)} at {time12(soonest.time)}</span><I n="arrow" s={18} /></button>
      <div className="fl-counsellors">{counsellors.map((c) => <CounsellorCard key={c.id} c={c} selected={who === c.id} onSelect={() => choose(c.id)} />)}</div>
    </section>

    <section className={"v4-block" + (who ? "" : " is-waiting")} ref={timeRef}>
      <div className="v4-block-head"><span className="v4-num">B</span><div><h2>When suits you?</h2><p>{who ? `Open times with ${counsellorById(who).name}. Pick a time when you’re free from classes.` : "Choose a counsellor first."}</p></div></div>
      {who && <SlotPicker counsellor={who} value={slot} onChange={setSlot} />}
    </section>

    {who && <div className={"v4-confirm" + (slot ? " is-ready" : "")}>
      <div>{slot ? <><strong>{counsellorById(slot.counsellor).name}</strong><span>{dayLabel(slot.date)}, {shortDate(slot.date)} at {time12(slot.time)} · 30 min</span></>
        : <span>{who ? "Now pick a time" : "Pick a counsellor, then a time"}</span>}</div>
      <button className="fl-btn fl-primary big" disabled={!slot} onClick={() => { dispatch({ type: "book", slot: slot! }); onBooked(); }}>Book this session</button>
    </div>}
    {video && <Dialog title="How Career Hub works" wide onClose={() => setVideo(false)}><Explainer /></Dialog>}
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
    <UpcomingCard s={upcoming} email={account!.email} phone={account!.phone} />
    {later && <section className="v4-next-up">
      <div><span className="fl-kicker">{nextCopy[ask].kicker}</span><h2>Help {counsellorById(upcoming.slot.counsellor).name.split(" ")[0]} get to know you</h2>
        <p>{nextCopy[ask].body}</p></div>
      <div className="v4-next-actions"><button className="fl-btn fl-primary big" onClick={onNext}>{nextCopy[ask].cta} <I n={ask === "voice" ? "phone" : ask === "chat" ? "chat" : "arrow"} s={18} /></button>{fresh && <button className="fl-link" onClick={onLater}>I’ll do it later</button>}</div>
    </section>}
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
    <div className="v4-ready">
      <UpcomingCard s={upcoming} email={account!.email} phone={account!.phone} />
      <div className="v4-ready-side">
        <section className="fl-card">
          <h2>Your checklist</h2>
          <ul className="v4-check">
            <li className="is-done"><span><I n="check" s={14} /></span>Session booked</li>
            <li className="is-done"><span><I n="check" s={14} /></span>Answers sent to {c.name.split(" ")[0]} <button className="fl-link" onClick={onEdit}>{ask === "form" ? "Edit" : "Review"}</button></li>
            <li><span /> Join on time and talk for 30 minutes</li>
          </ul>
        </section>
        <section className="fl-card v4-after">
          <h2>After your session</h2>
          <p>{c.name.split(" ")[0]} will open the parts of Career Hub that suit you, such as:</p>
          <ul>{[["tasks", "A short task list"], ["book", "Courses"], ["briefcase", "Jobs & internships"], ["doc", "CV Studio"], ["globe", "Study Abroad"]].map(([i, l]) => <li key={l}><I n={i} s={16} />{l}<I n="lock" s={13} /></li>)}</ul>
          <button className="fl-link" onClick={() => setVideo(true)}>Watch how it works again</button>
        </section>
      </div>
    </div>
    {video && <Dialog title="How Career Hub works" wide onClose={() => setVideo(false)}><Explainer /></Dialog>}
  </main>;
}
