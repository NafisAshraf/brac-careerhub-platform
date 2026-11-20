"use client";
// v11 Study Abroad. Three places in the sidebar: All programs, My programs, My documents.
// The AI match is not a separate tab: it is a short flow started from All programs, and it
// returns there. Built on the shared Study Abroad pieces (the earlier versions keep their own copy).
import { useEffect, useState } from "react";
import {
  programs, initialProfile, initialDocuments, profileFilters, updateFiltersFromProfile, emptyFilters, addProgram, programProgress,
  type Profile, type DocumentRecord, type ToolType,
} from "../../student/data";
import { Empty, Modal } from "../../student/ui";
import { Catalog, ProgramDetail } from "../../student/programs";
import { AiBasedMatch } from "../../student/match";
import { MyProgramRow, ProgramWorkspace } from "../../student/program-workspace";
import { DocumentStudio, initialReviews, ReviewWorkspace, type ReviewRecord, type StudioTab } from "../../student/studio";
import { ToolWorkspace } from "../../student/tool-workspace";
import "../../student/workspace.css";
import "../../student/workspace-surfaces.css";
import { Ico } from "./icons";
import { num, useL } from "./lang";
import { PageHead } from "./sections";
import { useHub } from "./store";

export type AbroadSub = "catalog" | "programs" | "documents";
type View = AbroadSub | "match" | "tool" | "review";
const initialSelection = ["glasgow-analytics", "adelaide-data", "ottawa-digital"];

export function AbroadV11({ sub, setSub, navKey, onConsult }: { sub: AbroadSub; setSub: (s: AbroadSub) => void; navKey: number; onConsult: () => void }) {
  const { account } = useHub();
  const { t, lang } = useL();
  const [view, setView] = useState<View>(sub);
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [profile, setProfile] = useState<Profile>(() => ({ ...initialProfile, name: account?.name || initialProfile.name, email: account?.email || initialProfile.email }));
  const [filters, setFilters] = useState(() => profileFilters(initialProfile));
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [reviews, setReviews] = useState<ReviewRecord[]>(initialReviews);
  const [studioTab, setStudioTab] = useState<StudioTab>("SOP");
  const [uploads, setUploads] = useState<Record<string, Record<string, string>>>({});
  const [detail, setDetail] = useState<string | null>(null);
  const [infoId, setInfoId] = useState<string | null>(null);
  const [tool, setTool] = useState<{ type: ToolType; programId: string | null; documentId: string | null; back: AbroadSub; backProgram: string | null } | null>(null);
  const [review, setReview] = useState<{ programId: string | null; documentId: string | null; back: AbroadSub | "tool" } | null>(null);
  const [notice, setNotice] = useState("");

  // A sidebar click always lands on that place's list.
  const [seen, setSeen] = useState(`${navKey}-${sub}`);
  if (seen !== `${navKey}-${sub}`) { setSeen(`${navKey}-${sub}`); setView(sub); setDetail(null); setNotice(""); }
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view, detail]);

  const goTo = (s: AbroadSub) => { setSub(s); setView(s); setDetail(null); setNotice(""); };
  const saveProfile = (next: Profile) => { setFilters((cur) => updateFiltersFromProfile(cur, profile, next)); setProfile(next); };
  const add = (id: string) => { setSelected((ids) => addProgram(ids, id)); setNotice(t("‘আমার প্রোগ্রাম’-এ যোগ হয়েছে।", "Added to My programs.")); };
  const openProgram = (id: string) => { setSub("programs"); setView("programs"); setDetail(id); setNotice(""); };
  const openTool = (type: ToolType, programId: string | null, documentId: string | null = null, fromStudio = false) => {
    if (fromStudio) setStudioTab(type);
    setTool({ type, programId, documentId, back: fromStudio ? "documents" : "programs", backProgram: fromStudio ? null : programId });
    setView("tool"); setDetail(null);
  };
  const openDocument = (id: string, fromStudio = false) => { const d = documents.find((x) => x.id === id); if (d) openTool(d.type, d.programId, d.id, fromStudio); };
  const openReview = (programId: string | null, documentId: string | null, back: AbroadSub | "tool") => { setReview({ programId, documentId, back }); setView("review"); setDetail(null); };
  const program = view === "programs" ? programs.find((p) => p.id === detail) : undefined;
  const mine = programs.filter((p) => selected.includes(p.id));
  const listView = (view === "catalog" || view === "programs" || view === "documents") && !program;
  const head = {
    catalog: { title: t("সব প্রোগ্রাম", "All programs"), body: t("দেশ, বিষয় আর খরচ দিয়ে ছেঁকে নিন। পছন্দ হলে ‘আমার প্রোগ্রাম’-এ যোগ করুন।", "Filter by country, subject and cost. Add the ones you like to My programs.") },
    programs: { title: t("আমার প্রোগ্রাম", "My programs"), body: t("যে প্রোগ্রামগুলো বেছেছেন। প্রতিটির কাগজপত্র এখানে গুছিয়ে নিন।", "The programs you picked. Get each one’s documents ready here.") },
    documents: { title: t("আমার ডকুমেন্ট", "My documents"), body: t("SOP, CV আর রেফারেন্স লেটার লিখুন, রিভিউ করান।", "Write your SOP, CV and reference letters, and get them reviewed.") },
  } as const;

  return <div className="v11-page v11-abroad">
    {listView && <PageHead icon="abroad" title={head[view as AbroadSub].title} body={head[view as AbroadSub].body} />}

    {view === "catalog" && !program && <section className="v11-match-cta">
      <span className="v11-match-ico"><Ico n="spark" s={26} w="fill" /></span>
      <div><b>{t("কোনটা দিয়ে শুরু করবেন বুঝতে পারছেন না?", "Not sure where to start?")}</b>
        <p>{t("কয়েকটি প্রশ্নের উত্তর দিন, AI আপনার জন্য মানানসই প্রোগ্রাম সাজিয়ে দেবে।", "Answer a few questions and AI will line up programs that fit you.")}</p></div>
      <button className="fl-btn fl-primary" onClick={() => setView("match")}>{t("আমার জন্য মিল খুঁজুন", "Find my matches")} <Ico n="arrow" s={18} w="bold" /></button>
    </section>}

    {view === "match" && <button className="fl-btn ghost v4-back v11-abroad-back" onClick={() => setView("catalog")}><Ico n="back" s={20} w="bold" /> {t("সব প্রোগ্রামে ফিরুন", "Back to all programs")}</button>}

    <div className={"sa-portal hub v3-abroad" + (listView ? " is-list" : "")}>
      <div className={`hub-main${view === "catalog" ? " hub-main-catalog" : ""}`}>
        {view === "match" ? <AiBasedMatch active profile={profile} selected={selected} onOpen={setInfoId} onAdd={add} onWorkspace={openProgram} />
          : view === "tool" && tool ? <ToolWorkspace key={`${tool.type}-${tool.programId}-${tool.documentId}`} type={tool.type} programId={tool.programId}
            document={documents.find((d) => d.id === tool.documentId)} profile={profile}
            onBack={() => { setView(tool.back); setDetail(tool.backProgram); }}
            onSave={(doc) => setDocuments((list) => (list.some((d) => d.id === doc.id) ? list.map((d) => (d.id === doc.id ? doc : d)) : [doc, ...list]))}
            onReview={(id) => { setTool({ ...tool, documentId: id }); openReview(tool.programId, id, "tool"); }} />
          : view === "review" && review ? <ReviewWorkspace key={`${review.programId}-${review.documentId}`} documents={documents} reviews={reviews} initialDocumentId={review.documentId} programId={review.programId}
            onBack={() => { setView(review.back); if (review.back === "programs") setDetail(review.programId); }}
            onOpen={(id) => openDocument(id, !review.programId)} onReviewed={(r) => setReviews((list) => [...list, r])} />
          : program ? <ProgramWorkspace key={program.id} program={program} documents={documents.filter((d) => d.programId === program.id)} uploads={uploads[program.id] || {}}
            profile={profile} onProfileSave={saveProfile}
            onUpload={(id, filename) => setUploads((cur) => ({ ...cur, [program.id]: { ...cur[program.id], [id]: filename } }))}
            onBack={() => setDetail(null)} onTool={(type) => openTool(type, program.id)} onDocument={(id) => openDocument(id)}
            onReview={() => openReview(program.id, null, "programs")} onConsult={onConsult} />
          : view === "catalog" ? <Catalog filters={filters} setFilters={setFilters} reset={() => setFilters(profileFilters(profile))} clear={() => setFilters({ ...emptyFilters })}
            selected={selected} onOpen={setInfoId} onAdd={add} onWorkspace={openProgram} />
          : view === "programs" ? <>
            <div className="v11-abroad-stats">
              <article><b>{num(selected.length, lang)}</b><span>{t("বাছাই করা প্রোগ্রাম", "Programs picked")}</span></article>
              <article><b>{num(documents.filter((d) => d.programId && selected.includes(d.programId)).length, lang)}</b><span>{t("প্রোগ্রামের ডকুমেন্ট", "Program documents")}</span></article>
              <article><b>{num(mine.filter((p) => { const g = programProgress(p, documents, uploads[p.id] || {}); return g.complete === g.total; }).length, lang)}</b><span>{t("কাগজপত্র সম্পূর্ণ", "Checklists complete")}</span></article>
            </div>
            {mine.length ? <div className="hub-program-grid">{mine.map((p) => <MyProgramRow key={p.id} program={p} documents={documents} uploads={uploads[p.id] || {}} profile={profile} onOpen={() => openProgram(p.id)} />)}</div>
              : <Empty title={t("এখনও কোনো প্রোগ্রাম নেই", "No programs yet")} copy={t("সব প্রোগ্রাম থেকে পছন্দেরটি যোগ করুন।", "Add one you like from All programs.")}
                action={<button className="fl-btn fl-primary" onClick={() => goTo("catalog")}>{t("প্রোগ্রাম দেখুন", "See programs")}</button>} />}
          </>
          : <DocumentStudio documents={documents} reviews={reviews} tab={studioTab} setTab={setStudioTab} onCreate={(type) => openTool(type, null, null, true)}
            onOpen={(id) => openDocument(id, true)} onReview={(id) => openReview(null, id, "documents")} onNewReview={() => openReview(null, null, "documents")} />}
      </div>
      {notice && <div className="hub-toast" role="status"><span>✓ {notice}</span>
        <button onClick={() => goTo("programs")}>{t("দেখুন", "View")}</button>
        <button aria-label={t("বন্ধ করুন", "Dismiss")} onClick={() => setNotice("")}>×</button></div>}
      {infoId && programs.find((p) => p.id === infoId) && <Modal title={t("প্রোগ্রামের বিস্তারিত", "Program details")} wide onClose={() => setInfoId(null)}>
        <div className="hub-program-info-modal"><ProgramDetail program={programs.find((p) => p.id === infoId)!} selected={selected.includes(infoId)} onBack={() => setInfoId(null)}
          onAdd={() => { if (selected.includes(infoId)) openProgram(infoId); else add(infoId); setInfoId(null); }} /></div>
      </Modal>}
    </div>
  </div>;
}
