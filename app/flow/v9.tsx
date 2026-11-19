"use client";
// v9 · The v4 flow, but the questions before the first session are a chat with an AI
// assistant instead of a form. It reads natural replies, skips what it already knows and
// re-asks in simpler words when an answer doesn't land.
import { FlowProvider } from "./store";
import { V4 } from "./v4";
import "./ask.css";

export default function HubV9({ exit }: { active: boolean; exit: () => void }) {
  return <FlowProvider><V4 exit={exit} ask="chat" /></FlowProvider>;
}
