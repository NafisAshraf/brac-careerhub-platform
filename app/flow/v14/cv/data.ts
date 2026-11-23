// CV data for the v14 CV maker. A simplified version of ScholarTrack's CV maker:
// the main sections only (no Europass template or its special fields).
export type Edu = { school: string; degree: string; location: string; year: string; details: string[] };
export type Exp = { company: string; role: string; location: string; duration: string; description: string[] };
export type Cert = { title: string; institution: string; year: string };
export type Ref = { name: string; position: string; contact: string; phone: string };
export type CV = {
  name: string; email: string; phone: string; address: string; summary: string; photo?: string;
  education: Edu[]; experience: Exp[]; skills: string[]; certifications: Cert[]; achievements: string[]; references: Ref[];
};
export type TemplateId = "professional" | "modern";
export const templates: { id: TemplateId; name: string; about: string }[] = [
  { id: "professional", name: "Professional", about: "Clean, single column. Good for most applications." },
  { id: "modern", name: "Modern", about: "Two columns with a dark sidebar and photo." },
];

export const emptyEdu = (): Edu => ({ school: "", degree: "", location: "", year: "", details: [""] });
export const emptyExp = (): Exp => ({ company: "", role: "", location: "", duration: "", description: [""] });
export const emptyCert = (): Cert => ({ title: "", institution: "", year: "" });
export const emptyRef = (): Ref => ({ name: "", position: "", contact: "", phone: "" });

// A starting CV built from the student's account, with sample content to edit.
export function startingCv(a: { name: string; email: string; phone: string; university: string; subject: string }): CV {
  return {
    name: a.name, email: a.email, phone: a.phone, address: "Dhaka, Bangladesh",
    summary: `${a.subject} student at ${a.university} with a strong interest in data. Organised, comfortable with numbers and used to leading small teams. Looking for an internship in analysis and reporting.`,
    education: [{ school: a.university, degree: `BSc in ${a.subject}`, location: "Dhaka", year: "2024 – 2028 (expected)", details: ["CGPA 3.62 / 4.00 (so far)", "Relevant courses: Data Structures, Database Systems, Statistics"] },
      { school: "Viqarunnisa Noon School and College", degree: "Higher Secondary Certificate (Science)", location: "Dhaka", year: "2023", details: [] }],
    experience: [{ company: "BRACU Computer Club", role: "Events Coordinator", location: "Dhaka", duration: "Jan 2025 – Present", description: ["Organised three workshops with 200+ attendees in total", "Managed a team of six volunteers and a small budget"] },
      { company: "Private tuition", role: "Maths and ICT Tutor", location: "Dhaka", duration: "2023 – Present", description: ["Teach three secondary students; all improved their grades by at least one level"] }],
    skills: ["Microsoft Excel", "SQL (beginner)", "Python", "Public speaking", "Team leadership", "Bangla and English"],
    certifications: [{ title: "Excel Skills for Business: Essentials", institution: "Macquarie University · Coursera", year: "2025" }],
    achievements: ["Dean’s List, Spring 2025", "Runner-up, BRACU Inter-department Hackathon 2025"],
    references: [{ name: "Dr. Farzana Ahmed", position: "Associate Professor, CSE, BRAC University", contact: "farzana.ahmed@bracu.ac.bd", phone: "01711-000000" }],
  };
}
