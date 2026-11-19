"use client";
// The Career Hub plane as a guide (from v8): it lifts out of the logo, flies to a target,
// spotlights it and explains it. Same plane, motion, colours and styles as v8; a 4-step tour.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PlaneSvg } from "../guide";
import { useL } from "./lang";

type Step = { target: string; title: string; body: string };
type Pt = { x: number; y: number };
const TIP = { x: 34.5, y: 2.5 };
const VB = 36;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const find = (key: string) => document.querySelector<HTMLElement>(`[data-guide="${key}"]`);
const visible = (el: HTMLElement | null) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
const aim = (r: DOMRect): Pt => ({ x: r.left + Math.min(r.width * 0.28, 46), y: r.bottom - Math.min(r.height * 0.32, 16) });
const NATURAL = Math.atan2(2.5 - 14, 34.5 - 20) * 180 / Math.PI;

export function Guide({ onHome, name }: { onHome: () => void; name: string }) {
  const { t } = useL();
  const tourSteps: Step[] = [
    { target: "nav-main", title: t(`হাই ${name}! আমি আপনার গাইড।`, `Hi ${name}! I’m your guide.`), body: t("বাঁ পাশের তালিকা থেকে সব জায়গায় যাবেন। কাউন্সেলর নতুন কিছু খুললে এখানে দেখা যাবে।", "Everything is in this list on the left. Anything your counsellor opens appears here.") },
    { target: "tile-session", title: t("সবচেয়ে গুরুত্বপূর্ণ: আপনার সেশন", "Most important: your sessions"), body: t("পরের সেশন, মিটিং লিংক বা নতুন বুকিং সবসময় এই বড় বক্সে।", "Your next session, its link, or booking a new one is always in this big box.") },
    { target: "history", title: t("আগের সব সেশন", "All your past sessions"), body: t("যেকোনো সেশনে চাপ দিলে কাউন্সেলরের লেখা নোট দেখবেন।", "Tap any session to read the notes your counsellor wrote.") },
    { target: "tile-tasks", title: t("কাউন্সেলরের দেওয়া কাজ", "Tasks from your counsellor"), body: t("ছোট ছোট কাজ। শেষ হলে টিক দিন, কাউন্সেলর অগ্রগতি দেখবেন।", "Small to-dos. Tick them when done; your counsellor sees your progress.") },
  ];
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"dock" | "fly" | "point" | "home">("dock");
  const [menu, setMenu] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const planeEl = useRef<HTMLDivElement>(null);
  const trailEl = useRef<SVGPolylineElement>(null);
  const pos = useRef<Pt>({ x: -100, y: -100 });
  const size = useRef(26);
  const anim = useRef(0);
  const started = useRef(false);
  const mounted = typeof document !== "undefined";

  const draw = useCallback((p: Pt, angle = 0, scale = 1, w = size.current) => {
    pos.current = p; size.current = w;
    const el = planeEl.current;
    if (!el) return;
    const s = w / VB;
    el.style.width = `${w}px`;
    el.style.transform = `translate(${p.x - TIP.x * s}px, ${p.y - TIP.y * s}px) rotate(${angle}deg) scale(${scale})`;
    el.style.transformOrigin = `${TIP.x * s}px ${TIP.y * s}px`;
  }, []);
  // The dock: the plane's place in the sidebar logo, or the floating pill on small screens.
  const dock = useCallback((): { p: Pt; w: number } => {
    const logo = find("plane-dock"), pill = find("plane-pill");
    const el = visible(logo) ? logo! : pill;
    if (!el) return { p: { x: -100, y: -100 }, w: 24 };
    const r = el.getBoundingClientRect();
    if (el === logo) { const k = r.width / 132; return { p: { x: r.left + (15 + TIP.x) * k, y: r.top + (4 + TIP.y) * k }, w: r.width * 36 / 132 }; }
    return { p: { x: r.left + 10 + TIP.x * 24 / VB, y: r.top + (r.height - 21) / 2 + TIP.y * 24 / VB }, w: 24 };
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
      const k = Math.min(1, (now - start) / dur), e = ease(k), u = 1 - e;
      const p = { x: u * u * from.x + 2 * u * e * c.x + e * e * to.x, y: u * u * from.y + 2 * u * e * c.y + e * e * to.y };
      const tan = { x: 2 * u * (c.x - from.x) + 2 * e * (to.x - c.x), y: 2 * u * (c.y - from.y) + 2 * e * (to.y - c.y) };
      const settle = k > 0.72 ? ease((k - 0.72) / 0.28) : 0;
      draw(p, (Math.atan2(tan.y, tan.x) * 180 / Math.PI - NATURAL) * (1 - settle), 1 + Math.sin(Math.PI * e) * 0.35, fromW + (toW - fromW) * e);
      trail.push(p); if (trail.length > 14) trail.shift();
      trailEl.current?.setAttribute("points", k < 1 ? trail.map((q) => `${q.x},${q.y}`).join(" ") : "");
      if (k < 1) anim.current = requestAnimationFrame(frame); else done();
    };
    anim.current = requestAnimationFrame(frame);
  }, [draw]);

  useEffect(() => {
    if (!mounted || mode !== "dock") return;
    const place = () => { const d = dock(); draw(d.p, 0, 1, d.w); };
    place();
    window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [mounted, mode, dock, draw]);

  const step = steps?.[i];
  const end = useCallback(() => { setSteps(null); setRect(null); setMenu(false); const d = dock(); setMode("home"); fly(d.p, d.w, () => setMode("dock")); }, [dock, fly]);
  const advance = () => { if (!steps) return; if (i + 1 >= steps.length) end(); else setI(i + 1); };

  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    const t0 = performance.now();
    const seek = () => {
      if (cancelled) return;
      setRect(null);
      const el = find(step.target);
      if (!visible(el)) { if (performance.now() - t0 < 1500) return void setTimeout(seek, 30); advance(); return; }
      el!.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => { if (cancelled) return; fly(aim(el!.getBoundingClientRect()), 48, () => { if (!cancelled) { setRect(el!.getBoundingClientRect()); setMode("point"); } }); }, 380);
    };
    const first = setTimeout(seek, 0);
    return () => { cancelled = true; clearTimeout(first); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, i]);
  useEffect(() => {
    if (mode !== "point" || !step) return;
    const el = find(step.target);
    if (!el) return;
    const follow = () => { const r = el.getBoundingClientRect(); setRect(r); draw(aim(r), 0, 1, 48); };
    window.addEventListener("scroll", follow, true); window.addEventListener("resize", follow);
    return () => { window.removeEventListener("scroll", follow, true); window.removeEventListener("resize", follow); };
  }, [mode, step, draw]);

  const start = () => { setMenu(false); onHome(); setI(0); setSteps(tourSteps); };
  // First open of the hub: show the student around once.
  useEffect(() => {
    if (!mounted || started.current) return;
    const id = setTimeout(() => { started.current = true; start(); }, 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;
  const bubble = step && mode === "point" && rect ? bubblePos(rect) : null;
  return createPortal(<div className="pg v11-pg">
    {rect && mode === "point" && <div className="pg-spot" style={{ left: rect.left - 6, top: rect.top - 6, width: rect.width + 12, height: rect.height + 12 }} />}
    <svg className="pg-trail" aria-hidden="true"><defs><linearGradient id="pg-trail-g"><stop offset="0" stopColor="#d4146e" stopOpacity="0" /><stop offset="1" stopColor="#d4146e" stopOpacity=".55" /></linearGradient></defs>
      <polyline ref={trailEl} fill="none" stroke="url(#pg-trail-g)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <div ref={planeEl} className={"pg-plane is-" + mode} aria-hidden="true"><PlaneSvg width={36} id="guide11" />{mode === "point" && <span className="pg-ring" />}</div>
    {mode === "dock" && <DockButton onClick={() => setMenu((m) => !m)} dock={dock} label={t("গাইড খুলুন", "Open the guide")} />}
    {menu && mode === "dock" && <div className="pg-menu" style={menuPos(dock().p)}>
      <strong>{t("সাহায্য লাগবে?", "Need a hand?")}</strong>
      <button onClick={start}>✈ {t("আবার ঘুরিয়ে দেখান", "Show me around again")}</button>
    </div>}
    {step && bubble && <div className="pg-bubble" role="dialog" aria-live="polite" aria-label={step.title} style={bubble} key={i}>
      <h3>{step.title}</h3><p>{step.body}</p>
      <div className="pg-bubble-foot">
        <span className="pg-dots">{steps!.map((_, k) => <i key={k} className={k === i ? "is-on" : k < i ? "is-done" : ""} />)}</span>
        <button className="pg-skip" onClick={end}>{i < steps!.length - 1 ? t("বাদ দিন", "Skip") : t("বন্ধ করুন", "Close")}</button>
        <button className="pg-next" onClick={advance}>{i + 1 < steps!.length ? t("পরেরটি", "Next") : t("বুঝেছি", "Got it")}</button>
      </div>
    </div>}
    <button data-guide="plane-pill" className="pg-pill" onClick={() => (mode === "dock" ? setMenu((m) => !m) : end())} aria-label={t("গাইড", "Guide")}>
      <span className="pg-pill-space" />{steps ? t("গাইড থামান", "Stop guide") : t("গাইড", "Guide me")}
    </button>
  </div>, document.body);
}

function DockButton({ onClick, dock, label }: { onClick: () => void; dock: () => { p: Pt; w: number }; label: string }) {
  const [{ p, w }, setAt] = useState({ p: { x: -100, y: -100 }, w: 24 });
  useEffect(() => {
    const place = () => setAt(dock());
    const id = requestAnimationFrame(place);
    window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [dock]);
  return <button className="pg-dock-btn" aria-label={label} title={label} onClick={onClick} style={{ left: p.x - w - 6, top: p.y - 6, width: w + 14, height: w + 6 }} />;
}
function bubblePos(r: DOMRect): React.CSSProperties {
  const W = Math.min(340, window.innerWidth - 24);
  const tip = aim(r);
  const below = tip.y + 58 + 180 < window.innerHeight;
  const left = Math.max(12, Math.min(tip.x - 30, window.innerWidth - W - 12));
  return below ? { left, top: tip.y + 54, width: W } : { left, top: Math.max(12, r.top - 196), width: W };
}
function menuPos(p: Pt): React.CSSProperties {
  const left = Math.max(12, Math.min(p.x - 20, window.innerWidth - 280));
  return p.y > window.innerHeight / 2 ? { left, bottom: window.innerHeight - p.y + 34 } : { left, top: p.y + 30 };
}
