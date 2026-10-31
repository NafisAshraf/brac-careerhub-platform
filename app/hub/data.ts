// Content for the unified Career Hub. Courses, seminars and the to-do list stand in
// for records stored in the backend; nothing here is searched for or personalised
// beyond the student's city and field of interest.
import type { Copy, Profile, Status } from "../career/data";

export type HubPage = "overview" | "plan" | "jobs" | "cv" | "counselling" | "abroad" | "generate" | "profile";

const option = (value: string, en: string, bn: string) => ({ value, label: [en, bn] as Copy });

export const statusOptions = [
  option("student", "University student", "বিশ্ববিদ্যালয়ের শিক্ষার্থী"),
  option("graduate", "Recent graduate", "সদ্য স্নাতক"),
  option("working", "Working professional", "কর্মজীবী"),
  option("seeking", "Looking for work", "চাকরি খুঁজছি"),
];
// Stored as `roles` so the existing job list can sort by it.
export const interestOptions = [
  option("business", "Business & operations", "ব্যবসা ও পরিচালনা"),
  option("data", "Data & technology", "ডেটা ও প্রযুক্তি"),
  option("marketing", "Marketing & communication", "বিপণন ও যোগাযোগ"),
  option("unsure", "Not sure yet", "এখনো নিশ্চিত নই"),
];
export const cities = [
  option("dhaka", "Dhaka", "ঢাকা"),
  option("chattogram", "Chattogram", "চট্টগ্রাম"),
  option("khulna", "Khulna", "খুলনা"),
  option("rajshahi", "Rajshahi", "রাজশাহী"),
  option("sylhet", "Sylhet", "সিলেট"),
  option("barishal", "Barishal", "বরিশাল"),
  option("rangpur", "Rangpur", "রংপুর"),
  option("mymensingh", "Mymensingh", "ময়মনসিংহ"),
];
export const universities = [
  "BRAC University", "University of Dhaka", "Bangladesh University of Engineering and Technology",
  "North South University", "Independent University, Bangladesh", "East West University",
  "American International University-Bangladesh", "University of Chittagong", "University of Rajshahi",
  "Khulna University", "Shahjalal University of Science and Technology", "Jahangirnagar University",
];

export const sampleHubProfile = (): Profile => ({
  name: "Ayesha Rahman", email: "ayesha@example.com", situation: "graduate",
  institution: "BRAC University", location: "dhaka", roles: "business",
});

export const optionLabel = (options: { value: string; label: Copy }[], value: string) =>
  options.find((o) => o.value === value)?.label;

/* ---------- General to-do list ---------- */
export type Todo = { id: string; title: Copy; why: Copy; steps: Copy; effort: Copy; kind: Copy; link?: HubPage | "seminars" | "courses" };
export const todos: Todo[] = [
  { id: "session", kind: ["Guidance", "নির্দেশনা"], effort: ["30 minutes", "৩০ মিনিট"], link: "counselling",
    title: ["Book a free counselling session", "একটি ফ্রি কাউন্সেলিং সেশন বুক করুন"],
    why: ["A counsellor can help you decide where to focus first.", "কোন দিকে আগে মনোযোগ দেবেন, তা ঠিক করতে কাউন্সেলর সাহায্য করবেন।"],
    steps: ["Pick a time on the Overview page. Note two or three questions you want to ask before the session.", "ওভারভিউ পেজ থেকে সময় বেছে নিন। সেশনের আগে দুই-তিনটি প্রশ্ন লিখে রাখুন।"] },
  { id: "cv", kind: ["Application", "আবেদন"], effort: ["1 hour", "১ ঘণ্টা"], link: "cv",
    title: ["Create your first CV draft", "প্রথম সিভির খসড়া তৈরি করুন"],
    why: ["Almost every application starts with a clear, one-page CV.", "প্রায় প্রতিটি আবেদনের শুরু এক পাতার পরিষ্কার সিভি দিয়ে।"],
    steps: ["Open CV Studio, add your education, experience and skills, then generate a draft. Check every date and name before you use it.", "সিভি স্টুডিওতে শিক্ষা, অভিজ্ঞতা ও দক্ষতা যোগ করে খসড়া তৈরি করুন। ব্যবহারের আগে সব তারিখ ও নাম যাচাই করুন।"] },
  { id: "linkedin", kind: ["Professional profile", "পেশাগত প্রোফাইল"], effort: ["45 minutes", "৪৫ মিনিট"],
    title: ["Set up or refresh your LinkedIn profile", "লিংকডইন প্রোফাইল তৈরি বা হালনাগাদ করুন"],
    why: ["Recruiters often check LinkedIn before they call.", "নিয়োগদাতারা প্রায়ই ফোন করার আগে লিংকডইন দেখেন।"],
    steps: ["Add a clear photo, a one-line headline and a short About section. List your education and any projects or volunteering.", "পরিষ্কার ছবি, এক লাইনের শিরোনাম ও সংক্ষিপ্ত পরিচিতি দিন। শিক্ষা, প্রকল্প ও স্বেচ্ছাসেবার তথ্য যোগ করুন।"] },
  { id: "seminar", kind: ["Event", "ইভেন্ট"], effort: ["2 hours", "২ ঘণ্টা"], link: "seminars",
    title: ["Attend one career seminar", "একটি ক্যারিয়ার সেমিনারে অংশ নিন"],
    why: ["Hear from people already doing the work and meet other job seekers.", "যাঁরা এই কাজ করছেন তাঁদের কাছ থেকে শুনুন, অন্যদের সঙ্গে পরিচিত হন।"],
    steps: ["Register for a seminar below. Bring a notebook and leave with one contact and one idea to try.", "নিচ থেকে একটি সেমিনারে নিবন্ধন করুন। অন্তত একজন পরিচিত ও একটি নতুন ধারণা নিয়ে ফিরুন।"] },
  { id: "course", kind: ["Learning", "শেখা"], effort: ["2–4 weeks", "২–৪ সপ্তাহ"], link: "courses",
    title: ["Start one short course", "একটি ছোট কোর্স শুরু করুন"],
    why: ["A finished course gives you something concrete to talk about in interviews.", "একটি কোর্স শেষ করলে সাক্ষাৎকারে বলার মতো বাস্তব কিছু থাকে।"],
    steps: ["Choose one course below, online or in person. Block two fixed times a week to study.", "নিচ থেকে অনলাইন বা সরাসরি একটি কোর্স বেছে নিন। সপ্তাহে দুটি নির্দিষ্ট সময় পড়ার জন্য রাখুন।"] },
  { id: "interview", kind: ["Practice", "অনুশীলন"], effort: ["1 hour", "১ ঘণ্টা"],
    title: ["Practise three interview answers", "সাক্ষাৎকারের তিনটি উত্তর অনুশীলন করুন"],
    why: ["Short, structured stories make interviews much less stressful.", "গুছানো ছোট গল্প সাক্ষাৎকারের চাপ অনেক কমায়।"],
    steps: ["Prepare a story about teamwork, a problem you solved, and a mistake you learned from. Say each aloud in under two minutes.", "দলগত কাজ, সমস্যা সমাধান ও ভুল থেকে শেখা নিয়ে তিনটি গল্প তৈরি করুন। প্রতিটি দুই মিনিটের মধ্যে জোরে বলুন।"] },
];
// Study Abroad shows up in the sidebar once this many to-dos are complete.
export const unlockAfter = 2;
export const initialTodoStatuses = (): Record<string, Status> => Object.fromEntries(todos.map((t) => [t.id, "todo"]));

/* ---------- Courses ---------- */
export type Course = {
  id: string; image: string; title: Copy; provider: string; reason: Copy; outcome: Copy;
  fields: string[]; url?: string; city?: string; schedule?: Copy;
};
export const courses: Course[] = [
  { id: "excel", image: "excel", fields: ["business", "data", "unsure"], provider: "Macquarie University · Coursera", url: "https://www.coursera.org/learn/excel-essentials",
    title: ["Excel Skills for Business: Essentials", "ব্যবসায় এক্সেল দক্ষতা: মৌলিক বিষয়"],
    reason: ["Spreadsheet skills are asked for in most entry-level office roles.", "প্রাথমিক পর্যায়ের বেশিরভাগ অফিস পদে স্প্রেডশিটের দক্ষতা চাওয়া হয়।"],
    outcome: ["Formulas, tables and charts", "ফর্মুলা, টেবিল ও চার্ট"] },
  { id: "writing", image: "writing", fields: ["business", "marketing", "unsure"], provider: "University of Colorado Boulder · Coursera", url: "https://www.coursera.org/learn/writing-for-business",
    title: ["Business Writing", "ব্যবসায়িক লেখা"],
    reason: ["Clear emails and reports are expected from your first week at work.", "কাজের প্রথম সপ্তাহ থেকেই স্পষ্ট ইমেইল ও প্রতিবেদন প্রত্যাশিত।"],
    outcome: ["Write a concise update", "সংক্ষিপ্ত আপডেট লেখা"] },
  { id: "sql", image: "sql", fields: ["data"], provider: "University of California, Davis · Coursera", url: "https://www.coursera.org/learn/sql-for-data-science",
    title: ["SQL for Data Science", "ডেটা বিশ্লেষণের জন্য এসকিউএল"],
    reason: ["The standard way to pull and summarise data in analyst roles.", "বিশ্লেষক পদে ডেটা খুঁজে বের ও সারসংক্ষেপ করার প্রচলিত উপায়।"],
    outcome: ["Query and filter a dataset", "ডেটাসেটে কুয়েরি ও ফিল্টার"] },
  { id: "digital-marketing", image: "digital-marketing", fields: ["marketing", "unsure"], provider: "Google · Coursera", url: "https://www.coursera.org/learn/foundations-of-digital-marketing-and-e-commerce",
    title: ["Foundations of Digital Marketing and E-commerce", "ডিজিটাল মার্কেটিং ও ই-কমার্সের ভিত্তি"],
    reason: ["An overview of campaigns, customer journeys and online selling.", "প্রচারণা, গ্রাহকের যাত্রা ও অনলাইন বিক্রির সংক্ষিপ্ত পরিচিতি।"],
    outcome: ["Map a customer journey", "গ্রাহকের যাত্রা চিত্রায়ন"] },
  { id: "excel-dhaka", image: "analytics", fields: ["business", "data", "unsure"], provider: "BRAC Career Hub · In person", city: "dhaka",
    schedule: ["Saturdays, 4 weeks · Mohakhali", "শনিবার, ৪ সপ্তাহ · মহাখালী"],
    title: ["Workplace Excel and Reporting (classroom)", "কর্মক্ষেত্রে এক্সেল ও রিপোর্টিং (ক্লাসরুম)"],
    reason: ["Hands-on practice with a trainer and a small group.", "প্রশিক্ষকের সঙ্গে ছোট দলে হাতে-কলমে অনুশীলন।"],
    outcome: ["Build a weekly sales report", "সাপ্তাহিক বিক্রয় প্রতিবেদন তৈরি"] },
  { id: "comms-ctg", image: "writing", fields: ["business", "marketing", "unsure"], provider: "BRAC Career Hub · In person", city: "chattogram",
    schedule: ["Fridays, 3 weeks · Agrabad", "শুক্রবার, ৩ সপ্তাহ · আগ্রাবাদ"],
    title: ["Professional Communication Workshop", "পেশাগত যোগাযোগ কর্মশালা"],
    reason: ["Practise presentations, emails and phone calls with feedback.", "প্রেজেন্টেশন, ইমেইল ও ফোনালাপ অনুশীলন, সঙ্গে মতামত।"],
    outcome: ["Give a five-minute presentation", "পাঁচ মিনিটের প্রেজেন্টেশন"] },
  { id: "marketing-sylhet", image: "marketing-analytics", fields: ["marketing", "business"], provider: "BRAC Career Hub · In person", city: "sylhet",
    schedule: ["Weekday evenings, 2 weeks · Zindabazar", "সন্ধ্যা, ২ সপ্তাহ · জিন্দাবাজার"],
    title: ["Social Media Marketing Bootcamp", "সোশ্যাল মিডিয়া মার্কেটিং বুটক্যাম্প"],
    reason: ["Plan and run a small campaign for a local business.", "স্থানীয় ব্যবসার জন্য ছোট প্রচারণা পরিকল্পনা ও পরিচালনা।"],
    outcome: ["Run a two-week campaign", "দুই সপ্তাহের প্রচারণা"] },
  { id: "data-rajshahi", image: "sql", fields: ["data"], provider: "BRAC Career Hub · In person", city: "rajshahi",
    schedule: ["Saturdays, 4 weeks · Shaheb Bazar", "শনিবার, ৪ সপ্তাহ · সাহেব বাজার"],
    title: ["Data Basics for Beginners", "শুরুর জন্য ডেটার মৌলিক পাঠ"],
    reason: ["Spreadsheets, simple charts and an introduction to SQL.", "স্প্রেডশিট, সহজ চার্ট ও এসকিউএলের পরিচিতি।"],
    outcome: ["Clean and chart a dataset", "ডেটাসেট পরিষ্কার ও চার্ট"] },
];

/* ---------- Seminars ---------- */
export type Seminar = {
  id: string; title: Copy; host: string; days: number; time: string; summary: Copy; fields: string[];
  city?: string; venue?: Copy; seats: number;
};
export const seminars: Seminar[] = [
  { id: "first-job", days: 6, time: "15:00", seats: 40, city: "dhaka", fields: ["business", "data", "marketing", "unsure"], host: "BRAC Career Hub",
    venue: ["BRAC Centre, Mohakhali", "ব্র্যাক সেন্টার, মহাখালী"],
    title: ["Landing Your First Job: What Recruiters Look For", "প্রথম চাকরি: নিয়োগদাতারা কী দেখেন"],
    summary: ["HR managers from three companies on CVs, interviews and the first 90 days.", "তিনটি প্রতিষ্ঠানের এইচআর ম্যানেজার বলবেন সিভি, সাক্ষাৎকার ও প্রথম ৯০ দিন নিয়ে।"] },
  { id: "linkedin-online", days: 3, time: "20:00", seats: 300, fields: ["business", "data", "marketing", "unsure"], host: "BRAC Career Hub · Online",
    title: ["LinkedIn for Students and Fresh Graduates", "শিক্ষার্থী ও নতুন স্নাতকদের জন্য লিংকডইন"],
    summary: ["A live walkthrough of profiles that get noticed, with Q&A at the end.", "নজরে পড়ে এমন প্রোফাইলের লাইভ উদাহরণ, শেষে প্রশ্নোত্তর।"] },
  { id: "data-careers", days: 10, time: "16:00", seats: 60, city: "dhaka", fields: ["data"], host: "BRAC Career Hub × Data Bangladesh",
    venue: ["Gulshan Tech Hub, Gulshan 1", "গুলশান টেক হাব, গুলশান ১"],
    title: ["Careers in Data: Where to Start", "ডেটায় ক্যারিয়ার: কোথা থেকে শুরু"],
    summary: ["Analysts share their first projects and the skills they actually use.", "বিশ্লেষকরা জানাবেন তাঁদের প্রথম প্রকল্প ও কাজে লাগা দক্ষতা।"] },
  { id: "ctg-fair", days: 14, time: "10:00", seats: 200, city: "chattogram", fields: ["business", "marketing", "unsure"], host: "BRAC Career Hub",
    venue: ["Radisson Blu, Nasirabad", "র‍্যাডিসন ব্লু, নাসিরাবাদ"],
    title: ["Chattogram Career Day", "চট্টগ্রাম ক্যারিয়ার ডে"],
    summary: ["Meet employers from shipping, banking and retail. Bring printed CVs.", "শিপিং, ব্যাংকিং ও রিটেইলের নিয়োগদাতাদের সঙ্গে দেখা করুন। ছাপানো সিভি আনুন।"] },
  { id: "marketing-online", days: 8, time: "19:30", seats: 300, fields: ["marketing"], host: "BRAC Career Hub · Online",
    title: ["Breaking into Marketing", "মার্কেটিংয়ে ক্যারিয়ার শুরু"],
    summary: ["What junior marketers do day to day, and how to build a small portfolio.", "জুনিয়র মার্কেটারদের দৈনন্দিন কাজ ও ছোট পোর্টফোলিও তৈরির উপায়।"] },
  { id: "khulna-interview", days: 12, time: "11:00", seats: 50, city: "khulna", fields: ["business", "data", "marketing", "unsure"], host: "BRAC Career Hub",
    venue: ["BRAC Learning Centre, Sonadanga", "ব্র্যাক লার্নিং সেন্টার, সোনাডাঙ্গা"],
    title: ["Mock Interview Morning", "মক ইন্টারভিউ সকাল"],
    summary: ["Practise with volunteer interviewers and get written feedback.", "স্বেচ্ছাসেবী সাক্ষাৎকারগ্রহীতার সঙ্গে অনুশীলন ও লিখিত মতামত।"] },
  { id: "sylhet-startups", days: 18, time: "15:30", seats: 80, city: "sylhet", fields: ["business", "marketing", "unsure"], host: "BRAC Career Hub",
    venue: ["Hi-Tech Park, Companiganj", "হাই-টেক পার্ক, কোম্পানীগঞ্জ"],
    title: ["Working at a Startup", "স্টার্টআপে কাজ"],
    summary: ["Founders talk about roles for fresh graduates and what they hire for.", "নতুন স্নাতকদের জন্য কী পদ আছে, প্রতিষ্ঠাতারা কী দেখে নিয়োগ দেন।"] },
];

const matchesField = (fields: string[], interest: string) => !interest || fields.includes(interest);
// The student's field first; within that, nearby before online before other cities.
const rank = (city: string | undefined, fields: string[], profile: Profile) =>
  (matchesField(fields, profile.roles) ? 0 : 3) + (city ? (city === profile.location ? 0 : 2) : 1);

// In-person courses only show in the student's own city.
export const coursesFor = (profile: Profile) =>
  courses.filter((c) => !c.city || c.city === profile.location)
    .sort((a, b) => rank(a.city, a.fields, profile) - rank(b.city, b.fields, profile)).slice(0, 5);

export const seminarsFor = (profile: Profile) => {
  const sorted = [...seminars].sort((a, b) => rank(a.city, a.fields, profile) - rank(b.city, b.fields, profile) || a.days - b.days);
  const near = (s: Seminar) => !s.city || s.city === profile.location;
  return { near: sorted.filter(near), elsewhere: sorted.filter((s) => !near(s)) };
};
