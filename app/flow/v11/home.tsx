"use client";
// v11 home. Sessions come first: the next session (or booking one) is the big tile, the last
// session's notes sit beside it, and the full session history is a table below.
// The notes tile opens where it stands (the others slide to make room). Every other tile
// grows into its full page (it opens that section).
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { assignedCourses, assignedJobs, counsellorById, counsellors } from "../data";
import { Avatar } from "../parts";
import { cf, cn, counsellorText, sessionTopics, type Task } from "./content";
import { AppIcon, Ico } from "./icons";
import { ago, clock, dayMonth, dayWord, inDays, longDay, num, useL } from "./lang";
import { firstOpen, useHub, type Session } from "./store";
import { ChangeSession, LinkBox, meetLink, sessionRange } from "./ui";

type Go = (to: string, opts?: { who?: "same" | "other" }) => void;
type Open = { id: string; col: number; row: number; w: number; h: number };

// Rearrange with a View Transition where the browser supports it.
export function animate(update: () => void, after?: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void>; ready: Promise<void> } };
  if (d.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let done = false;
    const once = () => { if (!done) { done = true; after?.(); } };
    const tr = d.startViewTransition(() => flushSync(update));
    tr.ready.catch(() => {});
    tr.finished.then(once, once);
    setTimeout(once, 520); // in case the transition is skipped or slow
  } else { update(); if (after) setTimeout(after, 30); }
}

// FLIP: note where every card is, apply the change, then slide each card from its old place.
// A card that grew is revealed with a clip; one that shrank scales down while its content fades in.
// The real elements move (no snapshots), so nothing jumps if the page scrolls or is hovered meanwhile.
const EASE = "cubic-bezier(.22, .8, .24, 1)";
export function flip(box: HTMLElement, sel: string, key: string, update: () => void, after?: () => void) {
  const items = () => Array.from(box.querySelectorAll<HTMLElement>(sel));
  items().forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  const before = new Map(items().map((el) => [el.dataset[key], el.getBoundingClientRect()]));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = reduce ? 0 : 480;
  box.classList.add("is-flipping");
  flushSync(update);
  if (T) for (const el of items()) {
    const a = before.get(el.dataset[key]), b = el.getBoundingClientRect();
    if (!a) { el.animate([{ opacity: 0, transform: "scale(.97)" }, { opacity: 1, transform: "none" }], { duration: T, easing: EASE }); continue; }
    const dx = a.left - b.left, dy = a.top - b.top, dw = b.width - a.width, dh = b.height - a.height;
    const r = getComputedStyle(el).borderTopLeftRadius;
    if (Math.abs(dw) < 1 && Math.abs(dh) < 1) {
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: T, easing: EASE });
    } else if (dw > -1 && dh > -1) {
      el.animate([{ transform: `translate(${dx}px, ${dy}px)`, clipPath: `inset(0 ${dw}px ${dh}px 0 round ${r})` }, { transform: "none", clipPath: `inset(0 0 0 0 round ${r})` }], { duration: T, easing: EASE });
    } else {
      el.animate([{ transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width}, ${a.height / b.height})` }, { transformOrigin: "0 0", transform: "none" }], { duration: T, easing: EASE });
      for (const ch of Array.from(el.children)) (ch as HTMLElement).animate([{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }], { duration: T });
    }
  }
  setTimeout(() => { box.classList.remove("is-flipping"); after?.(); }, T + 20);
}

// Where a tile sits in the grid right now (1-based column and row).
function cellOf(grid: HTMLElement, el: HTMLElement) {
  const cs = getComputedStyle(grid);
  const cols = cs.gridTemplateColumns.split(" ").length;
  const gap = parseFloat(cs.columnGap) || 0, rgap = parseFloat(cs.rowGap) || 0;
  const g = grid.getBoundingClientRect(), r = el.getBoundingClientRect();
  const colW = (g.width - gap * (cols - 1)) / cols;
  const col = Math.round((r.left - g.left) / (colW + gap)) + 1;
  const rows = cs.gridTemplateRows.split(" ").map(parseFloat);
  let y = 0, row = 1;
  for (let k = 0; k < rows.length; k++) { if (r.top - g.top < y + rows[k] / 2) { row = k + 1; break; } y += rows[k] + rgap; row = k + 2; }
  return { cols, col, row };
}

export function Home({ go }: { go: Go }) {
  const { account, last, tasks, unlocked = [], courses, savedJobs, answers, upcoming } = useHub();
  const { t, lang } = useL();
  const [open, setOpen] = useState<Open | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const has = (id: string) => (unlocked ?? []).includes(id as "courses");
  const SEL = ":scope > [data-tile]";

  const focusTile = (id: string) => {
    const el = grid.current?.querySelector<HTMLElement>(`[data-tile="${id}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = 80; // below the sticky bar
    if (r.top < top || r.bottom > window.innerHeight) (document.scrollingElement ?? document.documentElement).scrollBy({ top: (r.height > window.innerHeight - top ? r.top - top : r.bottom - window.innerHeight + 24), behavior: "smooth" });
    el.focus({ preventScroll: true });
  };
  const toggle = (id: string) => {
    const g = grid.current, el = g?.querySelector<HTMLElement>(`[data-tile="${id}"]`);
    if (!g || !el) return;
    if (open?.id === id) { flip(g, SEL, "tile", () => setOpen(null)); return; }
    const at = cellOf(g, el);
    const w = id === "session" ? at.cols : Math.min(2, at.cols);
    const col = Math.max(1, Math.min(at.col, at.cols - w + 1));
    flip(g, SEL, "tile", () => setOpen({ id, col, row: at.row, w, h: 2 }), () => focusTile(id));
  };

  const h = new Date().getHours();
  const hello = h < 12 ? t("শুভ সকাল", "Good morning") : h < 17 ? t("শুভ দুপুর", "Good afternoon") : t("শুভ সন্ধ্যা", "Good evening");
  const openTasks = tasks.filter((x) => !x.done);
  const doneCount = tasks.length - openTasks.length;
  const started = Object.values(courses).filter((v) => v === "started").length;
  const c0 = last ? counsellorById(last.slot.counsellor) : null;

  // One tile. With `more` it opens in place; without, it grows into its own page.
  const tile = (id: string, cls: string, label: ReactNode, peek: ReactNode, more?: ReactNode, guide?: string) => {
    const on = open?.id === id;
    const style: CSSProperties = { viewTransitionName: `tile-${id}`, ...(on && open ? { gridColumn: `${open.col} / span ${open.w}`, gridRow: `${open.row} / span ${open.h}` } : {}) };
    return <section key={id} data-tile={id} tabIndex={-1} className={`v11-tile ${cls}` + (on ? " is-open" : "") + (more ? "" : " is-link")} style={style} data-guide={guide}>
      {!on && <button className="v11-hit" aria-expanded={more ? false : undefined} aria-label={more ? t("আরও দেখুন", "Show more") : t("খুলুন", "Open")} onClick={() => (more ? toggle(id) : go(id))} />}
      <header className="v11-tile-head">{label}{on ? <button className="v11-close" aria-label={t("ছোট করুন", "Collapse")} onClick={() => toggle(id)}><Ico n="x" s={18} w="bold" /></button>
        : <span className="v11-more" aria-hidden="true"><Ico n={more ? "down" : "open"} s={16} w="bold" /></span>}</header>
      {on ? <div className="v11-tile-more">{more}</div> : peek}
    </section>;
  };
  const locked = (id: string, cls: string, icon: string, title: string) => <section key={id} data-tile={id} className={`v11-tile ${cls} is-locked`}>
    <span className="v11-label"><AppIcon n={icon} tone="slate" s={30} />{title}</span>
    <p className="v11-locked-p"><Ico n="lock" s={16} w="fill" />{c0 ? t(`${cf(c0, "bn")} প্রয়োজন মনে করলে এটি খুলে দেবেন।`, `${cf(c0, "en")} opens this when it will help you.`) : ""}</p>
  </section>;

  return <div className="v11-home">
    <header className="v11-hello">
      <div><h1>{hello}, {account?.name.split(" ")[0]}</h1><p>{longDay(new Date().toISOString().slice(0, 10), lang)}</p></div>
    </header>

    {/* session session notes notes / session session jobs cv / tasks courses profile cv */}
    <div className="v11-grid" ref={grid}>
      {upcoming ? tile("session", "is-session",
        <><span className="v11-label is-light"><AppIcon n="booked" tone="pink" s={30} />{t("পরের সেশন", "Your next session")}</span><Countdown date={upcoming.slot.date} /></>,
        <SessionPeek s={upcoming} />, <SessionMore s={upcoming} />, "tile-session")
        : <BookTile go={go} key="session" />}

      {last?.minutes ? tile("notes", "is-notes",
        <span className="v11-label"><AppIcon n="note" tone="amber" s={30} />{t("শেষ সেশনের নোট", "Last session’s notes")}</span>,
        <div className="v11-peek">
          <div className="v11-notes-by"><Avatar c={c0!} size={34} /><span><b>{cn(c0!, lang)}</b><small>{dayMonth(last.slot.date, lang)}</small></span></div>
          <p className="v11-peek-line">{t(`${num(last.minutes.agreed.length, "bn")}টি বিষয়ে সিদ্ধান্ত হয়েছে`, `${last.minutes.agreed.length} things agreed`)}</p>
        </div>,
        <><p className="v11-notes-text">{last.minutes.summary[lang]}</p>
          <h4>{t("যা ঠিক হলো", "What you agreed")}</h4>
          <ul className="v11-agreed">{last.minutes.agreed.map((x) => <li key={x.en}><Ico n="done" s={18} w="fill" c="#17845f" />{x[lang]}</li>)}</ul>
          <button className="v11-go" onClick={() => document.getElementById("v11-history")?.scrollIntoView({ behavior: "smooth" })}>{t("সব সেশনের নোট", "All session notes")} <Ico n="down" s={16} w="bold" /></button></>, "tile-notes")
        : <section key="notes" data-tile="notes" data-guide="tile-notes" className="v11-tile is-notes is-empty-notes"><span className="v11-label"><AppIcon n="note" tone="amber" s={30} />{t("সেশনের নোট", "Session notes")}</span><p className="v11-locked-p">{t("প্রথম সেশনের পর কাউন্সেলরের নোট এখানে আসবে।", "Your counsellor’s notes appear here after a session.")}</p></section>}

      {has("jobs") ? tile("jobs", "is-small",
        <span className="v11-label"><AppIcon n="jobs" s={30} />{t("চাকরি ও ইন্টার্নশিপ", "Jobs & internships")}</span>,
        <div className="v11-peek"><p className="v11-sum-big">{num(assignedJobs.length, lang)}<small>{t("টি সুযোগ", " openings")}</small></p>
          <p className="v11-peek-line">{savedJobs.length ? t(`${num(savedJobs.length, "bn")}টি সেভ করা`, `${savedJobs.length} saved`) : t("কাউন্সেলরের বাছাই", "Picked by your counsellor")}</p></div>)
        : locked("jobs", "is-small", "jobs", t("চাকরি ও ইন্টার্নশিপ", "Jobs & internships"))}

      {has("cv") ? tile("cv", "is-cv",
        <span className="v11-label"><AppIcon n="cv" s={30} />{t("সিভি স্টুডিও", "CV Studio")}</span>,
        <div className="v11-peek v11-cv-peek"><CvArt name={account?.name ?? ""} /><p>{t("আপনার তথ্য বসানো আছে। বাকিটা লিখলেই সিভি তৈরি।", "Your details are in. Add the rest and your CV is ready.")}</p></div>)
        : locked("cv", "is-cv", "cv", t("সিভি স্টুডিও", "CV Studio"))}

      {tile("tasks", "is-tasks",
        <span className="v11-label"><AppIcon n="tasks" s={30} />{t("কাজের তালিকা", "Tasks")}</span>,
        <div className="v11-peek">
          <div className="v11-tasks-sum"><Ring done={doneCount} total={tasks.length} /><div><small>{t("এরপর", "Up next")}</small><b title={openTasks[0]?.title[lang]}>{openTasks[0]?.title[lang] ?? t("সব কাজ শেষ!", "All done!")}</b>{openTasks[0] && <Due task={openTasks[0]} />}</div></div>
        </div>, undefined, "tile-tasks")}

      {has("courses") ? tile("courses", "is-small",
        <span className="v11-label"><AppIcon n="courses" s={30} />{t("কোর্স", "Courses")}</span>,
        <div className="v11-peek"><span className="v11-thumbs">{assignedCourses.map((x) => <img key={x.id} src={x.image} alt="" />)}</span>
          <p className="v11-peek-line"><b>{t(`${num(assignedCourses.length, "bn")}টি কোর্স`, `${assignedCourses.length} courses`)}</b> · {started ? t(`${num(started, "bn")}টি চলছে`, `${started} in progress`) : t("শুরু হয়নি", "not started")}</p></div>)
        : locked("courses", "is-small", "courses", t("কোর্স", "Courses"))}

      {tile("profile", "is-small",
        <span className="v11-label"><AppIcon n="profile" s={30} />{t("আমার প্রোফাইল", "My profile")}</span>,
        <div className="v11-peek"><p className="v11-sum-big">{num(Object.keys(answers).length, lang)}<small>{t("টি উত্তর", " answers")}</small></p><p className="v11-peek-line">{t("কিছু বদলালে আপডেট করুন", "Update when things change")}</p></div>)}

      {has("abroad") && tile("abroad", "is-abroad",
        <span className="v11-label is-light"><AppIcon n="abroad" s={30} />{t("বিদেশে পড়াশোনা", "Study Abroad")}</span>,
        <p className="v11-abroad-line">{t("প্রোগ্রাম খুঁজুন, কাগজপত্র গুছান, আবেদন ট্র্যাক করুন।", "Find programs, get documents ready, track applications.")}</p>)}
    </div>

    <History />
  </div>;
}

/* ---------- Session tile ---------- */
function Countdown({ date }: { date: string }) {
  const { t } = useL();
  const d = inDays(date);
  return <span className="v11-count">{d <= 0 ? t("আজ", "Today") : d === 1 ? t("আগামীকাল", "Tomorrow") : t(`আর ${num(d, "bn")} দিন`, `In ${d} days`)}</span>;
}
function SessionPeek({ s }: { s: Session }) {
  const { lang } = useL();
  const c = counsellorById(s.slot.counsellor);
  return <>
    <h2>{dayWord(s.slot.date, lang)}, {dayMonth(s.slot.date, lang)}<span>{sessionRange(s.slot, lang)}</span></h2>
    <div className="v11-session-who"><Avatar c={c} size={48} /><span><b>{cn(c, lang)}</b><small>{counsellorText[c.id].title[lang]} · Google Meet</small></span></div>
    <p className="v11-session-link"><Ico n="video" s={18} w="fill" /> {meetLink(s)}</p>
  </>;
}
function SessionMore({ s }: { s: Session }) {
  const { last } = useHub();
  const { t, lang } = useL();
  const c = counsellorById(s.slot.counsellor);
  return <div className="v11-session-more">
    <div className="v11-session-cols">
      <div><h2>{dayWord(s.slot.date, lang)}, {dayMonth(s.slot.date, lang)}<span>{sessionRange(s.slot, lang)}</span></h2>
        <div className="v11-session-who"><Avatar c={c} size={48} /><span><b>{cn(c, lang)}</b><small>{counsellorText[c.id].title[lang]}</small></span></div></div>
      {last?.minutes && <div className="v11-prep"><h4>{t("সেশনের আগে যা নিয়ে ভাববেন", "Before the session, think about")}</h4><ul>{last.minutes.agreed.map((x) => <li key={x.en}>{x[lang]}</li>)}</ul></div>}
    </div>
    <LinkBox s={s} />
    <ChangeSession />
  </div>;
}
// No session booked: the tile becomes the way to book one, with the same counsellor or another.
function BookTile({ go }: { go: Go }) {
  const { last } = useHub();
  const { t } = useL();
  const c = last ? counsellorById(last.slot.counsellor) : counsellors[0];
  const nextSame = firstOpen(c.id);
  const others = counsellors.filter((x) => x.id !== c.id);
  return <section className="v11-tile is-session is-book" data-tile="session" data-guide="tile-session">
    <span className="v11-label is-light"><AppIcon n="book" tone="pink" s={30} />{t("পরের সেশন", "Your next session")}</span>
    <h2>{t("আরেকটি সেশন বুক করুন", "Book your next session")}</h2>
    {last && <p className="v11-session-sub">{t(`শেষ সেশন ${ago(last.slot.date, "bn")}, ${cn(c, "bn")}ের সাথে।`, `Last session ${ago(last.slot.date, "en")}, with ${cn(c, "en")}.`)}</p>}
    <div className="v11-book-choices">
      <button className="v11-choice is-same" onClick={() => go("book", { who: "same" })} data-guide="book-same">
        <Avatar c={c} size={48} />
        <span><b>{t(`আবার ${cf(c, "bn")}ের সাথে`, `Again with ${cf(c, "en")}`)}</b>
          <small>{nextSame ? t(`খালি: ${dayWord(nextSame.date, "bn")}, ${clock(nextSame.time, "bn")}`, `Free: ${dayWord(nextSame.date, "en")}, ${clock(nextSame.time, "en")}`) : ""}</small></span>
        <Ico n="arrow" s={20} w="bold" />
      </button>
      <button className="v11-choice" onClick={() => go("book", { who: "other" })}>
        <span className="v11-stack">{others.slice(0, 3).map((x) => <Avatar key={x.id} c={x} size={34} />)}</span>
        <span><b>{t("অন্য কাউন্সেলর", "Another counsellor")}</b><small>{t("ভিন্ন বিষয়ে পরামর্শ", "A different focus")}</small></span>
        <Ico n="arrow" s={20} w="bold" />
      </button>
    </div>
  </section>;
}

/* A CV page drawn in CSS: photo, name, coloured section bars, a progress badge. */
function CvArt({ name }: { name: string }) {
  const { t } = useL();
  return <div className="v11-cvart" aria-hidden="true">
    <div className="v11-cvart-page">
      <div className="v11-cvart-top"><span className="v11-cvart-photo" /><div><b>{name}</b><i className="w60" /></div></div>
      <span className="v11-cvart-h" /><i /><i className="w80" /><i className="w60" />
      <span className="v11-cvart-h is-pink" /><i /><i className="w70" />
      <span className="v11-cvart-h is-dash" /><i className="is-dash" /><i className="is-dash w50" />
    </div>
    <span className="v11-cvart-badge">{t("৬০% তৈরি", "60% done")}</span>
    <span className="v11-cvart-pen"><Ico n="edit" s={18} w="fill" /></span>
  </div>;
}

/* ---------- Small pieces ---------- */
function Ring({ done, total }: { done: number; total: number }) {
  const { lang } = useL();
  const r = 26, c = 2 * Math.PI * r, p = total ? done / total : 0;
  return <span className="v11-ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r={r} /><circle cx="32" cy="32" r={r} className="is-fill" style={{ strokeDasharray: `${c * p} ${c}` }} /></svg>
    <b>{num(done, lang)}<small>/{num(total, lang)}</small></b></span>;
}
export function Due({ task }: { task: Task }) {
  const { t, lang } = useL();
  if (task.done) return null;
  const d = task.due;
  const date = new Date(); date.setDate(date.getDate() + d);
  const iso = date.toISOString().slice(0, 10);
  const cls = d < 0 ? "is-late" : d === 0 ? "is-today" : d <= 2 ? "is-soon" : "";
  const label = d < 0 ? t("সময় পেরিয়ে গেছে", "Overdue") : d === 0 ? t("আজ", "Today") : d === 1 ? t("আগামীকাল", "Tomorrow") : d < 7 ? dayWord(iso, lang) : dayMonth(iso, lang, true);
  return <span className={"v11-due " + cls}><Ico n="calendar" s={14} w="fill" />{label}</span>;
}
/* ---------- Session history: a table on the home page ---------- */
function History() {
  const { sessions } = useHub();
  const { t, lang } = useL();
  const [open, setOpen] = useState<string | null>(null);
  const rows: Session[] = [...sessions].sort((a, b) => (b.slot.date + b.slot.time).localeCompare(a.slot.date + a.slot.time));
  const state = (s: Session) => s.status === "upcoming" ? t("আসন্ন", "Upcoming") : s.status === "completed" ? t("সম্পন্ন", "Completed") : t("বাতিল", "Cancelled");
  return <section className="v11-history" id="v11-history" data-guide="history">
    <header><span className="v11-label"><AppIcon n="sessions" s={30} />{t("সেশনের ইতিহাস", "Session history")}</span>
      <small>{t(`মোট ${num(sessions.filter((s) => s.status === "completed").length, "bn")}টি সম্পন্ন`, `${sessions.filter((s) => s.status === "completed").length} completed`)}</small></header>
    <table>
      <thead><tr><th>{t("তারিখ", "Date")}</th><th>{t("কাউন্সেলর", "Counsellor")}</th><th>{t("বিষয়", "Topic")}</th><th>{t("অবস্থা", "Status")}</th><th><span className="sr">{t("নোট", "Notes")}</span></th></tr></thead>
      <tbody>{rows.map((s) => {
        const c = counsellorById(s.slot.counsellor);
        const can = !!s.minutes;
        const on = open === s.id;
        return [<tr key={s.id} className={(can ? "is-click " : "") + "is-" + s.status + (on ? " is-on" : "")} onClick={() => can && setOpen(on ? null : s.id)}>
          <td><b>{dayMonth(s.slot.date, lang, true)}</b><small>{clock(s.slot.time, lang)}</small></td>
          <td><span className="v11-who-cell"><Avatar c={c} size={30} />{cn(c, lang)}</span></td>
          <td>{s.status === "cancelled" ? "—" : sessionTopics[s.number]?.[lang] ?? t("ফলো-আপ", "Follow-up")}</td>
          <td><em className={"v11-chip is-" + s.status}>{state(s)}</em></td>
          <td className="v11-notes-cell">{can && <button className="v11-row-btn" aria-expanded={on} onClick={(e) => { e.stopPropagation(); setOpen(on ? null : s.id); }}><Ico n="note" s={16} w="fill" />{on ? t("লুকান", "Hide") : t("নোট", "Notes")}</button>}</td>
        </tr>, on && s.minutes ? <tr key={s.id + "-n"} className="v11-row-notes"><td colSpan={5}>
          <p>{s.minutes.summary[lang]}</p>
          <ul className="v11-agreed">{s.minutes.agreed.map((x) => <li key={x.en}><Ico n="done" s={18} w="fill" c="#17845f" />{x[lang]}</li>)}</ul>
        </td></tr> : null];
      })}</tbody>
    </table>
  </section>;
}
