"use client";
// v11 · Built on v4. Bangla first. Five questions before the first session, the plane guide
// from v8 (4 steps), and a new Career Hub centred on sessions.
import { useEffect, useState } from "react";
import Image from "next/image";
import { LangProvider, useL } from "./lang";
import { Store, useHub } from "./store";
import { Hub } from "./hub";
import { Book, Confirmed, Questions, Ready, Signup, Stepper } from "./pre";
import { Bell, DemoPanel, LangToggle } from "./ui";
import "../flow.css";
import "../v4.css";
import "../guide.css";
import "./v11.css";

export default function HubV11({ exit }: { active: boolean; exit: () => void }) {
  return <LangProvider><Store><V11 exit={exit} /></Store></LangProvider>;
}

function V11({ exit }: { exit: () => void }) {
  const flow = useHub();
  const { lang } = useL();
  const [view, setView] = useState<"auto" | "confirmed" | "questions">("auto");
  const booked = !!flow.upcoming;
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view, flow.phase, booked]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  if (flow.phase === "app") return <Hub exit={exit} />;
  const step = !flow.upcoming ? 1 : !flow.testDone || view === "questions" ? 2 : 3;
  const screen = flow.phase === "signup" ? "signup" : !flow.upcoming ? "book" : view === "questions" ? "questions" : view === "confirmed" || !flow.testDone ? "confirmed" : "ready";
  return <div className="fl v4 v11">
    <header className="fl-bar">
      <button className="fl-logo" onClick={exit} aria-label="BRAC Career Hub"><Image src="/careerhub-logo.png" width={74} height={51} alt="BRAC Career Hub" /></button>
      <div className="fl-bar-mid">{flow.phase !== "signup" && <Stepper step={step} />}</div>
      <div className="fl-bar-end"><LangToggle /><Bell onGo={() => setView("auto")} /></div>
    </header>
    {screen === "signup" && <Signup />}
    {screen === "book" && <Book onBooked={() => setView("confirmed")} />}
    {screen === "confirmed" && <Confirmed fresh={view === "confirmed"} onNext={() => setView("questions")} onLater={() => setView("auto")} />}
    {screen === "questions" && <Questions onDone={() => setView("auto")} />}
    {screen === "ready" && <Ready onEdit={() => setView("questions")} />}
    <DemoPanel />
  </div>;
}
