"use client";
// The original Study Abroad workspace, embedded in the Career Hub. Same pages and
// state as app/student/workspace.tsx; the hub supplies the sidebar and the account,
// so the separate entry screen and Study Abroad sidebar are left out.
import { useEffect, useState } from "react";
import {
  programs,
  initialProfile,
  initialDocuments,
  profileFilters,
  updateFiltersFromProfile,
  emptyFilters,
  addProgram,
  statuses,
  formatDate,
  programProgress,
  type Profile,
  type DocumentRecord,
  type ToolType,
} from "../student/data";
import { Heading, Empty, Modal } from "../student/ui";
import { Catalog, ProgramDetail } from "../student/programs";
import { AiBasedMatch } from "../student/match";
import { MyProgramRow, ProgramWorkspace } from "../student/program-workspace";
import {
  DocumentStudio,
  initialReviews,
  ReviewWorkspace,
  type ReviewRecord,
  type StudioTab,
} from "../student/studio";
import { ToolWorkspace } from "../student/tool-workspace";
import { MyProfile } from "../student/profile";
import { SupportActions } from "../student/legacy-panels";
import "../student/workspace.css";
import "../student/workspace-surfaces.css";

export type AbroadPage = "catalog" | "match" | "programs" | "documents" | "tracker" | "profile" | "tool" | "review";
export const abroadNav: { id: AbroadPage; label: string; icon: string }[] = [
  { id: "catalog", label: "All Programs", icon: "globe" },
  { id: "match", label: "AI Based Match", icon: "match" },
  { id: "programs", label: "My Programs", icon: "bookmark" },
  { id: "documents", label: "Document Studio", icon: "pen" },
  { id: "tracker", label: "Application Tracker", icon: "flag" },
  { id: "profile", label: "Academic Profile", icon: "cap" },
];
export const initialSelection = ["glasgow-analytics", "adelaide-data", "ottawa-digital"];

export function StudyAbroadSection({
  active,
  page,
  setPage,
  navKey,
  selected,
  setSelected,
  account,
  onConsult,
}: {
  active: boolean;
  page: AbroadPage;
  navKey: number;
  setPage: (page: AbroadPage) => void;
  selected: string[];
  setSelected: (update: (ids: string[]) => string[]) => void;
  account: { name: string; email: string };
  onConsult: () => void;
}) {
  const [profile, setProfile] = useState<Profile>(() => ({ ...initialProfile, name: account.name || initialProfile.name, email: account.email || initialProfile.email }));
  const [filters, setFilters] = useState(() => profileFilters(initialProfile));
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [reviews, setReviews] = useState<ReviewRecord[]>(initialReviews);
  const [studioTab, setStudioTab] = useState<StudioTab>("SOP");
  const [applications, setApplications] = useState<Record<string, string>>({
    "ottawa-digital": "Submitted",
    "adelaide-data": "Interview",
  });
  const [uploads, setUploads] = useState<Record<string, Record<string, string>>>({});
  const [detail, setDetail] = useState<string | null>(null);
  const [infoId, setInfoId] = useState<string | null>(null);
  const [toolSession, setToolSession] = useState<{
    type: ToolType;
    programId: string | null;
    documentId: string | null;
    returnPage: "programs" | "documents";
    returnProgramId: string | null;
  } | null>(null);
  const [reviewSession, setReviewSession] = useState<{
    programId: string | null;
    documentId: string | null;
    returnPage: "programs" | "documents" | "tool";
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [booked, setBooked] = useState(false);
  // A sidebar click (navKey changes) always lands on the section's list view.
  const [lastNav, setLastNav] = useState(navKey);
  if (lastNav !== navKey) {
    setLastNav(navKey);
    setDetail(null);
    setNotice("");
  }
  useEffect(() => {
    if (active) window.scrollTo({ top: 0 });
  }, [active, page, detail]);

  const navigate = (next: AbroadPage) => {
    setPage(next);
    setDetail(null);
    setNotice("");
  };
  const saveProfile = (next: Profile) => {
    setFilters((current) => updateFiltersFromProfile(current, profile, next));
    setProfile(next);
  };
  const selectProgram = (id: string) => {
    setSelected((ids) => addProgram(ids, id));
    setNotice("Added to My Programs. Your preparation workspace is ready.");
  };
  const openProgram = (id: string) => {
    setPage("programs");
    setDetail(id);
    setNotice("");
  };
  const openTool = (type: ToolType, programId: string | null, documentId: string | null = null, fromStudio = false) => {
    if (fromStudio) setStudioTab(type);
    setToolSession({
      type,
      programId,
      documentId,
      returnPage: fromStudio ? "documents" : "programs",
      returnProgramId: fromStudio ? null : programId,
    });
    setPage("tool");
    setDetail(null);
  };
  const openDocument = (id: string, fromStudio = false) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) openTool(doc.type, doc.programId, doc.id, fromStudio);
  };
  const openReview = (programId: string | null, documentId: string | null, returnPage: "programs" | "documents" | "tool") => {
    setReviewSession({ programId, documentId, returnPage });
    setPage("review");
    setDetail(null);
  };
  const activeProgram = page === "programs" ? programs.find((p) => p.id === detail) : undefined;
  const myPrograms = programs.filter((p) => selected.includes(p.id));

  return (
    <div className="sa-portal hub v3-abroad">
      <div className={`hub-main${page === "catalog" ? " hub-main-catalog" : ""}`}>
        <div hidden={page !== "match"}>
          <AiBasedMatch
            active={active && page === "match"}
            profile={profile}
            selected={selected}
            onOpen={setInfoId}
            onAdd={selectProgram}
            onWorkspace={openProgram}
          />
        </div>
        {page === "match" ? null : page === "tool" && toolSession ? (
          <ToolWorkspace
            key={`${toolSession.type}-${toolSession.programId}-${toolSession.documentId}`}
            type={toolSession.type}
            programId={toolSession.programId}
            document={documents.find((d) => d.id === toolSession.documentId)}
            profile={profile}
            onBack={() => {
              setPage(toolSession.returnPage);
              setDetail(toolSession.returnProgramId);
            }}
            onSave={(doc) =>
              setDocuments((list) =>
                list.some((d) => d.id === doc.id) ? list.map((d) => (d.id === doc.id ? doc : d)) : [doc, ...list],
              )
            }
            onReview={(id) => {
              setToolSession({ ...toolSession, documentId: id });
              openReview(toolSession.programId, id, "tool");
            }}
          />
        ) : page === "review" && reviewSession ? (
          <ReviewWorkspace
            key={`${reviewSession.programId}-${reviewSession.documentId}`}
            documents={documents}
            reviews={reviews}
            initialDocumentId={reviewSession.documentId}
            programId={reviewSession.programId}
            onBack={() => {
              setPage(reviewSession.returnPage);
              if (reviewSession.returnPage === "programs") setDetail(reviewSession.programId);
            }}
            onOpen={(id) => openDocument(id, !reviewSession.programId)}
            onReviewed={(review) => setReviews((list) => [...list, review])}
          />
        ) : activeProgram ? (
          <ProgramWorkspace
            key={activeProgram.id}
            program={activeProgram}
            documents={documents.filter((d) => d.programId === activeProgram.id)}
            uploads={uploads[activeProgram.id] || {}}
            profile={profile}
            onProfileSave={saveProfile}
            onUpload={(id, filename) =>
              setUploads((current) => ({
                ...current,
                [activeProgram.id]: { ...current[activeProgram.id], [id]: filename },
              }))
            }
            onBack={() => setDetail(null)}
            onTool={(type) => openTool(type, activeProgram.id)}
            onDocument={(id) => openDocument(id)}
            onReview={() => openReview(activeProgram.id, null, "programs")}
            onConsult={onConsult}
          />
        ) : (
          <>
            {page === "catalog" && (
              <Catalog
                filters={filters}
                setFilters={setFilters}
                reset={() => setFilters(profileFilters(profile))}
                clear={() => setFilters({ ...emptyFilters })}
                selected={selected}
                onOpen={setInfoId}
                onAdd={selectProgram}
                onWorkspace={openProgram}
              />
            )}
            {page === "programs" && (
              <>
                <Heading
                  title="My Programs"
                  copy="The possibilities you’ve chosen. Make each application your own."
                  action={<button className="hub-btn" onClick={() => navigate("catalog")}>Explore programs</button>}
                />
                <div className="hub-program-summary">
                  <article><b>{selected.length}</b><span>Selected programs</span></article>
                  <article>
                    <b>{documents.filter((d) => d.programId && selected.includes(d.programId)).length}</b>
                    <span>Program documents</span>
                  </article>
                  <article>
                    <b>
                      {myPrograms.filter((program) => {
                        const progress = programProgress(program, documents, uploads[program.id] || {});
                        return progress.complete === progress.total;
                      }).length}
                    </b>
                    <span>Document checklists complete</span>
                  </article>
                </div>
                {myPrograms.length ? (
                  <div className="hub-program-grid">
                    {myPrograms.map((p) => (
                      <MyProgramRow
                        key={p.id}
                        program={p}
                        documents={documents}
                        uploads={uploads[p.id] || {}}
                        profile={profile}
                        onOpen={() => openProgram(p.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <Empty
                    title="Your shortlist starts with a possibility"
                    copy="Explore the catalog and add a program you’d like to prepare for."
                    action={<button className="hub-btn hub-btn-primary" onClick={() => navigate("catalog")}>Explore programs</button>}
                  />
                )}
              </>
            )}
            {page === "documents" && (
              <DocumentStudio
                documents={documents}
                reviews={reviews}
                tab={studioTab}
                setTab={setStudioTab}
                onCreate={(type) => openTool(type, null, null, true)}
                onOpen={(id) => openDocument(id, true)}
                onReview={(id) => openReview(null, id, "documents")}
                onNewReview={() => openReview(null, null, "documents")}
              />
            )}
            {page === "tracker" && (
              <>
                <Heading eyebrow="MY JOURNEY" title="Application Tracker" copy="Keep track of your submissions, offers and visa steps." />
                <div className="sa-tracker">
                  {myPrograms.map((p) => (
                    <article key={p.id}>
                      <div>
                        <small>{p.country}</small>
                        <h3>{p.university}</h3>
                        <p>{p.name}</p>
                        <button className="hub-text-btn" onClick={() => openProgram(p.id)}>Open program</button>
                      </div>
                      <div className="hub-tracker-deadline">
                        <span>Application deadline</span>
                        <strong>{formatDate(p.deadline)}</strong>
                      </div>
                      <label className="hub-field">
                        Application status
                        <select
                          value={applications[p.id] || "Preparing"}
                          onChange={(e) => setApplications({ ...applications, [p.id]: e.target.value })}
                        >
                          {statuses.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </label>
                    </article>
                  ))}
                </div>
                {!myPrograms.length && (
                  <Empty
                    title="Your tracker is ready"
                    copy="Add a program to My Programs to start tracking its application."
                    action={<button className="hub-btn" onClick={() => navigate("catalog")}>Explore programs</button>}
                  />
                )}
                <SupportActions booked={booked} setBooked={setBooked} />
              </>
            )}
            {page === "profile" && <MyProfile profile={profile} onSave={saveProfile} />}
          </>
        )}
      </div>
      {notice && (
        <div className="hub-toast" role="status">
          <span>✓ {notice}</span>
          <button onClick={() => navigate("programs")}>View programs</button>
          <button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button>
        </div>
      )}
      {infoId && programs.find((p) => p.id === infoId) && (
        <Modal title="Program details" wide onClose={() => setInfoId(null)}>
          <div className="hub-program-info-modal">
            <ProgramDetail
              program={programs.find((p) => p.id === infoId)!}
              selected={selected.includes(infoId)}
              onBack={() => setInfoId(null)}
              onAdd={() => {
                if (selected.includes(infoId)) openProgram(infoId);
                else selectProgram(infoId);
                setInfoId(null);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
