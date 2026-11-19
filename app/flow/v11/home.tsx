"use client";
// v11 home. Sessions come first: the next session (or booking one) is the big tile, the last
// session's notes sit beside it, and the full session history is a table below.
// Every other tile is a short summary. Clicking a tile expands it in place (the grid
// rearranges); the link inside an expanded tile goes to that section.
import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { assignedCourses, assignedJobs, counsellorById, counsellors } from "../data";
import { Avatar } from "../parts";
import { answerText, cf, cn, counsellorText, questions, sessionTopics, type Task } from "./content";
import { AppIcon, Ico } from "./icons";
import { ago, clock, dayMonth, dayWord, inDays, longDay, num, useL } from "./lang";
import { firstOpen, useHub, type Session } from "./store";
import { ChangeSession, LinkBox, meetLink, sessionRange } from "./ui";

type Go = (to: string, opts?: { who?: "same" | "other" }) => void;

// Rearrange with a View Transition where the browser supports it.
function animate(update: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (d.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(() => flushSync(update));
  else update();
}

export function Home({ go }: { go: Go }) {
  const { account, last, tasks, unlocked = [], courses, savedJobs, answers } = useHub();
  const { t, lang } = useL();
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => animate(() => setOpen((o) => (o === id ? null : id)));
  const has = (id: string) => (unlocked ?? []).includes(id as "courses");
  const h = new Date().getHours();
  const hello = h < 12 ? t("শুভ সকাল", "Good morning") : h < 17 ? t("শুভ দুপুর", "Good afternoon") : t("শুভ সন্ধ্যা", "Good evening");
  const openTasks = tasks.filter((x) => !x.done);
  const doneCount = tasks.length - openTasks.length;
  const started = Object.values(courses).filter((v) => v === "started").length;

  const tile = (id: string, cls: string, head: ReactNode, body: ReactNode, more?: ReactNode, guide?: string) => {
    const on = open === id;
    return <section className={`v11-tile ${cls}` + (on ? " is-open" : "")} style={{ viewTransitionName: `tile-${id}` }} data-guide={guide}>
      {!on && <button className="v11-hit" aria-expanded={false} aria-label={t("আরও দেখুন", "Show more")} onClick={() => toggle(id)} />}
      <header className="v11-tile-head">{head}{on ? <button className="v11-close" aria-label={t("ছোট করুন", "Collapse")} onClick={() => toggle(id)}><Ico n="x" s={18} w="bold" /></button>
        : <span className="v11-more" aria-hidden="true"><Ico n="down" s={16} w="bold" /></span>}</header>
      {body}
      {on && more && <div className="v11-tile-more">{more}</div>}
    </section>;
  };

  return <div className="v11-home">
    <header className="v11-hello">
      <div><h1>{hello}, {account?.name.split(" ")[0]}</h1><p>{longDay(new Date().toISOString().slice(0, 10), lang)}</p></div>
    </header>

    <div className="v11-grid">
      <NextSession go={go} open={open === "session"} onToggle={() => toggle("session")} />

      {last?.minutes && tile("notes", "is-notes",
        <span className="v11-label"><AppIcon n="note" tone="amber" s={30} />{t("শেষ সেশনের নোট", "Notes from your last session")}</span>,
        <div className="v11-notes">
          <div className="v11-notes-by"><Avatar c={counsellorById(last.slot.counsellor)} size={36} /><span><b>{cn(counsellorById(last.slot.counsellor), lang)}</b><small>{dayMonth(last.slot.date, lang)} · {ago(last.slot.date, lang)}</small></span></div>
          <p className={open === "notes" ? "" : "is-clamped"}>{last.minutes.summary[lang]}</p>
        </div>,
        <><h4>{t("যা ঠিক হলো", "What you agreed")}</h4>
          <ul className="v11-agreed">{last.minutes.agreed.map((x) => <li key={x.en}><Ico n="done" s={18} w="fill" c="#17845f" />{x[lang]}</li>)}</ul>
          <button className="fl-link" onClick={() => document.getElementById("v11-history")?.scrollIntoView({ behavior: "smooth" })}>{t("সব সেশনের নোট নিচে ↓", "All session notes are below ↓")}</button></>)}

      {tile("tasks", "is-tasks",
        <span className="v11-label"><AppIcon n="tasks" s={30} />{t("কাজের তালিকা", "Tasks")}</span>,
        <div className="v11-tasks-sum">
          <Ring done={doneCount} total={tasks.length} />
          <div>{openTasks[0] ? <><small>{t("এরপর", "Up next")}</small><b>{openTasks[0].title[lang]}</b><Due task={openTasks[0]} /></> : <b>{t("সব কাজ শেষ!", "All done!")}</b>}</div>
        </div>,
        <><TaskMini list={openTasks.slice(0, 5)} />
          <button className="v11-go" onClick={() => go("tasks")}>{t("কাজের তালিকা খুলুন", "Open tasks")} <Ico n="arrow" s={16} w="bold" /></button></>, "tile-tasks")}

      {has("courses") && tile("courses", "is-small",
        <span className="v11-label"><AppIcon n="courses" s={30} />{t("কোর্স", "Courses")}</span>,
        <div className="v11-sum"><span className="v11-thumbs">{assignedCourses.map((x) => <img key={x.id} src={x.image} alt="" />)}</span>
          <p><b>{t(`${num(assignedCourses.length, "bn")}টি কোর্স`, `${assignedCourses.length} courses`)}</b> · {started ? t(`${num(started, "bn")}টি চলছে`, `${started} in progress`) : t("শুরু হয়নি", "not started")}</p></div>,
        <><ul className="v11-list">{assignedCourses.map((x) => <li key={x.id}><img src={x.image} alt="" /><span><b>{x.title}</b><small>{x.provider}</small></span><Status v={courses[x.id] ?? "new"} /></li>)}</ul>
          <button className="v11-go" onClick={() => go("courses")}>{t("কোর্সগুলো খুলুন", "Open courses")} <Ico n="arrow" s={16} w="bold" /></button></>)}

      {has("jobs") && tile("jobs", "is-small",
        <span className="v11-label"><AppIcon n="jobs" s={30} />{t("চাকরি ও ইন্টার্নশিপ", "Jobs & internships")}</span>,
        <div className="v11-sum"><p className="v11-sum-big">{num(assignedJobs.length, lang)}</p><p>{t("টি সুযোগ বাছাই করা", " openings picked for you")}{savedJobs.length ? t(` · ${num(savedJobs.length, "bn")}টি সেভ করা`, ` · ${savedJobs.length} saved`) : ""}</p></div>,
        <><ul className="v11-list">{assignedJobs.map((x) => <li key={x.id}><img src={x.image} alt="" /><span><b>{x.title}</b><small>{x.org}</small></span>{savedJobs.includes(x.id) && <em className="v11-chip is-saved">{t("সেভ করা", "Saved")}</em>}</li>)}</ul>
          <button className="v11-go" onClick={() => go("jobs")}>{t("সব সুযোগ দেখুন", "See all openings")} <Ico n="arrow" s={16} w="bold" /></button></>)}

      {has("cv") && tile("cv", "is-small",
        <span className="v11-label"><AppIcon n="cv" s={30} />{t("সিভি স্টুডিও", "CV Studio")}</span>,
        <div className="v11-sum v11-cv"><span className="v11-paper" aria-hidden="true"><b>{account?.name}</b><i /><i /><i className="s" /><i /></span><p>{t("আপনার তথ্য বসানো আছে", "Your details are filled in")}</p></div>,
        <><p className="v11-more-p">{t("নাম, ইমেইল, ফোন, বিশ্ববিদ্যালয় আর বিষয় আগেই বসানো। বাকিটা লিখে এক পাতার সিভি বানান।", "Your name, email, phone, university and subject are already in. Add the rest and make a one-page CV.")}</p>
          <button className="v11-go" onClick={() => go("cv")}>{t("সিভি স্টুডিও খুলুন", "Open CV Studio")} <Ico n="arrow" s={16} w="bold" /></button></>)}

      {has("abroad") && tile("abroad", "is-small is-abroad",
        <span className="v11-label"><AppIcon n="abroad" s={30} />{t("বিদেশে পড়াশোনা", "Study Abroad")}</span>,
        <div className="v11-sum"><p>{t("প্রোগ্রাম, কাগজপত্র আর আবেদন", "Programs, documents and applications")}</p></div>,
        <button className="v11-go" onClick={() => go("abroad")}>{t("খুলুন", "Open")} <Ico n="arrow" s={16} w="bold" /></button>)}

      {tile("profile", "is-small",
        <span className="v11-label"><AppIcon n="profile" s={30} />{t("আপনার উত্তর", "Your answers")}</span>,
        <div className="v11-sum"><p>{t("কাউন্সেলর এগুলো দেখে আপনাকে বোঝেন। কিছু বদলালে আপডেট করুন।", "Your counsellor reads these. Update them when something changes.")}</p></div>,
        <><dl className="v11-answers">{questions.slice(0, 4).map((q) => <div key={q.id}><dt>{q.prompt[lang]}</dt><dd>{answerText(q, answers, lang)}</dd></div>)}</dl>
          <button className="v11-go" onClick={() => go("profile")}>{t("উত্তর আপডেট করুন", "Update answers")} <Ico n="arrow" s={16} w="bold" /></button></>)}
    </div>

    <History />
  </div>;
}

/* ---------- The big tile: the next session, or booking one ---------- */
function NextSession({ go, open, onToggle }: { go: Go; open: boolean; onToggle: () => void }) {
  const { upcoming, last } = useHub();
  const { t, lang } = useL();
  if (!upcoming) {
    const c = last ? counsellorById(last.slot.counsellor) : counsellors[0];
    const nextSame = firstOpen(c.id);
    const others = counsellors.filter((x) => x.id !== c.id);
    return <section className="v11-tile is-session is-book" style={{ viewTransitionName: "tile-session" }} data-guide="tile-session">
      <span className="v11-label is-light"><AppIcon n="book" tone="pink" s={30} />{t("পরের সেশন", "Your next session")}</span>
      <h2>{t("আরেকটি সেশন বুক করুন", "Book your next session")}</h2>
      <p className="v11-session-sub">{last ? t(`শেষ সেশন ${ago(last.slot.date, "bn")}, ${cn(c, lang)}ের সাথে। কাজের অগ্রগতি নিয়ে কথা বলার এখনই ভালো সময়।`, `Your last session was ${ago(last.slot.date, "en")} with ${cn(c, lang)}. A good time to talk about your progress.`) : ""}</p>
      <div className="v11-book-choices">
        <button className="v11-choice is-same" onClick={() => go("book", { who: "same" })} data-guide="book-same">
          <Avatar c={c} size={52} />
          <span><b>{t(`আবার ${cf(c, lang)}ের সাথে`, `Again with ${cf(c, lang)}`)}</b>
            <small>{nextSame ? t(`প্রথম খালি সময়: ${dayWord(nextSame.date, "bn")}, ${clock(nextSame.time, "bn")}`, `First free: ${dayWord(nextSame.date, "en")}, ${clock(nextSame.time, "en")}`) : ""}</small></span>
          <Ico n="arrow" s={20} w="bold" />
        </button>
        <button className="v11-choice" onClick={() => go("book", { who: "other" })}>
          <span className="v11-stack">{others.slice(0, 3).map((x) => <Avatar key={x.id} c={x} size={38} />)}</span>
          <span><b>{t("অন্য কাউন্সেলরের সাথে", "With another counsellor")}</b><small>{t("ভিন্ন বিষয়ে বিশেষজ্ঞ কারও সাথে", "Someone with a different focus")}</small></span>
          <Ico n="arrow" s={20} w="bold" />
        </button>
      </div>
    </section>;
  }
  const c = counsellorById(upcoming.slot.counsellor);
  const d = inDays(upcoming.slot.date);
  const left = d <= 0 ? t("আজ", "Today") : d === 1 ? t("আগামীকাল", "Tomorrow") : t(`আর ${num(d, "bn")} দিন`, `In ${d} days`);
  return <section className={"v11-tile is-session" + (open ? " is-open" : "")} style={{ viewTransitionName: "tile-session" }} data-guide="tile-session">
    {!open && <button className="v11-hit" aria-label={t("সেশনের বিস্তারিত", "Session details")} onClick={onToggle} />}
    <header className="v11-tile-head"><span className="v11-label is-light"><AppIcon n="booked" tone="pink" s={30} />{t("পরের সেশন", "Your next session")}</span>
      <span className="v11-count">{left}</span>
      {open && <button className="v11-close is-light" aria-label={t("ছোট করুন", "Collapse")} onClick={onToggle}><Ico n="x" s={18} w="bold" /></button>}</header>
    <h2>{dayWord(upcoming.slot.date, lang)}, {dayMonth(upcoming.slot.date, lang)}<span>{sessionRange(upcoming.slot, lang)}</span></h2>
    <div className="v11-session-who"><Avatar c={c} size={48} /><span><b>{cn(c, lang)}</b><small>{counsellorText[c.id].title[lang]} · Google Meet</small></span></div>
    {!open && <p className="v11-session-link"><Ico n="video" s={18} w="fill" /> {meetLink(upcoming)}</p>}
    {open && <div className="v11-session-more">
      <LinkBox s={upcoming} />
      {last?.minutes && <div className="v11-prep"><h4>{t("সেশনের আগে যা নিয়ে ভাববেন", "Before the session, think about")}</h4>
        <ul>{last.minutes.agreed.map((x) => <li key={x.en}>{x[lang]}</li>)}</ul></div>}
      <ChangeSession />
    </div>}
  </section>;
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
function TaskMini({ list }: { list: Task[] }) {
  const { dispatch } = useHub();
  const { lang } = useL();
  return <ul className="v11-taskmini">{list.map((x) => <li key={x.id}>
    <button role="checkbox" aria-checked={!!x.done} aria-label={x.title[lang]} className="v11-check" onClick={() => dispatch({ type: "task", id: x.id })}><Ico n="check" s={12} w="bold" /></button>
    <span>{x.title[lang]}</span><Due task={x} /></li>)}</ul>;
}
function Status({ v }: { v: "new" | "started" | "done" }) {
  const { t } = useL();
  return <em className={"v11-chip is-" + v}>{v === "done" ? t("শেষ", "Finished") : v === "started" ? t("চলছে", "In progress") : t("শুরু হয়নি", "Not started")}</em>;
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
