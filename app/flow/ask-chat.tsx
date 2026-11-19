"use client";
// v9 · The questionnaire as a conversation. The assistant asks in plain words, reads
// free-text replies, skips anything already answered and re-asks more simply when needed.
import { useEffect, useMemo, useRef, useState } from "react";
import { counsellorById, questions, type Answers } from "./data";
import { asks, filled, filledCount, opening, sampleReplies } from "./converse";
import { useInterview, type Msg } from "./interview";
import { useFlow } from "./store";
import { I } from "./parts";
import { PlaneSvg } from "./guide";

const required = questions.filter((q) => !q.optional).length;
const show = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : v || "");

export function AssistantMark({ size = 40, live }: { size?: number; live?: boolean }) {
  return <span className={"ak-mark" + (live ? " is-live" : "")} style={{ width: size, height: size }} aria-hidden="true">
    <span style={{ width: size * 0.56 }}><PlaneSvg width={size * 0.56} id={`ak-${size}`} /></span>
  </span>;
}

/** What the assistant has understood so far, with a Change button on each answer. */
export function KnownList({ answers, current, onChange, busy }: { answers: Answers; current: string | null; onChange: (id: string) => void; busy?: boolean }) {
  return <ul className="ak-known">
    {questions.map((q) => {
      const has = filled(q, answers);
      const v = show(answers[q.id]);
      return <li key={q.id} className={(has ? "is-has" : "") + (q.id === current ? " is-asking" : "")}>
        <span className="ak-dot">{has ? <I n="check" s={12} /> : null}</span>
        <div><small>{asks[q.id].label}</small><b>{has ? (v || "Nothing to add") : q.id === current ? "Asking now…" : "Not yet"}</b></div>
        {has && !busy && <button className="fl-link" onClick={() => onChange(q.id)}>Change</button>}
      </li>;
    })}
  </ul>;
}

export function AskChat({ onDone, onLater }: { onDone: () => void; onLater: () => void }) {
  const { answers: saved, account, upcoming, testDone, dispatch } = useFlow();
  const c = upcoming ? counsellorById(upcoming.slot.counsellor) : null;
  const first = c?.name.split(" ")[0] ?? "your counsellor";
  const intro = useMemo(() => opening(account!.name.split(" ")[0], first), [account, first]);
  const talk = useInterview({ start: saved, intro });
  const [text, setText] = useState("");
  const [panel, setPanel] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const { begin, msgs, thinking, current, tries, done, answers } = talk;

  useEffect(() => { begin(); }, [begin]);
  // Scroll the chat box only (not the page) to the newest message.
  useEffect(() => { const el = log.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [msgs.length, thinking, done]);

  const q = questions.find((x) => x.id === current);
  // Before the first miss we offer example replies; after a miss, the actual choices.
  const chips = done ? [] : tries > 0 && q?.options ? q.options : sampleReplies[current ?? "intro"] ?? [];
  const send = (t = text) => { if (!t.trim()) return; talk.reply(t); setText(""); box.current?.focus(); };
  const finish = () => { dispatch({ type: "answers", answers, done: true }); onDone(); };
  const count = Math.min(filledCount(answers), questions.length);

  return <main className="v4-main ak-wrap">
    <div className="ak-top">
      <button className="fl-btn ghost" onClick={() => { if (!testDone) dispatch({ type: "answers", answers }); onLater(); }}><I n="back" s={17} /> {testDone ? "Back" : "Finish later"}</button>
      <div className="ak-top-progress" aria-label={`${count} of ${questions.length} answered`}>
        <span>{count} of {questions.length}</span><div className="fl-progress"><span style={{ width: `${(count / questions.length) * 100}%` }} /></div>
      </div>
      <button className="fl-btn ghost ak-panel-btn" onClick={() => setPanel((p) => !p)} aria-expanded={panel}><I n="notes" s={17} /> What I know</button>
    </div>
    <div className="ak-grid">
      <section className="ak-chat" aria-label="Chat with the Career Hub assistant">
        <header className="ak-chat-head">
          <AssistantMark live={thinking} />
          <div><strong>Career Hub assistant</strong><small>{thinking ? "Typing…" : "Asks a few questions for " + first}</small></div>
          <span className="ak-badge"><I n="spark" s={13} /> AI</span>
        </header>
        <div className="ak-log" aria-live="polite" ref={log}>
          {msgs.map((m) => <Bubble key={m.id} m={m} />)}
          {thinking && <div className="ak-row"><AssistantMark size={30} /><div className="ak-typing"><i /><i /><i /></div></div>}
          {done && !thinking && msgs.at(-1)?.summary && <div className="ak-summary">
            <h3>Your answers for {first}</h3>
            <KnownList answers={answers} current={null} onChange={talk.change} />
            <div className="ak-summary-actions">
              <button className="fl-btn fl-primary big" onClick={finish}>{testDone ? "Save changes" : `Send to ${first}`} <I n="arrow" s={18} /></button>
              <small><I n="lock" s={13} /> Only {c?.name ?? "your counsellor"} sees this.</small>
            </div>
          </div>}
        </div>
        {!done && <footer className="ak-compose">
          {chips.length > 0 && !thinking && <div className="ak-chips">
            <small>{tries > 0 ? "Tap one, or type your own:" : "Not sure what to say? Try:"}</small>
            {chips.map((x) => <button key={x} onClick={() => send(x)}>{x}</button>)}
          </div>}
          <form className="ak-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <textarea ref={box} rows={1} value={text} placeholder="Type your answer…" aria-label="Your answer"
              onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="fl-btn fl-primary" disabled={!text.trim() || thinking} aria-label="Send"><I n="arrow" s={18} /></button>
          </form>
          <small className="ak-fine">Write the way you’d text a friend. Short answers are fine.</small>
        </footer>}
      </section>
      <aside className={"ak-side" + (panel ? " is-open" : "")}>
        <div className="fl-card">
          <h2>What I know so far</h2>
          <p className="ak-side-lead">{count >= required ? "All done. You can still change anything." : `I’ll only ask about what’s missing. ${questions.length - count} to go.`}</p>
          <KnownList answers={answers} current={done ? null : current} onChange={(id) => { talk.change(id); setPanel(false); }} busy={thinking} />
        </div>
        <p className="fl-fine"><I n="lock" s={14} /> Only {c?.name ?? "your counsellor"} sees your answers.</p>
      </aside>
    </div>
  </main>;
}

function Bubble({ m }: { m: Msg }) {
  if (m.from === "me") return <div className="ak-row is-me"><p className="ak-bubble is-me">{m.parts[0]}</p></div>;
  return <div className="ak-row"><AssistantMark size={30} /><div className="ak-stack">{m.parts.map((p, i) => <p key={i} className="ak-bubble" style={{ animationDelay: `${i * 0.35}s` }}>{p}</p>)}</div></div>;
}
