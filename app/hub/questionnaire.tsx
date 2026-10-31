"use client";
import { useEffect, useRef, useState } from "react";
import { text, type Copy, type Language, type Profile } from "../career/data";
import { cities, interestOptions, statusOptions, universities } from "./data";

type Props = { language: Language; profile: Profile; onChange: (update: (p: Profile) => Profile) => void };

function Choices({ name, options, value, onPick, language }: {
  name: string; options: { value: string; label: Copy }[]; value?: string; onPick: (value: string) => void; language: Language;
}) {
  return <div className="hub-choices">{options.map((o) => <label key={o.value} className={value === o.value ? "selected" : ""}>
    <input type="radio" name={name} value={o.value} required checked={value === o.value} onChange={() => onPick(o.value)} />
    <span>{text(language, o.label)}</span>
  </label>)}</div>;
}

// The four onboarding questions, shared by the questionnaire and the profile page.
export function QuestionFields({ language, profile, onChange, prefix = "q" }: Props & { prefix?: string }) {
  const t = (copy: Copy) => text(language, copy);
  const set = (key: string) => (value: string) => onChange((p) => ({ ...p, [key]: value }));
  return <div className="hub-questions">
    <fieldset>
      <legend><span>1</span>{t(["What best describes you right now?", "এই মুহূর্তে আপনার অবস্থা কোনটি?"])}</legend>
      <Choices name={prefix + "-situation"} options={statusOptions} value={profile.situation} onPick={set("situation")} language={language} />
    </fieldset>
    <fieldset>
      <legend><span>2</span>{t(["Which university are you from?", "আপনি কোন বিশ্ববিদ্যালয়ের?"])}</legend>
      <input list={prefix + "-universities"} required aria-label={t(["University", "বিশ্ববিদ্যালয়"])} placeholder={t(["Start typing your university", "বিশ্ববিদ্যালয়ের নাম লিখুন"])} value={profile.institution || ""} onChange={(e) => set("institution")(e.target.value)} />
      <datalist id={prefix + "-universities"}>{universities.map((u) => <option key={u} value={u} />)}</datalist>
    </fieldset>
    <fieldset>
      <legend><span>3</span>{t(["Where are you based?", "আপনি কোথায় থাকেন?"])}</legend>
      <select required aria-label={t(["City", "শহর"])} value={profile.location || ""} onChange={(e) => set("location")(e.target.value)}>
        <option value="">{t(["Choose your city", "শহর বেছে নিন"])}</option>
        {cities.map((c) => <option key={c.value} value={c.value}>{t(c.label)}</option>)}
      </select>
      <small>{t(["Used to suggest in-person seminars and courses near you.", "কাছাকাছি সেমিনার ও কোর্সের পরামর্শ দিতে ব্যবহার হবে।"])}</small>
    </fieldset>
    <fieldset>
      <legend><span>4</span>{t(["Which area interests you most?", "কোন ক্ষেত্রে আপনার আগ্রহ বেশি?"])}</legend>
      <Choices name={prefix + "-roles"} options={interestOptions} value={profile.roles} onPick={set("roles")} language={language} />
    </fieldset>
  </div>;
}

export function Questionnaire({ language, profile, onChange, onBack, onComplete }: Props & { onBack: () => void; onComplete: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const t = (copy: Copy) => text(language, copy);
  useEffect(() => { heading.current?.focus(); }, []);
  return <div className="career-onboarding hub-onboarding">
    <aside><span className="career-kicker">{t(["ALMOST THERE", "প্রায় শেষ"])}</span>
      <h1>{t(["Four quick questions.", "চারটি ছোট প্রশ্ন।"])}</h1>
      <p>{t(["Nothing personal. We only use your city and interests to suggest seminars, courses and jobs. You can change these later in My Profile.", "ব্যক্তিগত কিছু নয়। শুধু শহর ও আগ্রহ অনুযায়ী সেমিনার, কোর্স ও চাকরির পরামর্শ দিতে ব্যবহার হবে। পরে ‘আমার প্রোফাইল’ থেকে বদলাতে পারবেন।"])}</p>
    </aside>
    <section className="career-question-panel">
      <h2 ref={heading} tabIndex={-1}>{t(["Hi", "হ্যালো"])} {profile.name?.split(" ")[0]}, {t(["tell us a little about you", "নিজের সম্পর্কে একটু জানান"])}</h2>
      <form onSubmit={(e) => { e.preventDefault(); onComplete(); }}>
        <QuestionFields language={language} profile={profile} onChange={onChange} />
        <footer className="career-form-footer"><button className="career-button" type="button" onClick={onBack}>{t(["Back", "পেছনে"])}</button>
          <button className="career-button primary" type="submit">{t(["Go to my Career Hub", "আমার ক্যারিয়ার হাবে যান"])} <span aria-hidden="true">→</span></button></footer>
      </form>
    </section>
  </div>;
}

export function HubProfile({ language, profile, onSave }: { language: Language; profile: Profile; onSave: (profile: Profile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [last, setLast] = useState(profile);
  // Pick up changes made elsewhere (e.g. the returning demo user) while not editing.
  if (last !== profile) { setLast(profile); setDraft(profile); }
  const t = (copy: Copy) => text(language, copy);
  const change = (update: (p: Profile) => Profile) => { setDraft(update); setSaved(false); };
  return <>
    <header className="career-heading"><h1>{t(["My Profile", "আমার প্রোফাইল"])}</h1><p>{t(["Your city and interests decide which seminars, courses and jobs you see first.", "আপনার শহর ও আগ্রহ অনুযায়ী সেমিনার, কোর্স ও চাকরি আগে দেখানো হয়।"])}</p></header>
    <form className="career-profile-form hub-profile-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...draft }); setSaved(true); }}>
      <section><h2>{t(["Account", "অ্যাকাউন্ট"])}</h2><div className="career-fields">
        <label><span>{t(["Full name", "পুরো নাম"])}</span><input required value={draft.name || ""} onChange={(e) => change((p) => ({ ...p, name: e.target.value }))} /></label>
        <label><span>{t(["Email", "ইমেইল"])}</span><input type="email" required value={draft.email || ""} onChange={(e) => change((p) => ({ ...p, email: e.target.value }))} /></label>
      </div></section>
      <section><h2>{t(["About you", "আপনার সম্পর্কে"])}</h2><QuestionFields language={language} profile={draft} onChange={change} prefix="profile" /></section>
      <footer className="career-form-footer"><span role="status">{saved ? t(["Profile saved. Suggestions are updated.", "প্রোফাইল সংরক্ষিত। পরামর্শ হালনাগাদ হয়েছে।"]) : ""}</span><button className="career-button primary" type="submit">{t(["Save profile", "প্রোফাইল সংরক্ষণ"])}</button></footer>
    </form>
  </>;
}
