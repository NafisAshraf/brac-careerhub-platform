"use client";
// v14 · Two parts after the landing page:
// 1. The questionnaire flow: v11's (Bangla first) — sign up, pick a counsellor and a time, the
//    five questions, then wait for the meeting.
// 2. The SaaS platform, opened by the counsellor: v4's layout and look, with a simpler home
//    (session, last notes, session history), no separate sessions page, a friendlier task list,
//    and v11's course and job cards.
import { useEffect, useState } from "react";
import Image from "next/image";
import { LangProvider, useL } from "../v11/lang";
import { Store, useHub } from "../v11/store";
import { Book, Confirmed, Questions, Ready, Signup, Stepper } from "../v11/pre";
import { Bell, DemoPanel, LangToggle } from "../v11/ui";
import { Saas } from "./saas";
import "../flow.css";
import "../v4.css";
import "../guide.css";
import "../v11/v11.css";
import "./v14.css";

export default function HubV14({ exit }: { active: boolean; exit: () => void }) {
  return <LangProvider><Store><V14 exit={exit} /></Store></LangProvider>;
}

function V14({ exit }: { exit: () => void }) {
  const flow = useHub();
  const { lang } = useL();
  const [view, setView] = useState<"auto" | "confirmed" | "questions">("auto");
  const [skipped, setSkipped] = useState(false);
  const booked = !!flow.upcoming;
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view, flow.phase, booked]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  if (flow.phase === "app") return <Saas exit={exit} />;
  const later = skipped && !flow.testDone;
  const step = !flow.upcoming ? 1 : view === "questions" || (!flow.testDone && !later) ? 2 : 3;
  const screen = flow.phase === "signup" ? "signup" : !flow.upcoming ? "book" : view === "questions" ? "questions" : (view === "confirmed" && !later) || (!flow.testDone && !later) ? "confirmed" : "ready";
  return <div className="fl v4 v11">
    <header className="fl-bar">
      <button className="fl-logo" onClick={exit} aria-label="BRAC Career Hub"><Image src="/careerhub-logo.png" width={74} height={51} alt="BRAC Career Hub" /></button>
      <div className="fl-bar-mid">{flow.phase !== "signup" && <Stepper step={step} formDue={later && step === 3} />}</div>
      <div className="fl-bar-end"><LangToggle /><Bell onGo={() => setView("auto")} /></div>
    </header>
    {screen === "signup" && <Signup />}
    {screen === "book" && <Book onBooked={() => setView("confirmed")} />}
    {screen === "confirmed" && <Confirmed fresh={view === "confirmed"} onNext={() => setView("questions")} onLater={() => { setSkipped(true); setView("auto"); }} />}
    {screen === "questions" && <Questions onDone={() => setView("auto")} />}
    {screen === "ready" && <Ready onEdit={() => setView("questions")} />}
    <DemoPanel />
  </div>;
}
