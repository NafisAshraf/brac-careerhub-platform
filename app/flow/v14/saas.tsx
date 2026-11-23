"use client";
// v14 SaaS platform: v4's sidebar, top bar, page heads and cards, in Bangla first.
// Home holds only three things: the session card, the last session's notes, and the session
// history table. Sessions have no page of their own any more; everything about them is on home.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { CVStudio } from "../../career/cv-studio";
import { counsellorById, counsellors, type Slot } from "../data";
import { Avatar, Dialog, I } from "../parts";
import { cf, cn, counsellorText, sessionTopics, type Task } from "../v11/content";
import { ago, clock, dateNum, dayMonth, dayWord, longDay, monthOf, num, useL, weekday } from "../v11/lang";
import { AnswersForm } from "../v11/sections";
import { animate } from "../v11/home";
import { AbroadV11, type AbroadSub } from "../v11/abroad";
import { Guide } from "../v11/guide";
import { firstOpen, useHub, type Account, type Session } from "../v11/store";
import { Bell, ChangeSession, CounsellorCard, DemoPanel, LangToggle, LinkBox, SlotPicker, sessionRange } from "../v11/ui";
import { Courses, Jobs } from "./catalog";
import { Head } from "./head";

type Page = "home" | "tasks" | "courses" | "jobs" | "cv" | "abroad" | "profile";

export function Saas({ exit }: { exit: () => void }) {
  const { unlocked = [], tasks, upcoming, account } = useHub();
  const { t, lang } = useL();
  const [page, setPage] = useState<Page>("home");
  const [sub, setSub] = useState<AbroadSub>("catalog"); // Study Abroad has three places of its own
  const [menu, setMenu] = useState(false);
  const [visit, setVisit] = useState(0);
  const main = useRef<HTMLElement>(null);
  const has = (id: string) => (unlocked ?? []).includes(id as "cv");
  const open = tasks.filter((x) => !x.done).length;
  const go = (p: string) => {
    const target = (["session", "sessions", "book"].includes(p) ? "home" : p) as Page;
    if (["courses", "jobs", "cv", "abroad"].includes(target) && !has(target)) return;
    if (target === "abroad") setSub("catalog");
    setPage(target); setMenu(false); setVisit((v) => v + 1);
    window.scrollTo({ top: 0 });
  };
  const goAbroad = (s: AbroadSub) => { setSub(s); setPage("abroad"); setMenu(false); setVisit((v) => v + 1); window.scrollTo({ top: 0 }); };
  useEffect(() => { main.current?.focus({ preventScroll: true }); }, [page]);

  const nav: { id: Page; label: string; icon: string; count?: number; show: boolean }[] = [
    { id: "home", label: t("হোম", "Home"), icon: "home", show: true },
    { id: "tasks", label: t("আমার কাজ", "My tasks"), icon: "tasks", count: open, show: true },
    { id: "courses", label: t("কোর্স", "Courses"), icon: "book", show: has("courses") },
    { id: "jobs", label: t("চাকরি ও ইন্টার্নশিপ", "Jobs & internships"), icon: "briefcase", show: has("jobs") },
    { id: "cv", label: t("সিভি স্টুডিও", "CV Studio"), icon: "doc", show: has("cv") },
  ];
  const abroadNav: [AbroadSub, string, string][] = [["catalog", "globe", t("সব প্রোগ্রাম", "All programs")], ["programs", "spark", t("আমার প্রোগ্রাম", "My programs")], ["documents", "notes", t("আমার ডকুমেন্ট", "My documents")]];
  const item = (id: Page, label: string, icon: string, on: boolean, click: () => void, count?: number, k = 0) =>
    <button key={id + label} style={{ ["--d" as string]: `${k * 0.07}s` }} className={"fl-nav" + (on ? " is-on" : "")} aria-current={on ? "page" : undefined} onClick={click}>
      <I n={icon} /><span>{label}</span>{!!count && <em>{num(count, lang)}</em>}</button>;
  const side = <>
    <div className="fl-brand is-guided"><Image data-guide="plane-dock" src="/careerhub-logo.png" width={96} height={86} alt="BRAC Career Hub" /></div>
    <nav aria-label="Career Hub" data-guide="nav-main">
      <span className="fl-nav-label">{t("আপনার পরিকল্পনা", "Your plan")}</span>
      <div className="fl-nav-group">{nav.filter((n) => n.show).map((n, k) => item(n.id, n.label, n.icon, page === n.id, () => go(n.id), n.count, k))}</div>
      {has("abroad") && <>
        <span className="fl-nav-label">{t("বিদেশে পড়াশোনা", "Study abroad")}</span>
        <div className="fl-nav-group">{abroadNav.map(([id, icon, label], k) => item("abroad", label, icon, page === "abroad" && sub === id, () => goAbroad(id), undefined, k + 5))}</div>
      </>}
      <span className="fl-nav-label">{t("সহায়তা", "Support")}</span>
      {item("profile", t("আমার প্রোফাইল ও উত্তর", "My profile & answers"), "user", page === "profile", () => go("profile"))}
    </nav>
    <div className="fl-side-foot">
      <p className="fl-side-hint"><I n="lock" s={14} /> {t("কাউন্সেলর নতুন কিছু যোগ করলে এখানে দেখা যাবে।", "More sections appear when your counsellor adds them.")}</p>
      <div className="fl-me"><span>{account?.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span><div><strong>{account?.name}</strong><small>{account?.university}</small></div></div>
      <button className="fl-link" onClick={exit}>← {t("মূল ওয়েবসাইটে ফিরুন", "Back to home page")}</button>
    </div>
  </>;

  return <div className="fl fl-app v11 v14">
    <aside className="fl-side">{side}</aside>
    {menu && <div className="fl-drawer" role="dialog" aria-modal="true" aria-label={t("মেনু", "Menu")}><div className="fl-drawer-in"><button className="fl-icon-btn fl-drawer-x" aria-label={t("বন্ধ করুন", "Close menu")} onClick={() => setMenu(false)}><I n="x" /></button>{side}</div><button className="fl-drawer-scrim" aria-label={t("বন্ধ করুন", "Close menu")} onClick={() => setMenu(false)} /></div>}
    <div className="fl-app-main">
      <header className="fl-top">
        <button className="fl-btn ghost fl-menu-btn" onClick={() => setMenu(true)}><I n="menu" /> {t("মেনু", "Menu")}</button>
        <div className="fl-top-session">{upcoming
          ? <button className="fl-chip" onClick={() => go("home")}><I n="calendar" s={16} /> {t("পরের সেশন:", "Next session:")} {dayWord(upcoming.slot.date, lang)}, {clock(upcoming.slot.time, lang)}</button>
          : <button className="fl-chip is-cta" onClick={() => go("home")}><I n="calendar" s={16} /> {t("পরের সেশন বুক করুন", "Book your next session")}</button>}</div>
        <LangToggle />
        <Bell onGo={go} />
      </header>
      <main ref={main} tabIndex={-1} className="fl-page">
        <div className="v14-enter" key={page === "abroad" ? "abroad" : page + visit}>
          {page === "home" && <Home />}
          {page === "tasks" && <Tasks go={go} />}
          {page === "courses" && <Courses />}
          {page === "jobs" && <Jobs />}
          {page === "cv" && <div className="career-app fl-embed" lang="en"><Head kicker={t("সিভি স্টুডিও", "CV STUDIO")} title={t("আপনার সিভি বানান", "Build your CV")} body={t("আপনার তথ্য বসানো আছে। যা খুশি বদলান, তারপর এক পাতার খসড়া বানান।", "Your details are filled in. Edit anything, then generate a one-page draft.")} />
            <CVStudio language="en" profile={{ name: account!.name, email: account!.email, institution: account!.university, subject: account!.subject, qualification: "bachelor", situation: "student" }} seeded={false} onDraft={() => {}} /></div>}
          {page === "abroad" && <AbroadV11 sub={sub} setSub={setSub} navKey={visit} onConsult={() => go("home")} renderHead={(title, body) => <Head kicker={t("বিদেশে পড়াশোনা", "STUDY ABROAD")} title={title} body={body} />} />}
          {page === "profile" && <ProfilePage />}
        </div>
      </main>
    </div>
    <DemoPanel />
    {/* First visit: the Career Hub plane shows the sidebar, the session card and the notes card. */}
    <Guide onHome={() => go("home")} name={account?.name.split(" ")[0] ?? ""} />
  </div>;
}


/* ---------- Home: the session, the last notes, the history ---------- */
function Home() {
  const { account, upcoming, last } = useHub();
  const { t, lang } = useL();
  return <>
    <Head kicker={t("হোম", "HOME")} title={t(`হাই ${account?.name.split(" ")[0]}`, `Hi ${account?.name.split(" ")[0]}`)} body={longDay(new Date().toISOString().slice(0, 10), lang)} />
    <div className={"v14-home" + (last?.minutes ? "" : " is-single")}>
      {upcoming ? <UpcomingCard s={upcoming} /> : <BookCard />}
      {last?.minutes && <NotesCard s={last} />}
    </div>
    <History />
  </>;
}

function UpcomingCard({ s }: { s: Session }) {
  const { t, lang } = useL();
  const c = counsellorById(s.slot.counsellor);
  return <section className="fl-card fl-upcoming v14-session" data-guide="tile-session">
    <div className="fl-upcoming-head">
      <div className="fl-date-tile"><small>{weekday(s.slot.date, lang, true)}</small><b>{dateNum(s.slot.date, lang)}</b><small>{monthOf(s.slot.date, lang)}</small></div>
      <div><span className="fl-kicker">{t("আপনার পরের সেশন", "YOUR NEXT SESSION")}</span><h2>{dayWord(s.slot.date, lang)}, {sessionRange(s.slot, lang)}</h2><p>{t(`${cn(c, lang)}ের সাথে ৩০ মিনিট, অনলাইনে`, `30 minutes with ${cn(c, lang)}, online`)}</p></div>
      <Avatar c={c} size={52} />
    </div>
    <LinkBox s={s} />
    <ChangeSession />
  </section>;
}

// Nothing booked: the card itself offers the two ways to book (as in v12): again with the same
// counsellor, showing their first free time, or with someone else.
function BookCard() {
  const { last } = useHub();
  const { t, lang } = useL();
  const [booking, setBooking] = useState<null | { preset?: string }>(null);
  const c = last ? counsellorById(last.slot.counsellor) : counsellors[0];
  const next = firstOpen(c.id);
  const others = counsellors.filter((x) => x.id !== c.id);
  return <section className="fl-card v14-book" data-guide="tile-session">
    <span className="fl-kicker">{t("পরের সেশন", "YOUR NEXT SESSION")}</span>
    <h2>{t("আরেকটি সেশন বুক করুন", "Book your next session")}</h2>
    {last && <p>{t(`শেষ সেশন ${ago(last.slot.date, "bn")}, ${cn(c, "bn")}ের সাথে।`, `Last session ${ago(last.slot.date, "en")}, with ${cn(c, "en")}.`)}</p>}
    <div className="v14-choices">
      <button className="v14-choice is-same" onClick={() => setBooking({ preset: c.id })}>
        <Avatar c={c} size={46} />
        <span><b>{t(`আবার ${cf(c, "bn")}ের সাথে`, `Again with ${cf(c, "en")}`)}</b>
          <small>{next ? t(`খালি: ${dayWord(next.date, "bn")}, ${clock(next.time, "bn")}`, `Free: ${dayWord(next.date, "en")}, ${clock(next.time, "en")}`) : counsellorText[c.id].title[lang]}</small></span>
        <I n="arrow" s={20} />
      </button>
      <button className="v14-choice" onClick={() => setBooking({})}>
        <span className="v14-stack">{others.slice(0, 3).map((x) => <Avatar key={x.id} c={x} size={32} />)}</span>
        <span><b>{t("অন্য কাউন্সেলর", "Another counsellor")}</b><small>{t("ভিন্ন বিষয়ে পরামর্শ", "A different focus")}</small></span>
        <I n="arrow" s={20} />
      </button>
    </div>
    {booking && <BookDialog preset={booking.preset} onClose={() => setBooking(null)} />}
  </section>;
}

function BookDialog({ onClose, preset }: { onClose: () => void; preset?: string }) {
  const { dispatch, last } = useHub();
  const { t, lang } = useL();
  const [who, setWho] = useState(preset ?? "");
  const [slot, setSlot] = useState<Slot | null>(null);
  const others = counsellors.filter((x) => x.id !== last?.slot.counsellor);
  return <Dialog title={who ? t(`${cn(counsellorById(who), lang)}ের সাথে বুক করুন`, `Book with ${cn(counsellorById(who), lang)}`) : t("কার সাথে কথা বলবেন?", "Who would you like to talk to?")} wide onClose={onClose}>
    {!who ? <>
      <p className="fl-muted v14-reassure">{t("যার সাথেই বুক করুন, তিনি আপনার উত্তর আর আগের সেশনের নোট দেখতে পাবেন।", "Whoever you book, they’ll see your answers and past session notes.")}</p>
      <div className="fl-counsellors v14-counsellors">{others.map((c) => <CounsellorCard key={c.id} c={c} onSelect={() => setWho(c.id)} />)}</div>
    </> : <><div className="v4"><SlotPicker counsellor={who} value={slot} onChange={setSlot} /></div>
      <div className="fl-dialog-actions">{!preset && <button className="fl-btn ghost" onClick={() => { setWho(""); setSlot(null); }}><I n="back" s={16} /> {t("অন্য কাউন্সেলর", "Other counsellors")}</button>}
        <button className="fl-btn fl-primary" disabled={!slot} onClick={() => { dispatch({ type: "book", slot: slot! }); dispatch({ type: "dismissUpdate" }); onClose(); }}>
          {slot ? t(`${dayWord(slot.date, "bn")}, ${clock(slot.time, "bn")}-এ বুক করুন`, `Book ${dayWord(slot.date, "en")}, ${clock(slot.time, "en")}`) : t("সময় বেছে নিন", "Pick a time")}</button></div></>}
  </Dialog>;
}

// The last session's notes: the same height as the session card beside it, filled with as much
// of the notes as fits and ending in "…". Clicking opens the full notes in a pop-up; the card
// and the page layout stay exactly as they are.
function NotesCard({ s }: { s: Session }) {
  const { t, lang } = useL();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState(4);
  const body = useRef<HTMLDivElement>(null);
  const c = counsellorById(s.slot.counsellor);
  const m = s.minutes!;
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const fit = () => { const lh = parseFloat(getComputedStyle(el).lineHeight) || 26; setLines(Math.max(1, Math.floor(el.clientHeight / lh))); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return <section className="fl-card v14-notes" data-guide="tile-notes">
    <button className="v14-hit" aria-haspopup="dialog" aria-label={t("সম্পূর্ণ নোট দেখুন", "Show the full notes")} onClick={() => setOpen(true)} />
    <div className="v14-notes-head"><span className="fl-kicker">{t("শেষ সেশনের নোট", "LAST SESSION’S NOTES")}</span></div>
    <div className="fl-who"><Avatar c={c} size={40} /><div><strong>{cn(c, lang)}</strong><small>{dayMonth(s.slot.date, lang)}</small></div></div>
    <div className="v14-notes-body" ref={body}>
      <p style={{ WebkitLineClamp: lines }}>{m.summary[lang]} <b>{t("যা ঠিক হলো:", "Agreed:")}</b> {m.agreed.map((x) => x[lang]).join("; ")}।</p>
    </div>
    <span className="v14-notes-more-link">{t("সম্পূর্ণ নোট দেখুন", "Read the full notes")} <I n="arrow" s={15} /></span>
    {open && <Dialog title={t("শেষ সেশনের নোট", "Last session’s notes")} onClose={() => setOpen(false)}>
      <div className="v14-notes-pop">
        <div className="fl-who"><Avatar c={c} size={44} /><div><strong>{cn(c, lang)}</strong><small>{counsellorText[c.id].title[lang]} · {dayMonth(s.slot.date, lang)}</small></div></div>
        <p>{m.summary[lang]}</p>
        <h3>{t("যা ঠিক হলো", "What you agreed")}</h3>
        <ul className="v14-agreed">{m.agreed.map((x) => <li key={x.en}><I n="check" s={14} />{x[lang]}</li>)}</ul>
        <div className="fl-dialog-actions">
          <button className="fl-btn ghost" onClick={() => { setOpen(false); setTimeout(() => document.getElementById("v14-history")?.scrollIntoView({ behavior: "smooth" }), 50); }}>{t("সব সেশনের নোট", "All session notes")}</button>
          <button className="fl-btn fl-primary" onClick={() => setOpen(false)}>{t("বন্ধ করুন", "Close")}</button>
        </div>
      </div>
    </Dialog>}
  </section>;
}

function History() {
  const { sessions } = useHub();
  const { t, lang } = useL();
  const [open, setOpen] = useState<string | null>(null);
  const rows = [...sessions].sort((a, b) => (b.slot.date + b.slot.time).localeCompare(a.slot.date + a.slot.time));
  const state = (s: Session) => s.status === "upcoming" ? t("আসন্ন", "Upcoming") : s.status === "completed" ? t("সম্পন্ন", "Completed") : t("বাতিল", "Cancelled");
  return <section className="fl-card v14-history" id="v14-history">
    <div className="v14-history-head"><div><span className="fl-kicker">{t("সেশনের ইতিহাস", "SESSION HISTORY")}</span><h2>{t("আপনার সব সেশন", "All your sessions")}</h2></div>
      <small>{t(`মোট ${num(sessions.filter((s) => s.status === "completed").length, "bn")}টি সম্পন্ন`, `${sessions.filter((s) => s.status === "completed").length} completed`)}</small></div>
    <table>
      <thead><tr><th>{t("তারিখ", "Date")}</th><th>{t("কাউন্সেলর", "Counsellor")}</th><th>{t("বিষয়", "Topic")}</th><th>{t("অবস্থা", "Status")}</th><th><span className="sr">{t("নোট", "Notes")}</span></th></tr></thead>
      <tbody>{rows.map((s) => {
        const c = counsellorById(s.slot.counsellor);
        const on = open === s.id;
        return [<tr key={s.id} className={"is-" + s.status + (s.minutes ? " is-click" : "") + (on ? " is-on" : "")} onClick={() => s.minutes && setOpen(on ? null : s.id)}>
          <td><b>{dayMonth(s.slot.date, lang, true)}</b><small>{clock(s.slot.time, lang)}</small></td>
          <td><span className="v14-who-cell"><Avatar c={c} size={28} />{cn(c, lang)}</span></td>
          <td>{s.status === "cancelled" ? "—" : sessionTopics[s.number]?.[lang] ?? t("ফলো-আপ", "Follow-up")}</td>
          <td><span className={"fl-status s-" + s.status}>{state(s)}</span></td>
          <td className="v14-notes-cell">{s.minutes && <button className="fl-btn ghost" aria-expanded={on} onClick={(e) => { e.stopPropagation(); setOpen(on ? null : s.id); }}><I n="notes" s={16} /> {on ? t("লুকান", "Hide") : t("নোট", "Notes")}</button>}</td>
        </tr>, on && s.minutes ? <tr key={s.id + "-n"} className="v14-row-notes"><td colSpan={5}>
          <p>{s.minutes.summary[lang]}</p>
          <ul className="v14-agreed">{s.minutes.agreed.map((x) => <li key={x.en}><I n="check" s={14} />{x[lang]}</li>)}</ul>
        </td></tr> : null];
      })}</tbody>
    </table>
  </section>;
}

/* ---------- Tasks: a plain to-do list in v4's cards ----------
   - What's left comes first, soonest due at the top; finished tasks sit in "Done" (open, collapsible).
   - Ticking a task fills its circle and strikes it through, then it slides down to "Done" and
     flashes there (as in v12). Ticking a done task moves it back the same way.
   - Due dates say "Overdue", "Today", "Tomorrow" and are coloured by urgency.
   - Students can add their own tasks (and delete those). */
function Tasks({ go }: { go: (p: string) => void }) {
  const { tasks, dispatch, last } = useHub();
  const { t, lang } = useL();
  const [showDone, setShowDone] = useState(true);
  const [text, setText] = useState("");
  const [ticking, setTicking] = useState<string | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const c = last ? counsellorById(last.slot.counsellor) : null;
  const todo = tasks.filter((x) => !x.done).sort((a, b) => a.due - b.due);
  const done = tasks.filter((x) => x.done);
  const toggle = (x: Task) => {
    if (ticking) return;
    setTicking(x.id);
    setTimeout(() => animate(() => { dispatch({ type: "task", id: x.id }); setTicking(null); setLanded(x.id); }, () => {
      document.querySelector(`[data-task="${x.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setTimeout(() => setLanded((y) => (y === x.id ? null : y)), 1600);
    }), 380);
  };
  const add = () => { const v = text.trim(); if (v) { dispatch({ type: "addTask", title: v }); setText(""); } };
  const row = (x: Task) => <li key={x.id} data-task={x.id} className={(x.done ? "is-done" : "") + (ticking === x.id ? " is-ticking" : "") + (landed === x.id ? " is-landed" : "")} style={{ viewTransitionName: `v14-task-${x.id}` }}>
    <button className="fl-check v14-check" role="checkbox" aria-checked={ticking === x.id ? !x.done : !!x.done} aria-label={x.title[lang]} onClick={() => toggle(x)}><I n="check" s={15} /></button>
    <div><h3>{x.title[lang]}</h3>{x.note && !x.done && <p>{x.note[lang]}</p>}
      <div className="fl-task-meta"><DueText task={x} />
        {x.mine ? <span className="v14-mine">{t("আমার কাজ", "My task")}</span> : c && <span className="fl-from"><Avatar c={c} size={20} /> {t(`${cf(c, lang)}ের দেওয়া`, `From ${cf(c, lang)}`)}</span>}</div></div>
    {x.mine && <button className="fl-icon-btn v14-del" aria-label={t("মুছুন", "Delete")} onClick={() => dispatch({ type: "removeTask", id: x.id })}><I n="x" s={16} /></button>}
  </li>;
  return <>
    <Head kicker={t("আমার কাজ", "MY TASKS")} title={t("কাউন্সেলরের দেওয়া কাজ", "Tasks from your counsellor")} body={c ? t(`${cn(c, lang)} সেশনের পর এগুলো দিয়েছেন। শেষ হলে টিক দিন, তিনি আপনার অগ্রগতি দেখবেন।`, `${cn(c, lang)} set these after your session. Tick each one when it’s done; they’ll see your progress.`) : undefined} />
    <section className="fl-card v14-progress">
      <div><strong>{t(`${num(done.length, "bn")}/${num(tasks.length, "bn")}টি শেষ`, `${done.length} of ${tasks.length} done`)}</strong>
        <small>{todo[0] ? t(`এরপর: ${todo[0].title.bn}`, `Next up: ${todo[0].title.en}`) : t("সব কাজ শেষ। পরের সেশন বুক করুন।", "All done. Book your next session.")}</small></div>
      {!todo[0] && <button className="fl-btn fl-primary" onClick={() => go("home")}>{t("সেশন বুক করুন", "Book a session")}</button>}
      <div className="fl-progress"><span style={{ width: `${(done.length / Math.max(1, tasks.length)) * 100}%` }} /></div>
    </section>
    <form className="v14-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
      <I n="edit" s={18} /><input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("নিজের একটি কাজ যোগ করুন…", "Add a task of your own…")} aria-label={t("নতুন কাজ", "New task")} />
      <button className="fl-btn" disabled={!text.trim()}>{t("যোগ করুন", "Add")}</button>
    </form>
    <h2 className="fl-section">{t("বাকি", "To do")} <small>{num(todo.length, lang)}</small></h2>
    {todo.length ? <ul className="fl-tasks">{todo.map(row)}</ul> : <p className="fl-muted v14-empty"><I n="check" s={18} /> {t("সব কাজ শেষ। দারুণ!", "Everything’s done. Nice work!")}</p>}
    {done.length > 0 && <>
      <button className="fl-section v14-done-toggle" aria-expanded={showDone} onClick={() => setShowDone((v) => !v)}>{t("সম্পন্ন", "Completed")} <small>{num(done.length, lang)}</small><span className={"v14-caret" + (showDone ? " is-open" : "")}>›</span></button>
      {showDone && <ul className="fl-tasks">{done.map(row)}</ul>}
    </>}
  </>;
}
function DueText({ task }: { task: Task }) {
  const { t, lang } = useL();
  if (task.done) return null;
  const d = task.due;
  const date = new Date(); date.setDate(date.getDate() + d);
  const iso = date.toISOString().slice(0, 10);
  const cls = d < 0 ? "is-late" : d === 0 ? "is-today" : d <= 2 ? "is-soon" : "";
  const label = d < 0 ? t("সময় পেরিয়ে গেছে", "Overdue") : d === 0 ? t("আজ", "Today") : d === 1 ? t("আগামীকাল", "Tomorrow") : d < 7 ? dayWord(iso, lang) : dayMonth(iso, lang, true);
  return <span className={"v14-due " + cls}><I n="clock" s={14} /> {label}</span>;
}

/* ---------- Profile and answers (v4 layout) ---------- */
function ProfilePage() {
  const { account, dispatch } = useHub();
  const { t } = useL();
  const [form, setForm] = useState<Account>(account!);
  const [saved, setSaved] = useState<"" | "profile" | "answers">("");
  useEffect(() => { if (saved) { const x = setTimeout(() => setSaved(""), 2600); return () => clearTimeout(x); } }, [saved]);
  const field = (k: keyof Account, label: string, type = "text") => <label className="fl-field"><span>{label}</span><input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>;
  return <>
    <Head kicker={t("আমার প্রোফাইল", "MY PROFILE")} title={t("আপনার তথ্য ও উত্তর", "Your details and answers")} body={t("এগুলো হালনাগাদ রাখুন। প্রতিটি সেশনের আগে কাউন্সেলর সর্বশেষটা দেখেন।", "Keep these up to date. Your counsellor sees the latest version before each session.")} />
    <section className="fl-card fl-form-card">
      <h2>{t("আপনার তথ্য", "Your details")}</h2>
      <div className="fl-form-grid">{field("name", t("পূর্ণ নাম", "Full name"))}{field("email", t("ইমেইল (মিটিং লিংকের জন্য)", "Email (for meeting links)"), "email")}{field("phone", t("মোবাইল (SMS-এর জন্য)", "Mobile number (for SMS)"), "tel")}{field("university", t("বিশ্ববিদ্যালয়", "University"))}{field("subject", t("বিষয়", "Subject"))}</div>
      <div className="fl-row"><button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "account", account: form }); setSaved("profile"); }}>{t("তথ্য সেভ করুন", "Save details")}</button>{saved === "profile" && <span className="fl-saved" role="status"><I n="check" s={16} /> {t("সেভ হয়েছে", "Saved")}</span>}</div>
    </section>
    <section className="fl-card fl-form-card">
      <h2>{t("আপনার উত্তর", "Your answers")}</h2><p className="fl-muted">{t("সময়ের সাথে বদলায়। যেকোনো উত্তর আপডেট করুন, কাউন্সেলরকে জানানো হবে।", "Things change. Update any answer and your counsellor will be told.")}</p>
      <AnswersForm onSaved={() => setSaved("answers")} />
      {saved === "answers" && <span className="fl-saved" role="status"><I n="check" s={16} /> {t("সেভ হয়েছে। কাউন্সেলর আপডেট দেখবেন।", "Saved. Your counsellor will see the update.")}</span>}
    </section>
  </>;
}
