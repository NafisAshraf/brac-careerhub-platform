"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { programImage } from "../../student/program-images";
import { daysUntilDeadline, formatDate, programs, type Program } from "../../student/data";
import { Icon } from "../../student/ui";
import { generateHref, programKit, useLab, type KitItem, type LabState } from "../../hub/abroad-store";
import "../../student/workspace.css";
import "../../student/workspace-surfaces.css";
import "../lab.css";

const variants = [
  { id: "a", name: "A · Inline kit", note: "“Prepare” opens a checklist inside the card. Everything stays in the list." },
  { id: "b", name: "B · Document chips", note: "Each document is a chip under the card. Tap one to generate or upload." },
  { id: "c", name: "C · Dropdown", note: "Card looks exactly like today. One “Prepare” menu holds every tool." },
  { id: "d", name: "D · Side sheet", note: "Card stays compact. “Prepare” opens a sheet (bottom on phone, right on desktop)." },
] as const;
type VariantId = (typeof variants)[number]["id"];

type CardProps = {
  program: Program;
  state: LabState;
  favorite: boolean;
  variant: VariantId;
  onFavorite: () => void;
  onUpload: (requirement: string, filename: string) => void;
};

function Glyph({ name }: { name: "heart" | "heart-on" | "spark" | "upload" | "check" | "chev" | "close" }) {
  const paths = {
    heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
    "heart-on": "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
    spark: "m12 3 2 5.5L19.5 10.5 14 12.5 12 18l-2-5.5L4.5 10.5 10 8.5Z",
    upload: "M12 16V4 M7 9l5-5 5 5 M5 20h14",
    check: "m5 12 4.5 4.5L19 7",
    chev: "m6 9 6 6 6-6",
    close: "M6 6l12 12 M18 6 6 18",
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={name === "heart-on" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function FavoriteButton({ program, favorite, onFavorite, overlay }: { program: Program; favorite: boolean; onFavorite: () => void; overlay?: boolean }) {
  return (
    <button
      type="button"
      className={`lab-fav${overlay ? " lab-fav-overlay" : ""}${favorite ? " is-on" : ""}`}
      aria-pressed={favorite}
      aria-label={favorite ? `Remove ${program.name} from favorites` : `Add ${program.name} to favorites`}
      onClick={onFavorite}
    >
      <Glyph name={favorite ? "heart-on" : "heart"} />
    </button>
  );
}

// The left half of the current ProgramRow, unchanged apart from the heart.
function CardInfo({ program: p, favorite, onFavorite, onClick, expanded }: { program: Program; favorite: boolean; onFavorite: () => void; onClick?: () => void; expanded?: boolean }) {
  const body = (
    <>
      <span className="hub-program-image" aria-hidden="true">
        <Image src={programImage(p)} alt="" fill sizes="(max-width: 600px) 96px, 132px" />
      </span>
      <span className="hub-program-row-info">
        <span className="hub-row-country">{p.country} · {p.level}</span>
        <strong>{p.name}</strong>
        <span>{p.university} · {p.city}</span>
        <small>
          {p.years} {p.years === 1 ? "year" : "years"} · {p.credits} · {p.tuition} · {p.scholarships.length} scholarship{p.scholarships.length === 1 ? "" : "s"}
        </small>
      </span>
    </>
  );
  return (
    <div className="lab-info">
      {onClick ? (
        <button type="button" className="hub-program-row-main" onClick={onClick} aria-expanded={expanded}>{body}</button>
      ) : (
        <div className="hub-program-row-main lab-static">{body}</div>
      )}
      <FavoriteButton program={p} favorite={favorite} onFavorite={onFavorite} overlay />
    </div>
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

function Progress({ prepared, slots }: { prepared: number; slots: number }) {
  return (
    <span className="lab-progress" role="progressbar" aria-label="Documents prepared" aria-valuenow={prepared} aria-valuemin={0} aria-valuemax={slots}>
      <span style={{ width: `${(prepared / slots) * 100}%` }} />
    </span>
  );
}

function status(item: KitItem) {
  if (item.kind === "upload") return item.file ? item.file : "Not uploaded";
  if (item.count > 1) return `${Math.min(item.current, item.count)} of ${item.count} drafts`;
  return item.done ? "Draft ready" : "Not started";
}

function UploadButton({ item, onUpload, className = "hub-btn" }: { item: KitItem; onUpload: CardProps["onUpload"]; className?: string }) {
  return (
    <label className={`${className} lab-upload`}>
      <Glyph name="upload" /> {item.file ? "Replace" : "Upload"}
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(item.id, file.name);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function ItemAction({ item, program, variant, onUpload, className = "hub-btn" }: { item: KitItem; program: Program; variant: VariantId; onUpload: CardProps["onUpload"]; className?: string }) {
  if (item.kind === "upload") return <UploadButton item={item} onUpload={onUpload} className={className} />;
  return (
    <a className={`${className} lab-generate`} href={generateHref(program.id, item.tool!, variant)}>
      <Glyph name="spark" /> {item.started ? (item.done ? "Open" : "Continue") : "Generate"}
    </a>
  );
}

// Checklist used by variants A and D.
function KitList({ program, state, variant, onUpload }: Omit<CardProps, "favorite" | "onFavorite">) {
  const kit = programKit(program, state);
  const groups = [
    { title: "Write with AI", items: kit.items.filter((i) => i.kind === "draft") },
    { title: "Upload", items: kit.items.filter((i) => i.kind === "upload") },
  ].filter((g) => g.items.length);
  return (
    <div className="lab-kit">
      {groups.map((group) => (
        <div key={group.title} className="lab-kit-group">
          <p className="lab-kit-title">{group.title}</p>
          <ul>
            {group.items.map((item) => (
              <li key={item.id} className={item.done ? "is-done" : item.started ? "is-started" : ""}>
                <span className="lab-tick" aria-hidden="true">{item.done ? <Glyph name="check" /> : null}</span>
                <span className="lab-kit-name">
                  <b>{item.title}{item.count > 1 && <i> ×{item.count}</i>}</b>
                  <small>{status(item)}</small>
                </span>
                <ItemAction item={item} program={program} variant={variant} onUpload={onUpload} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return [open, setOpen, ref] as const;
}

/* ---------- Variant A: inline expandable kit ---------- */
function CardA(props: CardProps) {
  const { program, state, favorite, onFavorite } = props;
  const [open, setOpen] = useState(false);
  const kit = programKit(program, state);
  return (
    <article className={`lab-card${open ? " is-open" : ""}`}>
      <div className="hub-program-row">
        <CardInfo program={program} favorite={favorite} onFavorite={onFavorite} onClick={() => setOpen(!open)} expanded={open} />
        <div className="hub-program-row-end">
          <Deadline program={program} />
          <button type="button" className="hub-row-action lab-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? "Close" : kit.started ? "Continue" : "Prepare"} <span className={open ? "lab-chev up" : "lab-chev"}><Glyph name="chev" /></span>
          </button>
        </div>
      </div>
      {!open && kit.started && (
        <button type="button" className="lab-strip" onClick={() => setOpen(true)}>
          <Progress prepared={kit.prepared} slots={kit.slots} />
          <span>{kit.prepared} of {kit.slots} documents ready</span>
        </button>
      )}
      {open && <KitList {...props} />}
    </article>
  );
}

/* ---------- Variant B: document chips ---------- */
function Chip({ item, program, variant, onUpload }: { item: KitItem; program: Program; variant: VariantId; onUpload: CardProps["onUpload"] }) {
  const [open, setOpen, ref] = usePopover();
  const short = item.tool === "SOP" ? "SOP" : item.tool === "LOR" ? "LOR" : item.tool === "CV" ? "CV" : item.tool === "Essay" ? "Essay" : item.id === "Academic transcript" ? "Transcript" : "English test";
  return (
    <div className="lab-chip-wrap" ref={ref}>
      <button
        type="button"
        className={`lab-chip${item.done ? " is-done" : item.started ? " is-started" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="lab-dot" aria-hidden="true">{item.done ? <Glyph name="check" /> : null}</span>
        {short}
        {item.count > 1 && <small>{Math.min(item.current, item.count)}/{item.count}</small>}
      </button>
      {open && (
        <div className="lab-pop" role="dialog" aria-label={item.title}>
          <b>{item.title}</b>
          <p>{item.note}</p>
          <small>{status(item)}</small>
          <ItemAction item={item} program={program} variant={variant} onUpload={(r, f) => { onUpload(r, f); setOpen(false); }} className="hub-btn hub-btn-primary" />
        </div>
      )}
    </div>
  );
}

function CardB(props: CardProps) {
  const { program, state, favorite, onFavorite, variant, onUpload } = props;
  const kit = programKit(program, state);
  return (
    <article className="lab-card">
      <div className="hub-program-row">
        <CardInfo program={program} favorite={favorite} onFavorite={onFavorite} />
        <div className="hub-program-row-end">
          <Deadline program={program} />
          <span className="lab-ready"><b>{kit.prepared}/{kit.slots}</b> documents ready</span>
        </div>
      </div>
      <div className="lab-chips" aria-label="Application documents">
        {kit.items.map((item) => (
          <Chip key={item.id} item={item} program={program} variant={variant} onUpload={onUpload} />
        ))}
      </div>
    </article>
  );
}

/* ---------- Variant C: dropdown menu ---------- */
function CardC(props: CardProps) {
  const { program, state, favorite, onFavorite, variant, onUpload } = props;
  const kit = programKit(program, state);
  const [open, setOpen, ref] = usePopover();
  return (
    <article className="lab-card">
      <div className="hub-program-row">
        <CardInfo program={program} favorite={favorite} onFavorite={onFavorite} />
        <div className="hub-program-row-end">
          <Deadline program={program} />
          <div className="lab-menu-wrap" ref={ref}>
            <button type="button" className="hub-row-action lab-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
              {kit.started ? `Continue · ${kit.prepared}/${kit.slots}` : "Prepare"} <span className={open ? "lab-chev up" : "lab-chev"}><Glyph name="chev" /></span>
            </button>
            {open && (
              <div className="lab-menu">
                {(["draft", "upload"] as const).map((kind) => {
                  const items = kit.items.filter((i) => i.kind === kind);
                  if (!items.length) return null;
                  return (
                    <div key={kind}>
                      <p className="lab-kit-title">{kind === "draft" ? "Write with AI" : "Upload"}</p>
                      {items.map((item) =>
                        item.kind === "upload" ? (
                          <label key={item.id} className="lab-menu-item">
                            <span className="lab-menu-icon"><Glyph name={item.done ? "check" : "upload"} /></span>
                            <span><b>{item.title}</b><small>{status(item)}</small></span>
                            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onUpload(item.id, file.name);
                              e.target.value = "";
                              setOpen(false);
                            }} />
                          </label>
                        ) : (
                          <a key={item.id} className="lab-menu-item" href={generateHref(program.id, item.tool!, variant)}>
                            <span className="lab-menu-icon"><Glyph name={item.done ? "check" : "spark"} /></span>
                            <span><b>{item.title}{item.count > 1 ? ` ×${item.count}` : ""}</b><small>{status(item)}</small></span>
                          </a>
                        ),
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Variant D: side / bottom sheet ---------- */
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="lab-sheet-layer">
      <button type="button" className="lab-sheet-backdrop" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <aside className="lab-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="lab-sheet-close" aria-label="Close" onClick={onClose}><Glyph name="close" /></button>
        {children}
      </aside>
    </div>
  );
}

function CardD(props: CardProps) {
  const { program, state, favorite, onFavorite } = props;
  const [open, setOpen] = useState(false);
  const kit = programKit(program, state);
  return (
    <article className="lab-card">
      <div className="hub-program-row">
        <CardInfo program={program} favorite={favorite} onFavorite={onFavorite} onClick={() => setOpen(true)} />
        <div className="hub-program-row-end">
          <Deadline program={program} />
          <button type="button" className="hub-row-action" onClick={() => setOpen(true)}>
            {kit.started ? "Continue" : "Prepare"}
          </button>
          {kit.started && <span className="lab-mini"><Progress prepared={kit.prepared} slots={kit.slots} />{kit.prepared}/{kit.slots} ready</span>}
        </div>
      </div>
      {open && (
        <Sheet title={program.name} onClose={() => setOpen(false)}>
          <div className="lab-sheet-head">
            <span className="hub-program-image" aria-hidden="true">
              <Image src={programImage(program)} alt="" fill sizes="96px" />
            </span>
            <div>
              <span className="hub-row-country">{program.country} · {program.level}</span>
              <h2>{program.name}</h2>
              <p>{program.university} · Apply by {formatDate(program.deadline)}</p>
            </div>
          </div>
          <div className="lab-sheet-progress">
            <Progress prepared={kit.prepared} slots={kit.slots} />
            <span>{kit.prepared} of {kit.slots} documents ready</span>
          </div>
          <KitList {...props} />
          <details className="lab-sheet-more">
            <summary>Fees, requirements & scholarships</summary>
            <dl>
              <div><dt>Tuition</dt><dd>{program.tuition}</dd></div>
              <div><dt>Living costs</dt><dd>{program.living}</dd></div>
              <div><dt>Minimum GPA</dt><dd>{program.gpa}</dd></div>
              <div><dt>IELTS</dt><dd>{program.ielts} (no band below {program.band})</dd></div>
            </dl>
            {program.scholarships.map((s) => <p key={s.name}><b>{s.name}</b> · {s.funding}</p>)}
          </details>
        </Sheet>
      )}
    </article>
  );
}

const cards = { a: CardA, b: CardB, c: CardC, d: CardD };

export default function CardLab({ initialVariant }: { initialVariant?: string }) {
  const lab = useLab();
  const [variant, setVariant] = useState<VariantId>(
    initialVariant && initialVariant in cards ? (initialVariant as VariantId) : "a",
  );
  const [search, setSearch] = useState("");

  const pick = (v: VariantId) => {
    setVariant(v);
    window.history.replaceState(null, "", `?variant=${v}`);
  };

  const q = search.trim().toLowerCase();
  const visible = programs.filter((p) =>
    !q || [p.name, p.university, p.country, p.city, p.field].some((t) => t.toLowerCase().includes(q)),
  );
  const pinned = (p: Program) => lab.state.favorites.includes(p.id) || programKit(p, lab.state).started;
  const mine = visible.filter(pinned).sort((a, b) => (lab.state.touched[b.id] || 0) - (lab.state.touched[a.id] || 0));
  const rest = visible.filter((p) => !pinned(p));
  const Card = cards[variant];
  const render = (p: Program) => (
    <Card
      key={`${variant}-${p.id}`}
      program={p}
      state={lab.state}
      variant={variant}
      favorite={lab.state.favorites.includes(p.id)}
      onFavorite={() => lab.toggleFavorite(p.id)}
      onUpload={(r, f) => lab.upload(p.id, r, f)}
    />
  );

  return (
    <main className="sa-portal hub lab-page">
      <div className="lab-shell">
        <header className="lab-header">
          <p className="lab-eyebrow">TEST · CARD LAB</p>
          <h1>Study abroad program card</h1>
          <p>Try each variant: favorite a card (♡), or generate / upload a document. Either one moves the card into “Your programs” at the top.</p>
        </header>

        <div className="lab-variants" role="tablist" aria-label="Card variant">
          {variants.map((v) => (
            <button key={v.id} type="button" role="tab" aria-selected={variant === v.id} className={variant === v.id ? "active" : ""} onClick={() => pick(v.id)}>
              {v.name}
            </button>
          ))}
        </div>
        <p className="lab-variant-note">{variants.find((v) => v.id === variant)!.note}</p>

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
        <p className="hub-footnote">{programs.length} demo programs. The real list (200–300) would page with “Load more”.</p>
      </div>
    </main>
  );
}
