"use client";
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { programImage } from "../student/program-images";
import {
  daysUntilDeadline,
  formatDate,
  initialProfile,
  makeContent,
  programs,
  tools,
  universityScholarships,
  type Program,
  type ToolType,
} from "../student/data";
import { programReadiness, type ReadinessItem } from "../student/readiness";
import { Icon } from "../student/ui";
import { DocumentPaper } from "../shared/document-paper";
import { programKit, useLab, type KitItem, type LabState } from "./abroad-store";
import "./abroad.css";

type Handlers = {
  state: LabState;
  onFavorite: (id: string) => void;
  onUpload: (id: string, requirement: string, filename: string) => void;
  onOpen: (id: string) => void;
  onGenerate: (id: string, tool: ToolType) => void;
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

// Requirements are checked against the demo student's academic profile.
const requirementsFor = (p: Program) => programReadiness(p, initialProfile).items;
const reqLabel: Record<ReadinessItem["status"], string> = { met: "Met", attention: "Below minimum", unknown: "Add details", review: "Needs review" };
const reqIcon: Record<ReadinessItem["status"], string> = { met: "check", attention: "alert", unknown: "question", review: "question" };

/* ---------- Small pieces ---------- */
function FavoriteButton({ program, favorite, onFavorite, className = "" }: { program: Program; favorite: boolean; onFavorite: (id: string) => void; className?: string }) {
  return (
    <button
      type="button"
      className={`ab-fav ${className}${favorite ? " is-on" : ""}`}
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
    <span className="ab-summary">
      <span className="ab-pill"><Glyph name="requirements" size={14} /> {requirementsFor(program).length} requirements</span>
      <span className="ab-pill"><Glyph name="documents" size={14} /> {kit.slots} documents</span>
      {kit.started && (left ? (
        <span className="ab-pill is-started"><Glyph name="progress" size={14} /> In progress · {left} left</span>
      ) : (
        <span className="ab-pill is-done"><Glyph name="check" size={14} /> Ready to apply</span>
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
function DocRow({ item, program, h, detailed }: { item: KitItem; program: Program; h: Handlers; detailed?: boolean }) {
  return (
    <li className={`ab-doc is-${tone(item)}`}>
      <span className="ab-doc-icon" aria-hidden="true"><Glyph name={item.done ? "check" : item.id} size={16} /></span>
      <span className="ab-doc-text">
        <b>{item.title}{item.count > 1 && <i> ×{item.count}</i>}</b>
        {detailed && <span className="ab-doc-note">{item.note}</span>}
        <small>{statusText(item)}</small>
      </span>
      <span className="ab-doc-buttons">
        {item.tool && (
          <button type="button" className="ab-btn ab-gen" onClick={() => h.onGenerate(program.id, item.tool!)}>
            <Glyph name="spark" size={15} /> {item.drafts ? "Edit draft" : "Generate"}
          </button>
        )}
        <label className="ab-btn ab-up">
          <Glyph name="upload" size={15} /> {item.file ? "Replace" : "Upload"}
          <FileInput onFile={(name) => h.onUpload(program.id, item.id, name)} />
        </label>
      </span>
    </li>
  );
}

function DocList({ program, h, detailed }: { program: Program; h: Handlers; detailed?: boolean }) {
  return (
    <ul className="ab-docs">
      {programKit(program, h.state).items.map((item) => <DocRow key={item.id} item={item} program={program} h={h} detailed={detailed} />)}
    </ul>
  );
}

function RequirementList({ program, detailed }: { program: Program; detailed?: boolean }) {
  return (
    <ul className={`ab-reqs${detailed ? " is-detailed" : ""}`}>
      {requirementsFor(program).map((r) => (
        <li key={r.id} className={`is-${r.status}`}>
          <span className="ab-req-icon" aria-hidden="true"><Glyph name={reqIcon[r.status]} size={14} /></span>
          <span className="ab-req-text">
            <b>{r.title}</b>
            <span>{r.required}</span>
            {detailed && <small>You: {r.current} · {r.detail}</small>}
          </span>
          <span className="ab-req-status">{reqLabel[r.status]}</span>
        </li>
      ))}
    </ul>
  );
}

function Deadline({ program }: { program: Program }) {
  const days = daysUntilDeadline(program.deadline);
  return (
    <span className="ab-deadline">
      <small>Apply by</small>
      <b>{formatDate(program.deadline)}</b>
      {days >= 0 && days < 45 && <em>{days} days left</em>}
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
    <article className={`ab-card${open ? " is-open" : ""}`} style={vt("ab-active-card")}>
      <div className="ab-card-top">
        {/* Covers the whole top of the card: click anywhere (image included) for details. */}
        <button type="button" className="ab-hit" aria-label={`View details for ${p.name}`} onClick={() => h.onOpen(p.id)} />
        <FavoriteButton program={p} favorite={favorite} onFavorite={h.onFavorite} className="ab-corner" />
        <div className="ab-row">
          <span className="ab-thumb" style={vt("ab-active-img")}>
            <Image src={programImage(p)} alt="" fill sizes="(max-width: 600px) 88px, 132px" />
          </span>
          <div className="ab-info">
            <span className="ab-meta">{p.country} · {p.level}</span>
            <h3>{p.name}</h3>
            <p>{p.university} · {p.city}</p>
            <small>{p.years} {p.years === 1 ? "year" : "years"} · {p.credits} · {p.tuition}</small>
            <Summary program={p} state={h.state} />
          </div>
          <div className="ab-end">
            <Deadline program={p} />
            <button type="button" className="ab-prepare" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? "Close" : kit.started ? "Continue" : "Prepare"}
              {kit.started && !open && <span className="ab-ratio">{kit.prepared}/{kit.slots}</span>}
              <span className={open ? "ab-chev up" : "ab-chev"}><Glyph name="chev" /></span>
            </button>
          </div>
        </div>
      </div>
      <div className={`ab-accordion${open ? " is-open" : ""}`}>
        <div>
          <div className="ab-panel">
            <h4 className="ab-panel-title">Requirements</h4>
            <RequirementList program={p} />
            <div className="ab-panel-head">
              <h4 className="ab-panel-title">Documents</h4>
              <span>{kit.prepared} of {kit.slots} ready</span>
            </div>
            <DocList program={p} h={h} />
            <button type="button" className="ab-more" onClick={() => h.onOpen(p.id)}>
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
    <section className="ab-section">
      <div className="ab-section-head"><h2>{title}</h2>{aside}</div>
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
    <article className="ab-detail" style={{ viewTransitionName: "ab-active-card" } as CSSProperties}>
      <div className="ab-detail-top">
        <button type="button" className="ab-back" onClick={onBack}>
          <Glyph name="back" size={18} /> All programs
        </button>
        <FavoriteButton program={p} favorite={favorite} onFavorite={h.onFavorite} />
      </div>

      <div className="ab-hero" style={{ viewTransitionName: "ab-active-img" } as CSSProperties}>
        <Image src={programImage(p)} alt="" fill sizes="(max-width: 800px) 100vw, 900px" priority />
      </div>

      <header className="ab-detail-head">
        <span className="career-kicker">{p.country} · {p.level} · {p.field}</span>
        <h1>{p.name}</h1>
        <p>{p.university} · {p.city}</p>
        <Summary program={p} state={h.state} />
      </header>

      <div className="ab-detail-grid">
        <div className="ab-detail-body">
          <dl className="ab-facts">
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
            <p className="ab-section-note">Checked against a sample student profile. Confirm final eligibility with the university.</p>
            <RequirementList program={p} detailed />
          </Section>

          <Section title="Documents to prepare" aside={<span>{kit.prepared} of {kit.slots} ready</span>}>
            <DocList program={p} h={h} detailed />
          </Section>

          <Section title="Scholarships">
            {scholarships.length ? (
              <div className="ab-scholarships">
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

        <div className="ab-detail-side">
          <div className="ab-side-card">
            <span className="ab-side-label"><Glyph name="clock" size={15} /> Application deadline</span>
            <strong>{formatDate(p.deadline)}</strong>
            <span className={days < 45 ? "ab-days is-soon" : "ab-days"}>{days < 0 ? "Deadline passed" : `${days} days left`}</span>
            <hr />
            <span className="ab-side-label">Your documents</span>
            <span className="ab-progress"><span style={{ width: `${(kit.prepared / kit.slots) * 100}%` }} /></span>
            <span className="ab-count">{kit.prepared} of {kit.slots} ready</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Section ---------- */
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

export function StudyAbroad({ active, onGenerate }: { active: boolean; onGenerate: (id: string, tool: ToolType) => void }) {
  const lab = useLab();
  const [detail, setDetail] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const scroll = useRef(0);

  const show = (id: string | null) =>
    transition(() => setDetail(id), () => window.scrollTo(0, id ? 0 : scroll.current));

  // Browser back closes the detail page while this section is on screen.
  const onPop = useEffectEvent(() => {
    if (active) show(new URLSearchParams(window.location.search).get("program"));
  });
  useEffect(() => {
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const open = (id: string) => {
    scroll.current = window.scrollY;
    flushSync(() => setActiveCard(id));
    show(id).then(() => window.history.pushState({ ...window.history.state, ab: true }, "", `?program=${id}`));
  };
  const close = () => {
    if (window.history.state?.ab) window.history.back();
    else show(null);
  };

  const h: Handlers = { state: lab.state, onFavorite: lab.toggleFavorite, onUpload: lab.upload, onOpen: open, onGenerate };

  const q = search.trim().toLowerCase();
  const visible = programs.filter((p) => !q || [p.name, p.university, p.country, p.city, p.field].some((t) => t.toLowerCase().includes(q)));
  const pinned = (p: Program) => lab.state.favorites.includes(p.id) || programKit(p, lab.state).started;
  const mine = visible.filter(pinned).sort((a, b) => (lab.state.touched[b.id] || 0) - (lab.state.touched[a.id] || 0));
  const rest = visible.filter((p) => !pinned(p));
  const render = (p: Program) => <ProgramCard key={p.id} program={p} h={h} active={activeCard === p.id && !detail} />;
  const current = programs.find((p) => p.id === detail);

  if (current) return <Detail program={current} h={h} onBack={close} />;
  return (
    <div className="ab-list">
      <header className="career-heading">
        <span className="career-kicker">STUDY ABROAD</span>
        <h1>Find your program</h1>
        <p>Open a card for full details. Save a program with ♡ or start a document and it moves to “Your programs”.</p>
      </header>
      <div className="career-toolbar">
        <label className="career-search">
          <Icon name="search" />
          <input aria-label="Search programs or universities" placeholder="Search programs, universities or countries" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>
      {mine.length > 0 && (
        <section aria-labelledby="ab-mine">
          <h2 className="ab-group-title" id="ab-mine">Your programs <span>{mine.length}</span></h2>
          <div className="ab-grid">{mine.map(render)}</div>
        </section>
      )}
      <section aria-labelledby="ab-all">
        <h2 className="ab-group-title" id="ab-all">{mine.length ? "More programs" : "All programs"} <span>{rest.length}</span></h2>
        {rest.length ? <div className="ab-grid">{rest.map(render)}</div> : <p className="ab-empty">No other programs match “{search}”.</p>}
      </section>
    </div>
  );
}

/* ---------- Generate ---------- */
// Placeholder writer for SOP / LOR / essays; saving a draft counts toward the program's documents.
export function Generate({ programId, tool: toolId, onDone }: { programId: string; tool: ToolType; onDone: () => void }) {
  const lab = useLab();
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const program = programs.find((p) => p.id === programId) || programs[0];
  const tool = tools.find((t) => t.id === toolId) || tools[0];
  return (
    <div className="ab-generate">
      <button type="button" className="ab-back" onClick={onDone}><Glyph name="back" size={18} /> Back to programs</button>
      <header className="career-heading">
        <span className="career-kicker">{program.university.toUpperCase()}</span>
        <h1>{tool.name}</h1>
        <p>{tool.description} For {program.name}.</p>
      </header>
      <label className="ab-notes">
        <span>Anything to include? <small>Optional</small></span>
        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="A project, an achievement, why this program…" />
      </label>
      <div className="ab-generate-actions">
        <button type="button" className="career-button primary" onClick={() => { setDraft(makeContent(tool.id, initialProfile, program, notes)); setEditing(false); }}>
          <Glyph name="spark" size={16} /> {draft ? "Regenerate" : "Generate draft"}
        </button>
        {draft && <button type="button" className="career-button" onClick={() => setEditing(!editing)}>{editing ? "Preview" : "Edit"}</button>}
        {draft && <button type="button" className="career-button" onClick={() => { lab.saveDraft(program.id, tool.id); onDone(); }}>Save draft & go back</button>}
      </div>
      {draft && <DocumentPaper value={draft} editing={editing} onChange={setDraft} label={tool.name} />}
      <p className="career-small">Demo writer. Check every detail before you use a draft.</p>
    </div>
  );
}
