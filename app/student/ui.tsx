"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    catalog: "M3 5h7v14H3z M14 5h7v14h-7z M6 8h1 M17 8h1",
    match: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z",
    programs: "M4 5h6l2 2h8v13H4Z M8 12h8 M8 16h5",
    documents: "M6 3h8l4 4v14H6Z M14 3v5h4 M9 12h6 M9 16h6",
    tracker: "M4 5h16v16H4Z M8 2v6 M16 2v6 M4 10h16 M8 15l3 3 5-5",
    profile: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2",
    search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0 M15 15l6 6",
    filter: "M3 6h18 M6 12h12 M9 18h6 M7 3v6 M16 9v6 M11 15v6",
    menu: "M4 6h16 M4 12h16 M4 18h16",
    arrow: "M4 12h16 M14 6l6 6-6 6",
    globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9 M12 3C9.5 5.6 8.3 8.6 8.3 12s1.2 6.4 3.7 9",
    steps: "M4 19h5v-5h5V9h5V4 M4 19v-3",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.documents} />
    </svg>
  );
}
export function Heading({
  eyebrow,
  title,
  copy,
  action,
  level = 1,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
  level?: 1 | 2;
}) {
  const Title = level === 1 ? "h1" : "h2";
  return (
    <header className={`hub-heading${eyebrow ? "" : " hub-heading-plain"}`}>
      <div>
        {eyebrow && <span className="hub-eyebrow">{eyebrow}</span>}
        <Title>{title}</Title>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </header>
  );
}
export function Empty({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="hub-empty">
      <h2>{title}</h2>
      <p>{copy}</p>
      {action}
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
  wide = false,
  drawer = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const closeFromBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };
    dialog.addEventListener("click", closeFromBackdrop);
    return () => dialog.removeEventListener("click", closeFromBackdrop);
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      className={`hub-modal ${wide ? "hub-modal-wide" : ""} ${drawer ? "hub-modal-drawer" : ""}`}
      aria-label={title}
      onCancel={onClose}
    >
      <header>
        <h2>{title}</h2>
        <button
          type="button"
          className="hub-icon-btn"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <div className="hub-modal-body">{children}</div>
    </dialog>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
  anyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  anyLabel?: string;
}) {
  return (
    <label className="hub-field">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {anyLabel && <option value="">{anyLabel}</option>}
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}
export function ChipSelect({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="hub-chip-field">
      <legend>{label}</legend>
      <div className="hub-chips">
        {options.map((v) => (
          <button
            type="button"
            key={v}
            aria-pressed={values.includes(v)}
            className={values.includes(v) ? "selected" : ""}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
