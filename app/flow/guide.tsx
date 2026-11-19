"use client";
// v8 · The Career Hub plane as a guide.
// The pink plane in the logo is shaped like a cursor. It lifts out of the logo, flies along
// an arc to the next thing to do, spotlights it, explains it, then flies back into the logo.
// Tours are scripted from the student's state (no AI). Elements opt in with data-guide="…".
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { counsellorById } from "./data";
import { useFlow } from "./store";
import type { AppPage } from "./main-app";

/* ---------- The plane, drawn from the logo ---------- */
// viewBox 36×31. The tip (top right) is the hotspot, like a cursor's point.
const TIP = { x: 34.5, y: 2.5 };
const VB = 36;
export function PlaneSvg({ width, id }: { width: number; id: string }) {
  return <svg width={width} height={width * 31 / 36} viewBox="0 0 36 31" aria-hidden="true" style={{ overflow: "visible", display: "block", width: "100%", height: "auto" }}>
    <defs>
      <linearGradient id={`pg-${id}`} x1="6" y1="4" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#f2167f" /><stop offset="1" stopColor="#b3127c" /></linearGradient>
    </defs>
    <path className="pl-wing" d="M0.6 11.2C12 11 21.6 17 26.6 30.6H22.1C17.6 21.2 10.2 14.6 0.6 11.2Z" fill="#6b2c91" />
    <path className="pl-body" d="M5.4 6.1L34.5 2.5L31.6 30C27.2 19.2 17.6 10.6 5.4 6.1Z" fill={`url(#pg-${id})`} />
  </svg>;
}

/* ---------- Tours ---------- */
type Step = {
  target: string; page?: AppPage; title: string; body: string;
  next?: string; // label of the main button
  click?: boolean; // the step ends when the student clicks the highlighted thing
};
type Tour = { id: string; steps: Step[] };

function welcomeTour(name: string, counsellor: string, unlocked: string[]): Tour {
  const has = (x: string) => unlocked.includes(x);
  const opened = [has("courses") && "courses", has("jobs") && "jobs", has("cv") && "CV Studio", has("abroad") && "Study Abroad"].filter(Boolean).join(", ");
  return { id: "welcome", steps: [
    { target: "nav-main", page: "home", title: `Hi ${name}! I’m your Career Hub guide.`, body: `${counsellor} opened these for you${opened ? `: your tasks, ${opened}` : ""}. Anything new will appear in this list.` },
    { target: "next-card", page: "home", title: "Start here", body: "This card always shows the one thing to do next. You don’t have to plan anything yourself." },
    { target: "nav-tasks", page: "home", title: "Your tasks live here", body: `${counsellor} set these after your session. Tick each one when it’s done.`, next: "Open my tasks", click: true },
    { target: "task-first", page: "tasks", title: "Tick it when it’s done", body: `${counsellor} sees your progress before your next session.` },
    { target: "session-chip", title: "Need to talk again?", body: "Book a follow-up session from here, whenever you’re ready." },
    { target: "bell", title: "Updates come here", body: "Notes from your counsellor, reminders and new tasks. The pink number shows what’s new." },
    { target: "nav-profile", title: "Something changed?", body: "Update your details or your answers here. Your counsellor sees the latest version." },
  ] };
}

// One step: the next unfinished task, and how to start it.
function nextTour(tasks: ReturnType<typeof useFlow>["tasks"]): Tour {
  const t = tasks.find((x) => !x.done);
  if (!t) return { id: "next", steps: [{ target: "nav-sessions", title: "All tasks done 🎉", body: "Book a follow-up so your counsellor can set your next steps.", next: "Take me there", click: true }] };
  return { id: "next", steps: [
    { target: `task-${t.id}`, page: "tasks", title: `Next: ${t.title}`, body: `${t.detail} About ${t.effort}.`, next: t.link ? "Next" : "Got it" },
    ...(t.link && t.link !== "profile" ? [{ target: `task-go-${t.id}`, page: "tasks" as AppPage, title: "Start it from here", body: "This button takes you straight to it.", next: "Take me there", click: true }] : []),
  ] };
}

// A single tip the first time each page opens.
const pageTips: Partial<Record<AppPage, Step>> = {
  courses: { target: "course-status", title: "Started a course?", body: "Change this to “In progress”. Your counsellor will see it." },
  jobs: { target: "job-save", title: "Like this one?", body: "Save it. You’ll talk through your saved jobs in your next session." },
  sessions: { target: "notes", title: "Your session notes", body: "Everything you discussed and agreed is here, written by your counsellor." },
  profile: { target: "answers", title: "Your answers", body: "Change anything here. Your counsellor is told when you do." },
  abroad: { target: "abroad-tabs", title: "Study Abroad", body: "Start with All Programs, or let the AI match suggest programs for you." },
  cv: { target: "cv-head", title: "Your CV, already started", body: "Your details are filled in. Check them, then create a draft." },
};

/* ---------- Geometry ---------- */
type Pt = { x: number; y: number };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const find = (key: string) => document.querySelector<HTMLElement>(`[data-guide="${key}"]`);
const visible = (el: HTMLElement | null) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
// Where the tip goes on a target: just inside its lower-left area, so the plane points up into it.
function aim(r: DOMRect): Pt {
  return { x: r.left + Math.min(r.width * 0.28, 46), y: r.bottom - Math.min(r.height * 0.32, 16) };
}
const NATURAL = Math.atan2(2.5 - 14, 34.5 - 20) * 180 / Math.PI; // the plane already points up-right

/* ---------- Guide ---------- */
type Mode = "dock" | "fly" | "point" | "home";
export function PlaneGuide({ page, go }: { page: AppPage; go: (p: string) => void }) {
  const { account, unlocked, sessions, tasks } = useFlow();
  const [tour, setTour] = useState<Tour | null>(null);
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<Mode>("dock");
  const [menu, setMenu] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const mounted = typeof document !== "undefined";
  const planeEl = useRef<HTMLDivElement>(null);
  const trailEl = useRef<SVGPolylineElement>(null);
  const pos = useRef<Pt>({ x: -100, y: -100 });
  const size = useRef(26);
  const seen = useRef<Set<string>>(new Set());
  const anim = useRef(0);
  const counsellor = sessions.find((s) => s.status === "completed") ? counsellorById(sessions.find((s) => s.status === "completed")!.slot.counsellor).name.split(" ")[0] : "Your counsellor";

  // Draw the plane with its tip at p.
  const draw = useCallback((p: Pt, angle = 0, scale = 1, w = size.current) => {
    pos.current = p; size.current = w;
    const el = planeEl.current;
    if (!el) return;
    const s = w / VB;
    el.style.width = `${w}px`;
    el.style.transform = `translate(${p.x - TIP.x * s}px, ${p.y - TIP.y * s}px) rotate(${angle}deg) scale(${scale})`;
    el.style.transformOrigin = `${TIP.x * s}px ${TIP.y * s}px`;
  }, []);

  // The dock is the plane inside the sidebar logo, or the floating button on small screens.
  const dock = useCallback((): { p: Pt; w: number } => {
    const logo = find("plane-dock");
    const pill = find("plane-pill");
    const el = visible(logo) ? logo! : pill;
    if (!el) return { p: { x: -100, y: -100 }, w: 24 };
    const r = el.getBoundingClientRect();
    const w = el === logo ? r.width * 36 / 132 : 24;
    // In the logo the plane's box starts at (15, 4) of the 132-wide image.
    if (el === logo) { const k = r.width / 132; return { p: { x: r.left + (15 + TIP.x) * k, y: r.top + (4 + TIP.y) * k }, w }; }
    return { p: { x: r.left + 10 + TIP.x * 24 / VB, y: r.top + (r.height - 21) / 2 + TIP.y * 24 / VB }, w };
  }, []);

  const fly = useCallback((to: Pt, toW: number, done: () => void) => {
    cancelAnimationFrame(anim.current);
    const from = { ...pos.current }, fromW = size.current;
    const dx = to.x - from.x, dy = to.y - from.y, dist = Math.hypot(dx, dy);
    const lift = Math.min(220, dist * 0.38);
    const c = { x: (from.x + to.x) / 2 + (dy > 0 ? -lift * 0.25 : 0), y: Math.min(from.y, to.y) - lift };
    const dur = Math.min(1150, Math.max(620, 480 + dist * 0.55));
    const start = performance.now();
    const trail: Pt[] = [];
    setMode("fly");
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / dur), e = ease(t), u = 1 - e;
      const p = { x: u * u * from.x + 2 * u * e * c.x + e * e * to.x, y: u * u * from.y + 2 * u * e * c.y + e * e * to.y };
      const tan = { x: 2 * u * (c.x - from.x) + 2 * e * (to.x - c.x), y: 2 * u * (c.y - from.y) + 2 * e * (to.y - c.y) };
      const heading = Math.atan2(tan.y, tan.x) * 180 / Math.PI - NATURAL;
      const settle = t > 0.72 ? ease((t - 0.72) / 0.28) : 0;
      const angle = heading * (1 - settle);
      const scale = 1 + Math.sin(Math.PI * e) * 0.35;
      draw(p, angle, scale, fromW + (toW - fromW) * e);
      trail.push(p); if (trail.length > 14) trail.shift();
      trailEl.current?.setAttribute("points", t < 1 ? trail.map((q) => `${q.x},${q.y}`).join(" ") : "");
      if (t < 1) anim.current = requestAnimationFrame(frame);
      else done();
    };
    anim.current = requestAnimationFrame(frame);
  }, [draw]);

  // Sit in the dock, following it if the layout moves.
  useEffect(() => {
    if (!mounted || mode !== "dock") return;
    const place = () => { const d = dock(); draw(d.p, 0, 1, d.w); };
    place();
    window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [mounted, mode, dock, draw]);

  const step = tour?.steps[i];
  const end = useCallback(() => {
    setTour(null); setRect(null); setMenu(false);
    const d = dock();
    setMode("home");
    fly(d.p, d.w, () => setMode("dock"));
  }, [dock, fly]);

  const advance = () => {
    if (!tour) return;
    if (i + 1 >= tour.steps.length) end(); else setI(i + 1);
  };
  // Go to a step: switch page if needed, find the element, scroll it into view, fly there.
  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    if (step.page && step.page !== page) { go(step.page); return; }
    const t0 = performance.now();
    const seek = () => {
      if (cancelled) return;
      setRect(null);
      const el = find(step.target === "task-first" ? `task-${tasks[0]?.id}` : step.target);
      if (!visible(el)) { if (performance.now() - t0 < 1500) return void setTimeout(seek, 30); advance(); return; }
      el!.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        if (cancelled) return;
        const r = el!.getBoundingClientRect();
        fly(aim(r), 48, () => { if (!cancelled) { setRect(el!.getBoundingClientRect()); setMode("point"); } });
      }, 380);
    };
    const first = setTimeout(seek, 0);
    return () => { cancelled = true; clearTimeout(first); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, i, page]);

  // Keep the plane and spotlight on the target while the page scrolls.
  useEffect(() => {
    if (mode !== "point" || !step) return;
    const el = find(step.target === "task-first" ? `task-${tasks[0]?.id}` : step.target);
    if (!el) return;
    const follow = () => { const r = el.getBoundingClientRect(); setRect(r); draw(aim(r), 0, 1, 48); };
    window.addEventListener("scroll", follow, true); window.addEventListener("resize", follow);
    // Steps that wait for the student's own click.
    // Advance in the same click, so the step changes together with the page.
    const clicked = () => advance();
    if (step.click) el.addEventListener("click", clicked);
    return () => { window.removeEventListener("scroll", follow, true); window.removeEventListener("resize", follow); el.removeEventListener("click", clicked); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  const start = useCallback((t: Tour) => { setMenu(false); setI(0); setTour(t); }, []);

  // First open: the plane lifts out of the logo and shows the student around.
  useEffect(() => {
    if (!mounted || seen.current.has("welcome")) return;
    // Marked as seen only when it actually starts (effects can run twice in development).
    const t = setTimeout(() => seen.current.add("welcome") && start(welcomeTour(account!.name.split(" ")[0], counsellor, unlocked ?? [])), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  // A one-off tip the first time a page opens (when no tour is running).
  useEffect(() => {
    const tip = pageTips[page];
    if (!tip || tour || seen.current.has(page) || !seen.current.has("welcome")) return;
    const t = setTimeout(() => seen.current.add(page) && start({ id: "tip-" + page, steps: [tip] }), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (!mounted) return null;
  const bubble = step && mode === "point" && rect ? bubblePos(rect) : null;
  return createPortal(<div className="pg">
    {/* Spotlight: dims the page except the target, which stays clickable */}
    {rect && mode === "point" && <div className="pg-spot" style={{ left: rect.left - 6, top: rect.top - 6, width: rect.width + 12, height: rect.height + 12 }} />}
    <svg className="pg-trail" aria-hidden="true"><defs><linearGradient id="pg-trail-g"><stop offset="0" stopColor="#d4146e" stopOpacity="0" /><stop offset="1" stopColor="#d4146e" stopOpacity=".55" /></linearGradient></defs>
      <polyline ref={trailEl} fill="none" stroke="url(#pg-trail-g)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <div ref={planeEl} className={"pg-plane is-" + mode} aria-hidden="true">
      <PlaneSvg width={36} id="guide" />
      {mode === "point" && <span className="pg-ring" />}
    </div>
    {/* The plane in the logo is a button too */}
    {mode === "dock" && <DockButton onClick={() => setMenu((m) => !m)} dock={dock} />}
    {menu && mode === "dock" && <div className="pg-menu" style={menuPos(dock().p)}>
      <strong>Hi! Need a hand?</strong>
      <button onClick={() => start(nextTour(tasks))}>✈ What should I do next?</button>
      <button onClick={() => start(welcomeTour(account!.name.split(" ")[0], counsellor, unlocked ?? []))}>Show me around again</button>
      {pageTips[page] && <button onClick={() => start({ id: "tip", steps: [pageTips[page]!] })}>Explain this page</button>}
    </div>}
    {step && bubble && <div className="pg-bubble" role="dialog" aria-live="polite" aria-label={step.title} style={bubble} key={tour!.id + i}>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
      <div className="pg-bubble-foot">
        {tour!.steps.length > 1 && <span className="pg-dots" aria-label={`Step ${i + 1} of ${tour!.steps.length}`}>{tour!.steps.map((_, k) => <i key={k} className={k === i ? "is-on" : k < i ? "is-done" : ""} />)}</span>}
        <button className="pg-skip" onClick={end}>{tour!.steps.length > 1 && i < tour!.steps.length - 1 ? "Skip tour" : "Close"}</button>
        <button className="pg-next" onClick={() => { if (step.click) find(step.target === "task-first" ? `task-${tasks[0]?.id}` : step.target)?.click(); else advance(); }}>
          {step.next ?? (i + 1 < tour!.steps.length ? "Next" : "Got it")}</button>
      </div>
    </div>}
    <button data-guide="plane-pill" className="pg-pill" onClick={() => (mode === "dock" ? setMenu((m) => !m) : end())} aria-label="Guide">
      <span className="pg-pill-space" />{tour ? "Stop guide" : "Guide me"}
    </button>
  </div>, document.body);
}

// An invisible button over the docked plane in the logo.
function DockButton({ onClick, dock }: { onClick: () => void; dock: () => { p: Pt; w: number } }) {
  const [{ p, w }, setAt] = useState({ p: { x: -100, y: -100 }, w: 24 });
  useEffect(() => {
    const place = () => setAt(dock());
    const id = requestAnimationFrame(place);
    window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [dock]);
  return <button className="pg-dock-btn" aria-label="Open the guide" title="Need a hand? Click the plane" onClick={onClick}
    style={{ left: p.x - w - 6, top: p.y - 6, width: w + 14, height: w + 6 }} />;
}
function bubblePos(r: DOMRect): React.CSSProperties {
  const W = Math.min(320, window.innerWidth - 24);
  const tip = aim(r);
  const below = tip.y + 58 + 170 < window.innerHeight;
  const left = Math.max(12, Math.min(tip.x - 30, window.innerWidth - W - 12));
  return below ? { left, top: tip.y + 54, width: W } : { left, top: Math.max(12, r.top - 186), width: W };
}
function menuPos(p: Pt): React.CSSProperties {
  const left = Math.max(12, Math.min(p.x - 20, window.innerWidth - 280));
  return p.y > window.innerHeight / 2 ? { left, bottom: window.innerHeight - p.y + 34 } : { left, top: p.y + 30 };
}
