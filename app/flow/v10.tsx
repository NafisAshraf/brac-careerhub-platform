"use client";
// v10 · The v4 flow, but the questions before the first session are a short voice call
// with the assistant: it speaks, listens and shows live captions. Typing stays available.
import { FlowProvider } from "./store";
import { V4 } from "./v4";
import "./ask.css";
import "./ask-voice.css";

export default function HubV10({ exit }: { active: boolean; exit: () => void }) {
  return <FlowProvider><V4 exit={exit} ask="voice" /></FlowProvider>;
}
