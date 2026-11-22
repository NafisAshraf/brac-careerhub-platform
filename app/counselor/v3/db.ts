// Demo data for counsellor portal v3. In production the courses and jobs come from the Career
// Hub database, and the AI picks the relevant ones for each student from their answers.
import { sampleAnswers, type Answers, type Unlockable } from "../../flow/data";

export type Item = { id: string; kind: "course" | "job"; title: string; org: string; meta: string; about: string; tags: string[]; image: string; link: string };
export type Pick = { id: string; note?: string; by: string; ai?: boolean };
export type Task = { id: string; title: string; due: number; by: string; done?: boolean; ai?: boolean };
export type Meeting = { id: string; date: string; time: string; counsellor: string; mode: "online" | "in person"; status: "upcoming" | "done" | "missed" | "cancelled"; notes?: string; aiNotes?: boolean };
export type Student = {
  id: string; name: string; initials: string; tone: string; subject: string; year: string; email: string; phone: string;
  answers?: Answers; meetings: Meeting[]; unlock: Unlockable[]; tasks: Task[]; courses: Pick[]; jobs: Pick[];
  ai: { courses: { id: string; why: string }[]; jobs: { id: string; why: string }[]; tasks: string[] };
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return iso(d); };
export const today = day(0);

const C = (id: string, title: string, org: string, meta: string, about: string, tags: string[], image: string, link: string): Item => ({ id, kind: "course", title, org, meta, about, tags, image: `/career/${image}.webp`, link });
const J = (id: string, title: string, org: string, meta: string, about: string, tags: string[], image: string, link: string): Item => ({ id, kind: "job", title, org, meta, about, tags, image: `/career/${image}.webp`, link });

export const db: Item[] = [
  C("c-excel", "Excel Skills for Business: Essentials", "Macquarie University · Coursera", "Online · 6 weeks · Free to audit", "Formulas, charts and sorting data. The base for almost any internship.", ["Data", "Business", "Beginner"], "course-excel", "https://www.coursera.org/learn/excel-essentials"),
  C("c-sql", "SQL for Data Science", "UC Davis · Coursera", "Online · 4 weeks · Free to audit", "Pulling data out of databases. Best after Excel.", ["Data", "Tech"], "course-sql", "https://www.coursera.org/learn/sql-for-data-science"),
  C("c-analytics", "Google Data Analytics Certificate", "Google · Coursera", "Self-paced · Financial aid available", "The full analysis process, from question to dashboard.", ["Data", "Certificate"], "course-analytics", "https://grow.google/certificates/data-analytics"),
  C("c-writing", "Professional Communication Workshop", "BRAC Career Hub · Mohakhali", "In person · 3 Saturdays · Free", "Emails, presentations and interview answers, practised in a small group.", ["Soft skills", "In person"], "course-writing", "https://careerhub.brac.net/events/communication"),
  C("c-dm", "Digital Marketing Fundamentals", "Google · Online", "40 hours · Free certificate", "Search, social and email marketing basics.", ["Marketing", "Beginner"], "course-digital-marketing", "https://learndigital.withgoogle.com"),
  C("c-mkt-analytics", "Marketing Analytics", "University of Virginia · Coursera", "Online · 4 weeks", "Measuring what marketing actually does.", ["Marketing", "Data"], "course-marketing-analytics", "https://www.coursera.org/learn/uva-darden-market-analytics"),
  C("c-ielts", "IELTS Preparation (weekend)", "British Council · Dhaka", "In person · 8 weekends", "Targeted practice for a 6.5+ band.", ["Study abroad", "In person"], "course-writing", "https://www.britishcouncil.org.bd/exam/ielts"),
  C("c-python", "Python for Everybody", "University of Michigan · Coursera", "Online · 8 weeks · Free to audit", "Programming from scratch, slowly and clearly.", ["Tech", "Beginner"], "course-sql", "https://www.coursera.org/specializations/python"),
  C("c-bcs", "BCS Preliminary Prep (weekend)", "BRAC Career Hub · Mohakhali", "In person · 10 Saturdays", "General knowledge, maths and English for the BCS preliminary.", ["Government", "In person"], "course-writing", "https://careerhub.brac.net/bcs"),
  J("j-analyst", "Business Analyst Intern", "bKash", "Gulshan · 3 months · Tk 15,000/month", "Reports and dashboards with the business team.", ["Data", "Business", "Paid"], "job-analyst", "https://www.bdjobs.com/jobs/bkash-analyst-intern"),
  J("j-data", "Junior Data Associate (part-time)", "Shohoz", "Hybrid · 15 hrs/week", "Cleaning and reporting ride data.", ["Data", "Part-time"], "job-data", "https://www.linkedin.com/jobs/shohoz-data"),
  J("j-research", "Research Assistant (part-time)", "BIGD, BRAC University", "Mohakhali · 15 hrs/week", "Surveys and data for development research.", ["Research", "Part-time"], "job-research", "https://bigd.bracu.ac.bd/careers"),
  J("j-ops", "Operations Intern", "Shikho", "Banani · Hybrid · 2 months", "See how a startup runs day to day.", ["Business", "Startup"], "job-operations", "https://shikho.com/careers"),
  J("j-content", "Content & Social Media Intern", "10 Minute School", "Dhaka · 3 months", "Writing posts and short videos.", ["Marketing", "Writing"], "job-content", "https://10minuteschool.com/careers"),
  J("j-marketing", "Marketing Trainee", "Unilever Bangladesh", "Gulshan · 6 months · Paid", "Brand work across one product line.", ["Marketing", "Paid"], "job-marketing", "https://careers.unilever.com/bangladesh"),
  J("j-ngo", "Programme Volunteer", "BRAC", "Dhaka and districts · Flexible", "Field support on education programmes.", ["Development", "Volunteer"], "job-research", "https://www.brac.net/volunteer"),
  J("j-dev", "Junior Web Developer Intern", "Pathao", "Remote · 3 months · Paid", "Front-end work on internal tools.", ["Tech", "Remote"], "job-data", "https://pathao.com/careers"),
];
export const byId = (id: string) => db.find((x) => x.id === id)!;

const raw: Student[] = [
  { id: "ayesha", name: "Ayesha Rahman", initials: "AR", tone: "#b5477f", subject: "Computer Science and Engineering", year: "2nd year", email: "ayesha.rahman@g.bracu.ac.bd", phone: "01712-345678",
    answers: { ...sampleAnswers, note: "My parents want me to do an MBA, but I like data. Can we talk about scholarships?" },
    meetings: [{ id: "a1", date: today, time: "10:45", counsellor: "nusrat", mode: "online", status: "upcoming" }],
    unlock: [], tasks: [], courses: [], jobs: [],
    ai: { courses: [{ id: "c-excel", why: "Enjoys numbers; Excel comes up in almost every internship she might want." }, { id: "c-sql", why: "Interested in data work; the next step after Excel." }, { id: "c-ielts", why: "Wants to study abroad after graduating." }],
      jobs: [{ id: "j-analyst", why: "Takes 2nd and 3rd year students; asks for Excel basics." }, { id: "j-data", why: "Part-time, fits her 2–3 free hours plus weekends." }],
      tasks: ["Write down three things you’re good at", "Make a one-page CV draft", "Shortlist three master’s programs"] } },
  { id: "sadia", name: "Sadia Islam", initials: "SI", tone: "#7a3fa0", subject: "Business Administration", year: "1st year", email: "sadia.islam@g.bracu.ac.bd", phone: "01511-443322",
    answers: { year: "1st year", studies: "I enjoy it", enjoy: ["Organising and leading", "Writing or speaking"], work: "Not yet", clarity: "A little", confidence: "Mostly", worry: "Having no experience", after: "Higher study in Bangladesh", fields: ["Business & finance", "Marketing & media"], hours: "2–3 hours", note: "" },
    meetings: [
      { id: "s1", date: day(-40), time: "11:30", counsellor: "tanvir", mode: "online", status: "done", notes: "Wants marketing. Agreed: join a club, start the digital marketing course." },
      { id: "s2", date: day(-18), time: "15:15", counsellor: "tanvir", mode: "in person", status: "done", notes: "Joined the business club. Course half done. Next: an internship by summer." },
      { id: "s3", date: today, time: "15:15", counsellor: "nusrat", mode: "in person", status: "upcoming" }],
    unlock: ["courses", "jobs", "cv"],
    tasks: [{ id: "st1", title: "Join one business club", due: -20, by: "tanvir", done: true }, { id: "st2", title: "Finish the digital marketing course", due: 5, by: "tanvir" }, { id: "st3", title: "Make your first CV draft", due: 10, by: "tanvir" }],
    courses: [{ id: "c-dm", by: "tanvir" }], jobs: [{ id: "j-content", by: "tanvir", note: "Good for a portfolio." }],
    ai: { courses: [{ id: "c-mkt-analytics", why: "Halfway through digital marketing; this adds the numbers side." }, { id: "c-writing", why: "Rated herself only somewhat confident with new people." }],
      jobs: [{ id: "j-marketing", why: "Open to 1st-years with club experience." }], tasks: ["Ask two seniors how they found their first internship"] } },
  { id: "tahmid", name: "Tahmid Chowdhury", initials: "TC", tone: "#2f6f9f", subject: "Economics", year: "3rd year", email: "tahmid.c@g.bracu.ac.bd", phone: "01811-223344",
    answers: { year: "3rd year", studies: "I enjoy it", enjoy: ["Writing or speaking", "Helping people"], work: "Clubs or volunteering", clarity: "Somewhat", confidence: "Mostly", worry: "Money and job security", after: "Get a job in Bangladesh", fields: ["Development & NGOs", "Government jobs"], hours: "4–6 hours", note: "" },
    meetings: [{ id: "t1", date: day(-1), time: "14:30", counsellor: "nusrat", mode: "online", status: "done", notes: "Talked through BCS vs NGO paths. He’ll try both for a semester." }],
    unlock: ["courses", "jobs"], tasks: [{ id: "tt1", title: "Read the BCS preliminary syllabus", due: 6, by: "nusrat" }],
    courses: [{ id: "c-bcs", by: "nusrat", ai: true }], jobs: [{ id: "j-research", by: "nusrat", ai: true }],
    ai: { courses: [{ id: "c-bcs", why: "Considering government jobs; matches his free Saturdays." }], jobs: [{ id: "j-research", why: "BIGD hires economics students every semester." }, { id: "j-ngo", why: "Wants development work; no contacts yet." }], tasks: ["Talk to someone working in a development NGO"] } },
  { id: "imran", name: "Imran Hossain", initials: "IH", tone: "#3f7d5c", subject: "Electrical and Electronic Engineering", year: "3rd year", email: "imran.h@g.bracu.ac.bd", phone: "01611-998877",
    answers: { year: "3rd year", studies: "It’s okay", enjoy: ["Building or fixing things"], work: "An internship", clarity: "Mostly", confidence: "Somewhat", worry: "My CV or interviews", after: "Study abroad", fields: ["Engineering", "Software & data"], hours: "4–6 hours", note: "I want to do a master's in Germany." },
    meetings: [{ id: "i1", date: day(1), time: "14:30", counsellor: "nusrat", mode: "online", status: "upcoming" }],
    unlock: [], tasks: [], courses: [], jobs: [],
    ai: { courses: [{ id: "c-ielts", why: "Plans a master’s abroad." }, { id: "c-python", why: "Interested in software; a gentle start." }], jobs: [{ id: "j-dev", why: "Remote and paid; builds a portfolio for applications." }], tasks: ["List three German universities and their deadlines"] } },
  { id: "zarif", name: "Zarif Haque", initials: "ZH", tone: "#4a5bb0", subject: "Computer Science and Engineering", year: "1st year", email: "zarif.haque@g.bracu.ac.bd", phone: "01411-112233",
    answers: { year: "1st year", studies: "I enjoy it", enjoy: ["Building or fixing things"], work: "Not yet", clarity: "Somewhat", confidence: "Somewhat", worry: "Having no experience", after: "Study abroad", fields: ["Software & data"], hours: "4–6 hours", note: "" },
    meetings: [{ id: "z1", date: day(-35), time: "16:00", counsellor: "farhana", mode: "online", status: "done", notes: "Keen coder. Start with a project, not courses." }],
    unlock: ["courses", "jobs", "cv", "abroad"], tasks: [{ id: "zt1", title: "Build a small project and put it on GitHub", due: -3, by: "farhana", done: true }],
    courses: [{ id: "c-python", by: "farhana" }], jobs: [],
    ai: { courses: [{ id: "c-sql", why: "Finished his first project; data is a natural next step." }], jobs: [{ id: "j-dev", why: "Remote internship that values projects over grades." }], tasks: ["Join one hackathon this term"] } },
];

// The AI's picks start out selected for anyone not set up yet; the counsellor removes or adds.
export const students: Student[] = raw.map((s) => (s.courses.length || s.jobs.length ? s : {
  ...s, courses: s.ai.courses.map((x) => ({ id: x.id, by: "ai", ai: true })), jobs: s.ai.jobs.map((x) => ({ id: x.id, by: "ai", ai: true })),
  tasks: s.ai.tasks.map((title, i) => ({ id: `${s.id}-ai${i}`, title, due: [3, 7, 14][i] ?? 14, by: "ai", ai: true })),
}));

// What the AI writes as a meeting summary once a session is marked done (a draft to edit).
export const aiSummary = (s: Student) => {
  const a = s.answers ?? {};
  const list = (v: unknown) => (Array.isArray(v) ? v.join(" and ").toLowerCase() : String(v ?? "").toLowerCase());
  return `We talked about what ${s.name.split(" ")[0]} enjoys (${list(a.enjoy)}) and the plan after university (${list(a.after)}). Main worry: ${list(a.worry)}. `
    + `Agreed next steps: ${s.tasks.slice(0, 2).map((t) => t.title.toLowerCase()).join("; ") || "pick a first task"}. We’ll check progress at the next session.`;
};
