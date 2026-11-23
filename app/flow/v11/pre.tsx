"use client";
// v11 before the first session: the v4 flow (video first → counsellor → time → 5 questions → ready),
// in Bangla first.
import { useState } from "react";
import { universities } from "../../hub/data";
import { counsellorById, counsellors, type Slot } from "../data";
import { Avatar } from "../parts";
import { PlaneSvg } from "../guide";
import { type Answers, answerText, cf, cn, counsellorText, isAnswered, type Q, questions } from "./content";
import { Ico } from "./icons";
import { clock, dayMonth, dayWord, num, useL } from "./lang";
import { firstOpen, sampleAccount, useHub, type Account } from "./store";
import { CounsellorCard, Explainer, SessionCard, SlotPicker } from "./ui";

/* ---------- Progress in the top bar ---------- */
export function Stepper({ step, formDue }: { step: number; formDue?: boolean }) {
  const { t } = useL();
  const steps = [t("সেশন বুক", "Book a session"), t("আপনার সম্পর্কে", "About you"), t("কাউন্সেলরের সাথে দেখা", "Meet your counsellor")];
  return <div className="v4-progress">
    <p className="v4-steps-m" aria-hidden="true"><b>{t(`ধাপ ${num(step, "bn")}/৩`, `Step ${step} of 3`)}</b> · {steps[step - 1]}</p>
    <ol className="v4-steps" aria-label={t("আপনার অগ্রগতি", "Your progress")}>
      {steps.map((s, k) => { const due = formDue && k === 1; return <li key={k} className={due ? "is-due" : k + 1 < step ? "is-done" : k + 1 === step ? "is-now" : ""} aria-current={k + 1 === step ? "step" : undefined}>
        <b>{k + 1 < step && !due && <Ico n="check" s={16} w="bold" />}{s}</b></li>; })}
      <li className="is-lock"><b><Ico n="lock" s={15} w="fill" />{t("ক্যারিয়ার হাব", "Your Career Hub")}</b></li>
    </ol>
  </div>;
}

/* ---------- Sign up ---------- */
export function Signup({ prefill }: { prefill?: boolean } = {}) {
  const { dispatch } = useHub();
  const { t } = useL();
  const [a, setA] = useState<Account>(prefill ? sampleAccount : { name: "", email: "", phone: "", university: "", subject: "" });
  const set = (k: keyof Account) => (e: { target: { value: string } }) => setA({ ...a, [k]: e.target.value });
  return <div className="fl-signup">
    <div className="fl-signup-intro"><span className="fl-kicker">BRAC CAREER HUB</span><h1>{t("ক্যারিয়ার বেছে নিতে সাহায্য নিন, একজন সত্যিকারের মানুষের কাছ থেকে।", "Get help choosing your career, from a real person.")}</h1>
      <p>{t("একজন ক্যারিয়ার কাউন্সেলরের সাথে ৩০ মিনিটের ফ্রি আলাপ দিয়ে শুরু করুন। তিনি আপনার জন্য একটা পরিকল্পনা সাজিয়ে দেবেন।", "Start with a free 30-minute chat with a career counsellor. They’ll set up a plan that fits you.")}</p>
      <ol className="fl-signup-steps">{[t("অ্যাকাউন্ট খুলুন", "Create your account"), t("ফ্রি সেশন বুক করুন", "Book a free session"), t("৫টি ছোট প্রশ্নের উত্তর দিন", "Answer 5 quick questions"), t("অনলাইনে কাউন্সেলরের সাথে দেখা করুন", "Meet your counsellor online")].map((x, k) => <li key={k}><span>{t(num(k + 1, "bn"), String(k + 1))}</span>{x}</li>)}</ol></div>
    <form onSubmit={(e) => { e.preventDefault(); dispatch({ type: "signup", account: a }); }}>
      <h2>{t("ফ্রি অ্যাকাউন্ট খুলুন", "Create your free account")}</h2>
      <p>{t("এক মিনিটের মতো লাগে। এই ডেমোতে পাসওয়ার্ড লাগবে না।", "Takes about a minute. No password needed for this demo.")}</p>
      <label className="fl-field"><span>{t("পূর্ণ নাম", "Full name")}</span><input required autoComplete="name" value={a.name} onChange={set("name")} /></label>
      <label className="fl-field"><span>{t("ইমেইল", "Email")} <small>· {t("মিটিং লিংক এখানে পাঠানো হবে", "we send the meeting link here")}</small></span><input required type="email" autoComplete="email" value={a.email} onChange={set("email")} /></label>
      <label className="fl-field"><span>{t("মোবাইল নম্বর", "Mobile number")} <small>· {t("SMS রিমাইন্ডারের জন্য", "for SMS reminders")}</small></span><input required type="tel" autoComplete="tel" inputMode="tel" placeholder="01XXX-XXXXXX" value={a.phone} onChange={set("phone")} /></label>
      <label className="fl-field"><span>{t("বিশ্ববিদ্যালয়", "University")}</span><select required value={a.university} onChange={set("university")}><option value="">{t("বিশ্ববিদ্যালয় বেছে নিন", "Choose your university")}</option>{universities.map((u) => <option key={u}>{u}</option>)}<option>{t("অন্যান্য", "Other")}</option></select></label>
      <label className="fl-field"><span>{t("বিষয়", "Subject")}</span><input required placeholder={t("যেমন: কম্পিউটার সায়েন্স", "e.g. Computer Science and Engineering")} value={a.subject} onChange={set("subject")} /></label>
      <button className="fl-btn fl-primary big" type="submit">{t("চালিয়ে যান", "Continue")} <Ico n="arrow" s={20} w="bold" /></button>
      <button type="button" className="fl-link" onClick={() => setA(sampleAccount)}>{t("নমুনা শিক্ষার্থীর তথ্য বসান", "Fill in a sample student")}</button>
    </form>
  </div>;
}

/* ---------- Step 1: video, then who, then when ---------- */
type Stage = "intro" | "who" | "when";
export function Book({ onBooked }: { onBooked: () => void }) {
  const { dispatch, sessions } = useHub();
  const { t, lang } = useL();
  const [stage, setStage] = useState<Stage>("intro");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [who, setWho] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const cancelled = sessions.at(-1)?.status === "cancelled";
  const soonest = counsellors.map((c) => firstOpen(c.id)!).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const order: Stage[] = ["intro", "who", "when"];
  const go = (next: Stage) => { setDir(order.indexOf(next) < order.indexOf(stage) ? "back" : "fwd"); setStage(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const choose = (id: string) => { if (id !== who) setSlot(null); setWho(id); setTimeout(() => go("when"), 260); };
  const c = who ? counsellorById(who) : null;

  if (stage === "intro") return <main className="v4-main v4-hero">
    {cancelled && <p className="v4-notice" role="status"><Ico n="info" s={20} w="fill" /> {t("আপনার সেশন বাতিল হয়েছে। নতুন করে বুক করুন।", "Your session was cancelled. Book a new one below.")}</p>}
    <span className="fl-kicker">{t("ধাপ ১/৩", "STEP 1 OF 3")}</span>
    <h1>{t("একজন ক্যারিয়ার কাউন্সেলরের সাথে ফ্রি আলাপ বুক করুন", "Book a free chat with a career counsellor")}</h1>
    <p className="v4-lead">{t("২৫ সেকেন্ডের ভিডিওটি দেখুন, তারপর সেশন বুক করুন।", "Watch the 25-second video, then book your session.")}</p>
    <div className="v4-hero-video"><Explainer /></div>
    <button className="fl-btn fl-primary v4-cta" onClick={() => go("who")}>{t("আমার ফ্রি সেশন বুক করুন", "Book my free session")} <Ico n="arrow" s={22} w="bold" /></button>
    <p className="v4-facts"><b>{t("ফ্রি", "Free")}</b> {t("শিক্ষার্থীদের জন্য", "for students")}<i>·</i><b>{t("৩০ মিনিট", "30 minutes")}</b> {t("Google Meet-এ", "on Google Meet")}<i>·</i>{t("মিটিং লিংক", "Meeting link by")} <b>{t("SMS ও ইমেইলে", "SMS and email")}</b></p>
  </main>;

  return <main className="v4-main v4-booking">
    <div className="v4-book-top">
      <button className="fl-btn ghost v4-back" onClick={() => go(stage === "when" ? "who" : "intro")}><Ico n="back" s={20} w="bold" /> {stage === "when" ? t("কাউন্সেলরদের কাছে ফিরে যান", "Back to counsellors") : t("ভিডিওতে ফিরে যান", "Back to the video")}</button>
    </div>
    <div className="v4-ticket" aria-label={t("আপনার বুকিং", "Your booking so far")}>
      <button className={"v4-ticket-part" + (stage === "who" ? " is-now" : " is-set")} onClick={() => go("who")} disabled={stage === "who"}>
        <small>{t("১ · কাউন্সেলর", "1 · Counsellor")}</small>
        {c ? <span className="v4-ticket-val"><Avatar c={c} size={36} /><b>{cn(c, lang)}</b></span> : <span className="v4-ticket-val is-empty">{t("এখন বাছাই করছেন", "Choosing now")}</span>}
        {stage !== "who" && <em>{t("বদলান", "Change")}</em>}
      </button>
      <span className="v4-ticket-cut" aria-hidden="true" />
      <div className={"v4-ticket-part" + (stage === "when" ? (slot ? " is-set is-now" : " is-now") : "")}>
        <small>{t("২ · দিন ও সময়", "2 · Day and time")}</small>
        {slot ? <span className="v4-ticket-val"><Ico n="calendar" s={22} w="duotone" /><b>{dayWord(slot.date, lang)}, {dayMonth(slot.date, lang, true)} · {clock(slot.time, lang)}</b></span>
          : <span className="v4-ticket-val is-empty">{stage === "when" ? t("এখন বাছাই করছেন", "Choosing now") : t("এরপর", "Next")}</span>}
      </div>
    </div>
    <section className={"v4-stage is-" + dir} key={stage}>
      {stage === "who" ? <>
        <h1>{t("কার সাথে কথা বলতে চান?", "Who would you like to talk to?")}</h1>
        <p className="v4-stage-lead">{t("যেকোনো কাউন্সেলর যেকোনো প্রশ্নে সাহায্য করতে পারেন। যাকে ভালো লাগে, তাকেই বেছে নিন।", "Every counsellor can help with any question. Pick whoever feels right to you.")}</p>
        <p className="v4-earliest">{t("কাকে বাছবেন বুঝতে পারছেন না?", "Not sure who to pick?")} <button className="fl-link" onClick={() => { setWho(soonest.counsellor); setSlot(soonest); go("when"); }}>{t("সবচেয়ে আগের খালি সময় নিন", "Take the earliest open time")}</button>: {cn(counsellorById(soonest.counsellor), lang)}, {dayWord(soonest.date, lang)} {dayMonth(soonest.date, lang, true)}, {clock(soonest.time, lang)}।</p>
        <div className="fl-counsellors">{counsellors.map((x) => <CounsellorCard key={x.id} c={x} selected={who === x.id} onSelect={() => choose(x.id)} />)}</div>
      </> : c && <>
        <h1>{t(`${cf(c, lang)}ের সাথে কখন কথা বলবেন?`, `When can you talk to ${cf(c, lang)}?`)}</h1>
        <p className="v4-stage-lead">{t("আগে দিন, তারপর ক্লাসের বাইরে একটা সময় বেছে নিন।", "First pick a day, then a time when you’re free from classes.")}</p>
        <SlotPicker counsellor={c.id} value={slot} onChange={setSlot} />
      </>}
    </section>
    {stage === "when" && <div className={"v4-confirm" + (slot ? " is-ready" : "")}>
      <div>{slot ? <><strong>{dayWord(slot.date, lang)}, {dayMonth(slot.date, lang)} · {clock(slot.time, lang)}</strong><span>{t(`${(c ? cn(c, lang) : "")}ের সাথে ৩০ মিনিট`, `30 minutes with ${(c ? cn(c, lang) : "")}`)}</span></>
        : <span>{t("উপরে একটি সময় বেছে নিন", "Pick a time above")}</span>}</div>
      <button className="fl-btn fl-primary big" disabled={!slot} onClick={() => { dispatch({ type: "book", slot: slot! }); onBooked(); }}>{t("সেশন বুক করুন", "Book this session")} <Ico n="arrow" s={20} w="bold" /></button>
    </div>}
  </main>;
}

/* ---------- Step 2: ask for the short form, plainly ---------- */
export function Confirmed({ onNext, onLater, fresh }: { onNext: () => void; onLater: () => void; fresh: boolean }) {
  const { upcoming } = useHub();
  const { t, lang } = useL();
  if (!upcoming) return null;
  const c = counsellorById(upcoming.slot.counsellor);
  const first = cf(c, lang);
  const sl = upcoming.slot;
  const x = counsellorText[c.id];
  return <main className="v4-main v4-step2">
    <div className={"v4-booked" + (fresh ? " is-fresh" : "")} role="status">
      <span className="v4-booked-tick"><Ico n="check" s={22} w="bold" /></span>
      <p><b>{fresh ? t("বুক হয়েছে।", "You’re booked.") : t("আপনার সেশন বুক করা আছে।", "Your session is booked.")}</b> {dayWord(sl.date, lang)}, {dayMonth(sl.date, lang, true)} · {clock(sl.time, lang)} · {cn(c, lang)}। {t("মিটিং লিংক আপনার SMS ও ইমেইলে আছে।", "The meeting link is in your SMS and email.")}</p>
    </div>
    <section className="v4-ask">
      <div className="v4-ask-main">
        <span className="fl-kicker">{t("ধাপ ২/৩", "STEP 2 OF 3")}</span>
        <h1>{t("এবার একটি ছোট ফর্ম পূরণ করুন", "Now, fill in a short form")}</h1>
        <p className="v4-ask-body">{t(`আপনার সম্পর্কে ৫টি প্রশ্ন। সেশনের আগে ${first} উত্তরগুলো পড়বেন, তাই দেখা হলে সরাসরি আপনার পরিকল্পনা নিয়ে কথা হবে।`, `5 questions about you. ${first} reads your answers before the session, so you can talk about your plan straight away.`)}</p>
        <ul className="v11-form-facts">
          <li><Ico n="tasks" s={20} w="duotone" />{t("৫টি প্রশ্ন", "5 questions")}</li>
          <li><Ico n="clock" s={20} w="duotone" />{t("২ মিনিটের মতো", "About 2 minutes")}</li>
          <li><Ico n="lock" s={20} w="duotone" />{t(`শুধু ${first} দেখবেন`, `Only ${first} sees it`)}</li>
        </ul>
        <div className="v4-next-actions"><button className="fl-btn fl-primary v4-cta" onClick={onNext}>{t("ফর্ম পূরণ করুন", "Fill in the form")} <Ico n="arrow" s={22} w="bold" /></button>
          <button className="fl-link" onClick={onLater}>{t("পরে করব", "I’ll do it later")}</button></div>
      </div>
      <aside className="v11-ask-who" aria-label={t("আপনার কাউন্সেলর", "Your counsellor")}>
        <small>{t("আপনার কাউন্সেলর", "Your counsellor")}</small>
        <Avatar c={c} size={104} />
        <b>{cn(c, lang)}</b>
        <span>{x.title[lang]}</span>
        <ul>{x.focus.map((f) => <li key={f.en}>{f[lang]}</li>)}</ul>
      </aside>
    </section>
  </main>;
}

/* The pointing plane (the Career Hub logo's plane), aimed up and right at whatever sits beside it. */
export function PlanePointer() {
  return <span className="v11-pointer" aria-hidden="true"><PlaneSvg width={44} id="ptr" /><span className="pg-ring" /></span>;
}

/* ---------- One answer ---------- */
export function AnswerInput({ q, answers, onChange }: { q: Q; answers: Answers; onChange: (a: Answers) => void }) {
  const { t, lang } = useL();
  const value = answers[q.id];
  const set = (v: string | string[]) => onChange({ ...answers, [q.id]: v });
  if (q.kind === "text") return <textarea className="fl-textarea" rows={5} aria-label={q.prompt[lang]} placeholder={t("এখানে লিখুন…", "Type here…")} value={(value as string) || ""} onChange={(e) => set(e.target.value)} />;
  const many = q.kind === "many";
  const list = many ? ((value as string[]) || []) : [];
  return <div className={"fl-options is-big" + (many ? " is-many" : "")} role={many ? "group" : "radiogroup"} aria-label={q.prompt[lang]}>
    {q.options!.map((o) => {
      const on = many ? list.includes(o.id) : value === o.id;
      const full = many && !on && list.length >= (q.max ?? 99);
      return <button key={o.id} role={many ? "checkbox" : "radio"} aria-checked={on} disabled={full} className={on ? "is-on" : ""}
        onClick={() => set(many ? (on ? list.filter((x) => x !== o.id) : [...list, o.id]) : o.id)}><span className="fl-tick">{on && <Ico n="check" s={14} w="bold" />}</span>{o.label[lang]}</button>;
    })}
  </div>;
}

/* ---------- Step 2: five questions, one per screen ---------- */
export function Questions({ onDone }: { onDone: () => void }) {
  const { answers, dispatch, testDone, upcoming } = useHub();
  const { t, lang } = useL();
  const [a, setA] = useState(answers);
  const [i, setI] = useState(0);
  const q = questions[i];
  const last = i === questions.length - 1;
  const finish = () => { dispatch({ type: "answers", answers: a, done: true }); onDone(); };
  const change = (next: Answers) => { setA(next); if (q.kind === "one") setTimeout(() => setI((x) => Math.min(x + 1, questions.length - 1)), 280); };
  const c = upcoming ? counsellorById(upcoming.slot.counsellor) : null;
  return <main className="v4-main v4-quiz">
    <div className="v4-quiz-top">
      <button className="fl-btn ghost" onClick={() => (i ? setI(i - 1) : onDone())}><Ico n="back" s={18} w="bold" /> {i ? t("আগের প্রশ্ন", "Back") : testDone ? t("বাতিল", "Cancel") : t("পরে", "Later")}</button>
      <span>{t(`প্রশ্ন ${num(i + 1, "bn")}/${num(questions.length, "bn")}`, `Question ${i + 1} of ${questions.length}`)}</span>
    </div>
    <div className="fl-progress v4-quiz-bar"><span style={{ width: `${((i + (isAnswered(q, a) ? 1 : 0)) / questions.length) * 100}%` }} /></div>
    <section className="v4-q" key={q.id}>
      <h1>{q.prompt[lang]}</h1>
      {q.help && <p>{q.help[lang]}</p>}
      <AnswerInput q={q} answers={a} onChange={change} />
    </section>
    <div className="v4-quiz-foot">
      <small><Ico n="lock" s={16} w="fill" /> {t(`শুধু ${c ? cn(c, lang) : "আপনার কাউন্সেলর"} উত্তরগুলো দেখবেন।`, `Only ${c ? cn(c, lang) : "your counsellor"} sees your answers.`)}</small>
      {last ? <button className="fl-btn fl-primary big" onClick={finish}>{testDone ? t("পরিবর্তন সেভ করুন", "Save changes") : t(`${(c ? cf(c, lang) : "") ?? "কাউন্সেলর"}কে পাঠান`, `Send to ${(c ? cf(c, lang) : "") ?? "counsellor"}`)}</button>
        : <button className="fl-btn fl-primary big" disabled={!isAnswered(q, a)} onClick={() => setI(i + 1)}>{t("পরের প্রশ্ন", "Next")} <Ico n="arrow" s={20} w="bold" /></button>}
    </div>
  </main>;
}

/* ---------- Step 3: ready for the session ---------- */
export function Ready({ onEdit }: { onEdit: () => void }) {
  const { upcoming, account, answers, testDone } = useHub();
  const { t, lang } = useL();
  if (!upcoming) return null;
  const c = counsellorById(upcoming.slot.counsellor);
  const first = cf(c, lang);
  return <main className="v4-main v4-step3">
    <div className="v4-ready-head"><span className="fl-kicker">{t("ধাপ ৩/৩", "STEP 3 OF 3")}</span><h1>{testDone ? t(`সব তৈরি, ${account!.name.split(" ")[0]}`, `You’re all set, ${account!.name.split(" ")[0]}`) : t(`প্রায় তৈরি, ${account!.name.split(" ")[0]}`, `Almost set, ${account!.name.split(" ")[0]}`)}</h1>
      <p>{testDone ? t(`এখন শুধু সেশনে যোগ দিন। ${first} সেশন শেষ করলে আপনার ক্যারিয়ার হাব খুলে যাবে।`, `Now just join your session. Your Career Hub opens after ${first} marks it complete.`)
        : t("সেশন বুক হয়ে গেছে। সেশনের আগে শুধু ছোট ফর্মটি পূরণ করে নিন।", "Your session is booked. Just fill in the short form before it.")}</p></div>
    <div className="v4-ready">
      <SessionCard s={upcoming} />
      <div className="v4-ready-side">
        <section className="fl-card">
          <h2>{t("আপনার চেকলিস্ট", "Your checklist")}</h2>
          <ul className="v4-check">
            <li className="is-done"><span><Ico n="check" s={16} w="bold" /></span>{t("সেশন বুক হয়েছে", "Session booked")}</li>
            {testDone ? <li className="is-done"><span><Ico n="check" s={16} w="bold" /></span>{t(`${first}কে উত্তর পাঠানো হয়েছে`, `Answers sent to ${first}`)} <button className="fl-link" onClick={onEdit}>{t("বদলান", "Edit")}</button></li>
              : <li className="is-todo"><span /> {t("ছোট ফর্মটি পূরণ করুন", "Fill in the short form")}</li>}
            <li><span /> {t("সময়মতো যোগ দিন, ৩০ মিনিট কথা বলুন", "Join on time and talk for 30 minutes")}</li>
          </ul>
        </section>
        {testDone ? <section className="fl-card v4-after">
          <h2>{t("আপনার উত্তর", "Your answers")}</h2>
          <dl className="v11-answers">{questions.slice(0, 4).map((q) => <div key={q.id}><dt>{q.prompt[lang]}</dt><dd>{answerText(q, answers, lang)}</dd></div>)}</dl>
        </section>
          : <section className="fl-card v11-form-due">
            <span className="v11-form-due-tag">{t("এখনও বাকি", "Still to do")}</span>
            <h2>{t("ছোট ফর্মটি পূরণ করুন", "Fill in the short form")}</h2>
            <p>{t(`৫টি প্রশ্ন, ২ মিনিট। সেশনের আগে করলে ${first} আপনাকে আগে থেকেই বুঝতে পারবেন।`, `5 questions, 2 minutes. Do it before the session so ${first} knows you already.`)}</p>
            <div className="v11-form-due-go"><PlanePointer /><button className="fl-btn fl-primary big" onClick={onEdit}>{t("ফর্ম পূরণ করুন", "Fill in the form")} <Ico n="arrow" s={20} w="bold" /></button></div>
          </section>}
      </div>
    </div>
  </main>;
}
