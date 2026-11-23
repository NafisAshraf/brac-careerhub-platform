"use client";
// v14 demo controls, kept to the minimum: before the hub opens, one button plays the counsellor
// unlocking it (everything except Study Abroad); inside the hub, one button unlocks Study Abroad.
import { useState } from "react";
import { I } from "../parts";
import { useL } from "../v11/lang";
import { firstOpen, sampleAccount, useHub } from "../v11/store";

export function DemoPanel() {
  const { phase, account, upcoming, unlocked, dispatch } = useHub();
  const { t } = useL();
  const [open, setOpen] = useState(false);
  const abroadOn = (unlocked ?? []).includes("abroad");
  const counsellorUnlocks = () => {
    if (!account) dispatch({ type: "signup", account: sampleAccount });
    if (!upcoming) { const slot = firstOpen("nusrat"); if (slot) dispatch({ type: "book", slot }); }
    dispatch({ type: "complete", unlock: ["courses", "jobs", "cv"] });
    setOpen(false);
  };
  return <div className={"fl-demo" + (open ? " is-open" : "")}>
    <button className="fl-demo-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}><I n="wand" s={16} /> {t("ডেমো কন্ট্রোল", "Demo controls")}</button>
    {open && <div className="fl-demo-panel">
      <p>{t("এই বোতাম কাউন্সেলরের দিকের কাজটি করে দেখায়।", "This button plays the counsellor’s side.")}</p>
      {phase !== "app"
        ? <button className="is-main" onClick={counsellorUnlocks}><I n="check" s={16} /> {t("কাউন্সেলর আনলক করেন", "Counsellor unlocks")}</button>
        : <button className="is-main" disabled={abroadOn} onClick={() => { dispatch({ type: "unlock", id: "abroad" }); setOpen(false); }}><I n="globe" s={16} /> {abroadOn ? t("বিদেশে পড়াশোনা খোলা আছে", "Study Abroad is open") : t("বিদেশে পড়াশোনা আনলক করুন", "Unlock Study Abroad")}</button>}
    </div>}
  </div>;
}
