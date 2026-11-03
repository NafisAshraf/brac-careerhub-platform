"use client";
// v3: Career Hub with the full Study Abroad workspace as a second sidebar section.
// Study Abroad stays greyed out until enough Career Action Plan steps are complete.
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "../student/ui";
import { text, type Booking, type Language, type Profile, type Status } from "../career/data";
import { LanguageSwitch } from "../career/onboarding";
import { RecommendedJobs } from "../career/explore";
import { Counselling } from "../career/support";
import { CVStudio } from "../career/cv-studio";
import { initialTodoStatuses, sampleHubProfile, todos, unlockAfter, type HubPage } from "../hub/data";
import { HubProfile, Questionnaire } from "../hub/questionnaire";
import { Overview } from "../hub/overview";
import { ActionPlan } from "../hub/plan";
import { StudyAbroadSection, abroadNav, initialSelection, type AbroadPage } from "./abroad";
import { defaultSubject, roleForSubject } from "./subjects";
import "../career/career.css";
import "../hub/hub.css";
import "./hub.css";

type CareerPage = "overview" | "plan" | "jobs" | "cv" | "counselling" | "profile";
type Copy = readonly [string, string];
const careerNav: { id: CareerPage; title: Copy; icon: string }[] = [
  { id: "overview", title: ["Career Overview", "ক্যারিয়ার সারসংক্ষেপ"], icon: "catalog" },
  { id: "plan", title: ["Career Action Plan", "ক্যারিয়ার কর্মপরিকল্পনা"], icon: "steps" },
  { id: "jobs", title: ["Recommended Jobs", "প্রস্তাবিত চাকরি"], icon: "programs" },
  { id: "cv", title: ["CV Studio", "সিভি স্টুডিও"], icon: "documents" },
  { id: "counselling", title: ["Career Counselling", "ক্যারিয়ার কাউন্সেলিং"], icon: "tracker" },
];

export default function HubV3({ active, exit }: { active: boolean; exit: () => void }) {
  const [language, setLanguage] = useState<Language>("en");
  const [phase, setPhase] = useState<"welcome" | "questions" | "ready">("welcome");
  const [profile, setProfile] = useState<Profile>({ name: "", email: "" });
  const [area, setArea] = useState<"career" | "abroad">("career");
  const [page, setPage] = useState<CareerPage>("overview");
  const [abroadPage, setAbroadPage] = useState<AbroadPage>("catalog");
  const [abroadNavKey, setAbroadNavKey] = useState(0);
  const [selected, setSelected] = useState(initialSelection);
  const [statuses, setStatuses] = useState<Record<string, Status>>(initialTodoStatuses);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hasCV, setHasCV] = useState(false);
  const [registered, setRegistered] = useState<string[]>([]);
  // Unlocks once enough to-dos are done, and stays unlocked. "New" clears on the first visit.
  const [abroadUnlocked, setAbroadUnlocked] = useState(false);
  const [abroadSeen, setAbroadSeen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const t = (copy: Copy) => text(language, copy);

  useEffect(() => {
    if (active && phase === "ready") main.current?.focus({ preventScroll: true });
  }, [active, phase, page, area]);
  useEffect(() => {
    const dialog = menu.current;
    if (!dialog || !mobileOpen) return;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeFromBackdrop = (event: MouseEvent) => { if (event.target === dialog) setMobileOpen(false); };
    dialog.addEventListener("click", closeFromBackdrop);
    return () => { dialog.removeEventListener("click", closeFromBackdrop); dialog.close(); document.body.style.overflow = old; };
  }, [mobileOpen]);

  function go(destination: HubPage, anchor?: string) {
    setMobileOpen(false);
    if (destination === "abroad" || destination === "generate") return openAbroad("catalog");
    setArea("career");
    setPage(destination);
    if (anchor) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    else window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openAbroad(destination: AbroadPage) {
    if (!abroadUnlocked) return;
    setMobileOpen(false);
    setArea("abroad");
    setAbroadPage(destination);
    setAbroadNavKey((k) => k + 1);
    setAbroadSeen(true);
  }
  function updateStatuses(update: (s: Record<string, Status>) => Record<string, Status>) {
    setStatuses((current) => {
      const next = update(current);
      if (todos.filter((todo) => next[todo.id] === "done").length >= unlockAfter) setAbroadUnlocked(true);
      return next;
    });
  }
  const setStatus = (id: string, status: Status) => updateStatuses((s) => ({ ...s, [id]: status }));
  const nudge = (id: string, status: Status) => updateStatuses((s) => (s[id] === "done" ? s : { ...s, [id]: status }));
  const onBook = (b: Booking | null) => { setBooking(b); if (b) nudge("session", "done"); };

  // Field of study starts as CSE; it also sets the interest area used for suggestions.
  const withSubject = (p: Profile): Profile => {
    const subject = p.subject || defaultSubject;
    return { ...p, subject, roles: roleForSubject(subject) };
  };
  function returningAccount() {
    setProfile(withSubject(sampleHubProfile()));
    setStatuses({ ...initialTodoStatuses(), linkedin: "done", interview: "done", cv: "doing" });
    setAbroadUnlocked(true);
    setHasCV(true);
    setPage("overview");
    setPhase("ready");
  }

  const done = todos.filter((todo) => statuses[todo.id] === "done").length;
  const abroadIsNew = abroadUnlocked && !abroadSeen;
  const abroadSection = abroadPage === "tool" ? "documents" : abroadPage === "review" ? "programs" : abroadPage;
  const navButton = (key: string, label: string, icon: string, current: boolean, onClick: () => void, extra?: ReactNode, disabled?: boolean) =>
    <button key={key} className={current ? "active" : ""} aria-current={current ? "page" : undefined} disabled={disabled} onClick={onClick}>
      <Icon name={icon} /><span>{label}</span>{extra}
    </button>;

  const sidebar = <>
    <div className="career-brand"><Image src="/careerhub-logo.png" width={108} height={74} alt="BRAC Career Hub" /></div>
    <nav aria-label={t(["Career Hub navigation", "ক্যারিয়ার হাব নেভিগেশন"])}>
      <section className="v3-nav-group" aria-labelledby="v3-nav-career">
        <span className="career-nav-label" id="v3-nav-career">{t(["CAREER HUB", "ক্যারিয়ার হাব"])}</span>
        {careerNav.map((item) => navButton(item.id, t(item.title), item.icon, area === "career" && page === item.id, () => go(item.id)))}
      </section>
      <section className={"v3-nav-group v3-abroad-nav" + (abroadUnlocked ? "" : " is-locked") + (abroadIsNew ? " is-new" : "")} aria-labelledby="v3-nav-abroad">
        <span className="career-nav-label" id="v3-nav-abroad">
          {t(["STUDY ABROAD", "বিদেশে পড়াশোনা"])}
          {!abroadUnlocked && <span className="v3-lock" aria-label={t(["Locked", "লক করা"])}><Icon name="lock" /></span>}
          {abroadIsNew && <span className="hub-new-badge">{t(["New", "নতুন"])}</span>}
        </span>
        {!abroadUnlocked && <button className="v3-lock-hint" onClick={() => go("plan")}>
          {t([`Complete ${unlockAfter} steps in your Career Action Plan to unlock.`, `আনলক করতে কর্মপরিকল্পনার ${unlockAfter}টি ধাপ সম্পন্ন করুন।`])}
          <span className="v3-lock-progress"><span style={{ width: `${Math.min(done, unlockAfter) / unlockAfter * 100}%` }} /></span>
          <small>{Math.min(done, unlockAfter)} / {unlockAfter} {t(["done", "সম্পন্ন"])}</small>
        </button>}
        {abroadNav.map((item) => navButton(item.id, item.label, item.icon, area === "abroad" && abroadSection === item.id, () => openAbroad(item.id),
          item.id === "programs" && abroadUnlocked ? <small className="v3-count">{selected.length}</small> : undefined, !abroadUnlocked))}
      </section>
      <section className="v3-nav-group" aria-labelledby="v3-nav-account">
        <span className="career-nav-label" id="v3-nav-account">{t(["ACCOUNT", "অ্যাকাউন্ট"])}</span>
        {navButton("profile", t(["My Profile", "আমার প্রোফাইল"]), "profile", area === "career" && page === "profile", () => go("profile"))}
      </section>
    </nav>
    <div className="career-sidebar-bottom"><LanguageSwitch language={language} onChange={setLanguage} />
      <button className="career-account" onClick={() => go("profile")}><Icon name="profile" /><span><strong>{profile.name}</strong><small>{profile.email}</small></span></button>
      <button className="career-link" onClick={() => { setMobileOpen(false); exit(); }}>← {t(["Back to home", "হোমে ফিরুন"])}</button><p>{t(["Demo session · resets on refresh", "ডেমো সেশন · রিফ্রেশে রিসেট হবে"])}</p></div>
  </>;

  if (phase !== "ready") return <div className="career-app career-entry hub-app" lang={language}>
    <header className="career-entry-header"><button className="career-brand-button" onClick={exit} aria-label={t(["Back to home", "হোমে ফিরুন"])}><Image src="/careerhub-logo.png" width={98} height={65} alt="BRAC Career Hub" /></button><div><LanguageSwitch language={language} onChange={setLanguage} /><button className="career-link" onClick={exit}>{t(["Back to home", "হোমে ফিরুন"])}</button></div></header>
    {phase === "welcome" && <main className="career-welcome"><section><span className="career-kicker">{t(["BRAC CAREER HUB", "ব্র্যাক ক্যারিয়ার হাব"])}</span><h1>{t(["Your potential.\nA clearer direction.", "আপনার সম্ভাবনা।\nআরও স্পষ্ট দিকনির্দেশনা।"])}</h1><p>{t(["A practical plan, jobs, courses, seminars and counselling, all in one place.", "বাস্তব পরিকল্পনা, চাকরি, কোর্স, সেমিনার ও কাউন্সেলিং, সব এক জায়গায়।"])}</p>
      <ol><li><span>01</span><div><strong>{t(["Create your account", "অ্যাকাউন্ট তৈরি করুন"])}</strong><p>{t(["Just your name and email.", "শুধু নাম ও ইমেইল।"])}</p></div></li><li><span>02</span><div><strong>{t(["Answer four quick questions", "চারটি ছোট প্রশ্নের উত্তর দিন"])}</strong><p>{t(["So we can show seminars and courses near you.", "যাতে কাছাকাছি সেমিনার ও কোর্স দেখাতে পারি।"])}</p></div></li><li><span>03</span><div><strong>{t(["Take the next step", "পরবর্তী পদক্ষেপ নিন"])}</strong><p>{t(["Your plan, opportunities and support in one place.", "পরিকল্পনা, সুযোগ ও সহায়তা এক জায়গায়।"])}</p></div></li></ol>
    </section><section className="career-signup"><h2>{t(["Create your Career Hub account", "ক্যারিয়ার হাব অ্যাকাউন্ট তৈরি করুন"])}</h2><p>{t(["It takes about a minute.", "এক মিনিটের মতো সময় লাগবে।"])}</p>
      <form onSubmit={(e) => { e.preventDefault(); if (profile.name?.trim() && profile.email?.trim()) { setProfile(withSubject); setPhase("questions"); } }}>
        <label><span>{t(["Full name", "পুরো নাম"])}</span><input name="name" autoComplete="name" required value={profile.name || ""} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></label>
        <label><span>{t(["Email address", "ইমেইল ঠিকানা"])}</span><input type="email" name="email" autoComplete="email" required value={profile.email || ""} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></label>
        <button className="career-button primary" type="submit">{t(["Continue", "এগিয়ে যান"])} →</button>
        <button type="button" className="career-link" onClick={() => setProfile(sampleHubProfile())}>{t(["Fill with a sample student", "নমুনা শিক্ষার্থীর তথ্য পূরণ করুন"])}</button>
      </form><div className="career-returning"><span>{t(["Already have an account?", "আগে থেকেই অ্যাকাউন্ট আছে?"])}</span><button className="career-button" onClick={returningAccount}>{t(["Log in as returning demo user", "ফিরতি ডেমো ব্যবহারকারী হিসেবে লগইন"])}</button></div>
      <small>{t(["No password or verification is needed for this demonstration.", "এই ডেমোতে পাসওয়ার্ড বা যাচাই প্রয়োজন নেই।"])}</small>
    </section></main>}
    {phase === "questions" && <Questionnaire study language={language} profile={profile} onChange={setProfile} onBack={() => setPhase("welcome")} onComplete={() => { setPage("overview"); setPhase("ready"); }} />}
  </div>;

  // The sidebar and career pages use career.css (scoped to .career-app); the Study Abroad
  // pages keep their own styles, so they sit outside any .career-app wrapper.
  return <div className="career-shell v3-shell" lang={language}>
    <div className="career-app v3-chrome" lang={language}>
      <a className="career-skip" href="#hub-content">{t(["Skip to content", "মূল অংশে যান"])}</a>
      <aside className="career-sidebar v3-sidebar">{sidebar}</aside>
      <dialog className="career-mobile-menu v3-sidebar" ref={menu} aria-label={t(["Career Hub navigation", "ক্যারিয়ার হাব নেভিগেশন"])} onCancel={() => setMobileOpen(false)}><div><button className="career-menu-close" aria-label={t(["Close menu", "মেনু বন্ধ করুন"])} onClick={() => setMobileOpen(false)}>×</button>{sidebar}</div></dialog>
    </div>
    <main id="hub-content" ref={main} tabIndex={-1} className="career-main">
      <div className="career-app v3-chrome" lang={language}>
        <div className="career-mobile-bar"><button className="career-button hub-menu-new-wrap" onClick={() => setMobileOpen(true)}><Icon name="menu" />{t(["Menu", "মেনু"])}{abroadIsNew && <span className="hub-dot" aria-label={t(["New section available", "নতুন অংশ যুক্ত হয়েছে"])} />}</button><LanguageSwitch language={language} onChange={setLanguage} /></div>
      </div>
      <div className="career-app v3-pane" lang={language} hidden={area !== "career"}>
        <div className="career-main-inner">
          <div hidden={page !== "overview"}><Overview language={language} profile={profile} statuses={statuses} booking={booking} hasCV={hasCV} go={go} onBook={onBook} bold /></div>
          <div hidden={page !== "plan"}><ActionPlan language={language} profile={profile} statuses={statuses} onStatus={setStatus} go={go} registered={registered} onRegister={(id) => { setRegistered((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id])); nudge("seminar", "doing"); }} abroadIsNew={abroadIsNew} /></div>
          <div hidden={page !== "jobs"}><RecommendedJobs language={language} profile={profile} /></div>
          <div hidden={page !== "cv"}><CVStudio language={language} profile={profile} seeded={false} onDraft={() => { setHasCV(true); nudge("cv", "doing"); }} /></div>
          <div hidden={page !== "counselling"}><Counselling language={language} booking={booking} onBook={onBook} /></div>
          <div hidden={page !== "profile"}><HubProfile study language={language} profile={profile} onSave={setProfile} /></div>
        </div>
      </div>
      {abroadUnlocked && <div className="v3-pane" hidden={area !== "abroad"} lang="en">
        <StudyAbroadSection
          active={active && area === "abroad"}
          page={abroadPage}
          setPage={setAbroadPage}
          navKey={abroadNavKey}
          selected={selected}
          setSelected={setSelected}
          account={{ name: profile.name || "", email: profile.email || "" }}
          onConsult={() => go("counselling")}
        />
      </div>}
    </main>
  </div>;
}
