"use client";
// v11 building blocks, all in Bangla and English.
import { useEffect, useRef, useState } from "react";
import { counsellorById, counsellors, openTimes, upcomingDays, unlockables, type Counsellor, type Slot, type Unlockable } from "../data";
import { Avatar, Dialog } from "../parts";
import { cn, counsellorText } from "./content";
import { Ico } from "./icons";
import { clock, clockEnd, dateNum, dayMonth, dayWord, longDay, monthOf, num, useL, weekday } from "./lang";
import { useHub, type Session } from "./store";

/* ---------- Language switch: Bangla first ---------- */
export function LangToggle() {
  const { lang, setLang } = useL();
  return <div className="v11-lang" role="group" aria-label="ভাষা / Language">
    <button lang="bn" aria-pressed={lang === "bn"} onClick={() => setLang("bn")}>বাংলা</button>
    <button lang="en" aria-pressed={lang === "en"} onClick={() => setLang("en")}>English</button>
  </div>;
}

/* ---------- Notifications ---------- */
export function Bell({ onGo }: { onGo?: (to: string) => void }) {
  const { notes, unread, dispatch } = useHub();
  const { t, lang } = useL();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const icon: Record<string, string> = { booking: "booked", reminder: "clock", counsellor: "note", unlock: "spark", task: "tasks", system: "info" };
  return <div className="fl-bell" ref={box} data-guide="bell">
    <button className="fl-bell-btn" aria-expanded={open} aria-label={t("নোটিফিকেশন", "Notifications")} onClick={() => setOpen((o) => !o)}>
      <Ico n="bell" s={22} w="fill" c="#59217a" />{unread > 0 && <span className="fl-bell-count">{num(unread, lang)}</span>}
    </button>
    {open && <div className="fl-bell-panel v11-bell" role="region" aria-label={t("নোটিফিকেশন", "Notifications")}>
      <header><strong>{t("নোটিফিকেশন", "Notifications")}</strong>{unread > 0 && <button className="fl-link" onClick={() => dispatch({ type: "read" })}>{t("সব পড়া হয়েছে", "Mark all as read")}</button>}</header>
      {notes.length === 0 ? <p className="fl-bell-empty">{t("এখনও কিছু নেই।", "Nothing yet.")}</p> :
        <ul>{notes.map((n) => <li key={n.id} className={n.read ? "" : "is-new"}>
          <button onClick={() => { dispatch({ type: "read", id: n.id }); if (n.go && onGo) { onGo(n.go); setOpen(false); } }}>
            <span className={"fl-note-icon k-" + n.kind}><Ico n={icon[n.kind]} s={18} w="fill" /></span>
            <span><strong>{n.title[lang]}</strong>{n.body && <small>{n.body[lang]}</small>}</span>
          </button></li>)}</ul>}
    </div>}
  </div>;
}

/* ---------- Counsellor card ---------- */
export function CounsellorCard({ c, selected, onSelect, cta }: { c: Counsellor; selected?: boolean; onSelect: () => void; cta?: string }) {
  const { t, lang } = useL();
  const x = counsellorText[c.id];
  return <button className={"fl-counsellor" + (selected ? " is-on" : "")} aria-pressed={selected} onClick={onSelect}>
    <Avatar c={c} size={72} />
    <span className="fl-counsellor-text">
      <strong>{cn(c, lang)}</strong><small>{x.title[lang]}</small>
      <span className="fl-tags">{x.focus.map((f) => <em key={f.en}>{f[lang]}</em>)}</span>
      <span className="fl-counsellor-about">{x.about[lang]}</span>
      <span className="fl-counsellor-meta">{t(`ভাষা: ${x.langs.bn} · ${num(c.sessions, "bn")}টি সেশন`, `Speaks ${x.langs.en} · ${c.sessions} sessions held`)}</span>
    </span>
    <span className="fl-counsellor-cta">{selected ? <><Ico n="check" s={16} w="bold" /> {t("বাছাই করা", "Chosen")}</> : cta ?? t("বেছে নিন", "Choose")}</span>
  </button>;
}

/* ---------- Day and time picker ---------- */
export function SlotPicker({ counsellor, value, onChange }: { counsellor: string; value: Slot | null; onChange: (s: Slot) => void }) {
  const { t, lang } = useL();
  const days = upcomingDays(8);
  const firstWithTimes = days.find((d) => openTimes(counsellor, d).length) ?? days[0];
  const [day, setDay] = useState(value && value.counsellor === counsellor ? value.date : firstWithTimes.date);
  const current = days.find((d) => d.date === day) ?? firstWithTimes;
  const times = openTimes(counsellor, current);
  const groups: [string, string[]][] = [[t("দুপুরের খাবারের আগে", "Before lunch"), times.filter((x) => x < "13:00")], [t("দুপুরের খাবারের পরে", "After lunch"), times.filter((x) => x >= "13:00")]];
  return <div className="fl-slots is-calendar">
    <div className="fl-days" role="radiogroup" aria-label={t("দিন", "Day")}>
      {days.map((d) => { const n = openTimes(counsellor, d).length; return <button key={d.date} role="radio" aria-checked={d.date === current.date} disabled={!n} className={d.date === current.date ? "is-on" : ""} onClick={() => setDay(d.date)}>
        <small>{dayWord(d.date, lang) === (lang === "bn" ? "আগামীকাল" : "Tomorrow") ? dayWord(d.date, lang) : weekday(d.date, lang, true)}</small><strong>{dateNum(d.date, lang)}</strong><small>{monthOf(d.date, lang)}</small>
        <span className="fl-day-dots" aria-label={n ? t(`${num(n, "bn")}টি সময় খালি`, `${n} times open`) : t("ছুটি", "Off")}>{n ? Array.from({ length: n }, (_, i) => <i key={i} />) : t("ছুটি", "Off")}</span>
      </button>; })}
    </div>
    {groups.map(([label, list]) => list.length > 0 && <div key={label} className="fl-times">
      <span>{label}</span>
      <div role="radiogroup" aria-label={label}>{list.map((x) => { const on = value?.counsellor === counsellor && value.date === current.date && value.time === x;
        return <button key={x} role="radio" aria-checked={on} className={on ? "is-on" : ""} onClick={() => onChange({ counsellor, date: current.date, time: x })}><span className="fl-time-mark">{on && <Ico n="check" s={14} w="bold" />}</span>{clock(x, lang)}</button>; })}</div>
    </div>)}
  </div>;
}
export const slotText = (s: Slot, lang: "bn" | "en") => `${longDay(s.date, lang)} · ${clock(s.time, lang)}`;

/* ---------- Meeting link ---------- */
export const meetLink = (s: Session) => {
  const a = "abcdefghijkmnopqrstuvwxyz";
  const h = [...(s.id + s.slot.date + s.slot.time)].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 11);
  const pick = (n: number, k: number) => Array.from({ length: n }, (_, i) => a[(h >>> ((i + k) % 24)) % a.length]).join("");
  return `meet.google.com/${pick(3, 0)}-${pick(4, 3)}-${pick(3, 7)}`;
};
export function LinkBox({ s }: { s: Session }) {
  const { t } = useL();
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (copied) { const x = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(x); } }, [copied]);
  const link = meetLink(s);
  return <div className="v4-link">
    <Ico n="video" s={26} w="duotone" c="#59217a" />
    <span><small>{t("মিটিং লিংক", "Meeting link")}</small><b>{link}</b></span>
    <button className="fl-btn" onClick={() => { navigator.clipboard?.writeText("https://" + link).catch(() => {}); setCopied(true); }}>{copied ? <><Ico n="check" s={18} w="bold" /> {t("কপি হয়েছে", "Copied")}</> : <><Ico n="copy" s={18} w="duotone" /> {t("কপি", "Copy")}</>}</button>
  </div>;
}

/* ---------- Change or cancel the booked session ---------- */
export function ChangeSession() {
  const { upcoming, dispatch } = useHub();
  const { t, lang } = useL();
  const [mode, setMode] = useState<null | "move" | "cancel">(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  if (!upcoming) return null;
  const c = counsellorById(upcoming.slot.counsellor);
  return <>
    <div className="fl-change">
      <button className="fl-btn" onClick={() => { setSlot(null); setMode("move"); }}><Ico n="calendar" s={18} w="duotone" /> {t("সময় বদলান", "Change time")}</button>
      <button className="fl-btn ghost danger" onClick={() => setMode("cancel")}>{t("বাতিল করুন", "Cancel session")}</button>
    </div>
    {mode === "move" && <Dialog title={t(`${cn(c, lang)}ের সাথে নতুন সময়`, `Pick a new time with ${cn(c, lang)}`)} wide onClose={() => setMode(null)}>
      <p className="fl-muted">{t("এখনকার সময়:", "Current time:")} <b>{slotText(upcoming.slot, lang)}</b></p>
      <div className="v4"><SlotPicker counsellor={c.id} value={slot} onChange={setSlot} /></div>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>{t("আগের সময়ই থাকুক", "Keep current time")}</button>
        <button className="fl-btn fl-primary" disabled={!slot} onClick={() => { dispatch({ type: "reschedule", slot: slot! }); setMode(null); }}>{slot ? t(`${dayWord(slot.date, "bn")}, ${clock(slot.time, "bn")}-এ সরান`, `Move to ${dayWord(slot.date, "en")}, ${clock(slot.time, "en")}`) : t("আগে সময় বেছে নিন", "Pick a time first")}</button></div>
    </Dialog>}
    {mode === "cancel" && <Dialog title={t("সেশনটি বাতিল করবেন?", "Cancel this session?")} onClose={() => setMode(null)}>
      <p className="fl-muted">{slotText(upcoming.slot, lang)} · {cn(c, lang)}. {t("পরে আবার বুক করতে পারবেন।", "You can book again afterwards.")}</p>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setMode(null)}>{t("রেখে দিন", "Keep my session")}</button>
        <button className="fl-btn danger" onClick={() => { dispatch({ type: "cancel" }); setMode(null); }}>{t("হ্যাঁ, বাতিল করুন", "Yes, cancel it")}</button></div>
    </Dialog>}
  </>;
}

/* ---------- The booked session: once, with the link ---------- */
export function SessionCard({ s }: { s: Session }) {
  const { account } = useHub();
  const { t, lang } = useL();
  const c = counsellorById(s.slot.counsellor);
  return <section className="fl-card v4-session">
    <span className="fl-kicker">{t("আপনার সেশন", "YOUR SESSION")}</span>
    <div className="v4-session-head">
      <Avatar c={c} size={64} />
      <div>
        <h2>{dayWord(s.slot.date, lang)}, {dayMonth(s.slot.date, lang)} · {clock(s.slot.time, lang)}</h2>
        <p>{t(`${cn(c, lang)}ের সাথে ৩০ মিনিট, Google Meet-এ`, `30 minutes with ${cn(c, lang)} on Google Meet`)}</p>
      </div>
    </div>
    <LinkBox s={s} />
    <p className="v4-session-note">{t(`লিংকটি আপনার ফোনে (${num(account?.phone ?? "", "bn")}) ও ইমেইলেও পাঠানো হয়েছে। শুরুর আগে মনে করিয়ে দেব।`, `Also sent to your phone (${account?.phone}) and email. We’ll remind you before it starts.`)}</p>
    <ChangeSession />
  </section>;
}
export const sessionRange = (s: Slot, lang: "bn" | "en") => `${clock(s.time, lang)} – ${clockEnd(s.time, lang)}`;

/* ---------- “How it works” animation ---------- */
const SCENE_MS = 4200;
export function Explainer() {
  const { t } = useL();
  const scenes = [
    { title: t("কাউন্সেলর বেছে নিন", "Pick a counsellor"), body: t("যাকে আপনার জন্য সবচেয়ে উপযুক্ত মনে হয়। শিক্ষার্থীদের জন্য ফ্রি।", "Choose the person who fits you best. Free for students.") },
    { title: t("সময় বেছে নিন", "Choose a time"), body: t("৩০ মিনিটের সেশন। ক্লাসের সাথে মিলিয়ে যেকোনো খালি সময়।", "Sessions are 30 minutes. Pick any open time that suits your classes.") },
    { title: t("৫টি ছোট প্রশ্নের উত্তর দিন", "Answer 5 quick questions"), body: t("২ মিনিটের মতো লাগে। কাউন্সেলর আগে থেকেই আপনাকে বুঝতে পারবেন।", "About 2 minutes. It helps your counsellor know you before you meet.") },
    { title: t("সাথে সাথে মিটিং লিংক পান", "Get your meeting link right away"), body: t("বুক করলেই SMS ও ইমেইলে, সেশনের আগে রিমাইন্ডারসহ।", "By SMS and email as soon as you book, with a reminder before.") },
    { title: t("৩০ মিনিট অনলাইনে কথা বলুন", "Talk online for 30 minutes"), body: t("ফোন বা ল্যাপটপ থেকে Google Meet-এ যোগ দিন।", "Join from your phone or laptop on Google Meet.") },
    { title: t("আপনার ক্যারিয়ার হাব খুলবে", "Your Career Hub opens"), body: t("কাউন্সেলর আপনার কাজ, কোর্স আর চাকরি ঠিক করে দেবেন।", "Your counsellor sets your tasks, courses and jobs.") },
  ];
  const [i, setI] = useState(0);
  const [tt, setTt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - tt * SCENE_MS;
    let raf = 0;
    const tick = (now: number) => {
      const p = (now - start) / SCENE_MS;
      if (p >= 1) { if (i === scenes.length - 1) { setTt(1); setPlaying(false); setEnded(true); return; } setI((x) => x + 1); setTt(0); return; }
      setTt(p); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, i]);
  const go = (n: number) => { setStarted(true); setI(n); setTt(0); setEnded(false); setPlaying(true); };
  const total = (i + tt) / scenes.length;
  const secs = Math.round(scenes.length * SCENE_MS / 1000);
  return <figure className="fl-video" aria-label={t("কীভাবে কাজ করে", "How it works")}>
    <div className={"fl-video-stage" + (playing ? "" : " is-paused")} key={i}>
      {!started && <button className="fl-video-poster" onClick={() => go(0)}>
        <span className="fl-video-play"><Ico n="play" s={30} w="fill" /></span>
        <strong>{t("ক্যারিয়ার হাব কীভাবে কাজ করে", "How Career Hub works")}</strong><small>{t(`${num(secs, "bn")} সেকেন্ডের অ্যানিমেশন · শব্দ নেই`, `A ${secs}-second animation · no sound`)}</small>
        <ol>{scenes.map((s) => <li key={s.title}>{s.title}</li>)}</ol>
      </button>}
      <Scene n={i} />
      <figcaption><b>{i + 1}/{scenes.length}</b> <strong>{scenes[i].title}</strong><span>{scenes[i].body}</span></figcaption>
      {ended && <button className="fl-video-replay" onClick={() => go(0)}><Ico n="replay" s={18} w="bold" /> {t("আবার দেখুন", "Watch again")}</button>}
    </div>
    <div className="fl-video-bar">
      <button className="fl-icon-btn" aria-label={playing ? t("থামান", "Pause") : t("চালান", "Play")} onClick={() => (ended || !started ? go(0) : setPlaying((p) => !p))}><Ico n={playing ? "pause" : "play"} s={18} w="fill" /></button>
      <div className="fl-video-track" style={{ ["--p" as string]: total }}>{scenes.map((s, n) => <button key={n} aria-label={`${n + 1}: ${s.title}`} aria-current={n === i} onClick={() => go(n)} />)}</div>
      <span className="fl-video-time">0:{String(Math.floor(total * secs)).padStart(2, "0")} / 0:{secs}</span>
    </div>
  </figure>;
}
function Scene({ n }: { n: number }) {
  const { t, lang } = useL();
  const c = counsellors;
  if (n === 0) return <div className="sc sc-pick">{c.slice(0, 3).map((x, k) => <div key={x.id} className={"sc-card" + (k === 1 ? " is-pick" : "")} style={{ ["--d" as string]: `${k * 0.18}s` }}><Avatar c={x} size={44} /><b>{cn(x, lang)}</b><small>{counsellorText[x.id].focus[0][lang]}</small></div>)}<span className="sc-cursor" /></div>;
  if (n === 1) return <div className="sc sc-time"><div className="sc-days">{[t("রবি", "Sun"), t("সোম", "Mon"), t("মঙ্গল", "Tue"), t("বুধ", "Wed"), t("বৃহঃ", "Thu")].map((d, k) => <span key={d} className={k === 2 ? "is-pick" : ""} style={{ ["--d" as string]: `${k * 0.1}s` }}>{d}<b>{t(num(12 + k, "bn"), String(12 + k))}</b></span>)}</div>
    <div className="sc-hours">{["10:00", "10:45", "11:30", "14:30", "15:15", "16:00"].map((x, k) => <span key={x} className={k === 4 ? "is-pick" : ""} style={{ ["--d" as string]: `${0.5 + k * 0.08}s` }}>{clock(x, lang)}</span>)}</div></div>;
  if (n === 2) return <div className="sc sc-quiz"><div className="sc-sheet">{[t("কোন বর্ষে পড়ছেন?", "Which year are you in?"), t("কী করতে ভালো লাগে?", "What do you enjoy?"), t("পড়াশোনা শেষে কী করতে চান?", "What after graduation?"), t("সবচেয়ে বড় চিন্তা কী?", "What worries you most?")].map((q, k) => <div key={q} style={{ ["--d" as string]: `${0.2 + k * 0.6}s` }}><span className="sc-check" />{q}</div>)}</div></div>;
  if (n === 3) return <div className="sc sc-msg"><div className="sc-phone"><span className="sc-notch" /><div className="sc-sms"><b>BRAC Career Hub</b>{t("নুসরাতের সাথে সেশন বুক হয়েছে।", "Booked with Nusrat.")}<u>meet.google.com/kmr-tqz</u></div></div>
    <div className="sc-mail"><Ico n="mail" s={26} w="duotone" /><span><b>{t("আপনার সেশন বুক হয়েছে", "Your session is booked")}</b><small>{t("মিটিং লিংক ভেতরে", "Meeting link inside")}</small></span></div></div>;
  if (n === 4) return <div className="sc sc-call"><div className="sc-tile"><Avatar c={c[0]} size={84} /><small>Nusrat</small></div><div className="sc-tile is-you"><span className="sc-you">{t("আপনি", "You")}</span><small>Ayesha</small></div><div className="sc-callbar"><span /><span /><span className="end" /></div><span className="sc-timer">29:41</span></div>;
  return <div className="sc sc-open"><div className="sc-side">{[t("হোম", "Home"), t("কাজ", "Tasks"), t("কোর্স", "Courses"), t("চাকরি", "Jobs"), t("সিভি", "CV")].map((x, k) => <span key={x} style={{ ["--d" as string]: `${0.2 + k * 0.25}s` }}>{x}</span>)}</div>
    <div className="sc-main"><b>{t("হাই আয়েশা 👋", "Hi Ayesha 👋")}</b>{[t("Excel কোর্স শুরু করুন", "Start the Excel course"), t("প্রথম সিভি বানান", "Make your first CV"), t("দুটি ইন্টার্নশিপ সেভ করুন", "Save two internships")].map((x, k) => <span key={x} style={{ ["--d" as string]: `${1.2 + k * 0.3}s` }}><i />{x}</span>)}</div></div>;
}

/* ---------- Demo controls: stand in for the counsellor's side ---------- */
export function DemoPanel() {
  const { upcoming, phase, dispatch, unlocked } = useHub();
  const { t } = useL();
  const [open, setOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [unlock, setUnlock] = useState<Unlockable[]>(["courses", "jobs", "cv"]);
  const first = unlocked === null;
  const label: Record<Unlockable, string> = { courses: t("কোর্স", "Courses"), jobs: t("চাকরি ও ইন্টার্নশিপ", "Jobs & internships"), cv: t("সিভি স্টুডিও", "CV Studio"), abroad: t("বিদেশে পড়াশোনা", "Study Abroad") };
  return <div className={"fl-demo" + (open ? " is-open" : "")}>
    <button className="fl-demo-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}><Ico n="wand" s={16} w="fill" /> {t("ডেমো কন্ট্রোল", "Demo controls")}</button>
    {open && <div className="fl-demo-panel">
      <p>{t("এই বোতামগুলো শিক্ষার্থীর স্ক্রিনের বাইরে ঘটে এমন কাজের বিকল্প।", "These buttons stand in for things that happen outside the student’s screen.")}</p>
      {upcoming ? <>
        <button onClick={() => dispatch({ type: "remind" })}><Ico n="mail" s={16} w="fill" /> {t("রিমাইন্ডার পাঠান", "Send the reminder")}</button>
        <button className="is-main" onClick={() => (first ? setCompleting(true) : (dispatch({ type: "complete", unlock: [] }), setOpen(false)))}><Ico n="done" s={16} w="fill" /> {t("কাউন্সেলর সেশন শেষ করলেন", "Counsellor marks session complete")}</button>
      </> : phase !== "signup" && <small>{t("কাউন্সেলরের কাজ দেখতে একটি সেশন বুক করুন।", "Book a session to try the counsellor actions.")}</small>}
      <hr />
      <button onClick={() => { dispatch({ type: "returning" }); setOpen(false); }}><Ico n="profile" s={16} w="fill" /> {t("পুরোনো শিক্ষার্থী হিসেবে দেখুন", "Jump to a returning student")}</button>
      <button onClick={() => { dispatch({ type: "reset" }); setOpen(false); }}><Ico n="replay" s={16} w="bold" /> {t("শুরু থেকে", "Start over")}</button>
    </div>}
    {completing && <Dialog title={t("কাউন্সেলরের ভিউ: সেশন শেষ", "Counsellor view: finish the session")} onClose={() => setCompleting(false)}>
      <p className="fl-muted">{t("শিক্ষার্থী কী কী ব্যবহার করতে পারবে বেছে নিন।", "Choose what this student can use.")}</p>
      <div className="fl-unlocks">{unlockables.map((u) => <label key={u.id}><input type="checkbox" aria-label={label[u.id]} checked={unlock.includes(u.id)} onChange={() => setUnlock((l) => (l.includes(u.id) ? l.filter((x) => x !== u.id) : [...l, u.id]))} />
        <span><strong>{label[u.id]}</strong></span></label>)}</div>
      <div className="fl-dialog-actions"><button className="fl-btn ghost" onClick={() => setCompleting(false)}>{t("ফিরে যান", "Back")}</button>
        <button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "complete", unlock }); setCompleting(false); setOpen(false); }}>{t("শেষ করুন ও হাব খুলুন", "Mark complete and open the hub")}</button></div>
    </Dialog>}
  </div>;
}
