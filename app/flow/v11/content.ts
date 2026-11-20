// v11 content in Bangla and English. Placeholder data for the demo; the real copy comes later.
export type Txt = { bn: string; en: string };
export const tx = (bn: string, en: string): Txt => ({ bn, en });

/* ---------- Counsellors (photos come from ../data) ---------- */
const bnNames: Record<string, string> = { nusrat: "নুসরাত জাহান", tanvir: "তানভীর আহমেদ", farhana: "ফারহান কবির", rafiq: "রফিক হাসান" };
// Full name and first name in the current language.
export const cn = (c: { id: string; name: string }, lang: "bn" | "en") => (lang === "bn" ? bnNames[c.id] ?? c.name : c.name);
export const cf = (c: { id: string; name: string }, lang: "bn" | "en") => cn(c, lang).split(" ")[0];
export const counsellorText: Record<string, { title: Txt; focus: Txt[]; about: Txt; langs: Txt }> = {
  nusrat: { title: tx("সিনিয়র ক্যারিয়ার কাউন্সেলর", "Senior Career Counsellor"), focus: [tx("ব্যবসা ও ফাইন্যান্স", "Business & finance"), tx("প্রথম চাকরি ও ইন্টার্নশিপ", "First jobs & internships")],
    about: tx("অস্পষ্ট আগ্রহকে একটা পরিষ্কার প্রথম চাকরি বা ইন্টার্নশিপের লক্ষ্যে পরিণত করতে সাহায্য করেন।", "Helps students turn a vague interest into a clear first job or internship target."), langs: tx("বাংলা, ইংরেজি", "Bangla, English") },
  tanvir: { title: tx("ক্যারিয়ার কাউন্সেলর · টেক", "Career Counsellor · Tech"), focus: [tx("সফটওয়্যার ও ডেটা", "Software & data"), tx("ইঞ্জিনিয়ারিং ক্যারিয়ার", "Engineering careers")],
    about: tx("আগে সফটওয়্যার ইঞ্জিনিয়ার ছিলেন। CSE ও EEE শিক্ষার্থীদের বাস্তব চাকরির পথ দেখান।", "Former software engineer. Good at mapping CSE and EEE students to real roles."), langs: tx("বাংলা, ইংরেজি", "Bangla, English") },
  farhana: { title: tx("উচ্চশিক্ষা উপদেষ্টা", "Higher Study Advisor"), focus: [tx("বিদেশে পড়াশোনা", "Study abroad"), tx("স্কলারশিপ ও গবেষণা", "Scholarships & research")],
    about: tx("বিদেশে মাস্টার্সের কথা ভাবছেন? দেশ বাছাই থেকে ফান্ডিং পর্যন্ত পথ দেখান।", "Guides students thinking about a master’s abroad, from choosing a country to funding."), langs: tx("বাংলা, ইংরেজি", "Bangla, English") },
  rafiq: { title: tx("ক্যারিয়ার কাউন্সেলর", "Career Counsellor"), focus: [tx("এখনও নিশ্চিত নই", "Not sure yet"), tx("বিষয় বদলাতে চাই", "Switching fields")],
    about: tx("কোথা থেকে শুরু করবেন বুঝতে না পারলে শান্তভাবে প্রথম আলাপের জন্য। সেশন বাংলায়।", "A calm first conversation if you don’t know where to start. Sessions in Bangla."), langs: tx("বাংলা", "Bangla") },
};

/* ---------- Five short questions before the first session ---------- */
export type Q = { id: string; kind: "one" | "many" | "text"; prompt: Txt; help?: Txt; max?: number; optional?: boolean; options?: { id: string; label: Txt }[] };
const o = (id: string, bn: string, en: string) => ({ id, label: tx(bn, en) });
export const questions: Q[] = [
  { id: "year", kind: "one", prompt: tx("আপনি বিশ্ববিদ্যালয়ের কোন বর্ষে পড়ছেন?", "Which year of university are you in?"),
    options: [o("y1", "১ম বর্ষ", "1st year"), o("y2", "২য় বর্ষ", "2nd year"), o("y3", "৩য় বর্ষ", "3rd year"), o("y4", "৪র্থ বর্ষ বা তার বেশি", "4th year or above")] },
  { id: "enjoy", kind: "many", max: 3, prompt: tx("কোন কাজগুলো করতে আপনার সবচেয়ে ভালো লাগে?", "What do you enjoy doing most?"), help: tx("৩টি পর্যন্ত বেছে নিন।", "Pick up to 3."),
    options: [o("numbers", "সংখ্যা নিয়ে কাজ", "Working with numbers"), o("words", "লেখা বা কথা বলা", "Writing or speaking"), o("build", "কিছু বানানো বা ঠিক করা", "Building or fixing things"),
      o("people", "মানুষকে সাহায্য করা", "Helping people"), o("lead", "পরিকল্পনা ও নেতৃত্ব", "Organising and leading"), o("design", "ডিজাইন বা সৃজনশীল কাজ", "Designing or creating")] },
  { id: "after", kind: "one", prompt: tx("পড়াশোনা শেষে আপনি কী করতে চান?", "After graduation, what would you most like to do?"),
    options: [o("job", "দেশে চাকরি", "Get a job in Bangladesh"), o("abroad", "বিদেশে পড়াশোনা", "Study abroad"), o("higher", "দেশে উচ্চশিক্ষা", "Higher study in Bangladesh"), o("business", "নিজের ব্যবসা", "Start my own business"), o("unsure", "এখনও নিশ্চিত নই", "I’m not sure yet")] },
  { id: "worry", kind: "one", prompt: tx("ক্যারিয়ার নিয়ে আপনার সবচেয়ে বড় চিন্তা কী?", "What worries you most about your career?"),
    options: [o("fit", "কোনটা আমার জন্য ঠিক বুঝি না", "Not knowing what suits me"), o("exp", "কোনো অভিজ্ঞতা নেই", "Having no experience"), o("cv", "সিভি বা ইন্টারভিউ", "My CV or interviews"), o("family", "পরিবারের প্রত্যাশা", "Family expectations"), o("money", "আয় ও চাকরির নিশ্চয়তা", "Money and job security")] },
  { id: "note", kind: "text", optional: true, prompt: tx("কাউন্সেলরকে আর কিছু জানাতে চান?", "Anything you want your counsellor to know?"), help: tx("ঐচ্ছিক। কোনো প্রশ্ন, চিন্তা বা স্বপ্নের চাকরি।", "Optional. A question, a worry, a dream job.") },
];
export type Answers = Record<string, string | string[]>;
export const isAnswered = (q: Q, a: Answers) => q.optional || (Array.isArray(a[q.id]) ? (a[q.id] as string[]).length > 0 : !!a[q.id]);
export const answerText = (q: Q, a: Answers, lang: "bn" | "en") => {
  const v = a[q.id];
  if (!v || (Array.isArray(v) && !v.length)) return lang === "bn" ? "—" : "—";
  if (q.kind === "text") return v as string;
  const ids = Array.isArray(v) ? v : [v];
  return ids.map((id) => q.options!.find((x) => x.id === id)?.label[lang] ?? id).join(lang === "bn" ? ", " : ", ");
};
export const sampleAnswers: Answers = { year: "y2", enjoy: ["numbers", "lead"], after: "abroad", worry: "fit", note: "আমার বাবা-মা চান আমি MBA করি, কিন্তু আমার ডেটা ভালো লাগে।" };

/* ---------- Session notes written by the counsellor ---------- */
export type Minutes = { summary: Txt; agreed: Txt[] };
export const minutesFirst: Minutes = {
  summary: tx("ডেটার প্রতি আপনার আগ্রহ আর বাবা-মায়ের MBA-র ইচ্ছা নিয়ে কথা হলো। এখনই বেছে নিতে হবে না: দুই পথেই সংখ্যার দক্ষতা আর কিছু বাস্তব অভিজ্ঞতা লাগবে।",
    "We talked about your interest in data and your parents’ wish for an MBA. You don’t have to choose now: both paths need strong numbers skills and some real experience first."),
  agreed: [tx("এই সপ্তাহে Excel কোর্স শুরু করা", "Start the Excel course this week"), tx("এক পাতার সিভি খসড়া বানানো", "Make a one-page CV draft"), tx("দুটি ইন্টার্নশিপ সেভ করে আনা", "Save two internships and bring them next time")],
};
export const minutesSecond: Minutes = {
  summary: tx("সিভি আর ইন্টার্নশিপের তালিকা নিয়ে ফলো-আপ। সিভি এখন অনেক পরিষ্কার। প্রথমে bKash-এর ইন্টার্নশিপে আবেদন করার সিদ্ধান্ত হলো।",
    "Follow-up on your CV and internship list. Your CV is much clearer now. We picked the bKash internship to apply to first."),
  agreed: [tx("রবিবারের মধ্যে bKash-এ আবেদন", "Apply to bKash by Sunday"), tx("‘নিজের সম্পর্কে বলুন’ উত্তর অনুশীলন", "Practise the ‘tell me about yourself’ answer")],
};
export const sessionTopics: Record<number, Txt> = {
  1: tx("প্রথম আলাপ: আগ্রহ ও লক্ষ্য", "First chat: interests and goals"),
  2: tx("সিভি ও ইন্টার্নশিপ", "CV and internships"),
  3: tx("ইন্টারভিউ প্রস্তুতি", "Interview preparation"),
};

/* ---------- Tasks: short, plain to-dos from the counsellor ---------- */
export type Task = { id: string; title: Txt; note?: Txt; due: number; done?: boolean; mine?: boolean; session?: number };
// due = days from today (negative is overdue).
export const counsellorTasks: Task[] = [
  { id: "t1", title: tx("নিজের তিনটি দক্ষতা লিখে ফেলুন", "Write down three things you’re good at"), note: tx("দুজন বন্ধুকেও জিজ্ঞেস করুন।", "Ask two friends what they’d say too."), due: 2, session: 1 },
  { id: "t2", title: tx("Excel কোর্সের প্রথম দুই সপ্তাহ শেষ করুন", "Finish the first two weeks of the Excel course"), due: 9, session: 1 },
  { id: "t3", title: tx("এক পাতার সিভি খসড়া বানান", "Make a one-page CV draft"), note: tx("ক্লাব আর গ্রুপ প্রজেক্ট অভিজ্ঞতায় রাখুন।", "Put clubs and group projects under experience."), due: 6, session: 1 },
  { id: "t4", title: tx("আগ্রহের দুটি ইন্টার্নশিপ সেভ করুন", "Save two internships that interest you"), due: 13, session: 1 },
  { id: "t5", title: tx("পরের সেশনের জন্য প্রশ্ন লিখে রাখুন", "Note down questions for your next session"), due: 0, session: 1 },
];

/* ---------- Courses and jobs picked by the counsellor ---------- */
export const courseText: Record<string, { mode: Txt; why: Txt }> = {
  "c-excel": { mode: tx("অনলাইন · ৬ সপ্তাহ · ফ্রি", "Online · 6 weeks · Free to audit"), why: tx("এখান থেকে শুরু করুন। যেকোনো ইন্টার্নশিপে কাজে লাগবে।", "Start here. You’ll use this in any internship.") },
  "c-sql": { mode: tx("অনলাইন · ৪ সপ্তাহ", "Online · 4 weeks"), why: tx("সংখ্যা ভালো লাগে, তাই Excel-এর পরে এটা।", "Since you enjoy numbers, try this after Excel.") },
  "c-writing": { mode: tx("সরাসরি · মহাখালী · ৩ শনিবার", "In person · Mohakhali · 3 Saturdays"), why: tx("আপনি যে আত্মবিশ্বাস চেয়েছিলেন, তা গড়তে।", "Builds the confidence you mentioned wanting.") },
};
export const jobText: Record<string, { meta: Txt; why: Txt }> = {
  "j-analyst": { meta: tx("ঢাকা · ৩ মাস · বেতনসহ", "Dhaka · 3 months · Paid"), why: tx("ডেটার কাজের ভালো প্রথম ধাপ।", "Good first step towards data work.") },
  "j-research": { meta: tx("ঢাকা · পার্ট-টাইম", "Dhaka · Part-time"), why: tx("ক্লাসের পাশাপাশি করা যায়। মাস্টার্স আবেদনে কাজে লাগবে।", "Fits around classes. Strong for a master’s application.") },
  "j-ops": { meta: tx("ঢাকা · হাইব্রিড · ২ মাস", "Dhaka · Hybrid · 2 months"), why: tx("স্টার্টআপের পরিবেশ দেখার সুযোগ।", "Lets you try a startup environment.") },
};
// Shown when a course or job card is opened.
export const courseMore: Record<string, { about: Txt; learn: Txt[]; extra: Txt }> = {
  "c-excel": { about: tx("স্প্রেডশিটের মূল কাজগুলো: ফর্মুলা, চার্ট আর ডেটা সাজানো। সপ্তাহে ৩-৪ ঘণ্টা লাগবে।", "The core of spreadsheets: formulas, charts and sorting data. About 3–4 hours a week."),
    learn: [tx("ফর্মুলা ও ফাংশন", "Formulas and functions"), tx("চার্ট বানানো", "Making charts"), tx("PivotTable দিয়ে সারাংশ", "Summaries with PivotTables")], extra: tx("সার্টিফিকেট পেইড অপশনে", "Certificate with the paid option") },
  "c-sql": { about: tx("ডেটাবেস থেকে নিজে তথ্য বের করা শিখবেন। Excel শেষ হলে শুরু করুন।", "Learn to pull data out of a database yourself. Start once Excel is done."),
    learn: [tx("SELECT, WHERE আর JOIN", "SELECT, WHERE and JOIN"), tx("ডেটা গ্রুপ ও সাজানো", "Grouping and sorting data"), tx("একটি ছোট প্রজেক্ট", "One small project")], extra: tx("সার্টিফিকেট পেইড অপশনে", "Certificate with the paid option") },
  "c-writing": { about: tx("ছোট দলে ইমেইল, প্রেজেন্টেশন আর ইন্টারভিউয়ের উত্তর অনুশীলন।", "Practise emails, presentations and interview answers in a small group."),
    learn: [tx("পেশাদার ইমেইল লেখা", "Writing professional emails"), tx("৫ মিনিটের প্রেজেন্টেশন", "A 5-minute presentation"), tx("মক ইন্টারভিউ", "A mock interview")], extra: tx("BRAC শিক্ষার্থীদের জন্য ফ্রি", "Free for BRAC students") },
};
export const jobMore: Record<string, { about: Txt; does: Txt[]; needs: Txt; by: Txt }> = {
  "j-analyst": { about: tx("bKash-এর বিজনেস টিমের সাথে রিপোর্ট আর ড্যাশবোর্ডে কাজ।", "Work with bKash’s business team on reports and dashboards."),
    does: [tx("সাপ্তাহিক রিপোর্ট তৈরি", "Build the weekly reports"), tx("Excel-এ ডেটা পরিষ্কার করা", "Clean data in Excel"), tx("টিম মিটিংয়ে ফলাফল দেখানো", "Show findings in team meetings")],
    needs: tx("Excel জানা থাকলে ভালো · ৩য় বা ৪র্থ বর্ষ", "Excel helps · 3rd or 4th year"), by: tx("১৫ ডিসেম্বর", "15 December") },
  "j-research": { about: tx("BIGD-এর গবেষণা দলে সার্ভে আর ডেটা নিয়ে কাজ, সপ্তাহে ১৫ ঘণ্টা।", "Join BIGD’s research team on surveys and data, 15 hours a week."),
    does: [tx("সার্ভের ডেটা এন্ট্রি ও যাচাই", "Enter and check survey data"), tx("আগের গবেষণা পড়া", "Read past studies"), tx("ছোট সারাংশ লেখা", "Write short summaries")],
    needs: tx("ভালো ইংরেজি লেখা · যেকোনো বিষয়", "Good written English · any subject"), by: tx("১০ ডিসেম্বর", "10 December") },
  "j-ops": { about: tx("Shikho-র অপারেশনস টিমে প্রতিদিনের কাজ কীভাবে চলে, তা কাছ থেকে দেখা।", "See how daily work runs in Shikho’s operations team."),
    does: [tx("শিক্ষার্থীদের সাপোর্ট টিকেট দেখা", "Handle student support tickets"), tx("কাজের ধাপ লিখে রাখা", "Write down how things are done"), tx("ছোট উন্নতির প্রস্তাব", "Suggest small fixes")],
    needs: tx("কথা বলায় আত্মবিশ্বাস · সপ্তাহে ৩ দিন অফিসে", "Confident talking to people · 3 days a week in the office"), by: tx("২০ ডিসেম্বর", "20 December") },
};
export const sectionName: Record<string, Txt> = {
  home: tx("হোম", "Home"), tasks: tx("কাজের তালিকা", "Tasks"), courses: tx("কোর্স", "Courses"), jobs: tx("চাকরি ও ইন্টার্নশিপ", "Jobs & internships"),
  cv: tx("সিভি স্টুডিও", "CV Studio"), abroad: tx("বিদেশে পড়াশোনা", "Study Abroad"), profile: tx("প্রোফাইল ও উত্তর", "Profile & answers"),
};
