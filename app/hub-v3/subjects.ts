// Common undergraduate subjects at Bangladeshi universities. Not exhaustive: the
// field matches as you type and snaps to the closest entry. `role` maps each subject
// to the interest area used to order jobs, courses and seminars.
import type { Copy } from "../career/data";

export type Subject = { name: string; bn: string; aliases?: string[]; role: "business" | "data" | "marketing" | "unsure" };

export const defaultSubject = "Computer Science and Engineering";

export const subjects: Subject[] = [
  { name: "Computer Science and Engineering", bn: "কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং", aliases: ["CSE", "computer science", "CS"], role: "data" },
  { name: "Software Engineering", bn: "সফটওয়্যার ইঞ্জিনিয়ারিং", aliases: ["SWE"], role: "data" },
  { name: "Information Technology", bn: "তথ্যপ্রযুক্তি", aliases: ["IT", "ICT"], role: "data" },
  { name: "Data Science", bn: "ডেটা সায়েন্স", role: "data" },
  { name: "Electrical and Electronic Engineering", bn: "ইলেকট্রিক্যাল অ্যান্ড ইলেকট্রনিক ইঞ্জিনিয়ারিং", aliases: ["EEE"], role: "data" },
  { name: "Electronics and Communication Engineering", bn: "ইলেকট্রনিক্স অ্যান্ড কমিউনিকেশন ইঞ্জিনিয়ারিং", aliases: ["ECE", "ETE"], role: "data" },
  { name: "Civil Engineering", bn: "সিভিল ইঞ্জিনিয়ারিং", aliases: ["CE"], role: "unsure" },
  { name: "Mechanical Engineering", bn: "মেকানিক্যাল ইঞ্জিনিয়ারিং", aliases: ["ME"], role: "unsure" },
  { name: "Industrial and Production Engineering", bn: "ইন্ডাস্ট্রিয়াল অ্যান্ড প্রোডাকশন ইঞ্জিনিয়ারিং", aliases: ["IPE"], role: "business" },
  { name: "Chemical Engineering", bn: "কেমিক্যাল ইঞ্জিনিয়ারিং", aliases: ["ChE"], role: "unsure" },
  { name: "Textile Engineering", bn: "টেক্সটাইল ইঞ্জিনিয়ারিং", aliases: ["TE"], role: "business" },
  { name: "Naval Architecture and Marine Engineering", bn: "নেভাল আর্কিটেকচার অ্যান্ড মেরিন ইঞ্জিনিয়ারিং", aliases: ["NAME"], role: "unsure" },
  { name: "Architecture", bn: "স্থাপত্য", aliases: ["BArch"], role: "unsure" },
  { name: "Urban and Regional Planning", bn: "নগর ও অঞ্চল পরিকল্পনা", aliases: ["URP"], role: "unsure" },
  { name: "Business Administration (BBA)", bn: "ব্যবসায় প্রশাসন (বিবিএ)", aliases: ["BBA", "business"], role: "business" },
  { name: "Accounting", bn: "হিসাববিজ্ঞান", aliases: ["accounting and information systems", "AIS"], role: "business" },
  { name: "Finance", bn: "ফিন্যান্স", aliases: ["finance and banking"], role: "business" },
  { name: "Banking and Insurance", bn: "ব্যাংকিং অ্যান্ড ইন্স্যুরেন্স", role: "business" },
  { name: "Management", bn: "ব্যবস্থাপনা", aliases: ["management studies"], role: "business" },
  { name: "Marketing", bn: "মার্কেটিং", role: "marketing" },
  { name: "Management Information Systems", bn: "ম্যানেজমেন্ট ইনফরমেশন সিস্টেমস", aliases: ["MIS"], role: "data" },
  { name: "Human Resource Management", bn: "মানবসম্পদ ব্যবস্থাপনা", aliases: ["HRM"], role: "business" },
  { name: "Supply Chain Management", bn: "সাপ্লাই চেইন ম্যানেজমেন্ট", aliases: ["SCM"], role: "business" },
  { name: "Tourism and Hospitality Management", bn: "ট্যুরিজম অ্যান্ড হসপিটালিটি ম্যানেজমেন্ট", role: "business" },
  { name: "International Business", bn: "আন্তর্জাতিক ব্যবসা", role: "business" },
  { name: "Economics", bn: "অর্থনীতি", aliases: ["econ"], role: "business" },
  { name: "Statistics", bn: "পরিসংখ্যান", aliases: ["applied statistics"], role: "data" },
  { name: "Mathematics", bn: "গণিত", aliases: ["math", "applied mathematics"], role: "data" },
  { name: "Physics", bn: "পদার্থবিজ্ঞান", role: "data" },
  { name: "Chemistry", bn: "রসায়ন", role: "unsure" },
  { name: "Biochemistry and Molecular Biology", bn: "প্রাণরসায়ন ও অণুপ্রাণবিজ্ঞান", aliases: ["BMB", "biochemistry"], role: "unsure" },
  { name: "Microbiology", bn: "অণুজীববিজ্ঞান", role: "unsure" },
  { name: "Genetic Engineering and Biotechnology", bn: "জিন প্রকৌশল ও জীবপ্রযুক্তি", aliases: ["GEB", "biotechnology"], role: "unsure" },
  { name: "Pharmacy", bn: "ফার্মেসি", aliases: ["BPharm"], role: "unsure" },
  { name: "Botany", bn: "উদ্ভিদবিজ্ঞান", role: "unsure" },
  { name: "Zoology", bn: "প্রাণিবিজ্ঞান", role: "unsure" },
  { name: "Environmental Science", bn: "পরিবেশ বিজ্ঞান", aliases: ["environmental science and management", "ESM"], role: "unsure" },
  { name: "Geography and Environment", bn: "ভূগোল ও পরিবেশ", role: "unsure" },
  { name: "Agriculture", bn: "কৃষি", aliases: ["BSc Ag"], role: "unsure" },
  { name: "Fisheries", bn: "মৎস্যবিজ্ঞান", role: "unsure" },
  { name: "Veterinary Medicine (DVM)", bn: "ভেটেরিনারি মেডিসিন (ডিভিএম)", aliases: ["DVM"], role: "unsure" },
  { name: "Food and Nutrition Science", bn: "খাদ্য ও পুষ্টিবিজ্ঞান", aliases: ["food engineering", "nutrition"], role: "unsure" },
  { name: "Medicine (MBBS)", bn: "চিকিৎসাবিজ্ঞান (এমবিবিএস)", aliases: ["MBBS"], role: "unsure" },
  { name: "Dental Surgery (BDS)", bn: "ডেন্টাল সার্জারি (বিডিএস)", aliases: ["BDS"], role: "unsure" },
  { name: "Nursing", bn: "নার্সিং", role: "unsure" },
  { name: "Public Health", bn: "জনস্বাস্থ্য", aliases: ["MPH"], role: "unsure" },
  { name: "Law (LLB)", bn: "আইন (এলএলবি)", aliases: ["LLB", "law"], role: "unsure" },
  { name: "English", bn: "ইংরেজি", aliases: ["English literature", "ELL"], role: "marketing" },
  { name: "Bangla", bn: "বাংলা", aliases: ["Bengali"], role: "marketing" },
  { name: "Mass Communication and Journalism", bn: "গণযোগাযোগ ও সাংবাদিকতা", aliases: ["MCJ", "journalism", "media studies"], role: "marketing" },
  { name: "Media and Communication", bn: "মিডিয়া অ্যান্ড কমিউনিকেশন", role: "marketing" },
  { name: "Fine Arts", bn: "চারুকলা", aliases: ["graphic design", "design"], role: "marketing" },
  { name: "Economics and Social Sciences", bn: "অর্থনীতি ও সমাজবিজ্ঞান", aliases: ["ESS"], role: "business" },
  { name: "Sociology", bn: "সমাজবিজ্ঞান", role: "unsure" },
  { name: "Anthropology", bn: "নৃবিজ্ঞান", role: "unsure" },
  { name: "Political Science", bn: "রাষ্ট্রবিজ্ঞান", role: "unsure" },
  { name: "International Relations", bn: "আন্তর্জাতিক সম্পর্ক", aliases: ["IR"], role: "unsure" },
  { name: "Public Administration", bn: "লোকপ্রশাসন", role: "business" },
  { name: "Development Studies", bn: "উন্নয়ন অধ্যয়ন", role: "unsure" },
  { name: "Psychology", bn: "মনোবিজ্ঞান", role: "unsure" },
  { name: "History", bn: "ইতিহাস", role: "unsure" },
  { name: "Philosophy", bn: "দর্শন", role: "unsure" },
  { name: "Islamic Studies", bn: "ইসলামিক স্টাডিজ", role: "unsure" },
  { name: "Education", bn: "শিক্ষা", aliases: ["BEd"], role: "unsure" },
];

export const subjectLabel = (name: string | undefined): Copy | undefined => {
  const s = subjects.find((x) => x.name === name);
  return s ? [s.name, s.bn] : undefined;
};
export const roleForSubject = (name: string | undefined) => subjects.find((s) => s.name === name)?.role ?? "unsure";

const norm = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}\p{M} ]/gu, " ").replace(/\s+/g, " ").trim();

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}

// Lower is better: exact/alias, prefix, word prefix, contains, initials, then typo distance.
function score(subject: Subject, query: string) {
  const names = [subject.name, subject.bn, ...(subject.aliases ?? [])].map(norm);
  let best = Infinity;
  for (const name of names) {
    if (name === query) return 0;
    if (name.startsWith(query)) best = Math.min(best, 1);
    else if (name.split(" ").some((word) => word.startsWith(query))) best = Math.min(best, 2);
    else if (name.includes(query)) best = Math.min(best, 3);
    else {
      const initials = name.split(" ").map((w) => w[0]).join("");
      if (initials.startsWith(query.replace(/ /g, ""))) best = Math.min(best, 3.5);
      else best = Math.min(best, 10 + distance(query, name.slice(0, query.length + 2)));
    }
  }
  return best;
}

// Close matches for the dropdown, best first; `closest` is always set when there's text.
export function matchSubjects(input: string) {
  const query = norm(input);
  if (!query) return { matches: subjects, closest: undefined };
  const ranked = subjects.map((s, i) => ({ s, i, score: score(s, query) })).sort((a, b) => a.score - b.score || a.i - b.i);
  const matches = ranked.filter((r) => r.score < 10).map((r) => r.s);
  return { matches, closest: ranked[0].s };
}
