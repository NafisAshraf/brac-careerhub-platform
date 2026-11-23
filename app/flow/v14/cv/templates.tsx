// The two CV templates from ScholarTrack's CV maker (Professional and Modern), drawn as an A4 page
// in HTML so the preview is live and the browser can save it as a PDF.
import type { CV, TemplateId } from "./data";

const has = (l: string[]) => l.some((x) => x.trim());
const Bullets = ({ items }: { items: string[] }) => has(items) ? <ul>{items.filter((x) => x.trim()).map((x, i) => <li key={i}>{x}</li>)}</ul> : null;

function Professional({ d }: { d: CV }) {
  const edu = d.education.filter((e) => e.school.trim());
  const exp = d.experience.filter((e) => e.company.trim());
  const refs = d.references.filter((r) => r.name.trim());
  const certs = d.certifications.filter((c) => c.title.trim());
  return <div className="cvt cvt-pro">
    <header className="cvt-pro-head">
      <h1>{d.name || "Your Name"}</h1>
      <p>{[d.email, d.phone].filter(Boolean).join(" | ")}</p>
      {d.address && <p>{d.address}</p>}
    </header>
    {d.summary.trim() && <section><h2>Summary</h2><p className="cvt-just">{d.summary}</p></section>}
    {edu.length > 0 && <section><h2>Education</h2>{edu.map((e, i) => <div key={i} className="cvt-entry">
      <div className="cvt-row"><b>{e.school}</b><b className="cvt-sm">{e.location}</b></div>
      <div className="cvt-row"><i className="cvt-strong">{e.degree}</i><i>{e.year}</i></div>
      <Bullets items={e.details} /></div>)}</section>}
    {exp.length > 0 && <section><h2>Experience</h2>{exp.map((e, i) => <div key={i} className="cvt-entry">
      <div className="cvt-row"><b>{e.company}</b><b className="cvt-sm">{e.location}</b></div>
      <div className="cvt-row"><i className="cvt-strong">{e.role}</i><i>{e.duration}</i></div>
      <Bullets items={e.description} /></div>)}</section>}
    {has(d.skills) && <section><h2>Skills</h2><div className="cvt-chips">{d.skills.filter((x) => x.trim()).map((x, i) => <span key={i}>{x}</span>)}</div></section>}
    {certs.length > 0 && <section><h2>Certifications</h2>{certs.map((c, i) => <div key={i} className="cvt-entry is-tight">
      <div className="cvt-row"><b>{c.title}</b><i>{c.year}</i></div><i className="cvt-strong">{c.institution}</i></div>)}</section>}
    {has(d.achievements) && <section><h2>Achievements</h2><Bullets items={d.achievements} /></section>}
    {refs.length > 0 && <section><h2>References</h2><div className="cvt-refs">{refs.map((r, i) => <div key={i}>
      <b>{r.name}</b>{r.position && <span>{r.position}</span>}{r.contact && <span>{r.contact}</span>}{r.phone && <span>{r.phone}</span>}</div>)}</div></section>}
  </div>;
}

function Modern({ d }: { d: CV }) {
  const edu = d.education.filter((e) => e.school.trim());
  const exp = d.experience.filter((e) => e.company.trim());
  const refs = d.references.filter((r) => r.name.trim());
  const certs = d.certifications.filter((c) => c.title.trim());
  return <div className="cvt cvt-mod">
    <aside>
      <div className="cvt-mod-photo">{d.photo ? <img src={d.photo} alt="" /> : <span>{(d.name || "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}</span>}</div>
      <div className="cvt-mod-contact">{d.email && <p>{d.email}</p>}{d.phone && <p>{d.phone}</p>}{d.address && <p>{d.address}</p>}</div>
      {has(d.skills) && <section><h3>Skills</h3><ul>{d.skills.filter((x) => x.trim()).map((x, i) => <li key={i}>{x}</li>)}</ul></section>}
      {certs.length > 0 && <section><h3>Certifications</h3>{certs.map((c, i) => <div key={i} className="cvt-mod-cert"><b>{c.title}</b><span>{c.institution}{c.year && ` (${c.year})`}</span></div>)}</section>}
      {has(d.achievements) && <section><h3>Achievements</h3><ul>{d.achievements.filter((x) => x.trim()).map((x, i) => <li key={i}>{x}</li>)}</ul></section>}
    </aside>
    <main>
      <header className="cvt-mod-head"><h1>{d.name || "Your Name"}</h1></header>
      {d.summary.trim() && <p className="cvt-just cvt-mod-sum">{d.summary}</p>}
      {exp.length > 0 && <section><h2>Experience</h2>{exp.map((e, i) => <div key={i} className="cvt-entry">
        <b className="cvt-mod-role">{e.role}</b><div className="cvt-mod-org">{e.company}{e.location && ` · ${e.location}`}</div>{e.duration && <i className="cvt-mod-when">{e.duration}</i>}
        <Bullets items={e.description} /></div>)}</section>}
      {edu.length > 0 && <section><h2>Education</h2>{edu.map((e, i) => <div key={i} className="cvt-entry">
        <b className="cvt-mod-role">{e.degree}</b><div className="cvt-mod-org">{e.school}{e.location && ` · ${e.location}`}</div>{e.year && <i className="cvt-mod-when">{e.year}</i>}
        <Bullets items={e.details} /></div>)}</section>}
      {refs.length > 0 && <section><h2>References</h2><div className="cvt-refs">{refs.map((r, i) => <div key={i}>
        <b>{r.name}</b>{r.position && <span>{r.position}</span>}{r.contact && <span>{r.contact}</span>}{r.phone && <span>{r.phone}</span>}</div>)}</div></section>}
    </main>
  </div>;
}

export function CvPage({ d, template }: { d: CV; template: TemplateId }) {
  return template === "modern" ? <Modern d={d} /> : <Professional d={d} />;
}
