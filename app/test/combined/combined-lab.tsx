"use client";
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { programImage } from "../../student/program-images";
import {
  daysUntilDeadline,
  formatDate,
  initialProfile,
  programs,
  universityScholarships,
  type Program,
} from "../../student/data";
import { programReadiness, type ReadinessItem } from "../../student/readiness";
import { Icon } from "../../student/ui";
import { generateHref, programKit, useLab, type KitItem, type LabState } from "../../hub/abroad-store";
import "../../career/career.css";
import "../../student/workspace.css";
import "../../student/workspace-surfaces.css";
import "../lab.css";
import "./combined.css";

type Handlers = {
  state: LabState;
  onFavorite: (id: string) => void;
  onUpload: (id: string, requirement: string, filename: string) => void;
  onOpen: (id: string) => void;
};

/* ---------- Icons ---------- */
const glyphs = {
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  back: "M19 12H5 M11 6l-6 6 6 6",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  spark: "m12 3 2 5.5L19.5 10.5 14 12.5 12 18l-2-5.5L4.5 10.5 10 8.5Z",
  upload: "M12 16V4 M7 9l5-5 5 5 M5 20h14",
  check: "m5 12 4.5 4.5L19 7",
  alert: "M12 8v5 M12 16.5v.5 M10.3 4 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z",
  question: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.4 M12 17h.01",
  chev: "m6 9 6 6 6-6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 2",
  requirements: "M9 5h10 M9 12h10 M9 19h10 M4 5l1 1 2-2 M4 12l1 1 2-2 M4 19l1 1 2-2",
  documents: "M7 3h7l5 5v13H7Z M14 3v5h5 M10 13h6 M10 17h4",
  progress: "M4 20h4L19 9l-4-4L4 16v4Z M13 7l4 4",
  SOP: "M4 20h4L19 9l-4-4L4 16v4Z M13 7l4 4",
  CV: "M4 5h16v14H4Z M9 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M6 16.5c.8-1.6 1.8-2.2 3-2.2s2.2.6 3 2.2 M14.5 10h3.5 M14.5 14h3.5",
  LOR: "M3 6h18v12H3Z M3 7l9 6 9-6",
  Essay: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M9 13l-2 8 5-3 5 3-2-8",
  "Academic transcript": "M2 9l10-5 10 5-10 5Z M6 11v5c3 2 9 2 12 0v-5",
  "English test evidence": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
} as const;

function Glyph({ name, filled, size = 16 }: { name: string; filled?: boolean; size?: number }) {
  const d = glyphs[name as keyof typeof glyphs] || glyphs.documents;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const tone = (item: KitItem) => (item.done ? "done" : item.started ? "started" : "todo");

function statusText(item: KitItem) {
  if (item.count > 1) return `${Math.min(item.current, item.count)} of ${item.count} ready`;
  if (item.file && item.drafts) return `Draft saved · ${item.file}`;
  if (item.file) return `Uploaded · ${item.file}`;
  if (item.drafts) return "Draft saved";
  return item.kind === "upload" ? "Upload needed" : "Not started";
}

const requirementsFor = (p: Program) => programReadiness(p, initialProfile).items;
const reqLabel: Record<ReadinessItem["status"], string> = { met: "Met", attention: "Below minimum", unknown: "Add details", review: "Needs review" };
const reqIcon: Record<ReadinessItem["status"], string> = { met: "check", attention: "alert", unknown: "question", review: "question" };

/* ---------- Small pieces ---------- */
function FavoriteButton({ program, favorite, onFavorite, className = "" }: { program: Program; favorite: boolean; onFavorite: (id: string) => void; className?: string }) {
  return (
    <button
      type="button"
      className={`cb-icon-btn cb-fav ${className}${favorite ? " is-on" : ""}`}
      aria-label={favorite ? `Remove ${program.name} from favorites` : `Add ${program.name} to favorites`}
      aria-pressed={favorite}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
      onClick={() => onFavorite(program.id)}
    >
      <Glyph name="heart" filled={favorite} size={18} />
    </button>
  );
}

// Two quiet summary badges, plus a progress badge once the student has started.
function Summary({ program, state }: { program: Program; state: LabState }) {
  const kit = programKit(program, state);
  const left = kit.slots - kit.prepared;
  return (
    <span className="cb-summary">
      <span className="cb-pill"><Glyph name="requirements" size={14} /> {requirementsFor(program).length} requirements</span>
      <span className="cb-pill"><Glyph name="documents" size={14} /> {kit.slots} documents</span>
      {kit.started && (left ? (
        <span className="cb-pill is-started"><Glyph name="progress" size={14} /> In progress · {left} left</span>
      ) : (
        <span className="cb-pill is-done"><Glyph name="check" size={14} /> Ready to apply</span>
      ))}
    </span>
  );
}

function FileInput({ onFile }: { onFile: (name: string) => void }) {
  return (
    <input
      type="file"
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFile(file.name);
        e.target.value = "";
      }}
    />
  );
}

// One row per document: Generate (if the document can be written) + Upload.
function DocRow({ item, program, h, back, detailed }: { item: KitItem; program: Program; h: Handlers; back: string; detailed?: boolean }) {
  return (
    <li className={`cb-doc is-${tone(item)}`}>
      <span className={`cb-badge is-${tone(item)} cb-doc-icon`} aria-hidden="true">
        <Glyph name={item.done ? "check" : item.id} size={16} />
      </span>
      <span className="cb-doc-text">
        <b>{item.title}{item.count > 1 && <i> ×{item.count}</i>}</b>
        {detailed && <span className="cb-doc-note">{item.note}</span>}
        <small>{statusText(item)}</small>
      </span>
      <span className="cb-doc-buttons">
        {item.tool && (
          <a className="hub-btn cb-gen" href={generateHref(program.id, item.tool, "combined", back)}>
            <Glyph name="spark" size={15} /> {item.drafts ? "Edit draft" : "Generate"}
          </a>
        )}
        <label className="hub-btn cb-up">
          <Glyph name="upload" size={15} /> {item.file ? "Replace" : "Upload"}
          <FileInput onFile={(name) => h.onUpload(program.id, item.id, name)} />
        </label>
      </span>
    </li>
  );
}

function DocList({ program, h, back, detailed }: { program: Program; h: Handlers; back: string; detailed?: boolean }) {
  return (
    <ul className="cb-docs">
      {programKit(program, h.state).items.map((item) => <DocRow key={item.id} item={item} program={program} h={h} back={back} detailed={detailed} />)}
    </ul>
  );
}

function RequirementList({ program, detailed }: { program: Program; detailed?: boolean }) {
  return (
    <ul className={`cb-reqlist${detailed ? " is-detailed" : ""}`}>
      {requirementsFor(program).map((r) => (
        <li key={r.id} className={`is-${r.status}`}>
          <span className="cb-req-icon" aria-hidden="true"><Glyph name={reqIcon[r.status]} size={14} /></span>
          <span className="cb-req-text">
            <b>{r.title}</b>
            <span>{r.required}</span>
            {detailed && <small>You: {r.current} · {r.detail}</small>}
          </span>
          <span className="cb-req-status">{reqLabel[r.status]}</span>
        </li>
      ))}
    </ul>
  );
}

function Deadline({ program }: { program: Program }) {
  const days = daysUntilDeadline(program.deadline);
  return (
    <span className="hub-program-deadline">
      <small>Application deadline</small>
      <b>{formatDate(program.deadline)}</b>
      {days >= 0 && days < 45 && <em className="lab-soon">{days} days left</em>}
    </span>
  );
}

/* ---------- Card ---------- */
function ProgramCard({ program: p, h, active }: { program: Program; h: Handlers; active: boolean }) {
  const [open, setOpen] = useState(false);
  const kit = programKit(p, h.state);
  const favorite = h.state.favorites.includes(p.id);
  const vt = (name: string) => (active ? ({ viewTransitionName: name } as CSSProperties) : undefined);

  return (
    <article className={`lab-card cb-card${open ? " is-open" : ""}`} style={vt("cb-active-card")}>
      <div className="cb-top">
        {/* Covers the whole top of the card: click anywhere (image included) for details. */}
        <button type="button" className="cb-hit" aria-label={`View details for ${p.name}`} onClick={() => h.onOpen(p.id)} />
        <FavoriteButton program={p} favorite={favorite} onFavorite={h.onFavorite} className="cb-corner" />
        <div className="hub-program-row">
          <div className="hub-program-row-main cb-main">
            <span className="hub-program-image" style={vt("cb-active-img")}>
              <Image src={programImage(p)} alt="" fill sizes="(max-width: 600px) 96px, 132px" />
            </span>
            <span className="hub-program-row-info">
              <span className="hub-row-country">{p.country} · {p.level}</span>
              <strong>{p.name}</strong>
              <span>{p.university} · {p.city}</span>
              <small>{p.years} {p.years === 1 ? "year" : "years"} · {p.credits} · {p.tuition}</small>
              <Summary program={p} state={h.state} />
            </span>
          </div>
          <div className="hub-program-row-end">
            <Deadline program={p} />
            <button type="button" className="hub-row-action lab-toggle cb-prepare" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? "Close" : kit.started ? "Continue" : "Prepare"}
              {kit.started && !open && <span className="cb-ratio">{kit.prepared}/{kit.slots}</span>}
              <span className={open ? "lab-chev up" : "lab-chev"}><Glyph name="chev" /></span>
            </button>
          </div>
        </div>
      </div>
      <div className={`cb-accordion${open ? " is-open" : ""}`}>
        <div>
          <div className="cb-panel">
            <h3 className="cb-panel-title">Requirements</h3>
            <RequirementList program={p} />
            <div className="cb-panel-head">
              <h3 className="cb-panel-title">Documents</h3>
              <span>{kit.prepared} of {kit.slots} ready</span>
            </div>
            <DocList program={p} h={h} back="/test/combined" />
            <button type="button" className="cb-more" onClick={() => h.onOpen(p.id)}>
              View full program details <Glyph name="arrow" size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Full-page detail ---------- */
function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="cb-section">
      <div className="cb-section-head"><h2>{title}</h2>{aside}</div>
      {children}
    </section>
  );
}

function Detail({ program: p, h, onBack }: { program: Program; h: Handlers; onBack: () => void }) {
  const kit = programKit(p, h.state);
  const favorite = h.state.favorites.includes(p.id);
  const days = daysUntilDeadline(p.deadline);
  const scholarships = universityScholarships(p);
  const reqs = requirementsFor(p);

  return (
    <article className="cb-detail" style={{ viewTransitionName: "cb-active-card" } as CSSProperties}>
      <div className="cb-detail-top">
        <button type="button" className="cb-back" onClick={onBack}>
          <Glyph name="back" size={18} /> All programs
        </button>
        <FavoriteButton program={p} favorite={favorite} onFavorite={h.onFavorite} />
      </div>

      <div className="cb-hero" style={{ viewTransitionName: "cb-active-img" } as CSSProperties}>
        <Image src={programImage(p)} alt="" fill sizes="(max-width: 800px) 100vw, 900px" priority />
      </div>

      <header className="cb-detail-head">
        <span className="hub-row-country">{p.country} · {p.level} · {p.field}</span>
        <h1>{p.name}</h1>
        <p>{p.university} · {p.city}</p>
        <Summary program={p} state={h.state} />
      </header>

      <div className="cb-detail-grid">
        <div className="cb-detail-body">
          <dl className="cb-facts">
            <div><dt>Duration</dt><dd>{p.years} {p.years === 1 ? "year" : "years"} · {p.credits}</dd></div>
            <div><dt>Annual tuition</dt><dd>{p.tuition}</dd></div>
            <div><dt>Living costs</dt><dd>{p.living}</dd></div>
            <div><dt>Application fee</dt><dd>{p.fee}</dd></div>
            <div><dt>Intake</dt><dd>{p.intake}</dd></div>
            <div><dt>Study mode</dt><dd>{p.mode}</dd></div>
          </dl>

          <Section title="About the program">
            <p>{p.description}</p>
            <p>
              Teaching combines lectures, seminars and applied project work, finishing with a dissertation or capstone.
              Graduates typically move into roles across {p.field.toLowerCase()} in industry, government and research.
              Course content shown here is illustrative for the demo.
            </p>
          </Section>

          <Section title="Entry requirements" aside={<span>{reqs.filter((r) => r.status === "met").length} of {reqs.length} met</span>}>
            <p className="cb-section-note">Checked against your saved profile. Confirm final eligibility with the university.</p>
            <RequirementList program={p} detailed />
          </Section>

          <Section title="Documents to prepare" aside={<span>{kit.prepared} of {kit.slots} ready</span>}>
            <DocList program={p} h={h} back={`/test/combined?program=${p.id}`} detailed />
          </Section>

          <Section title="Scholarships">
            {scholarships.length ? (
              <div className="cb-scholarships">
                {scholarships.map((s) => (
                  <article key={`${s.name}-${s.funding}`}>
                    <span>{s.forThisProgram ? "For this program" : `At ${p.university}`}</span>
                    <h3>{s.name}</h3>
                    <strong>{s.funding}</strong>
                    <p>{s.description}</p>
                    <small>Apply by {formatDate(s.deadline)}</small>
                  </article>
                ))}
              </div>
            ) : <p>No scholarships are listed for this university in the demo.</p>}
          </Section>
        </div>

        <div className="cb-detail-side">
          <div className="cb-side-card">
            <span className="cb-side-label"><Glyph name="clock" size={15} /> Application deadline</span>
            <strong>{formatDate(p.deadline)}</strong>
            <span className={days < 45 ? "cb-days is-soon" : "cb-days"}>{days < 0 ? "Deadline passed" : `${days} days left`}</span>
            <hr />
            <span className="cb-side-label">Your documents</span>
            <span className="lab-progress"><span style={{ width: `${(kit.prepared / kit.slots) * 100}%` }} /></span>
            <span className="cb-count">{kit.prepared} of {kit.slots} ready</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Page ---------- */
// Resolves once the animation is over, so the URL can change without the
// framework router starting a competing transition.
function transition(update: () => void, after: () => void): Promise<unknown> {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<unknown> } };
  const run = () => {
    flushSync(update);
    after();
  };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    run();
    return Promise.resolve();
  }
  return doc.startViewTransition(run).finished.catch(() => undefined);
}

const nav = [
  { label: "Career Overview", icon: "catalog" },
  { label: "Career Action Plan", icon: "match" },
  { label: "Recommended Jobs", icon: "programs" },
  { label: "CV Studio", icon: "documents" },
  { label: "Career Counselling", icon: "tracker" },
  { label: "Study Abroad", icon: "catalog", active: true },
];

export default function CombinedLab({ initialProgram }: { initialProgram?: string }) {
  const lab = useLab();
  const [detail, setDetail] = useState<string | null>(programs.some((p) => p.id === initialProgram) ? initialProgram! : null);
  const [active, setActive] = useState<string | null>(detail);
  const [search, setSearch] = useState("");
  const scroll = useRef(0);

  const show = (id: string | null) =>
    transition(() => setDetail(id), () => window.scrollTo(0, id ? 0 : scroll.current));

  const onPop = useEffectEvent(() => show(new URLSearchParams(window.location.search).get("program")));
  useEffect(() => {
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = (id: string) => {
    scroll.current = window.scrollY;
    flushSync(() => setActive(id));
    show(id).then(() => window.history.pushState({ ...window.history.state, cb: true }, "", `?program=${id}`));
  };
  const close = () => {
    if (window.history.state?.cb) window.history.back();
    else {
      window.history.replaceState(null, "", window.location.pathname);
      show(null);
    }
  };

  const h: Handlers = { state: lab.state, onFavorite: lab.toggleFavorite, onUpload: lab.upload, onOpen: open };

  const q = search.trim().toLowerCase();
  const visible = programs.filter((p) => !q || [p.name, p.university, p.country, p.city, p.field].some((t) => t.toLowerCase().includes(q)));
  const pinned = (p: Program) => lab.state.favorites.includes(p.id) || programKit(p, lab.state).started;
  const mine = visible.filter(pinned).sort((a, b) => (lab.state.touched[b.id] || 0) - (lab.state.touched[a.id] || 0));
  const rest = visible.filter((p) => !pinned(p));
  const render = (p: Program) => <ProgramCard key={p.id} program={p} h={h} active={active === p.id && !detail} />;
  const current = programs.find((p) => p.id === detail);

  return (
    <div className="career-app career-shell cb-shell">
      <aside className="career-sidebar cb-sidebar">
        <div className="career-brand">
          <Image src="/careerhub-logo.png" width={108} height={74} alt="BRAC Career Hub" />
          <span>CAREER & JOBS</span>
        </div>
        <nav aria-label="Career navigation">
          {nav.map((item) => (
            <div key={item.label}>
              <button type="button" className={item.active ? "active" : ""} aria-current={item.active ? "page" : undefined}>
                <Icon name={item.icon} /><span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </aside>
      <main className="career-main">
        <div className="sa-portal hub cb-scope">
          <div className="cb-mobile-bar">
            <Image src="/careerhub-logo.png" width={72} height={49} alt="BRAC Career Hub" />
            <span>Study Abroad</span>
          </div>

          {current ? (
            <Detail program={current} h={h} onBack={close} />
          ) : (
            <div className="cb-list">
              <header className="lab-header">
                <p className="lab-eyebrow">TEST · COMBINED CARD</p>
                <h1>Study Abroad</h1>
                <p>Click a card for full details. ♡ a program or start a document and it moves to “Your programs”.</p>
              </header>
              <div className="hub-search-row lab-search-row">
                <label className="hub-search">
                  <Icon name="search" />
                  <input aria-label="Search programs or universities" placeholder="Search programs, universities or countries…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </label>
                <button type="button" className="hub-btn" onClick={lab.reset}>Reset demo</button>
              </div>
              {mine.length > 0 && (
                <section aria-label="Your programs">
                  <h2 className="lab-section-title">Your programs <span>{mine.length}</span></h2>
                  <div className="hub-program-grid">{mine.map(render)}</div>
                </section>
              )}
              <section aria-label="All programs">
                <h2 className="lab-section-title">{mine.length ? "More programs" : "All programs"} <span>{rest.length}</span></h2>
                {rest.length ? <div className="hub-program-grid">{rest.map(render)}</div> : <p className="lab-empty">No other programs match “{search}”.</p>}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
