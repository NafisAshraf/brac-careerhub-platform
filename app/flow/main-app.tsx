"use client";
// The full Career Hub, shown once the counsellor marks the first session complete.
// The menu only lists what the counsellor unlocked.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { CVStudio } from "../career/cv-studio";
import { StudyAbroadSection, abroadNav, initialSelection, type AbroadPage } from "../hub-v3/abroad";
import {
  assignedCourses, assignedJobs, counsellorById, counsellors, questions, slotLabel, time12, dayLabel, nextOpen, longDate,
  type Answers, type Slot,
} from "./data";
import { useFlow, type Account, type Session } from "./store";
import { PlaneGuide } from "./guide";
import { Answer, Avatar, Bell, ChangeSession, CounsellorCard, DemoPanel, Dialog, I, JoinSteps, SlotPicker, sessionLine } from "./parts";

export type AppPage = "home" | "tasks" | "courses" | "jobs" | "cv" | "abroad" | "sessions" | "profile";

// layout "side": menu in a left sidebar (v4–v6). layout "top": no sidebar, the menu runs across the top (v7).
export function MainApp({ exit, accent, layout = "side", guide }: { exit: () => void; accent?: ReactNode; layout?: "side" | "top"; guide?: boolean }) {
  const flow = useFlow();
  const { unlocked = [], tasks, upcoming, account } = flow;
  const [page, setPage] = useState<AppPage>("home");
  const [abroadPage, setAbroadPage] = useState<AbroadPage>("catalog");
  const [abroadKey, setAbroadKey] = useState(0);
  const [selected, setSelected] = useState(initialSelection);
  const [menu, setMenu] = useState(false);
  const [welcome, setWelcome] = useState(!guide);
  const [me, setMe] = useState(false);
  const main = useRef<HTMLElement>(null);
  const has = (id: "courses" | "jobs" | "cv" | "abroad") => (unlocked ?? []).includes(id);
  const open = tasks.filter((t) => !t.done).length;

  const go = (p: string) => {
    const target = (p === "session" ? "sessions" : p) as AppPage;
    if (["courses", "jobs", "cv", "abroad"].includes(target) && !has(target as "courses")) return;
    setPage(target); setMenu(false);
    if (target === "abroad") setAbroadKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };
  useEffect(() => { main.current?.focus({ preventScroll: true }); }, [page]);

  const nav: { id: AppPage; label: string; icon: string; count?: number; show: boolean; group: string }[] = [
    { id: "home", label: "Home", icon: "home", show: true, group: "main" },
    { id: "tasks", label: "My tasks", icon: "tasks", count: open, show: true, group: "main" },
    { id: "courses", label: "Courses", icon: "book", show: has("courses"), group: "main" },
    { id: "jobs", label: "Jobs & internships", icon: "briefcase", show: has("jobs"), group: "main" },
    { id: "cv", label: "CV Studio", icon: "doc", show: has("cv"), group: "main" },
    { id: "abroad", label: "Study Abroad", icon: "globe", show: has("abroad"), group: "main" },
    { id: "sessions", label: "Counselling sessions", icon: "chat", show: true, group: "help" },
    { id: "profile", label: "My profile & answers", icon: "user", show: true, group: "help" },
  ];
  const side = <>
    <div className={"fl-brand" + (guide ? " is-guided" : "")}><Image data-guide={guide ? "plane-dock" : undefined} src="/careerhub-logo.png" width={96} height={86} alt="BRAC Career Hub" /></div>
    <nav aria-label="Career Hub">
      <span className="fl-nav-label">Your plan</span>
      <div className="fl-nav-group" data-guide="nav-main">{nav.filter((n) => n.show && n.group === "main").map((n, k) => <button key={n.id} data-guide={"nav-" + n.id} style={{ ["--d" as string]: `${k * 0.09}s` }} className={"fl-nav" + (page === n.id ? " is-on" : "")} aria-current={page === n.id ? "page" : undefined} onClick={() => go(n.id)}>
        <I n={n.icon} /><span>{n.label}</span>{!!n.count && <em>{n.count}</em>}</button>)}</div>
      <span className="fl-nav-label">Support</span>
      {nav.filter((n) => n.group === "help").map((n) => <button key={n.id} data-guide={"nav-" + n.id} className={"fl-nav" + (page === n.id ? " is-on" : "")} aria-current={page === n.id ? "page" : undefined} onClick={() => go(n.id)}><I n={n.icon} /><span>{n.label}</span></button>)}
    </nav>
    <div className="fl-side-foot">
      <p className="fl-side-hint"><I n="lock" s={14} /> More sections appear when your counsellor adds them.</p>
      <div className="fl-me"><span>{account?.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</span><div><strong>{account?.name}</strong><small>{account?.university}</small></div></div>
      <button className="fl-link" onClick={exit}>← Back to home page</button>
    </div>
  </>;

  const short: Partial<Record<AppPage, string>> = { tasks: "Tasks", jobs: "Jobs", sessions: "Sessions" };
  const topItems = nav.filter((n) => n.show && n.id !== "profile");
  const content = <main ref={main} tabIndex={-1} className="fl-page">{pages()}</main>;
  function pages() {
    return <>
        {page === "home" && <Home go={go} accent={accent} />}
        {page === "tasks" && <Tasks go={go} has={has} />}
        {page === "courses" && <Courses />}
        {page === "jobs" && <Jobs />}
        {page === "cv" && <div className="career-app fl-embed" lang="en"><div data-guide="cv-head"><Head kicker="CV STUDIO" title="Build your CV" body="Your details are filled in. Edit anything, then generate a one-page draft." /></div>
          <CVStudio language="en" profile={{ name: account!.name, email: account!.email, institution: account!.university, subject: account!.subject, qualification: "bachelor", situation: "student" }} seeded={false} onDraft={() => {}} /></div>}
        {page === "abroad" && <div className="fl-abroad">
          <Head kicker="STUDY ABROAD" title="Plan your study abroad" body={`${counsellorById(flow.sessions[0].slot.counsellor).name} opened this for you. Start with All Programs or the AI match.`} />
          <div className="fl-tabs" role="tablist" data-guide="abroad-tabs">{abroadNav.map((n) => <button key={n.id} role="tab" aria-selected={abroadPage === n.id} onClick={() => { setAbroadPage(n.id); setAbroadKey((k) => k + 1); }}>{n.label}</button>)}</div>
          <StudyAbroadSection active page={abroadPage} setPage={setAbroadPage} navKey={abroadKey} selected={selected} setSelected={setSelected} account={{ name: account!.name, email: account!.email }} onConsult={() => go("sessions")} />
        </div>}
        {page === "sessions" && <Sessions />}
        {page === "profile" && <ProfilePage />}
    </>;
  }
  const extras = <>
    {welcome && <Unlocked onClose={() => setWelcome(false)} onTasks={() => { setWelcome(false); go("tasks"); }} />}
    <DemoPanel />
  </>;
  if (layout === "top") return <div className="fl fl-app-top">
    <header className="ft-head">
      <button className="ft-logo" onClick={() => go("home")} aria-label="Home"><Image src="/careerhub-logo.png" width={70} height={48} alt="BRAC Career Hub" /></button>
      <nav className="ft-nav" aria-label="Career Hub">{topItems.map((n, k) => <button key={n.id} style={{ ["--d" as string]: `${k * 0.08}s` }} className={page === n.id ? "is-on" : ""} aria-current={page === n.id ? "page" : undefined} onClick={() => go(n.id)}>
        <I n={n.icon} s={18} /><span>{short[n.id] ?? n.label}</span>{!!n.count && <em>{n.count}</em>}</button>)}</nav>
      <div className="ft-end">
        {upcoming ? <button className="fl-chip ft-session" onClick={() => go("sessions")}><I n="calendar" s={16} /><span>{dayLabel(upcoming.slot.date)}, {time12(upcoming.slot.time)}</span></button>
          : <button className="fl-chip is-cta ft-session" onClick={() => go("sessions")}><I n="calendar" s={16} /><span>Book follow-up</span></button>}
        <Bell onGo={go} />
        <div className="ft-me">
          <button className="ft-me-btn" aria-expanded={me} aria-label="Your account" onClick={() => setMe((m) => !m)}>{account?.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</button>
          {me && <div className="ft-me-menu" onMouseLeave={() => setMe(false)}>
            <div className="ft-me-who"><strong>{account?.name}</strong><small>{account?.email}</small></div>
            <button onClick={() => { setMe(false); go("profile"); }}><I n="user" s={17} /> My profile & answers</button>
            <button onClick={() => { setMe(false); go("sessions"); }}><I n="chat" s={17} /> Counselling sessions</button>
            <button onClick={() => { setMe(false); exit(); }}><I n="back" s={17} /> Back to home page</button>
          </div>}
        </div>
      </div>
    </header>
    {content}
    {extras}
  </div>;

  return <div className="fl fl-app">
    <aside className="fl-side">{side}</aside>
    {menu && <div className="fl-drawer" role="dialog" aria-modal="true" aria-label="Menu"><div className="fl-drawer-in"><button className="fl-icon-btn fl-drawer-x" aria-label="Close menu" onClick={() => setMenu(false)}><I n="x" /></button>{side}</div><button className="fl-drawer-scrim" aria-label="Close menu" onClick={() => setMenu(false)} /></div>}
    <div className="fl-app-main">
      <header className="fl-top">
        <button className="fl-btn ghost fl-menu-btn" onClick={() => setMenu(true)}><I n="menu" /> Menu</button>
        <div className="fl-top-session">{upcoming ? <button data-guide="session-chip" className="fl-chip" onClick={() => go("sessions")}><I n="calendar" s={16} /> Next session: {dayLabel(upcoming.slot.date)}, {time12(upcoming.slot.time)}</button>
          : <button data-guide="session-chip" className="fl-chip is-cta" onClick={() => go("sessions")}><I n="calendar" s={16} /> Book a follow-up session</button>}</div>
        <div data-guide="bell"><Bell onGo={go} /></div>
      </header>
      {content}
    </div>
    {extras}
    {guide && <PlaneGuide page={page} go={go} />}
  </div>;
}

function Head({ kicker, title, body, children }: { kicker: string; title: string; body?: string; children?: ReactNode }) {
  return <header className="fl-head"><div><span className="fl-kicker">{kicker}</span><h1>{title}</h1>{body && <p>{body}</p>}</div>{children}</header>;
}

/* ---------- First open: show what the counsellor unlocked ---------- */
function Unlocked({ onClose, onTasks }: { onClose: () => void; onTasks: () => void }) {
  const { unlocked, tasks, sessions } = useFlow();
  const done = sessions.find((s) => s.status === "completed");
  if (!done || sessions.filter((s) => s.status === "completed").length > 1 || sessions.some((s) => s.id === "s-old1")) return null;
  const c = counsellorById(done.slot.counsellor);
  const items = [{ icon: "tasks", label: `${tasks.length} tasks to start with` },
    ...(unlocked ?? []).map((u) => ({ icon: { courses: "book", jobs: "briefcase", cv: "doc", abroad: "globe" }[u], label: { courses: "Courses picked for you", jobs: "Jobs & internships", cv: "CV Studio", abroad: "Study Abroad" }[u] })),
    { icon: "notes", label: "Notes from your session" }];
  return <Dialog title="Your Career Hub is open" onClose={onClose}>
    <div className="fl-unlocked">
      <Avatar c={c} size={64} />
      <p><b>{c.name}</b> finished your session and set up your hub. Here’s what you can use now:</p>
      <ul>{items.map((x, k) => <li key={x.label} style={{ ["--d" as string]: `${0.15 + k * 0.12}s` }}><I n={x.icon} s={18} />{x.label}</li>)}</ul>
      <button className="fl-btn fl-primary wide" onClick={onTasks}>Show me my tasks →</button>
    </div>
  </Dialog>;
}

/* ---------- Home ---------- */
function Home({ go, accent }: { go: (p: string) => void; accent?: ReactNode }) {
  const { account, tasks, sessions, upcoming, courses } = useFlow();
  const last = [...sessions].reverse().find((s) => s.status === "completed");
  const c = last ? counsellorById(last.slot.counsellor) : counsellors[0];
  const next = tasks.find((t) => !t.done);
  const done = tasks.filter((t) => t.done).length;
  return <>
    <Head kicker="HOME" title={`Hi ${account?.name.split(" ")[0]}, here’s what to do next`} body="Your counsellor chose these steps for you. Do them in order, at your own pace." />
    {accent}
    <div className="fl-home">
      <section className="fl-card fl-next" data-guide="next-card">
        <span className="fl-kicker">START HERE</span>
        {next ? <><h2>{next.title}</h2><p>{next.detail}</p>
          <div className="fl-row"><button className="fl-btn fl-primary" onClick={() => go(next.link ?? "tasks")}>{next.link ? "Open it" : "See the task"} <I n="arrow" s={17} /></button><span className="fl-muted">About {next.effort} · due in {next.due} days</span></div></>
          : <><h2>All tasks done. Well done!</h2><p>Book a follow-up so your counsellor can set your next steps.</p><button className="fl-btn fl-primary" onClick={() => go("sessions")}>Book a follow-up</button></>}
        <div className="fl-progress"><span style={{ width: `${(done / Math.max(1, tasks.length)) * 100}%` }} /></div>
        <small>{done} of {tasks.length} tasks done · <button className="fl-link" onClick={() => go("tasks")}>See all tasks</button></small>
      </section>
      <section className="fl-card fl-side-card">
        <span className="fl-kicker">YOUR COUNSELLOR</span>
        <div className="fl-who"><Avatar c={c} /><div><strong>{c.name}</strong><small>{c.title}</small></div></div>
        {upcoming ? <div className="fl-next-session"><I n="calendar" s={18} /><div><strong>{sessionLine(upcoming.slot)}</strong><small>Link comes by email and SMS</small></div></div>
          : <p className="fl-muted">No session booked.</p>}
        <button className="fl-btn wide" onClick={() => go("sessions")}>{upcoming ? "Manage session" : `Book again with ${c.name.split(" ")[0]}`}</button>
      </section>
      {last?.minutes && <section className="fl-card fl-minutes-card">
        <span className="fl-kicker">FROM YOUR LAST SESSION · {longDate(last.slot.date).toUpperCase()}</span>
        <p>{last.minutes.summary}</p>
        <button className="fl-link" onClick={() => go("sessions")}>Read the full notes →</button>
      </section>}
      {Object.keys(courses).length > 0 && <section className="fl-card fl-mini-list">
        <span className="fl-kicker">YOUR COURSES</span>
        {assignedCourses.map((x) => <button key={x.id} onClick={() => go("courses")}><img src={x.image} width={56} height={40} alt="" /><span><strong>{x.title}</strong><small>{courses[x.id] === "started" ? "In progress" : courses[x.id] === "done" ? "Finished" : "Not started"}</small></span></button>)}
      </section>}
    </div>
  </>;
}

/* ---------- Tasks ---------- */
function Tasks({ go, has }: { go: (p: string) => void; has: (id: "courses" | "jobs" | "cv" | "abroad") => boolean }) {
  const { tasks, dispatch, sessions } = useFlow();
  const c = counsellorById(sessions.find((s) => s.status === "completed")!.slot.counsellor);
  const linkLabel = { courses: "Open courses", jobs: "Open jobs", cv: "Open CV Studio", abroad: "Open Study Abroad", profile: "Open profile" };
  return <>
    <Head kicker="MY TASKS" title="Tasks from your counsellor" body={`${c.name} set these after your session. Tick each one when it’s done, they’ll see your progress.`} />
    <ol className="fl-tasks">{tasks.map((t, k) => <li key={t.id} data-guide={"task-" + t.id} className={t.done ? "is-done" : ""}>
      <button className="fl-check" role="checkbox" aria-checked={!!t.done} aria-label={`Mark “${t.title}” as ${t.done ? "not done" : "done"}`} onClick={() => dispatch({ type: "task", id: t.id })}>{t.done ? <I n="check" s={16} /> : k + 1}</button>
      <div><h3>{t.title}</h3><p>{t.detail}</p>
        <div className="fl-task-meta"><span><I n="clock" s={14} /> {t.effort}</span><span>Due in {t.due} days</span><span className="fl-from"><Avatar c={c} size={20} /> From {c.name.split(" ")[0]}</span></div></div>
      {t.link && t.link !== "profile" && has(t.link) && <button data-guide={"task-go-" + t.id} className="fl-btn" onClick={() => go(t.link!)}>{linkLabel[t.link]}</button>}
    </li>)}</ol>
  </>;
}

/* ---------- Courses and jobs ---------- */
function Courses() {
  const { courses, dispatch } = useFlow();
  const label = { new: "Not started", started: "In progress", done: "Finished" };
  return <>
    <Head kicker="COURSES" title="Courses picked for you" body="Your counsellor chose these from what you told them. Start with the first one." />
    <div className="fl-grid">{assignedCourses.map((x, k) => <article key={x.id} className="fl-item">
      <div className="fl-item-img"><img src={x.image} alt="" />{k === 0 && <span className="fl-badge">Start here</span>}</div>
      <div className="fl-item-body"><small>{x.provider}</small><h3>{x.title}</h3><p className="fl-quote">“{x.note}”</p><small>{x.mode}</small>
        <label className="fl-field inline" data-guide={k === 0 ? "course-status" : undefined}><span>Status</span><select value={courses[x.id] ?? "new"} onChange={(e) => dispatch({ type: "course", id: x.id, status: e.target.value as "new" })}>{Object.entries(label).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      </div></article>)}</div>
  </>;
}
function Jobs() {
  const { savedJobs, dispatch } = useFlow();
  return <>
    <Head kicker="JOBS & INTERNSHIPS" title="Openings your counsellor recommends" body="Save the ones you like. Applying happens on the employer’s website." />
    <div className="fl-grid">{assignedJobs.map((x, k) => { const saved = savedJobs.includes(x.id); return <article key={x.id} className="fl-item">
      <div className="fl-item-img"><img src={x.image} alt="" /></div>
      <div className="fl-item-body"><small>{x.org}</small><h3>{x.title}</h3><small>{x.meta}</small><p className="fl-quote">“{x.note}”</p>
        <div className="fl-row"><button data-guide={k === 0 ? "job-save" : undefined} className={"fl-btn" + (saved ? " is-saved" : "")} aria-pressed={saved} onClick={() => dispatch({ type: "job", id: x.id })}>{saved ? <><I n="check" s={16} /> Saved</> : "Save"}</button>
          <a className="fl-btn ghost" href="https://www.bdjobs.com" target="_blank" rel="noreferrer">How to apply <I n="external" s={15} /></a></div>
      </div></article>; })}</div>
  </>;
}

/* ---------- Sessions: upcoming, book another, history and notes ---------- */
export function BookDialog({ onClose, preset }: { onClose: () => void; preset?: string }) {
  const { dispatch } = useFlow();
  const [who, setWho] = useState(preset ?? "");
  const [slot, setSlot] = useState<Slot | null>(null);
  return <Dialog title={who ? `Book with ${counsellorById(who).name}` : "Book a session"} wide onClose={onClose}>
    {!who ? <div className="fl-counsellors">{counsellors.map((c) => <CounsellorCard key={c.id} c={c} onSelect={() => setWho(c.id)} />)}</div>
      : <><SlotPicker counsellor={who} value={slot} onChange={setSlot} />
        <div className="fl-dialog-actions">{!preset && <button className="fl-btn ghost" onClick={() => { setWho(""); setSlot(null); }}><I n="back" s={16} /> Other counsellors</button>}
          <button className="fl-btn fl-primary" disabled={!slot} onClick={() => { dispatch({ type: "book", slot: slot! }); onClose(); }}>{slot ? `Book ${dayLabel(slot.date)}, ${time12(slot.time)}` : "Pick a time"}</button></div></>}
  </Dialog>;
}
export function Sessions() {
  const { sessions, upcoming, account } = useFlow();
  const [booking, setBooking] = useState<null | { preset?: string }>(null);
  const [openId, setOpenId] = useState<string | null>(sessions.filter((s) => s.status === "completed").at(-1)?.id ?? null);
  const past = sessions.filter((s) => s.status !== "upcoming").reverse();
  const last = past.find((s) => s.status === "completed");
  return <>
    <Head kicker="COUNSELLING" title="Your sessions">
      <button className="fl-btn fl-primary" disabled={!!upcoming} onClick={() => setBooking({})}><I n="calendar" s={17} /> Book a session</button>
    </Head>
    {upcoming ? <UpcomingCard s={upcoming} email={account!.email} phone={account!.phone} />
      : <div className="fl-card fl-empty-upcoming"><div><h2>No session booked</h2><p>Book a follow-up when you’ve worked through your tasks, or any time you’re stuck.</p></div>
        {last && <button className="fl-btn fl-primary" onClick={() => setBooking({ preset: last.slot.counsellor })}>Book again with {counsellorById(last.slot.counsellor).name.split(" ")[0]}</button>}</div>}
    {upcoming && <p className="fl-fine fl-one-at-a-time"><I n="info" s={15} /> You can have one session booked at a time. To book another, change or cancel this one first.</p>}
    <h2 className="fl-section">Past sessions</h2>
    {past.length === 0 ? <p className="fl-muted">Nothing here yet.</p> : <ul className="fl-history">{past.map((s) => {
      const c = counsellorById(s.slot.counsellor);
      return <li key={s.id} className={"is-" + s.status}>
        <div className="fl-history-row">
          <Avatar c={c} size={40} />
          <div><strong>{s.status === "completed" ? `Session ${s.number} with ${c.name}` : `Cancelled session with ${c.name}`}</strong><small>{slotLabel(s.slot)}{s.reason ? ` · ${s.reason}` : ""}</small></div>
          <span className={"fl-status s-" + s.status}>{s.status === "completed" ? "Completed" : "Cancelled"}</span>
          {s.minutes && <button data-guide="notes" className="fl-btn ghost" aria-expanded={openId === s.id} onClick={() => setOpenId(openId === s.id ? null : s.id)}><I n="notes" s={16} /> {openId === s.id ? "Hide notes" : "Session notes"}</button>}
          <button className="fl-btn ghost" disabled={!!upcoming} title={upcoming ? "You already have a session booked" : undefined} onClick={() => setBooking({ preset: c.id })}>Book again</button>
        </div>
        {s.minutes && openId === s.id && <div className="fl-minutes">
          <p>{s.minutes.summary}</p>
          <div><h3>What we talked about</h3><ul>{s.minutes.discussed.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h3>What we agreed</h3><ul className="is-agreed">{s.minutes.agreed.map((x) => <li key={x}><I n="check" s={14} />{x}</li>)}</ul></div>
          <small>Notes written by {c.name}</small>
        </div>}
      </li>; })}</ul>}
    {booking && <BookDialog preset={booking.preset} onClose={() => setBooking(null)} />}
  </>;
}
export function UpcomingCard({ s, email, phone, title = "Your next session" }: { s: Session; email: string; phone: string; title?: string }) {
  const c = counsellorById(s.slot.counsellor);
  return <section className="fl-card fl-upcoming">
    <div className="fl-upcoming-head">
      <div className="fl-date-tile"><small>{longDate(s.slot.date).split(",")[0].slice(0, 3)}</small><b>{longDate(s.slot.date).split(" ")[1]}</b><small>{longDate(s.slot.date).split(" ")[2]}</small></div>
      <div><span className="fl-kicker">{title.toUpperCase()}</span><h2>{dayLabel(s.slot.date)} at {time12(s.slot.time)}</h2><p>30 minutes with <b>{c.name}</b>, online</p></div>
      <Avatar c={c} size={52} />
    </div>
    <JoinSteps email={email} phone={phone} />
    <ChangeSession />
  </section>;
}

/* ---------- Profile and questionnaire answers ---------- */
export function ProfilePage() {
  const { account, answers, dispatch } = useFlow();
  const [form, setForm] = useState<Account>(account!);
  const [a, setA] = useState<Answers>(answers);
  const [saved, setSaved] = useState<"" | "profile" | "answers">("");
  useEffect(() => { if (saved) { const t = setTimeout(() => setSaved(""), 2600); return () => clearTimeout(t); } }, [saved]);
  const field = (k: keyof Account, label: string, type = "text") => <label className="fl-field"><span>{label}</span><input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>;
  return <>
    <Head kicker="MY PROFILE" title="Your details and answers" body="Keep these up to date. Your counsellor sees the latest version before each session." />
    <section className="fl-card fl-form-card">
      <h2>Your details</h2>
      <div className="fl-form-grid">{field("name", "Full name")}{field("email", "Email (for meeting links)", "email")}{field("phone", "Mobile number (for SMS)", "tel")}{field("university", "University")}{field("subject", "Subject")}</div>
      <div className="fl-row"><button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "account", account: form }); setSaved("profile"); }}>Save details</button>{saved === "profile" && <span className="fl-saved" role="status"><I n="check" s={16} /> Saved</span>}</div>
    </section>
    <section className="fl-card fl-form-card" data-guide="answers">
      <h2>Your answers</h2><p className="fl-muted">Things change. Update any answer and your counsellor will be told.</p>
      {(["now", "next"] as const).map((part) => <div key={part} className="fl-q-part"><h3>{part === "now" ? "About you right now" : "Looking ahead"}</h3>
        {questions.filter((q) => q.part === part).map((q) => <div key={q.id} className="fl-q"><strong>{q.prompt}</strong>{q.help && <small>{q.help}</small>}<Answer q={q} answers={a} onChange={setA} /></div>)}</div>)}
      <div className="fl-row"><button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "answers", answers: a, done: true }); setSaved("answers"); }}>Save answers</button>{saved === "answers" && <span className="fl-saved" role="status"><I n="check" s={16} /> Saved. Your counsellor will see the update.</span>}</div>
    </section>
  </>;
}

export const firstOpen = (id: string) => nextOpen(id);
