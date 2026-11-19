"use client";
// v7 home: every part of Career Hub is a tile. Tap a tile to go in; there is no menu.
// Each tile shows a glimpse of what's inside, so the home page answers "what's waiting for me?"
import { assignedCourses, assignedJobs, counsellorById, dayLabel, longDate, shortDate, time12 } from "./data";
import { useFlow } from "./store";
import { Avatar, I } from "./parts";

type Go = (p: string) => void;
type Section = "courses" | "jobs" | "cv" | "abroad";

export function BentoHome({ go }: { go: Go }) {
  const { account, tasks, sessions, upcoming, courses, savedJobs, unlocked = [], answers } = useFlow();
  const has = (id: Section) => (unlocked ?? []).includes(id);
  const last = [...sessions].reverse().find((s) => s.status === "completed");
  const c = counsellorById((upcoming ?? last ?? sessions[0]).slot.counsellor);
  const open = tasks.filter((t) => !t.done);
  const done = tasks.length - open.length;
  const started = Object.values(courses).filter((v) => v === "started").length;
  const finished = Object.values(courses).filter((v) => v === "done").length;
  const answered = Object.keys(answers).length;

  const locked = (id: Section, label: string, icon: string) => <div className={"bt bt-" + id + " is-locked"} aria-label={`${label}, not opened yet`}>
    <span className="bt-label"><I n={icon} s={20} />{label}</span>
    <p><I n="lock" s={16} /> {c.name.split(" ")[0]} opens this when it will help you.</p>
  </div>;

  return <div className="bt-home">
    <header className="bt-hi">
      <h1>Hi {account?.name.split(" ")[0]}</h1>
      <p>Tap any box to open it. Start with your tasks.</p>
    </header>

    <div className="bt-grid">
      {/* Tasks: the biggest tile, because it is where the student should start. */}
      <button className="bt bt-tasks" onClick={() => go("tasks")} style={{ ["--d" as string]: "0s" }}>
        <span className="bt-label"><I n="tasks" s={20} />My tasks</span>
        <strong className="bt-big">{done} of {tasks.length} done</strong>
        <span className="bt-bar"><i style={{ width: `${(done / Math.max(1, tasks.length)) * 100}%` }} /></span>
        <ul className="bt-tasklist">{tasks.slice(0, 4).map((t) => <li key={t.id} className={t.done ? "is-done" : ""}><span>{t.done && <I n="check" s={13} />}</span>{t.title}</li>)}</ul>
        <span className="bt-go">Open my tasks <I n="arrow" s={18} /></span>
      </button>

      <button className="bt bt-sessions" onClick={() => go("sessions")} style={{ ["--d" as string]: ".06s" }}>
        <span className="bt-label"><I n="chat" s={20} />Sessions with {c.name.split(" ")[0]}</span>
        <span className="bt-who"><Avatar c={c} size={64} /><span>
          {upcoming ? <><small>Next session</small><b>{dayLabel(upcoming.slot.date)}, {shortDate(upcoming.slot.date)} · {time12(upcoming.slot.time)}</b></>
            : <><small>No session booked</small><b>Book a follow-up</b></>}
        </span></span>
        {last?.minutes && <span className="bt-sub">Notes from {longDate(last.slot.date)} are inside</span>}
      </button>

      {has("courses") ? <button className="bt bt-courses" onClick={() => go("courses")} style={{ ["--d" as string]: ".12s" }}>
        <span className="bt-label"><I n="book" s={20} />Courses</span>
        <span className="bt-thumbs">{assignedCourses.map((x) => <img key={x.id} src={x.image} alt="" />)}</span>
        <strong className="bt-mid">{assignedCourses.length} picked for you</strong>
        <span className="bt-sub">{started ? `${started} in progress` : "Not started yet"}{finished ? ` · ${finished} finished` : ""}</span>
      </button> : locked("courses", "Courses", "book")}

      {has("jobs") ? <button className="bt bt-jobs" onClick={() => go("jobs")} style={{ ["--d" as string]: ".18s" }}>
        <span className="bt-label"><I n="briefcase" s={20} />Jobs & internships</span>
        <span className="bt-orgs">{assignedJobs.map((j) => <span key={j.id}><b>{j.title}</b>{j.org}</span>)}</span>
        <span className="bt-sub">{savedJobs.length ? `${savedJobs.length} saved` : `${assignedJobs.length} openings picked for you`}</span>
      </button> : locked("jobs", "Jobs & internships", "briefcase")}

      {has("cv") ? <button className="bt bt-cv" onClick={() => go("cv")} style={{ ["--d" as string]: ".24s" }}>
        <span className="bt-label"><I n="doc" s={20} />CV Studio</span>
        <span className="bt-paper" aria-hidden="true"><b>{account?.name}</b><i /><i /><i className="s" /><i /><i className="s" /></span>
        <span className="bt-sub">Your details are filled in</span>
      </button> : locked("cv", "CV Studio", "doc")}

      {has("abroad") ? <button className="bt bt-abroad" onClick={() => go("abroad")} style={{ ["--d" as string]: ".3s" }}>
        <span className="bt-label"><I n="globe" s={20} />Study Abroad</span>
        <strong className="bt-mid">Programs, documents and applications</strong>
      </button> : locked("abroad", "Study Abroad", "globe")}

      <button className="bt bt-profile" onClick={() => go("profile")} style={{ ["--d" as string]: ".36s" }}>
        <span className="bt-label"><I n="user" s={20} />My profile & answers</span>
        <span className="bt-sub">{account?.university} · {answered} answers shared with {c.name.split(" ")[0]}</span>
      </button>
    </div>
  </div>;
}

/* Inside a section: one clear way back to the tiles. */
export function BackBar({ title, go }: { title: string; go: Go }) {
  return <nav className="bt-back" aria-label="Breadcrumb">
    <button className="fl-btn" onClick={() => go("home")}><I n="back" s={18} /> All sections</button>
    <span>{title}</span>
  </nav>;
}
