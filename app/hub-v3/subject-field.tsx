"use client";
import { useRef, useState } from "react";
import { text, type Language } from "../career/data";
import { matchSubjects, subjectLabel, type Subject } from "./subjects";

// Type to filter; Enter (or leaving the field) picks the closest subject.
export function SubjectField({ id, value, onChange, language }: {
  id: string; value: string; onChange: (subject: Subject) => void; language: Language;
}) {
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const label = (s: Subject) => text(language, [s.name, s.bn]);
  const current = subjectLabel(value);
  const shown = query ?? (current ? text(language, current) : "");
  const { matches, closest } = matchSubjects(query ?? "");
  const options = matches.slice(0, 50);

  function pick(subject: Subject | undefined) {
    if (subject) onChange(subject);
    setQuery(null);
    setOpen(false);
  }
  function move(step: number) {
    if (!options.length) return;
    const next = (highlight + step + options.length) % options.length;
    setHighlight(next);
    setOpen(true);
    list.current?.children[next]?.scrollIntoView({ block: "nearest" });
  }

  return <div className="v3-combo">
    <input
      id={id}
      role="combobox"
      aria-expanded={open}
      aria-controls={id + "-list"}
      aria-autocomplete="list"
      aria-activedescendant={open && options[highlight] ? `${id}-opt-${highlight}` : undefined}
      autoComplete="off"
      required
      placeholder={text(language, ["Start typing your subject", "আপনার বিষয় লিখুন"])}
      value={shown}
      onFocus={(e) => { e.currentTarget.select(); setHighlight(0); setOpen(true); }}
      onChange={(e) => { setQuery(e.target.value); setHighlight(0); setOpen(true); }}
      onBlur={() => pick(query?.trim() ? closest : undefined)}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
        else if (e.key === "Enter") {
          e.preventDefault();
          pick(open && options[highlight] ? options[highlight] : closest);
        } else if (e.key === "Escape") { setQuery(null); setOpen(false); }
      }}
    />
    {open && <ul className="v3-combo-list" id={id + "-list"} role="listbox" ref={list}>
      {options.length ? options.map((s, i) => <li
        key={s.name}
        id={`${id}-opt-${i}`}
        role="option"
        aria-selected={i === highlight}
        className={(i === highlight ? "is-active" : "") + (s.name === value ? " is-current" : "")}
        onMouseDown={(e) => { e.preventDefault(); pick(s); }}
        onMouseEnter={() => setHighlight(i)}
      >{label(s)}{s.aliases?.[0] && s.aliases[0].length <= 4 && <small>{s.aliases[0]}</small>}</li>)
        : <li className="v3-combo-empty" role="option" aria-selected="false">{text(language, ["No exact match. Press Enter for", "সঠিক মিল নেই। Enter চাপলে বেছে নেবে:"])} {closest && label(closest)}</li>}
    </ul>}
  </div>;
}
