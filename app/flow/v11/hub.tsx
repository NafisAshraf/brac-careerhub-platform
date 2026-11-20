"use client";
// v11 Career Hub after the first session: a sidebar, a home of expanding tiles built around
// sessions, and the sections behind the sidebar.
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { counsellorById, counsellors, type Slot } from "../data";
import { Avatar, Dialog } from "../parts";
import { cf, cn, counsellorText, sectionName } from "./content";
import { Home } from "./home";
import { AppIcon, Ico } from "./icons";
import { ago, clock, dayMonth, dayWord, num, useL } from "./lang";
import { Abroad, AnswersForm, CV, Courses, Jobs, Profile, Tasks } from "./sections";
import { useHub } from "./store";
import { Guide } from "./guide";
import { Bell, CounsellorCard, DemoPanel, LangToggle, SlotPicker } from "./ui";

const TILE_PAGES = ["tasks", "courses", "jobs", "cv", "abroad", "profile"];
type Page = "home" | "tasks" | "courses" | "jobs" | "cv" | "abroad" | "profile" | "book";

export function Hub({ exit }: { exit: () => void }) {
  const { unlocked = [], tasks, upcoming, account, askUpdate } = useHub();
  const { t, lang } = useL();
  const [page, setPage] = useState<Page>("home");
  const [who, setWho] = useState<"same" | "other">("same");
  const [menu, setMenu] = useState(false);
  const main = useRef<HTMLElement>(null);
  const has = (id: string) => (unlocked ?? []).includes(id as "cv");
  // A home tile and its page share one view-transition name ("zoom"), so going to a section
  // from home grows the tile into the page, and going home shrinks the page back into its tile.
  const [zoom, setZoom] = useState<string | null>(null);
  const go = (to: string, opts?: { who?: "same" | "other" }) => {
    const p = (to === "sessions" || to === "session" ? "home" : to) as Page;
    if (["courses", "jobs", "cv", "abroad"].includes(p) && !has(p)) return;
    if (opts?.who) setWho(opts.who);
    const apply = () => { setPage(p); setMenu(false); window.scrollTo({ top: 0 }); };
    const d = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void>; ready: Promise<void> } };
    const tilePage = (x: string) => TILE_PAGES.includes(x) && !!document.querySelector(`[data-tile="${x}"]:not(.is-locked)`);
    const from = page === "home" && p !== "home" && tilePage(p) ? p : p === "home" && TILE_PAGES.includes(page) ? page : null;
    if (!from || !d.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(); return; }
    flushSync(() => setZoom(from));
    const tr = d.startViewTransition(() => flushSync(apply));
    const clear = () => setZoom(null);
    tr.ready.catch(() => {}); // skipped (e.g. hidden tab): the page still changes
    tr.finished.then(clear, clear);
  };
  useEffect(() => { main.current?.focus({ preventScroll: true }); }, [page]);
  const open = tasks.filter((x) => !x.done).length;
  const nav = [
    { id: "home", icon: "home", show: true },
    { id: "tasks", icon: "tasks", show: true, count: open },
    { id: "courses", icon: "courses", show: has("courses") },
    { id: "jobs", icon: "jobs", show: has("jobs") },
    { id: "cv", icon: "cv", show: has("cv") },
    { id: "abroad", icon: "abroad", show: has("abroad") },
    { id: "profile", icon: "profile", show: true },
  ].filter((n) => n.show);

  const side = <>
    <div className="fl-brand is-guided v11-brand"><Image data-guide="plane-dock" src="/careerhub-logo.png" width={96} height={86} alt="BRAC Career Hub" /></div>
    <nav aria-label="Career Hub" data-guide="nav-main" className="v11-nav">
      {nav.map((n) => <button key={n.id} className={"v11-nav-item" + (page === n.id ? " is-on" : "")} aria-current={page === n.id ? "page" : undefined} onClick={() => go(n.id)}>
        <AppIcon n={n.icon} s={34} /><span>{sectionName[n.id][lang]}</span>{!!n.count && <em>{num(n.count, lang)}</em>}</button>)}
    </nav>
    <div className="v11-side-session">
      {upcoming ? <button className="v11-side-next" onClick={() => go("home")}>
        <small>{t("পরের সেশন", "Next session")}</small>
        <b>{dayWord(upcoming.slot.date, lang)}, {clock(upcoming.slot.time, lang)}</b>
        <span><Avatar c={counsellorById(upcoming.slot.counsellor)} size={22} />{cn(counsellorById(upcoming.slot.counsellor), lang)}</span>
      </button>
        : <button className="fl-btn fl-primary v11-side-book" data-guide="side-book" onClick={() => go("book", { who: "same" })}><Ico n="book" s={20} w="fill" />{t("নতুন সেশন বুক করুন", "Book a session")}</button>}
    </div>
    <div className="v11-side-foot">
      <p className="v11-side-hint"><Ico n="lock" s={14} w="fill" />{t("কাউন্সেলর নতুন কিছু খুললে এখানে দেখা যাবে।", "New sections appear when your counsellor opens them.")}</p>
      <button className="fl-link" onClick={exit}>← {t("মূল ওয়েবসাইটে ফিরুন", "Back to the website")}</button>
    </div>
  </>;

  return <div className="fl v11 v11-app">
    <aside className="v11-side">{side}</aside>
    {menu && <div className="fl-drawer" role="dialog" aria-modal="true" aria-label={t("মেনু", "Menu")}><div className="fl-drawer-in v11-side">
      <button className="fl-icon-btn fl-drawer-x" aria-label={t("বন্ধ করুন", "Close menu")} onClick={() => setMenu(false)}><Ico n="x" s={22} w="bold" /></button>{side}</div>
      <button className="fl-drawer-scrim" aria-label={t("বন্ধ করুন", "Close menu")} onClick={() => setMenu(false)} /></div>}
    <div className="v11-main">
      <header className="v11-top">
        <button className="fl-btn ghost v11-menu-btn" onClick={() => setMenu(true)}><Ico n="home" s={20} w="fill" /> {t("মেনু", "Menu")}</button>
        <div className="v11-top-end"><LangToggle /><Bell onGo={go} />
          <span className="v11-me" title={account?.name}>{account?.name.split(" ")[0]}</span></div>
      </header>
      <main ref={main} tabIndex={-1} className="v11-content" style={{ viewTransitionName: zoom && page !== "home" ? "zoom" : undefined }}>
        {page === "home" && <Home go={go} zoom={zoom} />}
        {page === "tasks" && <Tasks />}
        {page === "courses" && <Courses />}
        {page === "jobs" && <Jobs />}
        {page === "cv" && <CV />}
        {page === "abroad" && <Abroad onConsult={() => go("book", { who: "other" })} />}
        {page === "profile" && <Profile />}
        {page === "book" && <BookAgain start={who} onDone={() => go("home")} onBack={() => go("home")} />}
      </main>
    </div>
    {askUpdate && page === "home" && <UpdatePrompt />}
    <DemoPanel />
    <Guide onHome={() => setPage("home")} name={account?.name.split(" ")[0] ?? ""} />
  </div>;
}

/* ---------- Booking a later session: the same counsellor, or someone else ---------- */
function BookAgain({ start, onDone, onBack }: { start: "same" | "other"; onDone: () => void; onBack: () => void }) {
  const { last, sessions, dispatch } = useHub();
  const { t, lang } = useL();
  const prev = counsellorById((last ?? sessions[0]).slot.counsellor);
  const met = Array.from(new Set(sessions.filter((s) => s.status === "completed").map((s) => s.slot.counsellor)));
  const [mode, setMode] = useState<"same" | "other">(start);
  const [pick, setPick] = useState(start === "same" ? prev.id : "");
  const [slot, setSlot] = useState<Slot | null>(null);
  const choose = (m: "same" | "other") => { setMode(m); setSlot(null); setPick(m === "same" ? prev.id : ""); };
  const c = pick ? counsellorById(pick) : null;
  const others = counsellors.filter((x) => x.id !== prev.id);
  return <div className="v11-page v11-book">
    <button className="fl-btn ghost v4-back" onClick={onBack}><Ico n="back" s={20} w="bold" /> {t("হোমে ফিরুন", "Back to home")}</button>
    <header className="v11-book-head"><h1>{t("নতুন সেশন বুক করুন", "Book a session")}</h1>
      <p>{t("৩০ মিনিট, Google Meet-এ, শিক্ষার্থীদের জন্য ফ্রি।", "30 minutes on Google Meet, free for students.")}</p></header>

    <div className="v11-who-choice" role="radiogroup" aria-label={t("কার সাথে?", "Who with?")}>
      <button role="radio" aria-checked={mode === "same"} className={"v11-who" + (mode === "same" ? " is-on" : "")} onClick={() => choose("same")}>
        <span className="v11-who-radio" />
        <Avatar c={prev} size={64} />
        <span className="v11-who-text"><b>{t(`আবার ${cn(prev, lang)}ের সাথে`, `Again with ${cn(prev, lang)}`)}</b>
          <small>{t(`আপনার গল্প জানেন · শেষ দেখা ${ago((last ?? sessions[0]).slot.date, "bn")}`, `Already knows your story · last met ${ago((last ?? sessions[0]).slot.date, "en")}`)}</small></span>
        <em className="v11-tag">{t("সাজেস্টেড", "Suggested")}</em>
      </button>
      <button role="radio" aria-checked={mode === "other"} className={"v11-who" + (mode === "other" ? " is-on" : "")} onClick={() => choose("other")}>
        <span className="v11-who-radio" />
        <span className="v11-stack">{others.map((x) => <Avatar key={x.id} c={x} size={44} />)}</span>
        <span className="v11-who-text"><b>{t("অন্য একজন কাউন্সেলর", "A different counsellor")}</b>
          <small>{t("অন্য বিষয়ে পরামর্শ বা নতুন দৃষ্টিভঙ্গির জন্য", "For a different focus or a fresh view")}</small></span>
      </button>
    </div>

    {mode === "other" && <section className="v11-book-step" key="other">
      <h2>{t("কার সাথে কথা বলবেন?", "Who would you like to talk to?")}</h2>
      <p className="v11-reassure"><Ico n="info" s={20} w="fill" c="#59217a" />{t("যার সাথেই বুক করুন, তিনি আপনার উত্তর আর আগের সেশনের নোট দেখতে পাবেন। শুরু থেকে বলতে হবে না।", "Whoever you book, they’ll see your answers and past session notes. You won’t need to start from scratch.")}</p>
      <div className="fl-counsellors v11-others">{others.map((x) => <CounsellorCard key={x.id} c={x} selected={pick === x.id} onSelect={() => { setPick(x.id); setSlot(null); setTimeout(() => document.getElementById("v11-when")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }}
        cta={met.includes(x.id) ? t("আগে দেখা হয়েছে", "Met before") : undefined} />)}</div>
    </section>}

    {c && <section className="v11-book-step v4" id="v11-when" key={"time-" + c.id}>
      <h2>{t(`${cf(c, lang)}ের সাথে কখন?`, `When with ${cf(c, lang)}?`)}</h2>
      <SlotPicker counsellor={c.id} value={slot} onChange={setSlot} />
    </section>}

    {c && <div className={"v4-confirm" + (slot ? " is-ready" : "")}>
      <div>{slot ? <><strong>{dayWord(slot.date, lang)}, {dayMonth(slot.date, lang)} · {clock(slot.time, lang)}</strong><span>{t(`${cn(c, lang)}ের সাথে ৩০ মিনিট`, `30 minutes with ${cn(c, lang)}`)}</span></>
        : <span>{t(`${cn(c, lang)}ের সাথে একটি সময় বেছে নিন`, `Pick a time with ${cn(c, lang)}`)}</span>}</div>
      <button className="fl-btn fl-primary big" disabled={!slot} onClick={() => { dispatch({ type: "book", slot: slot! }); onDone(); }}>{t("সেশন বুক করুন", "Book this session")} <Ico n="arrow" s={20} w="bold" /></button>
    </div>}
  </div>;
}

/* ---------- After booking: an optional nudge to update answers ---------- */
function UpdatePrompt() {
  const { upcoming, dispatch } = useHub();
  const { t, lang } = useL();
  const [editing, setEditing] = useState(false);
  if (!upcoming) return null;
  const c = counsellorById(upcoming.slot.counsellor);
  return <Dialog title={editing ? t("আপনার উত্তর আপডেট করুন", "Update your answers") : t("সেশন বুক হয়েছে", "Session booked")} wide={editing} onClose={() => dispatch({ type: "dismissUpdate" })}>
    {!editing ? <div className="v11-update">
      <div className="v11-update-head"><span className="v4-booked-tick"><Ico n="check" s={22} w="bold" /></span>
        <p><b>{dayWord(upcoming.slot.date, lang)}, {dayMonth(upcoming.slot.date, lang)} · {clock(upcoming.slot.time, lang)}</b><br />{cn(c, lang)} · {counsellorText[c.id].title[lang]}</p></div>
      <h3>{t("নতুন কিছু জানানোর আছে?", "Anything new to share?")}</h3>
      <p>{t(`শেষবারের পর কিছু বদলে থাকলে, যেমন নতুন আগ্রহ, চাকরির খবর বা কোনো চিন্তা, উত্তর আপডেট করুন। ${cf(c, lang)} সেশনের আগে দেখে নেবেন। এটা বাধ্যতামূলক নয়।`, `If something changed since last time, like a new interest, job news or a worry, update your answers. ${cf(c, lang)} will read them before the session. This is optional.`)}</p>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => dispatch({ type: "dismissUpdate" })}>{t("দরকার নেই", "No, all good")}</button>
        <button className="fl-btn fl-primary" onClick={() => setEditing(true)}><Ico n="edit" s={18} w="fill" /> {t("উত্তর আপডেট করুন", "Update my answers")}</button></div>
    </div> : <AnswersForm compact onSaved={() => dispatch({ type: "dismissUpdate" })} />}
  </Dialog>;
}
