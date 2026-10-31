"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "../student/ui";
import { text, type Booking, type Language, type Profile, type Status } from "../career/data";
import { LanguageSwitch } from "../career/onboarding";
import { RecommendedJobs } from "../career/explore";
import { Counselling } from "../career/support";
import { CVStudio } from "../career/cv-studio";
import type { ToolType } from "../student/data";
import { initialTodoStatuses, sampleHubProfile, todos, unlockAfter, type HubPage } from "./data";
import { HubProfile, Questionnaire } from "./questionnaire";
import { Overview } from "./overview";
import { ActionPlan } from "./plan";
import { StudyAbroad, Generate } from "./abroad";
import "../career/career.css";
import "./hub.css";

const nav: { id: HubPage; title: readonly [string, string]; icon: string; group?: readonly [string, string] }[] = [
  { id: "overview", title: ["Career Overview", "ক্যারিয়ার সারসংক্ষেপ"], icon: "catalog" },
  { id: "plan", title: ["Career Action Plan", "ক্যারিয়ার কর্মপরিকল্পনা"], icon: "steps", group: ["YOUR NEXT STEPS", "পরবর্তী পদক্ষেপ"] },
  { id: "jobs", title: ["Recommended Jobs", "প্রস্তাবিত চাকরি"], icon: "programs" },
  { id: "cv", title: ["CV Studio", "সিভি স্টুডিও"], icon: "documents" },
  { id: "counselling", title: ["Career Counselling", "ক্যারিয়ার কাউন্সেলিং"], icon: "tracker" },
  { id: "abroad", title: ["Study Abroad", "বিদেশে পড়াশোনা"], icon: "globe" },
  { id: "profile", title: ["My Profile", "আমার প্রোফাইল"], icon: "profile", group: ["ACCOUNT", "অ্যাকাউন্ট"] },
];

export default function UnifiedHub({ active, exit }: { active: boolean; exit: () => void }) {
  const [language, setLanguage] = useState<Language>("en");
  const [phase, setPhase] = useState<"welcome" | "questions" | "ready">("welcome");
  const [profile, setProfile] = useState<Profile>({ name: "", email: "" });
  const [page, setPage] = useState<HubPage>("overview");
  const [statuses, setStatuses] = useState<Record<string, Status>>(initialTodoStatuses);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hasCV, setHasCV] = useState(false);
  const [registered, setRegistered] = useState<string[]>([]);
  // Study Abroad appears once enough to-dos are done, and stays. The badge clears on first visit.
  const [abroadUnlocked, setAbroadUnlocked] = useState(false);
  const [abroadSeen, setAbroadSeen] = useState(false);
  const [generating, setGenerating] = useState<{ program: string; tool: ToolType } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const t = (copy: readonly [string, string]) => text(language, copy);

  useEffect(() => {
    if (active && phase === "ready") main.current?.focus({ preventScroll: true });
  }, [active, phase, page]);
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
    setPage(destination);
    setMobileOpen(false);
    if (destination === "abroad") setAbroadSeen(true);
    if (anchor) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    else window.scrollTo({ top: 0, behavior: "instant" });
  }
  function updateStatuses(update: (s: Record<string, Status>) => Record<string, Status>) {
    setStatuses((current) => {
      const next = update(current);
      if (todos.filter((todo) => next[todo.id] === "done").length >= unlockAfter) setAbroadUnlocked(true);
      return next;
    });
  }
  const setStatus = (id: string, status: Status) => updateStatuses((s) => ({ ...s, [id]: status }));
  // Progress the related to-do without moving a finished one backwards.
  const nudge = (id: string, status: Status) => updateStatuses((s) => (s[id] === "done" ? s : { ...s, [id]: status }));

  function returningAccount() {
    setProfile(sampleHubProfile());
    setStatuses({ ...initialTodoStatuses(), linkedin: "done", interview: "done", cv: "doing" });
    setAbroadUnlocked(true);
    setHasCV(true);
    setPage("overview");
    setPhase("ready");
  }

  const showAbroad = abroadUnlocked;
  const abroadIsNew = showAbroad && !abroadSeen;
  const current = page === "generate" ? "abroad" : page;
  const sidebar = <>
    <div className="career-brand"><Image src="/careerhub-logo.png" width={108} height={74} alt="BRAC Career Hub" /><span>{t(["CAREER HUB", "ক্যারিয়ার হাব"])}</span></div>
    <nav aria-label={t(["Career Hub navigation", "ক্যারিয়ার হাব নেভিগেশন"])}>{nav.filter((item) => item.id !== "abroad" || showAbroad).map((item) => <div key={item.id}>
      {item.group && <span className="career-nav-label">{t(item.group)}</span>}
      <button className={(current === item.id ? "active " : "") + (item.id === "abroad" && abroadIsNew ? "hub-nav-new" : "")} aria-current={current === item.id ? "page" : undefined} onClick={() => go(item.id)}>
        <Icon name={item.icon} /><span>{t(item.title)}</span>
        {item.id === "abroad" && abroadIsNew && <span className="hub-new-badge">{t(["New", "নতুন"])}</span>}
      </button>
    </div>)}</nav>
    <div className="career-sidebar-bottom"><LanguageSwitch language={language} onChange={setLanguage} />
      <button className="career-account" onClick={() => go("profile")}><Icon name="profile" /><span><strong>{profile.name}</strong><small>{profile.email}</small></span></button>
      <button className="career-link" onClick={() => { setMobileOpen(false); exit(); }}>← {t(["Back to home", "হোমে ফিরুন"])}</button><p>{t(["Demo session · resets on refresh", "ডেমো সেশন · রিফ্রেশে রিসেট হবে"])}</p></div>
  </>;

  if (phase !== "ready") return <div className="career-app career-entry hub-app" lang={language}>
    <header className="career-entry-header"><button className="career-brand-button" onClick={exit} aria-label={t(["Back to home", "হোমে ফিরুন"])}><Image src="/careerhub-logo.png" width={98} height={65} alt="BRAC Career Hub" /></button><div><LanguageSwitch language={language} onChange={setLanguage} /><button className="career-link" onClick={exit}>{t(["Back to home", "হোমে ফিরুন"])}</button></div></header>
    {phase === "welcome" && <main className="career-welcome"><section><span className="career-kicker">{t(["BRAC CAREER HUB", "ব্র্যাক ক্যারিয়ার হাব"])}</span><h1>{t(["Your potential.\nA clearer direction.", "আপনার সম্ভাবনা।\nআরও স্পষ্ট দিকনির্দেশনা।"])}</h1><p>{t(["Jobs, courses, seminars, counselling and study abroad, all in one place.", "চাকরি, কোর্স, সেমিনার, কাউন্সেলিং ও বিদেশে পড়াশোনা, সব এক জায়গায়।"])}</p>
      <ol><li><span>01</span><div><strong>{t(["Create your account", "অ্যাকাউন্ট তৈরি করুন"])}</strong><p>{t(["Just your name and email.", "শুধু নাম ও ইমেইল।"])}</p></div></li><li><span>02</span><div><strong>{t(["Answer four quick questions", "চারটি ছোট প্রশ্নের উত্তর দিন"])}</strong><p>{t(["So we can show seminars and courses near you.", "যাতে কাছাকাছি সেমিনার ও কোর্স দেখাতে পারি।"])}</p></div></li><li><span>03</span><div><strong>{t(["Take the next step", "পরবর্তী পদক্ষেপ নিন"])}</strong><p>{t(["Your plan, opportunities and support in one place.", "পরিকল্পনা, সুযোগ ও সহায়তা এক জায়গায়।"])}</p></div></li></ol>
    </section><section className="career-signup"><h2>{t(["Create your Career Hub account", "ক্যারিয়ার হাব অ্যাকাউন্ট তৈরি করুন"])}</h2><p>{t(["It takes about a minute.", "এক মিনিটের মতো সময় লাগবে।"])}</p>
      <form onSubmit={(e) => { e.preventDefault(); if (profile.name?.trim() && profile.email?.trim()) setPhase("questions"); }}>
        <label><span>{t(["Full name", "পুরো নাম"])}</span><input name="name" autoComplete="name" required value={profile.name || ""} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></label>
        <label><span>{t(["Email address", "ইমেইল ঠিকানা"])}</span><input type="email" name="email" autoComplete="email" required value={profile.email || ""} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></label>
        <button className="career-button primary" type="submit">{t(["Continue", "এগিয়ে যান"])} →</button>
        <button type="button" className="career-link" onClick={() => setProfile(sampleHubProfile())}>{t(["Fill with a sample student", "নমুনা শিক্ষার্থীর তথ্য পূরণ করুন"])}</button>
      </form><div className="career-returning"><span>{t(["Already have an account?", "আগে থেকেই অ্যাকাউন্ট আছে?"])}</span><button className="career-button" onClick={returningAccount}>{t(["Log in as returning demo user", "ফিরতি ডেমো ব্যবহারকারী হিসেবে লগইন"])}</button></div>
      <small>{t(["No password or verification is needed for this demonstration.", "এই ডেমোতে পাসওয়ার্ড বা যাচাই প্রয়োজন নেই।"])}</small>
    </section></main>}
    {phase === "questions" && <Questionnaire language={language} profile={profile} onChange={setProfile} onBack={() => setPhase("welcome")} onComplete={() => { setPage("overview"); setPhase("ready"); }} />}
  </div>;

  const program = generating?.program;
  return <div className="career-app career-shell hub-app" lang={language}>
    <a className="career-skip" href="#hub-content">{t(["Skip to content", "মূল অংশে যান"])}</a>
    <aside className="career-sidebar hub-sidebar">{sidebar}</aside>
    <dialog className="career-mobile-menu" ref={menu} aria-label={t(["Career Hub navigation", "ক্যারিয়ার হাব নেভিগেশন"])} onCancel={() => setMobileOpen(false)}><div><button className="career-menu-close" aria-label={t(["Close menu", "মেনু বন্ধ করুন"])} onClick={() => setMobileOpen(false)}>×</button>{sidebar}</div></dialog>
    <main id="hub-content" ref={main} tabIndex={-1} className="career-main">
      <div className="career-mobile-bar"><button className={"career-button" + (abroadIsNew ? " hub-menu-new" : "")} onClick={() => setMobileOpen(true)}><Icon name="menu" />{t(["Menu", "মেনু"])}{abroadIsNew && <span className="hub-dot" aria-label={t(["New section available", "নতুন অংশ যুক্ত হয়েছে"])} />}</button><LanguageSwitch language={language} onChange={setLanguage} /></div>
      <div className="career-main-inner">
        <div hidden={page !== "overview"}><Overview language={language} profile={profile} statuses={statuses} booking={booking} hasCV={hasCV} go={go} onBook={(b) => { setBooking(b); if (b) nudge("session", "done"); }} /></div>
        <div hidden={page !== "plan"}><ActionPlan language={language} profile={profile} statuses={statuses} onStatus={setStatus} go={go} registered={registered} onRegister={(id) => { setRegistered((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id])); nudge("seminar", "doing"); }} abroadIsNew={abroadIsNew} /></div>
        <div hidden={page !== "jobs"}><RecommendedJobs language={language} profile={profile} /></div>
        <div hidden={page !== "cv"}><CVStudio language={language} profile={profile} seeded={false} onDraft={() => { setHasCV(true); nudge("cv", "doing"); }} /></div>
        <div hidden={page !== "counselling"}><Counselling language={language} booking={booking} onBook={(b) => { setBooking(b); if (b) nudge("session", "done"); }} /></div>
        {showAbroad && <div hidden={page !== "abroad"}><StudyAbroad active={active && page === "abroad"} onGenerate={(id, tool) => { setGenerating({ program: id, tool }); go("generate"); }} /></div>}
        {page === "generate" && program && generating && <Generate key={program + generating.tool} programId={program} tool={generating.tool} onDone={() => go("abroad")} />}
        <div hidden={page !== "profile"}><HubProfile language={language} profile={profile} onSave={setProfile} /></div>
      </div>
    </main>
  </div>;
}
