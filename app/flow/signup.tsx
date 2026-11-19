"use client";
import { useState, type ReactNode } from "react";
import { universities } from "../hub/data";
import { sampleAccount, useFlow, type Account } from "./store";
import { I } from "./parts";

// Name, email and mobile are needed: the meeting link goes out by email and SMS.
export function SignupForm({ title = "Create your free account", note }: { title?: string; note?: ReactNode }) {
  const { dispatch } = useFlow();
  const [a, setA] = useState<Account>({ name: "", email: "", phone: "", university: "", subject: "" });
  const set = (k: keyof Account) => (e: { target: { value: string } }) => setA({ ...a, [k]: e.target.value });
  return <form onSubmit={(e) => { e.preventDefault(); dispatch({ type: "signup", account: a }); }}>
    <h2>{title}</h2>
    <p>{note ?? "Takes about a minute. No password needed for this demo."}</p>
    <label className="fl-field"><span>Full name</span><input required autoComplete="name" value={a.name} onChange={set("name")} /></label>
    <label className="fl-field"><span>Email <small>· we send the meeting link here</small></span><input required type="email" autoComplete="email" value={a.email} onChange={set("email")} /></label>
    <label className="fl-field"><span>Mobile number <small>· for SMS reminders</small></span><input required type="tel" autoComplete="tel" inputMode="tel" placeholder="01XXX-XXXXXX" value={a.phone} onChange={set("phone")} /></label>
    <label className="fl-field"><span>University</span><select required value={a.university} onChange={set("university")}><option value="">Choose your university</option>{universities.map((u) => <option key={u}>{u}</option>)}<option>Other</option></select></label>
    <label className="fl-field"><span>Subject</span><input required placeholder="e.g. Computer Science and Engineering" value={a.subject} onChange={set("subject")} /></label>
    <button className="fl-btn fl-primary big" type="submit">Continue <I n="arrow" s={18} /></button>
    <button type="button" className="fl-link" onClick={() => setA(sampleAccount)}>Fill in a sample student</button>
  </form>;
}
