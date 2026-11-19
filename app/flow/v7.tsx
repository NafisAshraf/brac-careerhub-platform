"use client";
// v7 · No sidebar: the same counsellor-first flow as v4, but the opened Career Hub
// uses a menu along the top (a tab bar at the bottom on phones) instead of a sidebar.
import { FlowProvider } from "./store";
import { V4 } from "./v4";
import "./v7.css";

export default function HubV7({ exit }: { active: boolean; exit: () => void }) {
  return <FlowProvider><V4 exit={exit} layout="top" /></FlowProvider>;
}
