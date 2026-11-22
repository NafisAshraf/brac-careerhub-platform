"use client";
// Picking courses or jobs from the Career Hub database: two plain panels side by side.
// Left, the library (search, topic filter, AI suggestions first). Right, what the student gets.
// "Add" and "Remove" move a row across; the chevron opens more about it.
import { useState } from "react";
import { I } from "../../flow/parts";
import { byId, db, type Pick, type Student } from "./db";
import { cname, type Edit } from "./student";
import { first, me } from "./desk";

export function Picker({ s, edit, kind }: { s: Student; edit: Edit; kind: "course" | "job" }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const [moved, setMoved] = useState<string | null>(null);
  const key = kind === "course" ? "courses" : "jobs";
  const picks: Pick[] = s[key];
  const why = (id: string) => s.ai[key].find((x) => x.id === id)?.why;
  const all = db.filter((x) => x.kind === kind);
  const tags = ["All", ...new Set(all.flatMap((x) => x.tags))];
  const left = all.filter((x) => !picks.some((p) => p.id === x.id))
    .filter((x) => tag === "All" || x.tags.includes(tag))
    .filter((x) => !q || (x.title + x.org + x.tags.join(" ")).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(!!why(b.id)) - Number(!!why(a.id)));
  const set = (f: (l: Pick[]) => Pick[]) => edit((x) => ({ ...x, [key]: f(x[key]) }));
  const add = (id: string) => { set((l) => [...l, { id, by: me.id, ai: !!why(id) }]); setMoved(id); setOpen(null); };
  const remove = (id: string) => { set((l) => l.filter((p) => p.id !== id)); setMoved(id); setOpen(null); };
  const noun = kind === "course" ? "course" : "job";

  const row = (id: string, side: "left" | "right", p?: Pick) => {
    const x = byId(id);
    const on = open === id;
    return <li key={id} className={(moved === id ? "is-moved " : "") + (on ? "is-open" : "")}>
      <div className="c3-item">
        <img src={x.image} alt="" />
        <div className="c3-item-text">
          <b>{x.title}</b>
          <small>{x.org} · {x.meta}</small>
          {side === "left" ? why(id) && <span className="c3-ai-tag">AI suggests</span>
            : <span className="c3-item-by">{p!.ai ? <span className="c3-ai-tag">AI pick</span> : `Added by ${cname(p!.by)}`}{p!.note ? " · note added" : ""}</span>}
        </div>
        <button className="fl-icon-btn c3-chev" aria-expanded={on} aria-label="More details" onClick={() => setOpen(on ? null : id)}><I n="arrow" s={15} /></button>
        {side === "left" ? <button className="c3-act" onClick={() => add(id)}>Add</button> : <button className="c3-act is-remove" onClick={() => remove(id)}>Remove</button>}
      </div>
      {on && <div className="c3-details">
        <p>{x.about}</p>
        {why(id) && <p className="c3-why"><I n="spark" s={13} /> {why(id)}</p>}
        <div className="c3-tagline">{x.tags.map((t) => <span key={t}>{t}</span>)}<a href={x.link} target="_blank" rel="noreferrer">Open link <I n="external" s={13} /></a></div>
        {side === "right" && <label className="fl-field"><span>Note for {first(s)} <small>(optional, shows on the card)</small></span>
          <textarea className="fl-textarea" rows={2} value={p!.note ?? ""} placeholder={kind === "course" ? "e.g. Start with weeks 1–2." : "e.g. Apply after your CV draft."}
            onChange={(e) => set((l) => l.map((y) => (y.id === id ? { ...y, note: e.target.value } : y)))} /></label>}
      </div>}
    </li>;
  };

  return <div className="c3-split">
    <section className="c3-panel">
      <header className="c3-panel-head">
        <div><b>{kind === "course" ? "Course library" : "Job library"}</b><small>{left.length} available</small></div>
        <input className="c3-panel-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}s by name, provider or topic`} aria-label={`Search ${noun}s`} />
        <div className="c3-tags">{tags.map((t) => <button key={t} aria-pressed={tag === t} onClick={() => setTag(t)}>{t}</button>)}</div>
      </header>
      <ul className="c3-rows">{left.map((x) => row(x.id, "left"))}</ul>
      {!left.length && <p className="fl-muted c3-panel-empty">Nothing matches.</p>}
    </section>
    <section className="c3-panel is-picked">
      <header className="c3-panel-head">
        <div><b>Selected for {first(s)}</b><small>{picks.length} {noun}{picks.length === 1 ? "" : "s"}</small></div>
        <p className="fl-muted">AI’s picks are already here. Remove what doesn’t fit and add from the library.</p>
      </header>
      {picks.length ? <ul className="c3-rows">{picks.map((p) => row(p.id, "right", p))}</ul> : <p className="fl-muted c3-panel-empty">Nothing selected yet.</p>}
    </section>
  </div>;
}
