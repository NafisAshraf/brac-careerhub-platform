"use client";
import { useState } from "react";
import { initialProfile, makeContent, programs, tools } from "../../student/data";
import { addDraft, readLab, writeLab } from "../../hub/abroad-store";
import "../../student/workspace.css";
import "../../student/workspace-surfaces.css";
import "../lab.css";

// Stub generation page: proves the "Generate" hand-off from a card and back.
export default function GenerateLab(params: { program?: string; tool?: string; from?: string; back?: string }) {
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState("");

  const program = programs.find((p) => p.id === params.program) || programs[0];
  const tool = tools.find((t) => t.id === params.tool) || tools[0];
  const back = params.back?.startsWith("/test/") ? params.back : `/test/cards?variant=${params.from || "a"}`;
  const save = () => {
    writeLab(addDraft(readLab(), program.id, tool.id));
    window.location.assign(back);
  };

  return (
    <main className="sa-portal hub lab-page">
      <div className="lab-shell lab-generate-page">
        <a className="hub-back" href={back}>← Back to programs</a>
        <header className="lab-header">
          <p className="lab-eyebrow">{program.university.toUpperCase()}</p>
          <h1>{tool.name}</h1>
          <p>{tool.description} For {program.name}.</p>
        </header>
        <label className="hub-field">
          Anything to include? (optional)
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="A project, an achievement, why this program…" />
        </label>
        <div className="lab-generate-actions">
          <button type="button" className="hub-btn hub-btn-primary" onClick={() => setDraft(makeContent(tool.id, initialProfile, program, notes))}>
            {draft ? "Regenerate" : "Generate draft"}
          </button>
          {draft && <button type="button" className="hub-btn" onClick={save}>Save draft & go back</button>}
        </div>
        {draft && <pre className="lab-draft">{draft}</pre>}
        <p className="hub-footnote">Placeholder generator for the card test. The real editor would live here.</p>
      </div>
    </main>
  );
}
