// Dummy data for the counsellor panel (/counselor/v1). Nothing here is connected to the
// student side: in production these would come from the backend, and the AI suggestions
// from LLM calls that search the web right after a student submits their answers.
import { sampleAnswers, type Answers, type Unlockable } from "../flow/data";

export type Status = "today" | "booked" | "plan" | "active" | "quiet" | "cancelled";
export type SessionRec = { date: string; time: string; kind: "First session" | "Follow-up"; status: "upcoming" | "completed" | "cancelled" | "no-show"; notes?: string; reason?: string };
export type Suggestion = {
  id: string; kind: "task" | "course" | "job";
  title: string; detail: string; why: string; source: string;
  meta?: string; image?: string; due?: number; effort?: string; link?: Unlockable; fresh?: boolean; mine?: boolean;
};
export type Brief = { summary: string; strengths: string[]; concerns: string[]; ask: string[] };
export type Assigned = { unlock: Unlockable[]; items: (Suggestion & { done?: boolean; state?: string })[]; sentOn: string };
export type Student = {
  id: string; name: string; initials: string; tone: string; subject: string; year: string; email: string; phone: string;
  status: Status; next?: { date: string; time: string }; answers?: Answers; lastActive: string;
  sessions: SessionRec[]; brief?: Brief; ai?: Suggestion[]; plan?: Assigned; privateNote?: string;
};

/* ---------- dates relative to today ---------- */
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return iso(d); };
export const today = day(0);

/* ---------- AI suggestion pools (what the LLM search would return) ---------- */
const S = (kind: Suggestion["kind"], id: string, x: Omit<Suggestion, "id" | "kind">): Suggestion => ({ id, kind, ...x });
const pools: Record<string, Suggestion[]> = {
  data: [
    S("task", "t-sql-proj", { title: "Build a small data project with a public dataset", detail: "Pick a Bangladesh dataset (e.g. BBS or Kaggle), clean it in Excel or SQL, and write 5 findings.", why: "Enjoys numbers + interested in data. A project gives her something concrete for both a CV and a master’s application.", source: "kaggle.com", due: 21, effort: "4–5 hours", link: "courses" }),
    S("course", "c-sql", { title: "SQL for Data Science", detail: "Start after Excel. The first two weeks cover everything an analyst intern needs.", why: "Most-requested skill in 31 of 40 analyst internship posts found in Dhaka this month.", source: "coursera.org", meta: "UC Davis · Coursera · 4 weeks · Free to audit", image: "/career/course-sql.webp" }),
    S("course", "c-analytics", { title: "Google Data Analytics Certificate", detail: "Do courses 1–3 only for now. They teach the full analysis process.", why: "Recognised by employers; financial aid is available, which matters given her money worries.", source: "grow.google", meta: "Google · Coursera · Self-paced · Financial aid", image: "/career/course-analytics.webp" }),
    S("job", "j-analyst", { title: "Business Analyst Intern", detail: "Good first step towards data work. Apply after your CV draft.", why: "Accepts 2nd and 3rd year students; asks for Excel and SQL basics.", source: "bdjobs.com", meta: "bKash · Dhaka · 3 months · Paid · Deadline in 12 days", image: "/career/job-analyst.webp" }),
    S("job", "j-data", { title: "Junior Data Associate (part-time)", detail: "Part-time, fits around classes.", why: "Remote-friendly, 15 hrs/week. Matches her 2–3 hours plus weekends.", source: "linkedin.com", meta: "Shohoz · Hybrid · Part-time", image: "/career/job-data.webp" }),
  ],
  business: [
    S("task", "t-excel", { title: "Start the Excel course I picked for you", detail: "Finish the first two weeks. Spreadsheet skills come up in almost every internship.", why: "Foundation skill for both business and data roles; fits 2–3 hours a week.", source: "coursera.org", due: 10, effort: "2 weeks", link: "courses" }),
    S("course", "c-excel", { title: "Excel Skills for Business: Essentials", detail: "Start here. You’ll use this in any internship.", why: "Highest-rated beginner Excel course; free to audit.", source: "coursera.org", meta: "Macquarie University · Coursera · 6 weeks · Free to audit", image: "/career/course-excel.webp" }),
    S("job", "j-ops", { title: "Operations Intern", detail: "Lets you try a startup environment.", why: "Open to all departments; values club leadership, which she has.", source: "bdjobs.com", meta: "Shikho · Dhaka · Hybrid · 2 months", image: "/career/job-operations.webp" }),
  ],
  ngo: [
    S("task", "t-ngo", { title: "Talk to someone working in a development NGO", detail: "Use the BRAC alumni network. Ask what a normal week looks like.", why: "Interested in development work but has no contacts yet.", source: "bracu.ac.bd/alumni", due: 14, effort: "1 hour" }),
    S("job", "j-research", { title: "Research Assistant (part-time)", detail: "Fits around classes. Strong for a master’s application.", why: "BIGD hires economics and social science students every semester.", source: "bigd.bracu.ac.bd", meta: "BIGD · Dhaka · Part-time · Rolling", image: "/career/job-research.webp" }),
    S("course", "c-dev", { title: "Development Economics: Foundations", detail: "Short, free and directly useful for NGO interviews.", why: "Builds on his Economics major; free certificate.", source: "edx.org", meta: "MIT · edX · 8 weeks · Free", image: "/career/course-analytics.webp" }),
  ],
  gov: [
    S("task", "t-bcs", { title: "Read the BCS preliminary syllabus and mark weak areas", detail: "Bring the list to our next session.", why: "Mentioned government jobs; most students underestimate the general-knowledge part.", source: "bpsc.gov.bd", due: 7, effort: "1 hour" }),
    S("course", "c-bcs", { title: "BCS Preliminary Prep (weekend batch)", detail: "In person, Saturdays only.", why: "Matches his free Saturdays and budget.", source: "careerhub.brac.net", meta: "BRAC Career Hub · Mohakhali · 10 Saturdays", image: "/career/course-writing.webp" }),
  ],
  marketing: [
    S("course", "c-dm", { title: "Digital Marketing Fundamentals", detail: "A quick, free start with a certificate.", why: "Interested in marketing; no experience yet.", source: "learndigital.withgoogle.com", meta: "Google · Online · 40 hours · Free", image: "/career/course-digital-marketing.webp" }),
    S("job", "j-content", { title: "Content & Social Media Intern", detail: "Good for building a portfolio.", why: "Asks for a portfolio rather than experience.", source: "bdjobs.com", meta: "10 Minute School · Dhaka · 3 months", image: "/career/job-content.webp" }),
  ],
  abroad: [
    S("task", "t-abroad", { title: "Shortlist three master’s programs", detail: "Use the AI match in Study Abroad. Note the IELTS score and deadline for each.", why: "Wants to study abroad after graduating; 2nd year is a good time to plan IELTS and grades.", source: "careerhub.brac.net", due: 21, effort: "1 hour", link: "abroad" }),
    S("task", "t-ielts", { title: "Take a free IELTS practice test", detail: "Just to see where you are. No preparation needed.", why: "Most programs she’d match need 6.5+. Knowing the gap early helps plan.", source: "britishcouncil.org.bd", due: 30, effort: "3 hours" }),
  ],
  common: [
    S("task", "t-strengths", { title: "Write down three things you’re good at", detail: "Ask two friends what they’d say too. Bring the list to your next session.", why: "Low clarity score (“a little”). Naming strengths is the quickest first step.", source: "Career Hub method", due: 3, effort: "20 min" }),
    S("task", "t-cv", { title: "Make your first CV draft", detail: "One page. Put your clubs and group projects under experience.", why: "Needed for every internship suggested below.", source: "Career Hub method", due: 7, effort: "1 hour", link: "cv" }),
    S("task", "t-jobs", { title: "Save two internships that interest you", detail: "Read what they ask for. We’ll look at the gaps together.", why: "Has no work experience in her field yet.", source: "Career Hub method", due: 14, effort: "30 min", link: "jobs" }),
    S("course", "c-comm", { title: "Professional Communication Workshop", detail: "Builds confidence for interviews.", why: "Rated herself only “somewhat” confident with new people.", source: "careerhub.brac.net", meta: "BRAC Career Hub · Mohakhali · 3 Saturdays", image: "/career/course-writing.webp" }),
  ],
};
const pick = (...keys: string[]) => keys.flatMap((k) => pools[k]);

// Extra ideas the “Regenerate” box can produce, by keyword.
export const moreIdeas: { match: RegExp; items: Suggestion[] }[] = [
  { match: /remote|online|home/i, items: [S("job", "j-remote", { title: "Remote Data Entry & Reporting Intern", detail: "Fully remote, flexible hours.", why: "You asked for remote options. 10 hrs/week, paid.", source: "linkedin.com", meta: "Pathao · Remote · 3 months", image: "/career/job-data.webp", fresh: true })] },
  { match: /cheap|free|money|budget/i, items: [S("course", "c-free", { title: "Data Analysis with Python (free certificate)", detail: "Completely free, certificate included.", why: "You asked for free options. No cost at all.", source: "freecodecamp.org", meta: "freeCodeCamp · Online · Self-paced · Free", image: "/career/course-analytics.webp", fresh: true })] },
  { match: /scholar|abroad|master/i, items: [S("task", "t-scholar", { title: "List three scholarships you could apply for", detail: "Start with DAAD, Chevening and the Australia Awards. Note who can apply.", why: "You asked about scholarships. She mentioned it in her note too.", source: "daad.de · chevening.org", due: 21, effort: "1 hour", fresh: true })] },
];
export const genericIdea = S("task", "t-network", { title: "Go to one career event this month", detail: "The Career Hub calendar lists free talks and job fairs.", why: "A low-effort way to meet people in the fields she’s curious about.", source: "careerhub.brac.net/events", due: 30, effort: "2 hours", fresh: true });

/* ---------- Students ---------- */
const ayeshaBrief: Brief = {
  summary: "2nd-year CSE student who enjoys numbers and organising. Wants to study abroad, likely in data, but her parents prefer an MBA. Low clarity about the kind of work she wants, somewhat confident, 2–3 hours a week to spare.",
  strengths: ["Comfortable with numbers", "Leads events in her club", "Does tuition, so has some work experience"],
  concerns: ["Family expectations (MBA vs. data)", "Not yet clear on job types"],
  ask: ["What does she enjoy most in CSE so far?", "Would her parents be open to a data path that still leads to an MBA later?", "She asked about scholarships in her note"],
};
const tahmidBrief: Brief = {
  summary: "3rd-year Economics student split between government jobs and development work. Confident, but worried about job security. Has volunteered with a youth NGO.",
  strengths: ["Strong speaker", "Volunteering experience", "4–6 hours a week available"],
  concerns: ["Money and job security", "Unsure whether to start BCS prep now"],
  ask: ["How does his family feel about NGO pay?", "Is he ready to commit Saturdays to BCS prep?"],
};

export const students: Student[] = [
  { id: "ayesha", name: "Ayesha Rahman", initials: "AR", tone: "#b5477f", subject: "Computer Science and Engineering", year: "2nd year", email: "ayesha.rahman@g.bracu.ac.bd", phone: "01712-345678",
    status: "today", next: { date: today, time: "10:45" }, answers: { ...sampleAnswers, note: "Can we talk about scholarships?" }, lastActive: "Today",
    sessions: [{ date: today, time: "10:45", kind: "First session", status: "upcoming" }], brief: ayeshaBrief,
    ai: [...pick("common", "business", "data", "abroad")] },
  { id: "tahmid", name: "Tahmid Chowdhury", initials: "TC", tone: "#2f6f9f", subject: "Economics", year: "3rd year", email: "tahmid.c@g.bracu.ac.bd", phone: "01811-223344",
    status: "plan", answers: { year: "3rd year", studies: "I enjoy it", enjoy: ["Writing or speaking", "Helping people"], work: "Clubs or volunteering", clarity: "Somewhat", confidence: "Mostly", worry: "Money and job security", after: "Get a job in Bangladesh", fields: ["Development & NGOs", "Government jobs"], hours: "4–6 hours", note: "" },
    lastActive: "Yesterday", brief: tahmidBrief,
    sessions: [{ date: day(-1), time: "14:30", kind: "First session", status: "completed", notes: "Talked through BCS vs. NGO paths. He’ll try both for a semester before deciding." }],
    ai: [...pick("common", "ngo", "gov")].map((x) => ({ ...x, why: x.why.replace(/\bher\b/g, "his").replace(/\bshe\b/gi, "he") })) },
  { id: "arif", name: "Arif Khan", initials: "AK", tone: "#8a6d1f", subject: "Architecture", year: "4th year", email: "arif.khan@g.bracu.ac.bd", phone: "01911-556677",
    status: "today", next: { date: today, time: "12:15" }, lastActive: "2 days ago",
    answers: { year: "4th year or above", studies: "I enjoy it", enjoy: ["Designing or creating", "Building or fixing things"], work: "An internship", clarity: "Mostly", confidence: "Somewhat", worry: "My CV or interviews", after: "Get a job in Bangladesh", fields: ["Engineering", "Marketing & media"], hours: "2–3 hours", note: "I need help with my portfolio." },
    brief: { summary: "Final-year Architecture student with one internship. Fairly clear on design work; wants help with his portfolio and interviews.", strengths: ["Design skills", "Has done an internship"], concerns: ["CV and interviews", "Portfolio presentation"], ask: ["Which firms does he want to target?", "Can he bring his portfolio next time?"] },
    sessions: [{ date: today, time: "12:15", kind: "First session", status: "upcoming" }], ai: [...pick("common", "marketing")] },
  { id: "imran", name: "Imran Hossain", initials: "IH", tone: "#3f7d5c", subject: "Electrical and Electronic Engineering", year: "3rd year", email: "imran.h@g.bracu.ac.bd", phone: "01611-998877",
    status: "booked", next: { date: day(1), time: "14:30" }, lastActive: "4 days ago",
    sessions: [{ date: day(1), time: "14:30", kind: "First session", status: "upcoming" }] },
  { id: "sadia", name: "Sadia Islam", initials: "SI", tone: "#7a3fa0", subject: "Business Administration", year: "1st year", email: "sadia.islam@g.bracu.ac.bd", phone: "01511-443322",
    status: "active", next: { date: today, time: "15:15" }, lastActive: "Today", answers: { year: "1st year", studies: "I enjoy it", enjoy: ["Organising and leading", "Writing or speaking"], work: "Not yet", clarity: "A little", confidence: "Mostly", worry: "Having no experience", after: "Higher study in Bangladesh", fields: ["Business & finance", "Marketing & media"], hours: "2–3 hours", note: "" },
    brief: { summary: "1st-year BBA student, confident and organised, with no work experience yet. Interested in marketing.", strengths: ["Confident speaker", "Organised"], concerns: ["No experience yet"], ask: ["Has she joined any clubs?"] },
    sessions: [
      { date: day(-24), time: "11:30", kind: "First session", status: "completed", notes: "Agreed to focus on clubs and one marketing course this semester." },
      { date: today, time: "15:15", kind: "Follow-up", status: "upcoming" }],
    plan: { unlock: ["courses", "jobs", "cv"], sentOn: day(-24), items: [
      { ...pools.common[0], done: true }, { ...pools.common[1], done: true }, { ...pools.business[0], done: true }, { ...pools.common[2] },
      { ...pools.marketing[0], state: "In progress" }, { ...pools.common[3], state: "Not started" }, { ...pools.marketing[1], state: "Saved" }] } },
  { id: "mehjabin", name: "Mehjabin Akter", initials: "MA", tone: "#a0523f", subject: "English and Humanities", year: "2nd year", email: "mehjabin.a@g.bracu.ac.bd", phone: "01311-776655",
    status: "quiet", lastActive: "18 days ago", answers: { year: "2nd year", studies: "It’s okay", enjoy: ["Writing or speaking"], work: "Tuition or part-time work", clarity: "Not at all", confidence: "A little", worry: "Not knowing what suits me", after: "I’m not sure yet", fields: ["Marketing & media", "Research & teaching"], hours: "About 1 hour", note: "" },
    brief: { summary: "2nd-year English student, unsure about direction, low confidence. Has gone quiet since her first session.", strengths: ["Writing"], concerns: ["Low confidence", "No activity for 18 days"], ask: ["Is the task list too much?"] },
    sessions: [{ date: day(-30), time: "10:00", kind: "First session", status: "completed", notes: "Very unsure. Gave her two small tasks only." }],
    plan: { unlock: ["courses"], sentOn: day(-30), items: [{ ...pools.common[0] }, { ...pools.marketing[0], state: "Not started" }] } },
  { id: "zarif", name: "Zarif Haque", initials: "ZH", tone: "#4a5bb0", subject: "Computer Science and Engineering", year: "1st year", email: "zarif.haque@g.bracu.ac.bd", phone: "01411-112233",
    status: "active", lastActive: "Today", answers: { year: "1st year", studies: "I enjoy it", enjoy: ["Building or fixing things"], work: "Not yet", clarity: "Somewhat", confidence: "Somewhat", worry: "Having no experience", after: "Study abroad", fields: ["Software & data"], hours: "4–6 hours", note: "" },
    sessions: [
      { date: day(-35), time: "16:00", kind: "First session", status: "completed", notes: "Keen coder. Start with a project, not courses." },
      { date: today, time: "10:00", kind: "Follow-up", status: "completed", notes: "Finished his first project. Next: GitHub profile and a hackathon." }],
    plan: { unlock: ["courses", "jobs", "cv", "abroad"], sentOn: day(-35), items: [{ ...pools.data[0], done: true }, { ...pools.common[1] }, { ...pools.abroad[0] }, { ...pools.data[1], state: "In progress" }] } },
  { id: "nabila", name: "Nabila Sultana", initials: "NS", tone: "#9c3d5c", subject: "Pharmacy", year: "2nd year", email: "nabila.s@g.bracu.ac.bd", phone: "01711-667788",
    status: "cancelled", lastActive: "6 days ago",
    sessions: [{ date: day(-2), time: "14:30", kind: "First session", status: "cancelled", reason: "Mid-term exam that day" }] },
];

export const statusInfo: Record<Status, { label: string; tone: string }> = {
  today: { label: "Session today", tone: "pink" },
  booked: { label: "Booked", tone: "blue" },
  plan: { label: "Plan to send", tone: "amber" },
  active: { label: "Active", tone: "green" },
  quiet: { label: "Gone quiet", tone: "grey" },
  cancelled: { label: "Cancelled", tone: "red" },
};
