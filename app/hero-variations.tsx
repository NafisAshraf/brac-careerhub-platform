"use client";
import { useEffect, useRef, type PointerEvent } from "react";
import "./hero-variations.css";

// "career" is a single full-width Career Hub scene (v3, where Study Abroad lives inside the hub).
export type HeroVariant = "split" | "rows" | "career";

const destinations = [
  {
    id: "career",
    label: "চাকরি ও ক্যারিয়ার প্রস্তুতি",
    title: ["আপনার ক্যারিয়ার,", "আপনার আগামী।"],
    description: "নিজেকে জানুন, দক্ষতা গড়ুন। সঠিক দিকনির্দেশনায় এগিয়ে যান আপনার পছন্দের কর্মজীবনের পথে।",
    action: "ক্যারিয়ার যাত্রা শুরু করুন",
    image: "/career-journey-hero.png",
    panorama: "/career-hero-panorama.webp",
    alt: "ক্যারিয়ার প্রস্তুতির বিভিন্ন ধাপ পেরিয়ে এগিয়ে যাচ্ছেন একজন শিক্ষার্থী",
  },
  {
    id: "study",
    label: "বিদেশে উচ্চশিক্ষা",
    title: ["উচ্চশিক্ষার পথে,", "বিশ্ব আপনার সামনে।"],
    description: "আপনার জন্য সঠিক বিশ্ববিদ্যালয় খুঁজুন। প্রথম শর্টলিস্ট থেকে প্রস্তুত আবেদন—প্রতি ধাপে সঙ্গে আছি।",
    action: "স্টাডি অ্যাব্রড শুরু করুন",
    image: "/study-abroad-hero.png",
    panorama: "/study-hero-panorama.webp",
    alt: "বিশ্ববিদ্যালয়ের বিকল্প ও আবেদনের কাগজপত্র নিয়ে পরিকল্পনা করছেন একজন শিক্ষার্থী",
  },
];

function DestinationScene({ destination, variant, index, onStart }: {
  destination: typeof destinations[number];
  variant: HeroVariant;
  index: number;
  onStart: () => void;
}) {
  const sceneRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const canAnimate = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => {
      canAnimate.current = preference.matches;
      if (!preference.matches) {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        sceneRef.current?.style.removeProperty("--pointer-x");
        sceneRef.current?.style.removeProperty("--pointer-y");
      }
    };
    update();
    preference.addEventListener("change", update);
    return () => {
      preference.removeEventListener("change", update);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const followPointer = (event: PointerEvent<HTMLElement>) => {
    if (!canAnimate.current || event.pointerType === "touch") return;
    const scene = event.currentTarget;
    const bounds = scene.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      scene.style.setProperty("--pointer-x", x.toFixed(3));
      scene.style.setProperty("--pointer-y", y.toFixed(3));
      frameRef.current = null;
    });
  };
  const resetPointer = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    sceneRef.current?.style.removeProperty("--pointer-x");
    sceneRef.current?.style.removeProperty("--pointer-y");
  };

  return (
    <article ref={sceneRef} onPointerMove={followPointer} onPointerLeave={resetPointer} onPointerCancel={resetPointer}
      className={`hero-destination hero-destination--${destination.id}`} aria-labelledby={`hero-${destination.id}-title`}>
      <div className="hero-destination-visual">
        <picture>
          {variant !== "split" && <source media="(max-width: 700px)" srcSet={destination.image} />}
          <img src={variant !== "split" ? destination.panorama : destination.image} alt={destination.alt} fetchPriority={index === 0 ? "high" : "auto"} decoding="async" />
        </picture>
      </div>
      <div className="hero-destination-copy">
        <div className="hero-reveal hero-reveal--label"><span className="hero-destination-label">{destination.label}</span></div>
        <div className="hero-reveal hero-reveal--title"><h2 id={`hero-${destination.id}-title`}>
          {destination.title[0]}<br /><span>{destination.title[1]}</span>
        </h2></div>
        <div className="hero-reveal hero-reveal--description"><p>{destination.description}</p></div>
        <div className="hero-reveal hero-reveal--action">
          <button className="hero-destination-action" onClick={onStart}>
            <span className="hero-action-face">
              {destination.action}
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function HeroVariation({ variant, startCareer, startStudy }: {
  variant: HeroVariant;
  startCareer: () => void;
  startStudy: () => void;
}) {
  return (
    <section className={`hero-variation hero-variation--${variant}`} id="pathways" aria-labelledby="hero-variation-title">
      <h1 id="hero-variation-title" className="hero-variation-sr">আপনার লক্ষ্য বেছে নিন</h1>
      {(variant === "career" ? destinations.slice(0, 1) : destinations).map((destination, index) => (
        <DestinationScene key={destination.id} destination={destination} variant={variant} index={index} onStart={index === 0 ? startCareer : startStudy} />
      ))}
    </section>
  );
}
