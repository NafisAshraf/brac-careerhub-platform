"use client";
import { useState } from "react";
import Image from "next/image";
import { Icon } from "../student/ui";
import { dateAfter, jobs, text, topics, type Booking, type Copy, type Language, type Profile, type Status } from "../career/data";
import { todos, type HubPage } from "./data";

const slots = ["10:00", "11:00", "14:00", "15:00", "16:00"];
// Same demo availability rule as the Counselling page, so both agree.
const unavailable = (day: string, i: number) => (new Date(day).getDate() + i) % 4 === 0;

// Takes the place of the old readiness analytics: book a session without leaving the page.
// `bold` is the v3 look: a purple banner with a pulsing pink button and the next open time.
function BookingCallout({ language, booking, onBook, go, bold }: { language: Language; booking: Booking | null; onBook: (b: Booking) => void; go: (page: HubPage) => void; bold?: boolean }) {
  const t = (copy: Copy) => text(language, copy);
  const [days] = useState(() => Array.from({ length: 7 }, (_, i) => dateAfter(i + 1)));
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("0");
  const locale = language === "en" ? "en-GB" : "bn-BD";
  const displayTime = (value: string) => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date("2000-01-01T" + value + ":00Z"));
  const weekday = (date: Date) => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "Asia/Dhaka" }).format(date);
  const dayMonth = (date: Date) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "Asia/Dhaka" }).format(date);

  const firstOpen = days.map((date, d) => ({ d, i: slots.findIndex((_, i) => !unavailable(date.toISOString(), i)) })).find((x) => x.i >= 0);

  let body;
  if (booking) {
    const date = new Date(booking.day);
    body = <div className="hub-cta-copy">
      <span className="hub-cta-confirmed"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" /></svg>{t(["Session booked", "সেশন বুক হয়েছে"])}</span>
      <h2>{weekday(date)}, {dayMonth(date)} · {displayTime(booking.time)}</h2>
      <p>{t(topics[Number(booking.topic)])} · {t(["30 minutes, online via Google Meet. We'll send the link by email.", "৩০ মিনিট, গুগল মিটে অনলাইন। লিংক ইমেইলে পাঠানো হবে।"])}</p>
      <div className="hub-cta-actions"><button className="career-button" onClick={() => go("counselling")}>{t(["Manage booking", "বুকিং পরিচালনা"])}</button></div>
    </div>;
  } else if (open) {
    body = <form className="hub-cta-form" onSubmit={(e) => { e.preventDefault(); if (day && time) { onBook({ day, time, topic, language, note: "" }); setOpen(false); } }}>
      <header><h2>{t(["Book a session", "সেশন বুক করুন"])}</h2><button type="button" className="hub-cta-close" aria-label={t(["Close booking", "বুকিং বন্ধ করুন"])} onClick={() => setOpen(false)}>×</button></header>
      <fieldset><legend>{t(["Day", "দিন"])}</legend><div className="hub-chip-row">{days.map((date) => {
        const value = date.toISOString();
        return <label key={value} className={"hub-chip hub-chip-day" + (day === value ? " selected" : "")}>
          <input type="radio" name="cta-day" required value={value} checked={day === value} onChange={() => { setDay(value); setTime(""); }} />
          <small>{weekday(date)}</small><strong>{dayMonth(date)}</strong>
        </label>;
      })}</div></fieldset>
      <fieldset disabled={!day}><legend>{t(["Time", "সময়"])} <small>{t(["Bangladesh time", "বাংলাদেশ সময়"])}</small></legend>
        {day ? <div className="hub-chip-row">{slots.map((slot, i) => {
          const off = unavailable(day, i);
          return <label key={slot} className={"hub-chip" + (time === slot ? " selected" : "") + (off ? " unavailable" : "")}>
            <input type="radio" name="cta-time" required value={slot} disabled={off} checked={time === slot} onChange={() => setTime(slot)} />
            <strong>{displayTime(slot)}</strong>
          </label>;
        })}</div> : <p className="hub-cta-hint">{t(["Pick a day to see open times.", "সময় দেখতে আগে দিন বেছে নিন।"])}</p>}
      </fieldset>
      <div className="hub-cta-submit">
        <label className="hub-cta-topic"><span>{t(["Topic", "বিষয়"])}</span><select value={topic} onChange={(e) => setTopic(e.target.value)}>{topics.map((value, i) => <option key={i} value={String(i)}>{t(value)}</option>)}</select></label>
        <button type="submit" className="career-button primary" disabled={!day || !time}>{t(["Confirm booking", "বুকিং নিশ্চিত করুন"])}</button>
      </div>
    </form>;
  } else if (bold) {
    body = <div className="hub-cta-copy">
      <span className="hub-cta-pill">{t(["Free · 30 minutes · Online", "ফ্রি · ৩০ মিনিট · অনলাইন"])}</span>
      <h2>{t(["Talk to a career counsellor before you decide your next step.", "পরবর্তী পদক্ষেপ ঠিক করার আগে একজন ক্যারিয়ার কাউন্সেলরের সঙ্গে কথা বলুন।"])}</h2>
      <p>{t(["Bring your questions about jobs, courses or studying abroad.", "চাকরি, কোর্স বা বিদেশে পড়াশোনা নিয়ে আপনার প্রশ্ন নিয়ে আসুন।"])}</p>
      <button className="hub-cta-book" onClick={() => setOpen(true)}>{t(["Book my free session", "ফ্রি সেশন বুক করুন"])} <span aria-hidden="true">→</span></button>
      {firstOpen && <small className="hub-cta-next"><span className="hub-cta-live" aria-hidden="true" />
        {t(["Next open:", "পরবর্তী খালি সময়:"])} {firstOpen.d === 0 ? t(["Tomorrow", "আগামীকাল"]) : `${weekday(days[firstOpen.d])}, ${dayMonth(days[firstOpen.d])}`}, {displayTime(slots[firstOpen.i])}</small>}
    </div>;
  } else {
    body = <div className="hub-cta-copy">
      <span className="career-kicker">{t(["FREE ONE-TO-ONE SESSION", "ফ্রি একান্ত সেশন"])}</span>
      <h2>{t(["Not sure where to start? Talk it through with a career counsellor.", "কোথা থেকে শুরু করবেন বুঝতে পারছেন না? একজন কাউন্সেলরের সঙ্গে কথা বলুন।"])}</h2>
      <p>{t(["Bring your questions about jobs, courses or studying abroad. We'll help you choose a first step.", "চাকরি, কোর্স বা বিদেশে পড়াশোনা নিয়ে প্রশ্ন নিয়ে আসুন। প্রথম পদক্ষেপ বেছে নিতে সাহায্য করব।"])}</p>
      <ul className="hub-cta-facts"><li>{t(["30 minutes", "৩০ মিনিট"])}</li><li>{t(["Online", "অনলাইন"])}</li><li>{t(["English or Bangla", "ইংরেজি বা বাংলা"])}</li></ul>
      <div className="hub-cta-actions"><button className="career-button primary" onClick={() => setOpen(true)}>{t(["Book a session", "সেশন বুক করুন"])} <span aria-hidden="true">→</span></button></div>
    </div>;
  }
  return <section className={"hub-cta" + (bold ? " hub-cta-bold" : "") + (open && !booking ? " is-booking" : "")} aria-label={t(["Career counselling", "ক্যারিয়ার কাউন্সেলিং"])}>
    <div className="hub-cta-media"><Image src="/career-journey-hero.png" alt="" fill sizes="(max-width: 800px) 100vw, 1100px" priority /></div>
    <div className="hub-cta-panel">{body}</div>
  </section>;
}

export function Overview({ language, profile, statuses, booking, hasCV, go, onBook, bold }: {
  language: Language; profile: Profile; statuses: Record<string, Status>; booking: Booking | null; hasCV: boolean;
  go: (page: HubPage) => void; onBook: (b: Booking) => void; bold?: boolean;
}) {
  const t = (copy: Copy) => text(language, copy);
  const done = todos.filter((todo) => statuses[todo.id] === "done").length;
  const cards: { id: HubPage; icon: string; title: Copy; copy: Copy; status: Copy; action: Copy }[] = [
    { id: "plan", icon: "steps", title: ["Career Action Plan", "ক্যারিয়ার কর্মপরিকল্পনা"], copy: ["Simple steps, plus courses and seminars near you.", "সহজ পদক্ষেপ, সঙ্গে কাছাকাছি কোর্স ও সেমিনার।"],
      status: [`${done} of ${todos.length} steps completed`, `${todos.length}টির মধ্যে ${done}টি সম্পন্ন`], action: ["View my plan", "আমার পরিকল্পনা দেখুন"] },
    { id: "jobs", icon: "programs", title: ["Recommended Jobs", "প্রস্তাবিত চাকরি"], copy: ["Opportunities in the field you're interested in.", "আপনার আগ্রহের ক্ষেত্রের সুযোগ।"],
      status: [`${jobs.length} sample opportunities`, `${jobs.length}টি নমুনা সুযোগ`], action: ["Explore jobs", "চাকরি দেখুন"] },
    { id: "cv", icon: "documents", title: ["CV Studio", "সিভি স্টুডিও"], copy: ["Turn your education and experience into a focused CV.", "শিক্ষা ও অভিজ্ঞতা দিয়ে লক্ষ্যভিত্তিক সিভি তৈরি করুন।"],
      status: hasCV ? ["Draft in progress", "খসড়া চলছে"] : ["Ready to create", "তৈরির জন্য প্রস্তুত"], action: ["Open CV Studio", "সিভি স্টুডিও খুলুন"] },
    { id: "counselling", icon: "tracker", title: ["Career Counselling", "ক্যারিয়ার কাউন্সেলিং"], copy: ["Talk through your next steps with the Career Hub team.", "ক্যারিয়ার হাবের সঙ্গে পরবর্তী পদক্ষেপ নিয়ে কথা বলুন।"],
      status: booking ? ["Session booked", "সেশন বুক করা হয়েছে"] : ["30-minute online session", "৩০ মিনিটের অনলাইন সেশন"], action: booking ? ["View my booking", "আমার বুকিং দেখুন"] : ["Book a session", "সেশন বুক করুন"] },
  ];
  // The bold banner already books sessions, so it doesn't repeat Counselling as a card.
  const shown = bold ? cards.filter((item) => item.id !== "counselling") : cards;
  return <>
    <header className="career-heading"><span className="career-kicker">{t(["YOUR NEXT CHAPTER", "আপনার পরবর্তী অধ্যায়"])}</span>
      <h1>{t(["Career Overview", "ক্যারিয়ার সারসংক্ষেপ"])}</h1><p>{t(["Welcome,", "স্বাগতম,"])} {profile.name}. {t(["Here is where to start.", "এখান থেকে শুরু করুন।"])}</p></header>
    <BookingCallout language={language} booking={booking} onBook={onBook} go={go} bold={bold} />
    <h2 className="career-section-title">{t(["Make your next move", "পরবর্তী পদক্ষেপ নিন"])}</h2>
    <div className={"career-destination-grid" + (bold ? " hub-three" : "")}>{shown.map((item) => <button className="career-destination" key={item.id} onClick={() => go(item.id)}>
      <div className="career-destination-top"><Icon name={item.icon} /></div>
      <h3>{t(item.title)}</h3><p>{t(item.copy)}</p>
      <small className="career-destination-status">{t(item.status)}</small>
      <span className="career-destination-action"><span>{t(item.action)}</span><span className="career-destination-arrow" aria-hidden="true">→</span></span>
    </button>)}</div>
  </>;
}
