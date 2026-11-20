"use client";
// v11 sections behind the sidebar. Tasks are a plain to-do list (Todoist / Notion style):
// tick, add, done. No buttons inside tasks, no links out.
import { useRef, useState, type ReactNode } from "react";
import { CVStudio } from "../../career/cv-studio";
import { StudyAbroadSection, abroadNav, initialSelection, type AbroadPage } from "../../hub-v3/abroad";
import { assignedCourses, assignedJobs, counsellorById } from "../data";
import { Avatar } from "../parts";
import { type Answers, cf, courseMore, courseText, jobMore, jobText, questions, type Task } from "./content";
import { AppIcon, Ico } from "./icons";
import { num, useL } from "./lang";
import { AnswerInput } from "./pre";
import { useHub, type Account } from "./store";
import { Due, animate, flip } from "./home";

export function PageHead({ icon, title, body, children }: { icon: string; title: string; body?: string; children?: ReactNode }) {
  return <header className="v11-page-head"><AppIcon n={icon} s={48} /><div><h1>{title}</h1>{body && <p>{body}</p>}</div>{children}</header>;
}

/* ---------- Tasks ---------- */
export function Tasks() {
  const { tasks, dispatch, sessions } = useHub();
  const { t, lang } = useL();
  const [text, setText] = useState("");
  const [showDone, setShowDone] = useState(true);
  // Ticking: the circle fills first, then the task slides to its new group and flashes there.
  const [ticking, setTicking] = useState<string | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const toggle = (id: string) => {
    if (ticking) return;
    setTicking(id);
    setTimeout(() => animate(() => { dispatch({ type: "task", id }); setTicking(null); setLanded(id); }, () => {
      document.querySelector(`[data-task="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setTimeout(() => setLanded((x) => (x === id ? null : x)), 1600);
    }), 380);
  };
  const from = sessions.find((s) => s.status === "completed");
  const c = from ? counsellorById(from.slot.counsellor) : null;
  const open = tasks.filter((x) => !x.done).sort((a, b) => a.due - b.due);
  const done = tasks.filter((x) => x.done);
  const groups: [string, Task[]][] = [
    [t("আজ ও আগের", "Today and overdue"), open.filter((x) => x.due <= 0)],
    [t("এই সপ্তাহে", "This week"), open.filter((x) => x.due > 0 && x.due <= 7)],
    [t("পরে", "Later"), open.filter((x) => x.due > 7)],
  ];
  const add = () => { const v = text.trim(); if (v) { dispatch({ type: "addTask", title: v }); setText(""); } };
  return <div className="v11-page v11-tasks">
    <PageHead icon="tasks" title={t("কাজের তালিকা", "Tasks")} body={t(`${num(open.length, "bn")}টি বাকি · ${num(done.length, "bn")}টি শেষ`, `${open.length} to do · ${done.length} done`)} />
    <form className="v11-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
      <span className="v11-add-plus"><Ico n="plus" s={16} w="bold" /></span>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("কাজ যোগ করুন… (Enter চাপুন)", "Add a task… (press Enter)")} aria-label={t("নতুন কাজ", "New task")} />
    </form>
    {groups.map(([label, list]) => list.length > 0 && <section key={label} className="v11-group">
      <h2>{label}<small>{num(list.length, lang)}</small></h2>
      <ul>{list.map((x) => <TaskRow key={x.id} task={x} by={x.mine ? null : c} ticking={ticking === x.id} landed={landed === x.id} onToggle={() => toggle(x.id)} />)}</ul>
    </section>)}
    {open.length === 0 && <p className="v11-empty"><Ico n="done" s={28} w="fill" c="#17845f" />{t("সব কাজ শেষ। দারুণ!", "Everything’s done. Nice work!")}</p>}
    {done.length > 0 && <section className="v11-group is-done">
      <button className="v11-group-toggle" aria-expanded={showDone} onClick={() => setShowDone((v) => !v)}><Ico n={showDone ? "down" : "right"} s={14} w="bold" />{t("সম্পন্ন", "Completed")}<small>{num(done.length, lang)}</small></button>
      {showDone && <ul>{done.map((x) => <TaskRow key={x.id} task={x} by={x.mine ? null : c} ticking={ticking === x.id} landed={landed === x.id} onToggle={() => toggle(x.id)} />)}</ul>}
    </section>}
  </div>;
}
function TaskRow({ task, by, ticking, landed, onToggle }: { task: Task; by: ReturnType<typeof counsellorById> | null; ticking: boolean; landed: boolean; onToggle: () => void }) {
  const { dispatch } = useHub();
  const { t, lang } = useL();
  const tone = task.due < 0 ? "is-late" : task.due === 0 ? "is-today" : task.due <= 2 ? "is-soon" : "";
  return <li data-task={task.id} className={"v11-task" + (task.done ? " is-done" : "") + (ticking ? " is-ticking" : "") + (landed ? " is-landed" : "")} style={{ viewTransitionName: `task-${task.id}` }}>
    <button role="checkbox" aria-checked={ticking ? !task.done : !!task.done} aria-label={task.title[lang]} className={"v11-check " + tone} onClick={onToggle}><Ico n="check" s={12} w="bold" /></button>
    <div className="v11-task-body">
      <span className="v11-task-title">{task.title[lang]}</span>
      {task.note && !task.done && <span className="v11-task-note">{task.note[lang]}</span>}
      <span className="v11-task-meta"><Due task={task} />
        {by ? <span className="v11-task-by"><Avatar c={by} size={18} />{cf(by, lang)}</span> : <span className="v11-task-by is-mine">{t("আমার কাজ", "My task")}</span>}</span>
    </div>
    {task.mine && <button className="v11-task-del" aria-label={t("মুছুন", "Delete")} onClick={() => dispatch({ type: "removeTask", id: task.id })}><Ico n="trash" s={16} w="duotone" /></button>}
  </li>;
}

/* ---------- Courses and jobs: cards that open in place to show more ---------- */
function useOpenCard() {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState<string | null>(null);
  const toggle = (id: string) => {
    if (!box.current) return;
    flip(box.current, ":scope > [data-card]", "card", () => setOn((o) => (o === id ? null : id)), () =>
      box.current?.querySelector(`[data-card="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };
  return { box, on, toggle };
}
function Card({ id, open, onToggle, image, top, title, why, meta, children, more }: { id: string; open: boolean; onToggle: () => void; image: string; top: string; title: string; why: string; meta: string; children?: ReactNode; more: ReactNode }) {
  const { t } = useL();
  return <article data-card={id} className={"v11-card is-click" + (open ? " is-open" : "")}>
    {!open && <button className="v11-card-hit" tabIndex={-1} aria-hidden="true" onClick={onToggle} />}
    <img src={image} alt="" />
    <div>
      <small>{top}</small>
      <h3>{title}</h3>
      <p className="v11-why">“{why}”</p>
      <p>{meta}</p>
      {open && <div className="v11-card-more">{more}</div>}
      <div className="v11-card-foot">{children}
        <button className="v11-card-toggle" aria-expanded={open} onClick={onToggle}>{open ? t("কম দেখুন", "Show less") : t("বিস্তারিত দেখুন", "See details")}<Ico n="down" s={14} w="bold" /></button></div>
    </div>
  </article>;
}

export function Courses() {
  const { courses, dispatch } = useHub();
  const { t, lang } = useL();
  const { box, on, toggle } = useOpenCard();
  return <div className="v11-page">
    <PageHead icon="courses" title={t("আপনার কোর্স", "Your courses")} body={t("কাউন্সেলর আপনার কথা শুনে এগুলো বেছেছেন। প্রথমটা দিয়ে শুরু করুন।", "Your counsellor chose these from what you told them. Start with the first one.")} />
    <div className="v11-cards" ref={box}>{assignedCourses.map((x) => { const m = courseMore[x.id]; return <Card key={x.id} id={x.id} open={on === x.id} onToggle={() => toggle(x.id)}
      image={x.image} top={x.provider} title={x.title} why={courseText[x.id].why[lang]} meta={courseText[x.id].mode[lang]}
      more={<><p>{m.about[lang]}</p><h4>{t("যা শিখবেন", "What you’ll learn")}</h4>
        <ul className="v11-agreed">{m.learn.map((l) => <li key={l.en}><Ico n="done" s={18} w="fill" c="#17845f" />{l[lang]}</li>)}</ul>
        <p className="v11-card-note"><Ico n="grad" s={18} w="duotone" />{m.extra[lang]}</p></>}>
      <label className="v11-select"><span>{t("অবস্থা", "Status")}</span><select value={courses[x.id] ?? "new"} onChange={(e) => dispatch({ type: "course", id: x.id, status: e.target.value as "new" })}>
        <option value="new">{t("শুরু হয়নি", "Not started")}</option><option value="started">{t("চলছে", "In progress")}</option><option value="done">{t("শেষ", "Finished")}</option></select></label>
    </Card>; })}</div>
  </div>;
}

export function Jobs() {
  const { t, lang } = useL();
  const { box, on, toggle } = useOpenCard();
  return <div className="v11-page">
    <PageHead icon="jobs" title={t("চাকরি ও ইন্টার্নশিপ", "Jobs & internships")} body={t("আপনার কাউন্সেলরের বাছাই করা সুযোগ। যেকোনোটিতে চাপ দিয়ে বিস্তারিত দেখুন।", "Openings your counsellor picked. Tap any one to read more.")} />
    <div className="v11-cards" ref={box}>{assignedJobs.map((x) => { const m = jobMore[x.id]; return <Card key={x.id} id={x.id} open={on === x.id} onToggle={() => toggle(x.id)}
      image={x.image} top={x.org} title={x.title} why={jobText[x.id].why[lang]} meta={jobText[x.id].meta[lang]}
      more={<><p>{m.about[lang]}</p><h4>{t("যা করবেন", "What you’ll do")}</h4>
        <ul className="v11-agreed">{m.does.map((l) => <li key={l.en}><Ico n="done" s={18} w="fill" c="#17845f" />{l[lang]}</li>)}</ul>
        <dl className="v11-card-facts"><div><dt>{t("যা লাগবে", "Looking for")}</dt><dd>{m.needs[lang]}</dd></div><div><dt>{t("আবেদনের শেষ দিন", "Apply by")}</dt><dd>{m.by[lang]}</dd></div></dl></>} />; })}</div>
  </div>;
}

/* ---------- CV and Study Abroad (existing tools, embedded) ---------- */
export function CV() {
  const { account } = useHub();
  const { t } = useL();
  return <div className="v11-page career-app fl-embed" lang="en">
    <PageHead icon="cv" title={t("সিভি স্টুডিও", "CV Studio")} body={t("আপনার তথ্য বসানো আছে। যা খুশি বদলান, তারপর এক পাতার খসড়া বানান।", "Your details are filled in. Edit anything, then generate a one-page draft.")} />
    <CVStudio language="en" profile={{ name: account!.name, email: account!.email, institution: account!.university, subject: account!.subject, qualification: "bachelor", situation: "student" }} seeded={false} onDraft={() => {}} />
  </div>;
}
export function Abroad({ onConsult }: { onConsult: () => void }) {
  const { account } = useHub();
  const { t } = useL();
  const [page, setPage] = useState<AbroadPage>("catalog");
  const [key, setKey] = useState(0);
  const [selected, setSelected] = useState(initialSelection);
  return <div className="v11-page fl-abroad">
    <PageHead icon="abroad" title={t("বিদেশে পড়াশোনা", "Study Abroad")} body={t("All Programs বা AI ম্যাচ দিয়ে শুরু করুন।", "Start with All Programs or the AI match.")} />
    <div className="fl-tabs" role="tablist">{abroadNav.map((n) => <button key={n.id} role="tab" aria-selected={page === n.id} onClick={() => { setPage(n.id); setKey((k) => k + 1); }}>{n.label}</button>)}</div>
    <StudyAbroadSection active page={page} setPage={setPage} navKey={key} selected={selected} setSelected={setSelected} account={{ name: account!.name, email: account!.email }} onConsult={onConsult} />
  </div>;
}

/* ---------- Profile and answers ---------- */
export function AnswersForm({ onSaved, compact }: { onSaved: () => void; compact?: boolean }) {
  const { answers, dispatch } = useHub();
  const { t, lang } = useL();
  const [a, setA] = useState<Answers>(answers);
  return <div className={"v11-answers-form" + (compact ? " is-compact" : "")}>
    {questions.map((q) => <div key={q.id} className="v11-q"><strong>{q.prompt[lang]}</strong>{q.help && <small>{q.help[lang]}</small>}<AnswerInput q={q} answers={a} onChange={setA} /></div>)}
    <div className="fl-row"><button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "answers", answers: a, done: true }); onSaved(); }}>{t("সেভ করুন", "Save answers")}</button></div>
  </div>;
}
export function Profile() {
  const { account, dispatch } = useHub();
  const { t } = useL();
  const [form, setForm] = useState<Account>(account!);
  const [saved, setSaved] = useState("");
  const field = (k: keyof Account, label: string, type = "text") => <label className="fl-field"><span>{label}</span><input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>;
  return <div className="v11-page">
    <PageHead icon="profile" title={t("প্রোফাইল ও উত্তর", "Profile & answers")} body={t("কিছু বদলালে এখানে আপডেট করুন। প্রতিটি সেশনের আগে কাউন্সেলর সর্বশেষটা দেখেন।", "Update anything that changed. Your counsellor sees the latest before each session.")} />
    <section className="fl-card v11-form-card">
      <h2>{t("আপনার উত্তর", "Your answers")}</h2>
      <AnswersForm onSaved={() => setSaved("answers")} />
      {saved === "answers" && <p className="fl-saved" role="status"><Ico n="done" s={18} w="fill" /> {t("সেভ হয়েছে। কাউন্সেলরকে জানানো হবে।", "Saved. Your counsellor will see it.")}</p>}
    </section>
    <section className="fl-card v11-form-card">
      <h2>{t("আপনার তথ্য", "Your details")}</h2>
      <div className="fl-form-grid">{field("name", t("পূর্ণ নাম", "Full name"))}{field("email", t("ইমেইল", "Email"), "email")}{field("phone", t("মোবাইল", "Mobile"), "tel")}{field("university", t("বিশ্ববিদ্যালয়", "University"))}{field("subject", t("বিষয়", "Subject"))}</div>
      <div className="fl-row"><button className="fl-btn fl-primary" onClick={() => { dispatch({ type: "account", account: form }); setSaved("details"); }}>{t("সেভ করুন", "Save details")}</button>
        {saved === "details" && <span className="fl-saved" role="status"><Ico n="done" s={18} w="fill" /> {t("সেভ হয়েছে", "Saved")}</span>}</div>
    </section>
  </div>;
}
