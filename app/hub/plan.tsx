"use client";
import { useState } from "react";
import Image from "next/image";
import { Icon } from "../student/ui";
import { dateAfter, statusLabels, text, type Copy, type Language, type Profile, type Status } from "../career/data";
import { cities, coursesFor, optionLabel, seminarsFor, todos, type HubPage, type Seminar } from "./data";

type Go = (page: HubPage, anchor?: string) => void;

function StatusSelect({ label, value, onChange, language }: { label: string; value: Status; onChange: (s: Status) => void; language: Language }) {
  return <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as Status)}>
    {Object.entries(statusLabels).map(([key, copy]) => <option key={key} value={key}>{text(language, copy)}</option>)}
  </select>;
}

function SeminarRow({ seminar: s, language, registered, onRegister, base }: { seminar: Seminar; language: Language; registered: boolean; onRegister: () => void; base: Date }) {
  const t = (copy: Copy) => text(language, copy);
  const locale = language === "en" ? "en-GB" : "bn-BD";
  const date = dateAfter(s.days, base);
  const part = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...options, timeZone: "Asia/Dhaka" }).format(date);
  const time = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date("2000-01-01T" + s.time + ":00Z"));
  const city = s.city ? optionLabel(cities, s.city) : undefined;
  return <article className="career-recommendation hub-seminar">
    <span className="hub-date-tile" aria-hidden="true"><small>{part({ month: "short" })}</small><strong>{part({ day: "numeric" })}</strong><small>{part({ weekday: "short" })}</small></span>
    <div>
      <span className="career-recommendation-provider">{s.host}</span>
      <h3>{t(s.title)}</h3>
      <p>{t(s.summary)}</p>
      <small className="hub-seminar-meta"><span className={"hub-format" + (s.city ? "" : " is-online")}>{s.city ? t(["In person", "সরাসরি"]) : t(["Online", "অনলাইন"])}</span>{part({ weekday: "long", day: "numeric", month: "long" })} · {time}{s.venue && city ? <> · {t(s.venue)}, {t(city)}</> : null}</small>
    </div>
    <div className="career-recommendation-actions">
      {registered
        ? <><span className="hub-registered">✓ {t(["Registered", "নিবন্ধিত"])}</span><button className="career-link" onClick={onRegister}>{t(["Cancel registration", "নিবন্ধন বাতিল"])}</button></>
        : <><button className="career-button" onClick={onRegister}>{t(["Register", "নিবন্ধন করুন"])}</button><small className="hub-seats">{s.seats} {t(["seats", "আসন"])}</small></>}
    </div>
  </article>;
}

export function ActionPlan({ language, profile, statuses, onStatus, go, registered, onRegister, abroadIsNew }: {
  language: Language; profile: Profile; statuses: Record<string, Status>; onStatus: (id: string, s: Status) => void; go: Go;
  registered: string[]; onRegister: (id: string) => void; abroadIsNew: boolean;
}) {
  const t = (copy: Copy) => text(language, copy);
  const [filter, setFilter] = useState("all");
  const [courseStatuses, setCourseStatuses] = useState<Record<string, Status>>({});
  const [base] = useState(() => new Date());
  const done = todos.filter((todo) => statuses[todo.id] === "done").length;
  const visible = todos.filter((todo) => filter === "all" || statuses[todo.id] === filter);
  const courseList = coursesFor(profile);
  const events = seminarsFor(profile);
  const city = optionLabel(cities, profile.location);
  const linkLabel = (link: string): Copy => link === "cv" ? ["Open CV Studio", "সিভি স্টুডিও খুলুন"] : link === "counselling" ? ["Book a session", "সেশন বুক করুন"] : link === "seminars" ? ["See seminars", "সেমিনার দেখুন"] : ["See courses", "কোর্স দেখুন"];
  const follow = (link: string) => link === "seminars" ? go("plan", "hub-seminars") : link === "courses" ? go("plan", "hub-courses") : go(link === "counselling" ? "overview" : link as HubPage);

  return <>
    <header className="career-heading career-plan-heading"><div><h1>{t(["Career Action Plan", "ক্যারিয়ার কর্মপরিকল্পনা"])}</h1><p>{t(["A few practical steps most students take, plus courses and seminars picked for your city.", "বেশিরভাগ শিক্ষার্থী যে বাস্তব পদক্ষেপগুলো নেন, সঙ্গে আপনার শহরের কোর্স ও সেমিনার।"])}</p></div>
      <nav className="hub-jump" aria-label={t(["On this page", "এই পেজে"])}><a href="#hub-courses">{t(["Courses", "কোর্স"])} ↓</a><a href="#hub-seminars">{t(["Seminars", "সেমিনার"])} ↓</a></nav></header>
    {abroadIsNew && <div className="hub-unlock" role="status">
      <span className="hub-unlock-icon"><Icon name="globe" /></span>
      <div><strong>{t(["Study Abroad is now open", "বিদেশে পড়াশোনা এখন খোলা"])}</strong><p>{t(["Nice progress. You can now explore universities and prepare applications from the sidebar.", "ভালো অগ্রগতি। এখন সাইডবার থেকে বিশ্ববিদ্যালয় দেখতে ও আবেদন প্রস্তুত করতে পারবেন।"])}</p></div>
      <button className="career-button" onClick={() => go("abroad")}>{t(["Explore", "দেখুন"])} →</button>
    </div>}
    <div className="career-plan-progress"><div><strong>{done} / {todos.length} {t(["completed", "সম্পন্ন"])}</strong><span>{t(["Mark a step complete when you've done it.", "কাজ শেষ হলে সম্পন্ন চিহ্নিত করুন।"])}</span></div><progress max={todos.length} value={done} aria-label={t(["Action plan progress", "কর্মপরিকল্পনার অগ্রগতি"])} /></div>
    <div className="career-tabs" role="group" aria-label={t(["Filter steps", "কাজ বাছাই"])}>{["all", "todo", "doing", "done"].map((status) => <button key={status} aria-pressed={filter === status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{status === "all" ? t(["All steps", "সব কাজ"]) : t(statusLabels[status as Status])}</button>)}</div>
    <div className="career-task-list">{visible.map((todo) => <article key={todo.id} className={"career-task " + statuses[todo.id]}>
      <div className="career-task-marker" aria-hidden="true">{statuses[todo.id] === "done" ? "✓" : <span />}</div>
      <div className="career-task-body"><div className="career-task-heading"><div><div className="career-task-meta"><span>{t(todo.kind)}</span><span>{t(todo.effort)}</span></div>
        <h2>{t(todo.title)}</h2></div><StatusSelect label={t(todo.title) + " — " + t(["Status", "অবস্থা"])} value={statuses[todo.id]} onChange={(s) => onStatus(todo.id, s)} language={language} /></div>
        <p>{t(todo.why)}</p>
        <details><summary>{t(["How to do it", "কীভাবে করবেন"])}</summary><p>{t(todo.steps)}</p>
          {todo.link && <button className="career-button" onClick={() => follow(todo.link!)}>{t(linkLabel(todo.link))} →</button>}
        </details>
      </div>
    </article>)}</div>
    {!visible.length && <div className="career-empty"><h2>{t(["No steps in this view", "এই তালিকায় কোনো কাজ নেই"])}</h2><p>{t(["Change a step's status or view all steps.", "কাজের অবস্থা পরিবর্তন করুন বা সব কাজ দেখুন।"])}</p></div>}

    <section className="career-recommendations" id="hub-courses" aria-labelledby="hub-courses-title">
      <header><div><span className="career-kicker">{t(["LEARNING", "শেখা"])}</span><h2 id="hub-courses-title">{t(["Courses", "কোর্স"])}</h2><p>{t(["Online courses, plus classroom courses in", "অনলাইন কোর্স, সঙ্গে সরাসরি ক্লাস:"])} {city ? t(city) : t(["your city", "আপনার শহর"])}.</p></div><span>{courseList.length} {t(["courses", "কোর্স"])}</span></header>
      <div className="career-recommendation-list">{courseList.map((course) => <article className="career-recommendation" key={course.id}>
        <span className="career-recommendation-image"><Image src={`/career/course-${course.image}.webp`} alt="" width={144} height={108} sizes="(max-width: 600px) 96px, 144px" /></span>
        <div><span className="career-recommendation-provider">{course.provider}</span><h3>{t(course.title)}</h3><p>{t(course.reason)}</p>
          <small className="hub-seminar-meta"><span className={"hub-format" + (course.city ? "" : " is-online")}>{course.city ? t(["In person", "সরাসরি"]) : t(["Online", "অনলাইন"])}</span>{course.schedule ? t(course.schedule) : <>{t(["Try it:", "অনুশীলন করুন:"])} {t(course.outcome)}</>}</small></div>
        <div className="career-recommendation-actions"><StatusSelect label={t(course.title) + " — " + t(["Status", "অবস্থা"])} value={courseStatuses[course.id] ?? "todo"} onChange={(s) => setCourseStatuses((c) => ({ ...c, [course.id]: s }))} language={language} />
          {course.url ? <a href={course.url} target="_blank" rel="noopener noreferrer">{t(["View course", "কোর্স দেখুন"])} <span aria-hidden="true">↗</span></a> : <span className="hub-seats">{t(["Enrol at the centre", "কেন্দ্রে ভর্তি"])}</span>}</div>
      </article>)}</div>
    </section>

    <section className="career-recommendations" id="hub-seminars" aria-labelledby="hub-seminars-title">
      <header><div><span className="career-kicker">{t(["EVENTS", "ইভেন্ট"])}</span><h2 id="hub-seminars-title">{t(["Seminars", "সেমিনার"])}</h2><p>{t(["Upcoming seminars in", "আসন্ন সেমিনার:"])} {city ? t(city) : t(["your city", "আপনার শহর"])} {t(["and online.", "ও অনলাইনে।"])}</p></div><span>{events.near.length} {t(["seminars", "সেমিনার"])}</span></header>
      <div className="career-recommendation-list">{events.near.map((s) => <SeminarRow key={s.id} seminar={s} language={language} base={base} registered={registered.includes(s.id)} onRegister={() => onRegister(s.id)} />)}</div>
      {events.elsewhere.length > 0 && <details className="hub-elsewhere"><summary>{t(["Seminars in other cities", "অন্য শহরের সেমিনার"])} ({events.elsewhere.length})</summary>
        <div className="career-recommendation-list">{events.elsewhere.map((s) => <SeminarRow key={s.id} seminar={s} language={language} base={base} registered={registered.includes(s.id)} onRegister={() => onRegister(s.id)} />)}</div>
      </details>}
      <p className="career-recommendation-note">{t(["Sample events for the demo. Registration isn't sent anywhere.", "ডেমোর নমুনা ইভেন্ট। নিবন্ধন কোথাও পাঠানো হয় না।"])}</p>
    </section>
  </>;
}
