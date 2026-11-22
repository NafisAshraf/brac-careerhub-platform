"use client";
// Picking courses or jobs from the Career Hub database. Left: everything, with search and topic
// filters, AI suggestions first. Right: what the student gets. Click a row to move it across;
// the small arrow on a row opens more about it (and, on the right, a note for the student).
import { useState } from "react";
import { I } from "../../flow/parts";
import { useDesk } from "./store";
import { byId, db, type Pick, type Student } from "./db";
import { cname } from "./student";
import { first, me } from "./desk";

export function Picker({ s, kind }: { s: Student; kind: "course" | "job" }) {
  const { update } = useDesk();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [openL, setOpenL] = useState<string | null>(null);
  const [openR, setOpenR] = useState<string | null>(null);
  const [moved, setMoved] = useState<string | null>(null);
  const key = kind === "course" ? "courses" : "jobs";
  const picks: Pick[] = s[key];
  const ai = s.ai[key];
  const why = (id: string) => ai.find((x) => x.id === id)?.why;
  const all = db.filter((x) => x.kind === kind);
  const tags = ["All", ...new Set(all.flatMap((x) => x.tags))];
  const left = all.filter((x) => !picks.some((p) => p.id === x.id))
    .filter((x) => tag === "All" || x.tags.includes(tag))
    .filter((x) => !q || (x.title + x.org + x.tags.join(" ")).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(!!why(b.id)) - Number(!!why(a.id)));
  const set = (f: (l: Pick[]) => Pick[]) => update(s.id, (x) => ({ ...x, [key]: f(x[key]) }));
  const add = (id: string) => { set((l) => [...l, { id, by: me.id, ai: !!why(id) }]); setMoved(id); setOpenL(null); };
  const remove = (id: string) => { set((l) => l.filter((p) => p.id !== id)); setMoved(id); setOpenR(null); };
  const noun = kind === "course" ? "course" : "job";
  const locked = !s.unlock.includes(key);

  return <>
    {locked && <p className="c2-hint"><I n="info" s={15} /> {kind === "course" ? "Courses" : "Jobs & internships"} {kind === "course" ? "is" : "are"} turned off in Access, so {first(s)} won’t see these until you turn it on. <button className="fl-link" onClick={() => update(s.id, (x) => ({ ...x, unlock: [...x.unlock, key] }))}>Turn on now</button></p>}
    <div className="c3-split">
      <section className="fl-card c3-pane">
        <div className="c3-pane-head"><span className="fl-kicker">ALL {noun.toUpperCase()}S</span><small className="fl-muted">{left.length} shown</small></div>
        <div className="c2-search c3-pane-search"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}s`} aria-label={`Search ${noun}s`} /></div>
        <div className="c3-tags">{tags.map((t) => <button key={t} aria-pressed={tag === t} onClick={() => setTag(t)}>{t}</button>)}</div>
        <ul className="c3-list">{left.map((x) => <li key={x.id} className={moved === x.id ? "is-moved" : ""}>
          <div className="c3-row">
            <button className="c3-row-main" onClick={() => add(x.id)} title={`Give this to ${first(s)}`}>
              <img src={x.image} alt="" />
              <span><b>{x.title}</b><small>{x.org}</small>{why(x.id) && <em className="c3-ai"><I n="spark" s={12} /> AI suggests</em>}</span>
              <span className="c3-move" aria-hidden="true"><I n="arrow" s={16} /></span>
            </button>
            <button className="fl-icon-btn c3-more" aria-expanded={openL === x.id} aria-label="More about this" onClick={() => setOpenL(openL === x.id ? null : x.id)}><I n="info" s={16} /></button>
          </div>
          {openL === x.id && <Details id={x.id} why={why(x.id)} />}
        </li>)}</ul>
        {!left.length && <p className="fl-muted c2-empty">Nothing matches.</p>}
      </section>

      <section className="fl-card c3-pane is-picked">
        <div className="c3-pane-head"><span className="fl-kicker">FOR {first(s).toUpperCase()}</span><small className="fl-muted">{picks.length} selected</small></div>
        {picks.length ? <ul className="c3-list">{picks.map((p) => { const x = byId(p.id); return <li key={p.id} className={moved === p.id ? "is-moved" : ""}>
          <div className="c3-row">
            <button className="c3-row-main" onClick={() => remove(p.id)} title="Take this back">
              <span className="c3-move is-back" aria-hidden="true"><I n="back" s={16} /></span>
              <img src={x.image} alt="" />
              <span><b>{x.title}</b><small>{x.org}</small><em className="c3-by">{p.ai ? "Suggested by AI" : `Added by ${cname(p.by)}`}{p.note ? " · has a note" : ""}</em></span>
            </button>
            <button className="fl-icon-btn c3-more" aria-expanded={openR === p.id} aria-label="More and note" onClick={() => setOpenR(openR === p.id ? null : p.id)}><I n="edit" s={16} /></button>
          </div>
          {openR === p.id && <Details id={p.id} why={why(p.id)}>
            <label className="fl-field"><span>Note for {first(s)} <small>(optional, shows on the card)</small></span>
              <textarea className="fl-textarea" rows={2} defaultValue={p.note ?? ""} placeholder={kind === "course" ? "e.g. Start with weeks 1–2." : "e.g. Apply after your CV draft."}
                onBlur={(e) => e.target.value !== (p.note ?? "") && set((l) => l.map((y) => (y.id === p.id ? { ...y, note: e.target.value } : y)))} /></label>
          </Details>}
        </li>; })}</ul> : <p className="fl-muted c2-empty">Nothing selected. Click a {noun} on the left to add it.</p>}
      </section>
    </div>
  </>;
}

function Details({ id, why, children }: { id: string; why?: string; children?: React.ReactNode }) {
  const x = byId(id);
  return <div className="c3-details">
    <p>{x.about}</p>
    <small>{x.meta}</small>
    {why && <p className="c3-why"><I n="spark" s={13} /> {why}</p>}
    <div className="c3-tagline">{x.tags.map((t) => <span key={t}>{t}</span>)}<a href={x.link} target="_blank" rel="noreferrer">Open link <I n="external" s={13} /></a></div>
    {children}
  </div>;
}
