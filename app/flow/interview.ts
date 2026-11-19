"use client";
// The conversation loop shared by the chat (v9) and voice (v10) questionnaires.
// Keeps the answers found so far, decides what to ask next, and re-asks in simpler words
// when a reply didn't answer the question.
import { useCallback, useEffect, useRef, useState } from "react";
import { questions, type Answers } from "./data";
import { asks, extract, filled, nextMissing, reaction } from "./converse";

export type Msg = { id: number; from: "ai" | "me"; parts: string[]; summary?: boolean };

export function useInterview({ start, intro, delay = 900, onAi }: { start: Answers; intro: string; delay?: number; onAi?: (m: Msg) => void }) {
  const complete = !nextMissing(start);
  const [answers, setAnswers] = useState<Answers>(start);
  const [current, setCurrent] = useState<string | null>(complete ? null : Object.keys(start).length ? nextMissing(start)!.id : null);
  const [tries, setTries] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(complete);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const seq = useRef(0);
  const turn = useRef(0);
  const timers = useRef<number[]>([]);
  const aiRef = useRef(onAi);
  useEffect(() => { aiRef.current = onAi; }, [onAi]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const pushAi = useCallback((parts: string[], summary?: boolean) => {
    const m: Msg = { id: ++seq.current, from: "ai", parts: parts.filter(Boolean), summary };
    setMsgs((l) => [...l, m]);
    setThinking(false);
    aiRef.current?.(m);
  }, []);

  /** Starts the conversation (called once by the screen when it is ready). */
  const begin = useCallback(() => {
    if (seq.current) return;
    setThinking(true);
    later(500, () => {
      if (complete) pushAi(["You’ve already answered everything. Check the list, and tap Change next to anything you’d like to update."], true);
      else if (Object.keys(start).length) pushAi([`Welcome back! Let’s finish off. ${asks[nextMissing(start)!.id].ask}`]);
      else pushAi([intro]);
    });
  }, [complete, intro, pushAi, start]);

  /** The student answered (typed, tapped or spoke). */
  const reply = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    setMsgs((l) => [...l, { id: ++seq.current, from: "me", parts: [clean] }]);
    setThinking(true);
    const found = extract(clean, current, answers);
    const merged = { ...answers, ...found };
    setAnswers(merged);
    const q = questions.find((x) => x.id === current);
    const wait = delay + Math.min(clean.length * 8, 600);
    if (q && !filled(q, merged)) {
      // Didn't get it: ask again, more simply. After that, the screen shows the options too.
      const n = tries + 1;
      setTries(n);
      later(wait, () => pushAi([n === 1 ? `Sorry, I didn’t quite get that. ${asks[q.id].simpler}` : "No problem. You can tap one of the answers below, or say it in your own words."]));
      return;
    }
    setTries(0);
    const said = reaction(found, current, turn.current++);
    const next = nextMissing(merged);
    setCurrent(next?.id ?? null);
    if (!next) {
      setDone(true);
      later(wait, () => pushAi([said, "That’s everything I need. Here’s what I’ll send to your counsellor. Check it, and change anything that isn’t right."], true));
    } else {
      // From the opening question, a reply with nothing useful just moves on to the first question.
      later(wait, () => pushAi([said, asks[next.id].ask]));
    }
  }, [answers, current, delay, pushAi, thinking, tries]);

  /** Re-ask one question (from the summary's “Change” buttons). */
  const change = useCallback((id: string) => {
    const rest = { ...answers };
    delete rest[id];
    setAnswers(rest);
    setCurrent(id);
    setTries(0);
    setDone(false);
    setThinking(true);
    later(400, () => pushAi([`Sure, let’s change that. ${asks[id].ask}`]));
  }, [answers, pushAi]);

  return { msgs, answers, current, tries, thinking, done, begin, reply, change };
}
