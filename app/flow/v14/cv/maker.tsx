"use client";
// v14 CV maker, simplified from ScholarTrack's: details on the left, a live A4 preview on the
// right (Professional or Modern template). On phones the two become "Edit" and "Preview" tabs.
// "Download PDF" opens the browser's print dialog with only the CV page, ready to save as PDF.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { I } from "../../parts";
import { useL } from "../../v11/lang";
import { useHub } from "../../v11/store";
import { emptyCert, emptyEdu, emptyExp, emptyRef, startingCv, templates, type CV, type TemplateId } from "./data";
import { CvPage } from "./templates";
import "./cv.css";

const KEY = "careerhub-v14-cv";
const lines = (v: string) => v.split("\n");
const join = (l: string[]) => l.join("\n");

export function CvMaker() {
  const { account } = useHub();
  const { t } = useL();
  const [cv, setCv] = useState<CV>(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) as CV; } catch { /* first visit or storage blocked */ }
    return startingCv(account!);
  });
  const [tpl, setTpl] = useState<TemplateId>("professional");
  const [view, setView] = useState<"edit" | "preview">("edit");
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(cv)); } catch { /* ignore */ } }, [cv]);
  const set = <K extends keyof CV>(k: K, v: CV[K]) => setCv((x) => ({ ...x, [k]: v }));

  return <div className="cvm">
    <div className="cvm-top">
      <div className="cvm-title"><span className="fl-kicker">{t("সিভি স্টুডিও", "CV STUDIO")}</span><small>{t("বাঁ পাশে লিখুন, ডান পাশে সিভি দেখুন", "Write on the left, see your CV on the right")}</small></div>
      <div className="cvm-switch" role="tablist">
        <button role="tab" aria-selected={view === "edit"} onClick={() => setView("edit")}><I n="edit" s={16} /> {t("লিখুন", "Edit")}</button>
        <button role="tab" aria-selected={view === "preview"} onClick={() => setView("preview")}><I n="doc" s={16} /> {t("দেখুন", "Preview")}</button>
      </div>
      <div className="cvm-tpls" role="radiogroup" aria-label={t("টেমপ্লেট", "Template")}>{templates.map((x) => <button key={x.id} role="radio" aria-checked={tpl === x.id} title={x.about} onClick={() => setTpl(x.id)}>{x.name}</button>)}</div>
      <button className="fl-btn fl-primary cvm-dl" onClick={() => window.print()}><I n="doc" s={16} /> {t("PDF ডাউনলোড", "Download PDF")}</button>
    </div>
    <div className={"cvm-split is-" + view}>
      <div className="cvm-form" lang="en"><Form cv={cv} set={set} reset={() => setCv(startingCv(account!))} /></div>
      <div className="cvm-preview">
        <Scaled><CvPage d={cv} template={tpl} /></Scaled>
      </div>
    </div>
    {typeof document !== "undefined" && createPortal(<div className="cvm-print" aria-hidden="true"><CvPage d={cv} template={tpl} /></div>, document.body)}
  </div>;
}

// Shows the A4 page (794 px wide) scaled down to fit the preview column.
function Scaled({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [h, setH] = useState(1123);
  useLayoutEffect(() => {
    const el = box.current, pg = page.current;
    if (!el || !pg) return;
    const fit = () => { const s = Math.min(1, el.clientWidth / 794); setScale(s); setH(Math.max(1123, pg.scrollHeight) * s); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el); ro.observe(pg);
    return () => ro.disconnect();
  }, []);
  return <div className="cvm-stage" ref={box} style={{ height: h }}>
    <div className="cvm-page" ref={page} style={{ transform: `scale(${scale})` }}>{children}</div>
  </div>;
}

/* ---------- The form ---------- */
function Section({ title, children, open = false, count }: { title: string; children: ReactNode; open?: boolean; count?: number }) {
  return <details className="cvm-sec" open={open}>
    <summary><span>{title}</span>{count !== undefined && <small>{count}</small>}<I n="arrow" s={15} /></summary>
    <div className="cvm-sec-body">{children}</div>
  </details>;
}
const Field = ({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) =>
  <label className="fl-field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
const Lines = ({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; rows?: number }) =>
  <label className="fl-field"><span>{label} <small>(one per line)</small></span><textarea className="fl-textarea" rows={rows} value={join(value)} placeholder={placeholder} onChange={(e) => onChange(lines(e.target.value))} /></label>;

function List<T>({ items, onChange, make, render, noun }: { items: T[]; onChange: (l: T[]) => void; make: () => T; render: (x: T, set: (x: T) => void) => ReactNode; noun: string }) {
  return <div className="cvm-list">
    {items.map((x, i) => <div key={i} className="cvm-item">
      <div className="cvm-item-head"><b>{noun} {i + 1}</b>
        <span>{i > 0 && <button type="button" className="fl-icon-btn" aria-label="Move up" onClick={() => { const l = [...items]; [l[i - 1], l[i]] = [l[i], l[i - 1]]; onChange(l); }}><I n="arrow" s={14} /></button>}
          <button type="button" className="fl-icon-btn" aria-label={`Remove ${noun}`} onClick={() => onChange(items.filter((_, k) => k !== i))}><I n="x" s={15} /></button></span></div>
      {render(x, (v) => onChange(items.map((y, k) => (k === i ? v : y))))}
    </div>)}
    <button type="button" className="fl-btn cvm-add" onClick={() => onChange([...items, make()])}>+ Add {noun.toLowerCase()}</button>
  </div>;
}

function Form({ cv, set, reset }: { cv: CV; set: <K extends keyof CV>(k: K, v: CV[K]) => void; reset: () => void }) {
  const photo = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => set("photo", String(r.result)); r.readAsDataURL(f); };
  return <>
    <Section title="Personal details" open>
      <div className="cvm-grid">
        <Field label="Full name" value={cv.name} onChange={(v) => set("name", v)} />
        <Field label="Email" type="email" value={cv.email} onChange={(v) => set("email", v)} />
        <Field label="Phone" value={cv.phone} onChange={(v) => set("phone", v)} />
        <Field label="Address" value={cv.address} onChange={(v) => set("address", v)} placeholder="City, Country" />
      </div>
      <label className="fl-field"><span>Summary</span><textarea className="fl-textarea" rows={4} value={cv.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Two or three sentences about you and what you’re looking for." /></label>
      <div className="cvm-photo">
        <span className="cvm-photo-img">{cv.photo ? <img src={cv.photo} alt="" /> : <I n="user" s={22} />}</span>
        <div><b>Photo</b><small>Shown in the Modern template.</small></div>
        <label className="fl-btn cvm-file">Upload<input type="file" accept="image/*" onChange={(e) => photo(e.target.files?.[0])} /></label>
        {cv.photo && <button type="button" className="fl-link" onClick={() => set("photo", undefined)}>Remove</button>}
      </div>
    </Section>
    <Section title="Education" count={cv.education.length}>
      <List items={cv.education} onChange={(l) => set("education", l)} make={emptyEdu} noun="Education" render={(e, put) => <>
        <div className="cvm-grid"><Field label="School or university" value={e.school} onChange={(v) => put({ ...e, school: v })} /><Field label="Degree" value={e.degree} onChange={(v) => put({ ...e, degree: v })} />
          <Field label="Location" value={e.location} onChange={(v) => put({ ...e, location: v })} /><Field label="Years" value={e.year} onChange={(v) => put({ ...e, year: v })} placeholder="2024 – 2028" /></div>
        <Lines label="Details" value={e.details} onChange={(v) => put({ ...e, details: v })} placeholder="CGPA, relevant courses, awards" rows={2} /></>} />
    </Section>
    <Section title="Experience" count={cv.experience.length}>
      <List items={cv.experience} onChange={(l) => set("experience", l)} make={emptyExp} noun="Experience" render={(e, put) => <>
        <div className="cvm-grid"><Field label="Organisation" value={e.company} onChange={(v) => put({ ...e, company: v })} /><Field label="Role" value={e.role} onChange={(v) => put({ ...e, role: v })} />
          <Field label="Location" value={e.location} onChange={(v) => put({ ...e, location: v })} /><Field label="Dates" value={e.duration} onChange={(v) => put({ ...e, duration: v })} placeholder="Jan 2025 – Present" /></div>
        <Lines label="What you did" value={e.description} onChange={(v) => put({ ...e, description: v })} placeholder="Start each line with an action: Organised, Built, Led…" /></>} />
    </Section>
    <Section title="Skills" count={cv.skills.filter((x) => x.trim()).length}>
      <Lines label="Skills" value={cv.skills} onChange={(v) => set("skills", v)} placeholder={"Microsoft Excel\nPublic speaking"} rows={5} />
    </Section>
    <Section title="Certifications" count={cv.certifications.length}>
      <List items={cv.certifications} onChange={(l) => set("certifications", l)} make={emptyCert} noun="Certification" render={(c, put) =>
        <div className="cvm-grid is-3"><Field label="Title" value={c.title} onChange={(v) => put({ ...c, title: v })} /><Field label="Institution" value={c.institution} onChange={(v) => put({ ...c, institution: v })} /><Field label="Year" value={c.year} onChange={(v) => put({ ...c, year: v })} /></div>} />
    </Section>
    <Section title="Achievements" count={cv.achievements.filter((x) => x.trim()).length}>
      <Lines label="Achievements" value={cv.achievements} onChange={(v) => set("achievements", v)} placeholder="Dean’s List, Spring 2025" rows={4} />
    </Section>
    <Section title="References" count={cv.references.length}>
      <List items={cv.references} onChange={(l) => set("references", l)} make={emptyRef} noun="Reference" render={(r, put) =>
        <div className="cvm-grid"><Field label="Name" value={r.name} onChange={(v) => put({ ...r, name: v })} /><Field label="Position" value={r.position} onChange={(v) => put({ ...r, position: v })} />
          <Field label="Email" value={r.contact} onChange={(v) => put({ ...r, contact: v })} /><Field label="Phone" value={r.phone} onChange={(v) => put({ ...r, phone: v })} /></div>} />
    </Section>
    <button type="button" className="fl-link cvm-reset" onClick={reset}>Start again from the sample CV</button>
  </>;
}
