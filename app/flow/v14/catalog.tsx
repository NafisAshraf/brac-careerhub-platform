"use client";
// v14 courses and jobs: v11's cards and full-page details, with more to read on each one
// (key facts, how to start or apply, and links). The links are placeholders for the demo.
import { useState, type ReactNode } from "react";
import { assignedCourses, assignedJobs } from "../data";
import { courseMore, courseText, jobMore, jobText, tx, type Txt } from "../v11/content";
import { Ico } from "../v11/icons";
import { useL } from "../v11/lang";
import { PageHead } from "../v11/sections";
import { useHub } from "../v11/store";

type Link = { label: Txt; href: string };
const courseFacts: Record<string, { facts: [Txt, Txt][]; steps: Txt[]; links: Link[] }> = {
  "c-excel": {
    facts: [[tx("শুরু", "Starts"), tx("যেকোনো দিন", "Any day")], [tx("সময়", "Time"), tx("সপ্তাহে ৩-৪ ঘণ্টা", "3–4 hours a week")], [tx("স্তর", "Level"), tx("শুরু থেকে", "Beginner")], [tx("খরচ", "Cost"), tx("ফ্রি (সার্টিফিকেট আলাদা)", "Free to audit")], [tx("ভাষা", "Language"), tx("ইংরেজি, সাবটাইটেলসহ", "English, with subtitles")]],
    steps: [tx("Coursera-তে ফ্রি অ্যাকাউন্ট খুলুন", "Make a free Coursera account"), tx("কোর্সে ‘Audit’ বেছে নিন, তাহলে ফ্রি", "Choose ‘Audit’ to take it free"), tx("প্রথম দুই সপ্তাহ শেষ করে কাজের তালিকায় টিক দিন", "Finish weeks 1–2, then tick it in your tasks")],
    links: [{ label: tx("কোর্সের পেজ", "Course page"), href: "https://www.coursera.org/learn/excel-essentials" }, { label: tx("ফ্রিতে নেওয়ার নিয়ম", "How to audit for free"), href: "https://www.coursera.org/about/audit" }],
  },
  "c-sql": {
    facts: [[tx("শুরু", "Starts"), tx("যেকোনো দিন", "Any day")], [tx("সময়", "Time"), tx("সপ্তাহে ৪-৫ ঘণ্টা", "4–5 hours a week")], [tx("স্তর", "Level"), tx("Excel-এর পরে", "After Excel")], [tx("খরচ", "Cost"), tx("ফ্রি (সার্টিফিকেট আলাদা)", "Free to audit")], [tx("ভাষা", "Language"), tx("ইংরেজি", "English")]],
    steps: [tx("আগে Excel কোর্স শেষ করুন", "Finish the Excel course first"), tx("প্রথম মডিউলের প্র্যাকটিস ডেটাবেস ডাউনলোড করুন", "Download the practice database in module 1"), tx("প্রতি সপ্তাহে একটি কুইজ", "One quiz a week")],
    links: [{ label: tx("কোর্সের পেজ", "Course page"), href: "https://www.coursera.org/learn/sql-for-data-science" }, { label: tx("প্র্যাকটিস সাইট", "Practice site"), href: "https://sqlbolt.com" }],
  },
  "c-writing": {
    facts: [[tx("শুরু", "Starts"), tx("৬ ডিসেম্বর, শনিবার", "Saturday 6 December")], [tx("সময়", "Time"), tx("সকাল ১০টা – দুপুর ১টা", "10 am – 1 pm")], [tx("কোথায়", "Where"), tx("BRAC Career Hub, মহাখালী", "BRAC Career Hub, Mohakhali")], [tx("খরচ", "Cost"), tx("BRAC শিক্ষার্থীদের জন্য ফ্রি", "Free for BRAC students")], [tx("আসন", "Seats"), tx("২০টি, আগে এলে আগে", "20, first come")]],
    steps: [tx("নিচের লিংকে নাম লেখান", "Register with the link below"), tx("প্রথম দিন একটি ছোট পরিচিতি লিখে আনুন", "Bring a short self-introduction on day 1"), tx("তিন শনিবারই আসুন", "Come all three Saturdays")],
    links: [{ label: tx("নাম লেখান", "Register"), href: "https://careerhub.brac.net/events/communication-workshop" }, { label: tx("জায়গার ম্যাপ", "Map"), href: "https://maps.google.com/?q=BRAC+Centre+Mohakhali" }],
  },
};
const jobFacts: Record<string, { facts: [Txt, Txt][]; steps: Txt[]; links: Link[] }> = {
  "j-analyst": {
    facts: [[tx("ভাতা", "Stipend"), tx("মাসে ১৫,০০০ টাকা", "Tk 15,000 a month")], [tx("কোথায়", "Where"), tx("গুলশান, ঢাকা", "Gulshan, Dhaka")], [tx("সময়", "Hours"), tx("সপ্তাহে ৫ দিন, ৩ মাস", "5 days a week, 3 months")], [tx("শেষ দিন", "Apply by"), tx("১৫ ডিসেম্বর", "15 December")], [tx("কারা পারবেন", "Who can apply"), tx("৩য় বা ৪র্থ বর্ষ", "3rd or 4th year")]],
    steps: [tx("সিভি স্টুডিওতে এক পাতার সিভি বানান", "Make a one-page CV in CV Studio"), tx("লিংক থেকে অনলাইনে আবেদন করুন", "Apply online with the link"), tx("আবেদন করলে কাউন্সেলরকে জানান", "Tell your counsellor once you’ve applied")],
    links: [{ label: tx("আবেদনের পেজ", "Apply here"), href: "https://www.bdjobs.com/jobs/bkash-business-analyst-intern" }, { label: tx("কোম্পানির ওয়েবসাইট", "Company website"), href: "https://www.bkash.com/careers" }],
  },
  "j-research": {
    facts: [[tx("ভাতা", "Stipend"), tx("ঘণ্টায় ৩০০ টাকা", "Tk 300 an hour")], [tx("কোথায়", "Where"), tx("মহাখালী, ঢাকা", "Mohakhali, Dhaka")], [tx("সময়", "Hours"), tx("সপ্তাহে ১৫ ঘণ্টা", "15 hours a week")], [tx("শেষ দিন", "Apply by"), tx("১০ ডিসেম্বর", "10 December")], [tx("কারা পারবেন", "Who can apply"), tx("যেকোনো বিষয়, ২য় বর্ষ থেকে", "Any subject, from 2nd year")]],
    steps: [tx("আধা পাতার একটি কভার লেটার লিখুন", "Write a half-page cover letter"), tx("সিভি আর লেটার ইমেইলে পাঠান", "Email your CV and letter"), tx("ছোট একটি লেখার পরীক্ষা হতে পারে", "There may be a short writing test")],
    links: [{ label: tx("আবেদনের পেজ", "Apply here"), href: "https://bigd.bracu.ac.bd/careers/research-assistant" }, { label: tx("BIGD সম্পর্কে", "About BIGD"), href: "https://bigd.bracu.ac.bd" }],
  },
  "j-ops": {
    facts: [[tx("ভাতা", "Stipend"), tx("মাসে ১০,০০০ টাকা", "Tk 10,000 a month")], [tx("কোথায়", "Where"), tx("বনানী, ঢাকা (হাইব্রিড)", "Banani, Dhaka (hybrid)")], [tx("সময়", "Hours"), tx("সপ্তাহে ৩ দিন অফিসে, ২ মাস", "3 office days a week, 2 months")], [tx("শেষ দিন", "Apply by"), tx("২০ ডিসেম্বর", "20 December")], [tx("কারা পারবেন", "Who can apply"), tx("সব বিভাগ", "All departments")]],
    steps: [tx("ক্লাব বা ইভেন্টের অভিজ্ঞতা সিভিতে রাখুন", "Put clubs and events on your CV"), tx("লিংক থেকে ফর্ম পূরণ করুন", "Fill in the form at the link"), tx("১৫ মিনিটের ফোন ইন্টারভিউ হবে", "Expect a 15-minute phone interview")],
    links: [{ label: tx("আবেদনের পেজ", "Apply here"), href: "https://www.bdjobs.com/jobs/shikho-operations-intern" }, { label: tx("কোম্পানির ওয়েবসাইট", "Company website"), href: "https://shikho.com/careers" }],
  },
};

const host = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];

function Card({ onOpen, image, top, title, why, meta, extra, children }: { onOpen: () => void; image: string; top: string; title: string; why: string; meta: string; extra?: ReactNode; children?: ReactNode }) {
  const { t } = useL();
  return <article className="v11-card is-click">
    <button className="v11-card-hit" tabIndex={-1} aria-hidden="true" onClick={onOpen} />
    <img src={image} alt="" />
    <div>
      <small>{top}</small>
      <h3>{title}</h3>
      <p className="v11-why">“{why}”</p>
      <p>{meta}</p>
      {extra}
      <div className="v11-card-foot">{children}
        <button className="v11-card-toggle" onClick={onOpen}>{t("বিস্তারিত দেখুন", "See details")}<Ico n="arrow" s={14} w="bold" /></button></div>
    </div>
  </article>;
}
function Detail({ back, onBack, image, top, title, why, meta, info, children, side }: { back: string; onBack: () => void; image: string; top: string; title: string; why: string; meta: string; info: (typeof courseFacts)[string]; children: ReactNode; side?: ReactNode }) {
  const { t, lang } = useL();
  return <div className="v11-page v11-detail">
    <button className="fl-btn ghost v4-back" onClick={onBack}><Ico n="back" s={20} w="bold" /> {back}</button>
    <img className="v11-detail-img" src={image} alt="" />
    <small className="v11-detail-top">{top}</small>
    <h1>{title}</h1>
    <p className="v11-detail-meta">{meta}</p>
    <p className="v11-why">“{why}”</p>
    <div className="v14-links">{info.links.map((l, k) => <a key={l.href} className={"fl-btn" + (k === 0 ? " fl-primary" : "")} href={l.href} target="_blank" rel="noreferrer">{l.label[lang]} <Ico n="open" s={16} w="bold" /></a>)}</div>
    <dl className="v14-facts">{info.facts.map(([k, v]) => <div key={k.en}><dt>{k[lang]}</dt><dd>{v[lang]}</dd></div>)}</dl>
    <div className="v11-detail-more">
      {children}
      <h4>{t("কীভাবে শুরু করবেন", "How to get started")}</h4>
      <ol className="v14-steps">{info.steps.map((x) => <li key={x.en}>{x[lang]}</li>)}</ol>
      <p className="v14-link-note"><Ico n="link" s={16} w="duotone" /> {info.links.map((l) => host(l.href)).join(" · ")}</p>
    </div>
    {side}
  </div>;
}

export function Courses() {
  const { courses, dispatch } = useHub();
  const { t, lang } = useL();
  const [on, setOn] = useState<string | null>(null);
  const open = (id: string | null) => { setOn(id); window.scrollTo({ top: 0 }); };
  const status = (id: string) => <label className="v11-select"><span>{t("অবস্থা", "Status")}</span><select value={courses[id] ?? "new"} onChange={(e) => dispatch({ type: "course", id, status: e.target.value as "new" })}>
    <option value="new">{t("শুরু হয়নি", "Not started")}</option><option value="started">{t("চলছে", "In progress")}</option><option value="done">{t("শেষ", "Finished")}</option></select></label>;
  const cur = assignedCourses.find((x) => x.id === on);
  if (cur) {
    const m = courseMore[cur.id];
    return <Detail back={t("সব কোর্স", "All courses")} onBack={() => open(null)} image={cur.image} top={cur.provider} title={cur.title} why={courseText[cur.id].why[lang]} meta={courseText[cur.id].mode[lang]} info={courseFacts[cur.id]}
      side={<div className="v11-detail-foot">{status(cur.id)}</div>}>
      <p>{m.about[lang]}</p><h4>{t("যা শিখবেন", "What you’ll learn")}</h4>
      <ul className="v11-agreed">{m.learn.map((l) => <li key={l.en}><Ico n="done" s={18} w="fill" c="#17845f" />{l[lang]}</li>)}</ul>
      <p className="v11-card-note"><Ico n="grad" s={18} w="duotone" />{m.extra[lang]}</p>
    </Detail>;
  }
  return <div className="v11-page">
    <PageHead icon="courses" title={t("আপনার কোর্স", "Your courses")} body={t("কাউন্সেলর আপনার কথা শুনে এগুলো বেছেছেন। প্রথমটা দিয়ে শুরু করুন।", "Your counsellor chose these from what you told them. Start with the first one.")} />
    <div className="v11-cards">{assignedCourses.map((x) => <Card key={x.id} onOpen={() => open(x.id)} image={x.image} top={x.provider} title={x.title} why={courseText[x.id].why[lang]} meta={courseText[x.id].mode[lang]}
      extra={<p className="v14-card-fact"><Ico n="clock" s={15} w="duotone" /> {courseFacts[x.id].facts[1][1][lang]} · {courseFacts[x.id].facts[3][1][lang]}</p>}>{status(x.id)}</Card>)}</div>
  </div>;
}

export function Jobs() {
  const { t, lang } = useL();
  const [on, setOn] = useState<string | null>(null);
  const open = (id: string | null) => { setOn(id); window.scrollTo({ top: 0 }); };
  const cur = assignedJobs.find((x) => x.id === on);
  if (cur) {
    const m = jobMore[cur.id];
    return <Detail back={t("সব সুযোগ", "All openings")} onBack={() => open(null)} image={cur.image} top={cur.org} title={cur.title} why={jobText[cur.id].why[lang]} meta={jobText[cur.id].meta[lang]} info={jobFacts[cur.id]}>
      <p>{m.about[lang]}</p><h4>{t("যা করবেন", "What you’ll do")}</h4>
      <ul className="v11-agreed">{m.does.map((l) => <li key={l.en}><Ico n="done" s={18} w="fill" c="#17845f" />{l[lang]}</li>)}</ul>
      <p className="v11-card-note"><Ico n="info" s={18} w="duotone" />{m.needs[lang]}</p>
    </Detail>;
  }
  return <div className="v11-page">
    <PageHead icon="jobs" title={t("চাকরি ও ইন্টার্নশিপ", "Jobs & internships")} body={t("আপনার কাউন্সেলরের বাছাই করা সুযোগ। যেকোনোটিতে চাপ দিয়ে বিস্তারিত দেখুন।", "Openings your counsellor picked. Tap any one to read more.")} />
    <div className="v11-cards">{assignedJobs.map((x) => <Card key={x.id} onOpen={() => open(x.id)} image={x.image} top={x.org} title={x.title} why={jobText[x.id].why[lang]} meta={jobText[x.id].meta[lang]}
      extra={<p className="v14-card-fact"><Ico n="calendar" s={15} w="duotone" /> {t("শেষ দিন:", "Apply by")} {jobFacts[x.id].facts[3][1][lang]} · {jobFacts[x.id].facts[0][1][lang]}</p>} />)}</div>
  </div>;
}
