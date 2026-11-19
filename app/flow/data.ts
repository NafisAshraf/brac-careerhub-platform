// Dummy data for the counsellor-first Career Hub flow (v4, v5, v6).
// Everything here stands in for records the backend and the counselling team would own.

/* ---------- Counsellors ---------- */
export type Counsellor = {
  id: string; name: string; initials: string; title: string; tone: string;
  focus: string[]; about: string; languages: string; sessions: number; days: number[];
};
// days: weekdays they counsel (0 = Sunday … 4 = Thursday, 6 = Saturday). Friday is off for everyone.
export const counsellors: Counsellor[] = [
  { id: "nusrat", name: "Nusrat Jahan", initials: "NJ", title: "Senior Career Counsellor", tone: "#8e3b8a",
    focus: ["Business & finance", "First jobs & internships"], languages: "Bangla, English", sessions: 412, days: [0, 1, 2, 3, 4],
    about: "Helps students turn a vague interest into a clear first job or internship target." },
  { id: "tanvir", name: "Tanvir Ahmed", initials: "TA", title: "Career Counsellor · Tech", tone: "#2f6f9f",
    focus: ["Software & data", "Engineering careers"], languages: "Bangla, English", sessions: 268, days: [0, 2, 4, 6],
    about: "Former software engineer. Good at mapping CSE and EEE students to real roles." },
  { id: "farhana", name: "Farhana Kabir", initials: "FK", title: "Higher Study Advisor", tone: "#b5475f",
    focus: ["Study abroad", "Scholarships & research"], languages: "Bangla, English", sessions: 339, days: [1, 3, 6],
    about: "Guides students thinking about a master’s abroad, from choosing a country to funding." },
  { id: "rafiq", name: "Rafiq Hasan", initials: "RH", title: "Career Counsellor", tone: "#3f7d5c",
    focus: ["Not sure yet", "Switching fields"], languages: "Bangla", sessions: 187, days: [0, 1, 3, 4, 6],
    about: "A calm first conversation if you don’t know where to start. Sessions in Bangla." },
];
export const counsellorById = (id: string) => counsellors.find((c) => c.id === id)!;

/* ---------- Time slots ----------
   Sessions are 30 minutes with a 15-minute gap after each, so start times are 45 minutes apart. */
export const slotTimes = ["10:00", "10:45", "11:30", "12:15", "14:30", "15:15", "16:00", "16:45"];
export const sessionMinutes = 30;
export type Slot = { counsellor: string; date: string; time: string };
export type Day = { date: string; weekday: number };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromIso = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

// The next `count` working days, starting tomorrow (Fridays skipped).
export function upcomingDays(count = 8, from = new Date()): Day[] {
  const days: Day[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 5) days.push({ date: iso(d), weekday: d.getDay() });
  }
  return days;
}
// A stable pseudo-random "already booked" pattern so every counsellor has some taken slots.
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export function isTaken(counsellor: string, date: string, time: string) {
  return hash(counsellor + date + time) % 5 < 2;
}
export function openTimes(counsellor: string, day: Day) {
  const c = counsellorById(counsellor);
  if (!c.days.includes(day.weekday)) return [];
  return slotTimes.filter((t) => !isTaken(counsellor, day.date, t));
}
export function nextOpen(counsellor: string, days = upcomingDays()): Slot | null {
  for (const d of days) { const t = openTimes(counsellor, d)[0]; if (t) return { counsellor, date: d.date, time: t }; }
  return null;
}

/* ---------- Formatting ---------- */
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const time12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
export const endTime = (t: string) => { const [h, m] = t.split(":").map(Number); const e = h * 60 + m + sessionMinutes; return time12(`${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`); };
export function dayLabel(date: string, today = new Date()) {
  const d = fromIso(date);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return weekdays[d.getDay()];
}
export const shortDate = (date: string) => { const d = fromIso(date); return `${d.getDate()} ${months[d.getMonth()]}`; };
export const longDate = (date: string) => { const d = fromIso(date); return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`; };
export const shortWeekday = (date: string) => weekdays[fromIso(date).getDay()].slice(0, 3);
export const slotLabel = (s: Slot) => `${longDate(s.date)} · ${time12(s.time)}–${endTime(s.time)}`;

/* ---------- Short questionnaire before the first session ---------- */
export type Question = {
  id: string; part: "now" | "next"; prompt: string; help?: string;
  kind: "one" | "many" | "scale" | "text"; options?: string[]; max?: number; optional?: boolean;
};
export const questions: Question[] = [
  { id: "year", part: "now", kind: "one", prompt: "Which year of university are you in?", options: ["1st year", "2nd year", "3rd year", "4th year or above"] },
  { id: "studies", part: "now", kind: "one", prompt: "How do you feel about your subject right now?", options: ["I enjoy it", "It’s okay", "I find it hard", "I’m thinking of switching"] },
  { id: "enjoy", part: "now", kind: "many", max: 3, prompt: "What do you enjoy doing most?", help: "Pick up to 3.",
    options: ["Working with numbers", "Writing or speaking", "Building or fixing things", "Helping people", "Organising and leading", "Designing or creating"] },
  { id: "work", part: "now", kind: "one", prompt: "Have you done any work so far?", help: "Clubs and tuition count.",
    options: ["Not yet", "Clubs or volunteering", "Tuition or part-time work", "An internship"] },
  { id: "clarity", part: "now", kind: "scale", prompt: "“I know what kind of work I want to do.”", options: ["Not at all", "A little", "Somewhat", "Mostly", "Completely"] },
  { id: "confidence", part: "now", kind: "scale", prompt: "“I feel confident talking to new people.”", options: ["Not at all", "A little", "Somewhat", "Mostly", "Completely"] },
  { id: "worry", part: "now", kind: "one", prompt: "What worries you most about your career?",
    options: ["Not knowing what suits me", "Having no experience", "My CV or interviews", "Family expectations", "Money and job security"] },
  { id: "after", part: "next", kind: "one", prompt: "After graduation, what would you most like to do?",
    options: ["Get a job in Bangladesh", "Study abroad", "Higher study in Bangladesh", "Start my own business", "I’m not sure yet"] },
  { id: "fields", part: "next", kind: "many", max: 3, prompt: "Which areas interest you?", help: "Pick up to 3.",
    options: ["Business & finance", "Software & data", "Engineering", "Marketing & media", "Development & NGOs", "Research & teaching", "Government jobs"] },
  { id: "hours", part: "next", kind: "one", prompt: "How much time can you give to career work each week?", options: ["About 1 hour", "2–3 hours", "4–6 hours", "More than 6 hours"] },
  { id: "note", part: "next", kind: "text", optional: true, prompt: "Anything you want your counsellor to know?", help: "Optional. A question, a worry, a dream job." },
];
export type Answers = Record<string, string | string[]>;
export const answered = (q: Question, a: Answers) => q.optional || (Array.isArray(a[q.id]) ? (a[q.id] as string[]).length > 0 : !!a[q.id]);
export const sampleAnswers: Answers = {
  year: "2nd year", studies: "It’s okay", enjoy: ["Working with numbers", "Organising and leading"], work: "Clubs or volunteering",
  clarity: "A little", confidence: "Somewhat", worry: "Not knowing what suits me", after: "Study abroad",
  fields: ["Business & finance", "Software & data"], hours: "2–3 hours", note: "My parents want me to do an MBA but I like data.",
};

/* ---------- What a counsellor can assign or unlock ---------- */
export type Unlockable = "courses" | "jobs" | "cv" | "abroad";
export const unlockables: { id: Unlockable; label: string; hint: string }[] = [
  { id: "courses", label: "Courses", hint: "Learning picked for this student" },
  { id: "jobs", label: "Jobs & internships", hint: "Openings the counsellor recommends" },
  { id: "cv", label: "CV Studio", hint: "Build a CV with the student’s details" },
  { id: "abroad", label: "Study Abroad", hint: "Programs, documents and applications" },
];

export type Task = { id: string; title: string; detail: string; due: number; effort: string; done?: boolean; link?: "courses" | "jobs" | "cv" | "abroad" | "profile" };
export const firstTasks: Task[] = [
  { id: "t-strengths", title: "Write down three things you’re good at", detail: "Ask two friends what they’d say too. Bring the list to your next session.", due: 3, effort: "20 min" },
  { id: "t-course", title: "Start the Excel course I picked for you", detail: "Finish the first two weeks. Spreadsheet skills come up in almost every internship.", due: 10, effort: "2 weeks", link: "courses" },
  { id: "t-cv", title: "Make your first CV draft", detail: "One page. Put your clubs and your group projects under experience.", due: 7, effort: "1 hour", link: "cv" },
  { id: "t-jobs", title: "Save two internships that interest you", detail: "Read what they ask for. We’ll look at the gaps together.", due: 14, effort: "30 min", link: "jobs" },
  { id: "t-abroad", title: "Shortlist three master’s programs", detail: "Use the AI match. Note the IELTS score and deadline for each.", due: 21, effort: "1 hour", link: "abroad" },
];

export type CourseItem = { id: string; image: string; title: string; provider: string; mode: string; note: string };
export const assignedCourses: CourseItem[] = [
  { id: "c-excel", image: "/career/course-excel.webp", title: "Excel Skills for Business: Essentials", provider: "Macquarie University · Coursera", mode: "Online · 6 weeks · Free to audit", note: "Start here. You’ll use this in any internship." },
  { id: "c-sql", image: "/career/course-sql.webp", title: "SQL for Data Science", provider: "UC Davis · Coursera", mode: "Online · 4 weeks", note: "Since you enjoy numbers, try this after Excel." },
  { id: "c-writing", image: "/career/course-writing.webp", title: "Professional Communication Workshop", provider: "BRAC Career Hub · Mohakhali", mode: "In person · 3 Saturdays", note: "Builds the confidence you mentioned wanting." },
];

export type JobItem = { id: string; image: string; title: string; org: string; meta: string; note: string };
export const assignedJobs: JobItem[] = [
  { id: "j-analyst", image: "/career/job-analyst.webp", title: "Business Analyst Intern", org: "bKash", meta: "Dhaka · 3 months · Paid", note: "Good first step towards data work." },
  { id: "j-research", image: "/career/job-research.webp", title: "Research Assistant (part-time)", org: "BRAC Institute of Governance and Development", meta: "Dhaka · Part-time", note: "Fits around classes. Strong for a master’s application." },
  { id: "j-ops", image: "/career/job-operations.webp", title: "Operations Intern", org: "Shikho", meta: "Dhaka · Hybrid · 2 months", note: "Lets you try a startup environment." },
];

/* ---------- Session minutes ---------- */
export type Minutes = { summary: string; discussed: string[]; agreed: string[] };
export const firstMinutes: Minutes = {
  summary: "We talked about your interest in data and your parents’ wish for an MBA. You don’t have to choose now: both paths need strong numbers skills and some real experience first.",
  discussed: ["What you enjoy in your CSE course and what you don’t", "Data and business analyst roles, and what a normal day looks like", "Studying abroad after two years of work vs. straight after graduation"],
  agreed: ["Start the Excel course this week", "Make a one-page CV draft", "Save two internships and bring them next time", "Meet again in about three weeks"],
};
export const pastMinutes: Minutes = {
  summary: "Follow-up on your CV and internship list. Your CV is much clearer now. We picked the bKash internship to apply to first.",
  discussed: ["Your CV draft, line by line", "The two internships you saved", "How to talk about club work in an interview"],
  agreed: ["Apply to the bKash internship by Sunday", "Practise the ‘tell me about yourself’ answer", "Book a follow-up after you hear back"],
};

/* ---------- Notifications ---------- */
export type Note = { id: string; kind: "booking" | "reminder" | "test" | "counsellor" | "unlock" | "task" | "system"; title: string; body?: string; at: number; read?: boolean; go?: string };
