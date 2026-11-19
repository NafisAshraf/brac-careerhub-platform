"use client";
// v8 · Experimental: the v4 counsellor-first flow, plus the Career Hub plane as a guide.
// Once the hub opens, the plane from the logo flies out, points at what to do next,
// spotlights it and explains it. Click the plane in the logo any time to ask for help.
import { FlowProvider } from "./store";
import { V4 } from "./v4";
import "./guide.css";

export default function HubV8({ exit }: { active: boolean; exit: () => void }) {
  return <FlowProvider><V4 exit={exit} guide /></FlowProvider>;
}
