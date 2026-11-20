"use client";
// v12 · The v11 app as is, with a calmer home page: softer colours and tighter, more
// business-like corners. Only the look changes, so v11 is reused and restyled from v12.css.
import HubV11 from "../v11";
import "./v12.css";

export default function HubV12(props: { active: boolean; exit: () => void }) {
  return <div className="v12-look"><HubV11 {...props} /></div>;
}
