"use client";
// v10 · The questionnaire as a short voice call. The assistant speaks each question
// (browser speech synthesis), listens to the answer (browser speech recognition) and shows
// live captions. Where the browser has no microphone support, “Answer for me” plays a sample reply.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { counsellorById, questions } from "./data";
import { filledCount, openingVoice, sampleReplies } from "./converse";
import { useInterview, type Msg } from "./interview";
import { useFlow } from "./store";
import { I } from "./parts";
import { PlaneSvg } from "./guide";
import { AskChat, KnownList } from "./ask-chat";

type Rec = {
  lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null;
};
type RecCtor = new () => Rec;
const recognizer = (): RecCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};
const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);
const pickVoice = () => {
  const vs = synth()?.getVoices().filter((v) => v.lang.startsWith("en")) ?? [];
  return vs.find((v) => /natural|aria|jenny|samantha|google uk english female|zira/i.test(v.name)) ?? vs.find((v) => /en-(GB|IN)/.test(v.lang)) ?? vs[0];
};
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Phase = "ringing" | "speaking" | "listening" | "thinking" | "idle";

export function AskVoice({ onDone, onLater }: { onDone: () => void; onLater: () => void }) {
  const { answers: saved, account, upcoming, testDone, dispatch } = useFlow();
  const c = upcoming ? counsellorById(upcoming.slot.counsellor) : null;
  const first = c?.name.split(" ")[0] ?? "your counsellor";
  const intro = useMemo(() => openingVoice(account!.name.split(" ")[0], first), [account, first]);
  const [stage, setStage] = useState<"intro" | "call" | "review" | "typing">(testDone ? "review" : "intro");
  const [phase, setPhase] = useState<Phase>("ringing");
  const [line, setLine] = useState({ text: "", n: 0 });
  const [heard, setHeard] = useState("");
  const [secs, setSecs] = useState(0);
  const [speaker, setSpeaker] = useState(true);
  const [mic, setMic] = useState(true);
  const [canHear, setCanHear] = useState(() => !!recognizer());
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  const [panel, setPanel] = useState(false);
  const timers = useRef<number[]>([]);
  const rec = useRef<Rec | null>(null);
  const speakRef = useRef<(m: Msg) => void>(() => {});
  const settings = useRef({ speaker, mic, canHear });
  useEffect(() => { settings.current = { speaker, mic, canHear }; }, [speaker, mic, canHear]);

  const talk = useInterview({ start: saved, intro, delay: 500, onAi: (m) => speakRef.current(m) });
  const { answers, current, tries, done } = talk;

  const clear = () => { timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers.current = []; };
  const stopAll = useCallback(() => { clear(); synth()?.cancel(); rec.current?.abort(); rec.current = null; }, []);
  useEffect(() => stopAll, [stopAll]);

  // Call timer
  useEffect(() => {
    if (stage !== "call") return;
    const t = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const answer = useCallback((text: string) => {
    rec.current?.abort(); rec.current = null;
    setHeard(text);
    setPhase("thinking");
    talk.reply(text);
  }, [talk]);

  const listen = useCallback(() => {
    setHeard("");
    setPhase("listening");
    const R = recognizer();
    const s = settings.current;
    if (!R || !s.mic || !s.canHear) { setPhase("idle"); return; }
    const r = new R();
    r.lang = "en-IN"; r.interimResults = true; r.continuous = false;
    let final = "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript; else interim += res[0].transcript;
      }
      setHeard(final + interim);
    };
    r.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") setCanHear(false); };
    r.onend = () => { if (rec.current !== r) return; rec.current = null; if (final.trim()) answer(final); else setPhase("idle"); };
    rec.current = r;
    try { r.start(); } catch { setPhase("idle"); }
  }, [answer]);

  // The assistant speaks one turn, with captions that light up word by word.
  const speak = useCallback((m: Msg) => {
    clear();
    const text = m.parts.join(" ");
    const words = text.split(" ").length;
    setLine({ text, n: 0 });
    setPhase("speaking");
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true; clear();
      setLine({ text, n: words });
      if (m.summary) timers.current.push(window.setTimeout(() => setStage("review"), 1200));
      else timers.current.push(window.setTimeout(listen, 250));
    };
    timers.current.push(window.setInterval(() => setLine((l) => ({ ...l, n: Math.min(l.n + 1, words) })), 255));
    const sy = synth();
    if (settings.current.speaker && sy) {
      sy.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice(); if (v) u.voice = v;
      u.rate = 1.03; u.onend = finish; u.onerror = finish;
      sy.speak(u);
      timers.current.push(window.setTimeout(finish, words * 430 + 2500)); // in case the browser never reports the end
    } else timers.current.push(window.setTimeout(finish, words * 270 + 700));
  }, [listen]);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  // Demo: play a sample reply as if the student said it.
  const sayFor = () => {
    const pool = sampleReplies[current ?? "intro"] ?? ["Yes"];
    const text = tries > 0 && questions.find((q) => q.id === current)?.options ? questions.find((q) => q.id === current)!.options![0] : pool[secs % pool.length];
    rec.current?.abort(); rec.current = null; clear();
    setPhase("listening");
    const w = text.split(" ");
    let i = 0;
    timers.current.push(window.setInterval(() => {
      i++; setHeard(w.slice(0, i).join(" "));
      if (i >= w.length) { clear(); timers.current.push(window.setTimeout(() => answer(text), 350)); }
    }, 150));
  };

  const startCall = () => { setStage("call"); setPhase("ringing"); setSecs(0); timers.current.push(window.setTimeout(() => talk.begin(), 1600)); };
  const leave = () => { stopAll(); if (!testDone) dispatch({ type: "answers", answers }); onLater(); };
  const redo = (id: string) => { setStage("call"); setPanel(false); talk.change(id); };
  const finish = () => { stopAll(); dispatch({ type: "answers", answers, done: true }); onDone(); };
  const count = Math.min(filledCount(answers), questions.length);
  const q = questions.find((x) => x.id === current);

  if (stage === "typing") return <AskChat onDone={onDone} onLater={onLater} />;

  if (stage === "intro") return <main className="v4-main v4-narrow av-intro">
    <div className="av-hero">
      <Orb phase="idle" />
      <span className="fl-kicker">STEP 2 OF 3 · ABOUT 3 MINUTES</span>
      <h1>A quick call instead of a form</h1>
      <p>Our assistant will ask you a few questions out loud. Just answer the way you’d talk to a friend. It sends your answers to {first} before your session.</p>
    </div>
    <ul className="av-tips">
      <li><span><I n="chat" s={18} /></span><div><b>Talk normally</b><small>Short answers are fine. If it doesn’t understand, it asks again in a simpler way.</small></div></li>
      <li><span><I n="phone" s={18} /></span><div><b>Find a quiet spot</b><small>Your browser will ask to use the microphone. Tap Allow.</small></div></li>
      <li><span><I n="lock" s={18} /></span><div><b>Nothing is recorded</b><small>We only keep the answers. Only {c?.name ?? "your counsellor"} sees them.</small></div></li>
    </ul>
    <div className="av-intro-actions">
      <button className="fl-btn fl-primary big av-call-btn" onClick={startCall}><I n="phone" s={20} /> Start the call</button>
      <button className="fl-link" onClick={() => setStage("typing")}>I’d rather type my answers</button>
      <button className="fl-link" onClick={onLater}>Do it later</button>
    </div>
  </main>;

  if (stage === "review") return <main className="v4-main v4-narrow">
    <div className="av-review-head">
      <span className="av-ended"><I n="check" s={16} /> {secs ? `Call finished · ${clock(secs)}` : "Your answers"}</span>
      <h1>Here’s what I’ll send to {first}</h1>
      <p>Check it over. Tap Change to answer any one again by voice.</p>
    </div>
    <section className="fl-card"><KnownList answers={answers} current={null} onChange={redo} /></section>
    <div className="av-review-actions">
      <button className="fl-btn fl-primary big" onClick={finish} disabled={!done}>{testDone ? "Save changes" : `Send to ${first}`} <I n="arrow" s={18} /></button>
      <button className="fl-btn ghost" onClick={onLater}>{testDone ? "Cancel" : "Later"}</button>
    </div>
  </main>;

  return <main className="v4-main av-wrap">
    <div className="av-grid">
      <section className={"av-call is-" + phase} aria-label="Voice call with the Career Hub assistant">
        <header className="av-call-head">
          <span className="av-live"><i /> {phase === "ringing" ? "Connecting…" : clock(secs)}</span>
          <strong>Career Hub assistant</strong>
          <button className="av-panel-btn" onClick={() => setPanel((p) => !p)}>{count}/{questions.length} answered</button>
        </header>
        <div className="av-stage">
          <Orb phase={phase} />
          <p className="av-status" aria-live="polite">{{ ringing: "Calling the assistant…", speaking: "Assistant is speaking", listening: canHear && mic ? "Listening… go ahead" : "Your turn", thinking: "Thinking…", idle: "Your turn to answer" }[phase]}</p>
          <p className="av-caption" aria-live="polite">{line.text.split(" ").map((w, i) => <span key={i} className={i < line.n ? "is-on" : ""}>{w} </span>)}</p>
          <p className={"av-heard" + (heard ? " is-on" : "")}>{heard ? <>“{heard}”</> : phase === "listening" || phase === "idle" ? "Say your answer…" : " "}</p>
          {(phase === "idle" || phase === "listening") && tries > 0 && q?.options && <div className="av-options">
            <small>Or tap your answer:</small>{q.options.map((o) => <button key={o} onClick={() => answer(o)}>{o}</button>)}
          </div>}
        </div>
        {!canHear && <p className="av-note"><I n="info" s={15} /> Voice input isn’t available here. Use “Answer for me” or type instead.</p>}
        {typing && <form className="av-type" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) { answer(typed); setTyped(""); } }}>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your answer…" aria-label="Type your answer" />
          <button className="fl-btn fl-primary" disabled={!typed.trim()}>Send</button>
        </form>}
        <footer className="av-controls">
          <Ctl icon={mic ? "mic" : "micOff"} label={mic ? "Mute" : "Unmute"} on={!mic} onClick={() => { setMic((m) => !m); rec.current?.abort(); }} />
          <Ctl icon={speaker ? "speaker" : "speakerOff"} label={speaker ? "Speaker" : "Muted"} on={!speaker} onClick={() => { setSpeaker((s) => !s); synth()?.cancel(); }} />
          {phase === "idle" && canHear && mic
            ? <button className="av-talk" onClick={listen}><Svg n="mic" /> Tap to talk</button>
            : <button className="av-talk is-demo" disabled={phase === "ringing" || phase === "thinking" || phase === "speaking"} onClick={sayFor}><I n="wand" s={18} /> Answer for me</button>}
          <Ctl icon="keyboard" label="Type" on={typing} onClick={() => setTyping((t) => !t)} />
          <button className="av-end" onClick={leave} aria-label="End call and finish later"><Svg n="hang" /></button>
        </footer>
      </section>
      <aside className={"ak-side" + (panel ? " is-open" : "")}>
        <div className="fl-card">
          <h2>Heard so far</h2>
          <p className="ak-side-lead">It only asks about what’s still missing.</p>
          <KnownList answers={answers} current={current} onChange={redo} busy={phase !== "idle" && phase !== "listening"} />
        </div>
        <p className="fl-fine"><I n="lock" s={14} /> Nothing is recorded. Only the answers are kept.</p>
      </aside>
    </div>
  </main>;
}

function Orb({ phase }: { phase: Phase }) {
  return <div className={"av-orb is-" + phase} aria-hidden="true">
    <span className="av-ring" /><span className="av-ring" /><span className="av-ring" />
    <span className="av-core"><span className="av-plane"><PlaneSvg width={64} id="voice" /></span></span>
    <span className="av-bars">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 5) * 0.11}s` }} />)}</span>
  </div>;
}

const extra: Record<string, string> = {
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z M5 11a7 7 0 0 0 14 0 M12 18v3",
  micOff: "M9 6a3 3 0 0 1 6 0v5 M15 14.5A3 3 0 0 1 9 12V9 M5 11a7 7 0 0 0 11.5 5.4 M19 11a7 7 0 0 1-.6 2.8 M12 18v3 M4 4l16 16",
  speaker: "M4 9h4l5-4v14l-5-4H4Z M16.5 8.5a5 5 0 0 1 0 7 M19 6a8.5 8.5 0 0 1 0 12",
  speakerOff: "M4 9h4l5-4v14l-5-4H4Z M17 9l5 6 M22 9l-5 6",
  keyboard: "M3 6h18v12H3Z M7 10h.01 M11 10h.01 M15 10h.01 M7 14h10",
  hang: "M3 14.5c5-5 13-5 18 0l-2.5 2.5-3.5-1.5v-3a10 10 0 0 0-6 0v3L5.5 17Z",
};
function Svg({ n }: { n: string }) {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={extra[n]} /></svg>;
}
function Ctl({ icon, label, on, onClick }: { icon: string; label: string; on?: boolean; onClick: () => void }) {
  return <button className={"av-ctl" + (on ? " is-on" : "")} onClick={onClick} aria-pressed={on}><span><Svg n={icon} /></span><small>{label}</small></button>;
}
