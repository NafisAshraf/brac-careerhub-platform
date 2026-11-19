// The scripted "AI" behind the chat (v9) and voice (v10) questionnaires.
// It is not a real language model: it reads free text with keyword rules, fills every
// answer it can find in one reply, only asks for what is still missing, and asks again
// in simpler words when it can't understand. A real version would swap `extract` for an LLM call.
import { questions, type Answers, type Question } from "./data";

type Rule = { re: RegExp; value: string; anywhere?: boolean };

// `anywhere` rules are distinctive enough to pick up even when we asked about something else
// (e.g. “I want to study abroad” while answering which year you are in).
const rules: Record<string, Rule[]> = {
  year: [
    { re: /\b(1st|first)\s*(year|yr)|\byear\s*(1|one)\b|\bfresher\b/i, value: "1st year", anywhere: true },
    { re: /\b(2nd|second)\s*(year|yr)|\byear\s*(2|two)\b|\bsophomore\b/i, value: "2nd year", anywhere: true },
    { re: /\b(3rd|third)\s*(year|yr)|\byear\s*(3|three)\b/i, value: "3rd year", anywhere: true },
    { re: /\b(4th|fourth|final|last)\s*(year|yr)|\byear\s*(4|four)\b|\bgraduating\b/i, value: "4th year or above", anywhere: true },
    { re: /^\D*\b(1|one|first|1st)\b\D*$/i, value: "1st year" },
    { re: /^\D*\b(2|two|second|2nd)\b\D*$/i, value: "2nd year" },
    { re: /^\D*\b(3|three|third|3rd)\b\D*$/i, value: "3rd year" },
    { re: /^\D*\b(4|four|fourth|4th|final|last)\b\D*$/i, value: "4th year or above" },
  ],
  studies: [
    { re: /switch|change (my )?(subject|major|department)|wrong (subject|major)|not for me/i, value: "I’m thinking of switching", anywhere: true },
    { re: /hard|difficult|struggl|tough|stress|fail/i, value: "I find it hard" },
    { re: /\b(ok|okay|fine|alright|so[- ]so|not bad|average|decent|mixed)\b/i, value: "It’s okay" },
    { re: /love|enjoy|like it|good|great|interest|fun|happy/i, value: "I enjoy it" },
  ],
  enjoy: [
    { re: /number|math|calcul|excel|statistic|analy|account/i, value: "Working with numbers", anywhere: true },
    { re: /writ|speak|debat|present|public speaking|blog/i, value: "Writing or speaking", anywhere: true },
    { re: /build|fix|cod(e|ing)|program|robot|hardware|electronic|making things/i, value: "Building or fixing things", anywhere: true },
    { re: /help(ing)? (people|others)|teach|tutor|volunteer|people/i, value: "Helping people" },
    { re: /organi[sz]|lead|manag|event|in charge|president|captain/i, value: "Organising and leading", anywhere: true },
    { re: /design|draw|art|creat|photo|video|music|paint/i, value: "Designing or creating", anywhere: true },
  ],
  work: [
    { re: /intern/i, value: "An internship", anywhere: true },
    { re: /tuition|tutor|part[- ]?time|freelanc|\bjob\b|work(ed)? at/i, value: "Tuition or part-time work", anywhere: true },
    { re: /club|volunteer|society|organi[sz]ation/i, value: "Clubs or volunteering" },
    { re: /\b(no|not yet|none|never|nothing|nope)\b/i, value: "Not yet" },
  ],
  clarity: scale(),
  confidence: scale(),
  worry: [
    { re: /family|parent|mother|father|\bmom\b|\bdad\b|abbu|ammu|expect/i, value: "Family expectations", anywhere: true },
    { re: /cv|resume|interview/i, value: "My CV or interviews" },
    { re: /experience|no skills|nothing to show/i, value: "Having no experience" },
    { re: /money|salary|income|secur|stable|pay|afford|financ/i, value: "Money and job security" },
    { re: /(don.?t|do not) know|not sure|confus|what suits|direction|lost|which (path|career)/i, value: "Not knowing what suits me" },
  ],
  after: [
    { re: /abroad|overseas|foreign|outside (the )?country|\b(usa|us|uk|canada|germany|australia|europe|japan)\b|master.?s abroad/i, value: "Study abroad", anywhere: true },
    { re: /(own|my) (business|company|startup)|start ?up|entrepreneur/i, value: "Start my own business", anywhere: true },
    { re: /higher stud|master|mba|\bms\b|phd/i, value: "Higher study in Bangladesh" },
    { re: /\bjob\b|work|employ|corporate|career here|in bangladesh/i, value: "Get a job in Bangladesh" },
    { re: /not sure|don.?t know|no idea|unsure|confus|undecided/i, value: "I’m not sure yet" },
  ],
  fields: [
    { re: /business|financ|bank|account|\bmba\b|econom/i, value: "Business & finance", anywhere: true },
    { re: /software|\bdata\b|cod(e|ing)|program|\bai\b|machine learning|computer|developer|\bit\b|tech/i, value: "Software & data", anywhere: true },
    { re: /engineer|\beee\b|civil|mechanical|electrical/i, value: "Engineering", anywhere: true },
    { re: /marketing|media|advertis|content|journalis|brand/i, value: "Marketing & media", anywhere: true },
    { re: /\bngo\b|development sector|social (work|impact)|humanitarian/i, value: "Development & NGOs", anywhere: true },
    { re: /research|teach|academi|lectur|professor/i, value: "Research & teaching", anywhere: true },
    { re: /government|\bbcs\b|civil service|public sector|cadre/i, value: "Government jobs", anywhere: true },
  ],
  hours: [
    { re: /more than 6|\b([7-9]|1\d|20)\b|a lot|lots|plenty|as much/i, value: "More than 6 hours" },
    { re: /\b([4-6]|four|five|six)\b/i, value: "4–6 hours" },
    { re: /\b([23]|two|three|couple)\b/i, value: "2–3 hours" },
    { re: /\b(1|one|an?)\s*hour|very little|not much|little time|busy/i, value: "About 1 hour" },
  ],
};

function scale(): Rule[] {
  return [
    { re: /not at all|no idea|\bno\b|\bnever\b|^\s*1\s*$|zero/i, value: "Not at all" },
    { re: /a (little|bit)|slightly|not really|^\s*2\s*$/i, value: "A little" },
    { re: /somewhat|kind of|kinda|sort of|maybe|so[- ]so|half|^\s*3\s*$|okay|ok/i, value: "Somewhat" },
    { re: /mostly|pretty|fairly|quite|usually|^\s*4\s*$/i, value: "Mostly" },
    { re: /completely|totally|very|100|definitely|absolutely|\byes\b|^\s*5\s*$/i, value: "Completely" },
  ];
}

const skipWords = /^\s*((no|nope|nothing|none|skip|not really|na)\b[\s,.!]*)?(that.?s (all|it)|thanks?|thank you|nothing else)?[\s.!]*$/i;

/** Reads one reply. `current` is the question we just asked. Returns the answers it found. */
export function extract(text: string, current: string | null, have: Answers): Answers {
  const found: Answers = {};
  for (const q of questions) {
    const isCurrent = q.id === current;
    if (q.kind === "text") {
      if (isCurrent) found[q.id] = skipWords.test(text) ? "" : text.trim();
      continue;
    }
    if (!isCurrent && filled(q, have)) continue; // already known: leave it
    const list = (rules[q.id] ?? []).filter((r) => isCurrent || r.anywhere);
    // An option typed or tapped word for word always counts for the current question.
    const exact = isCurrent ? q.options?.filter((o) => text.toLowerCase().includes(o.toLowerCase())) ?? [] : [];
    if (q.kind === "many") {
      const hits = [...new Set([...exact, ...list.filter((r) => r.re.test(text)).map((r) => r.value)])].slice(0, q.max ?? 3);
      if (hits.length) found[q.id] = hits;
    } else {
      const hit = exact[0] ?? list.find((r) => r.re.test(text))?.value;
      if (hit) found[q.id] = hit;
    }
  }
  return found;
}

export const filled = (q: Question, a: Answers) =>
  q.kind === "text" ? a[q.id] !== undefined : Array.isArray(a[q.id]) ? (a[q.id] as string[]).length > 0 : !!a[q.id];
export const nextMissing = (a: Answers) => questions.find((q) => !filled(q, a)) ?? null;
export const filledCount = (a: Answers) => questions.filter((q) => filled(q, a)).length;

/* ---------- How the assistant talks ---------- */
// First try is friendly and natural; the retry uses simpler words (like asking “gender” after “sex” didn’t land).
export const asks: Record<string, { ask: string; simpler: string; label: string }> = {
  year: { label: "Year", ask: "Which year of university are you in right now?", simpler: "Let me ask it another way. Are you in your 1st, 2nd, 3rd or 4th year?" },
  studies: { label: "Feeling about studies", ask: "How are you finding your subject so far? Honestly is best.", simpler: "Put simply: do you like your subject, is it just okay, is it hard, or are you thinking of changing it?" },
  enjoy: { label: "Enjoys", ask: "What kind of things do you enjoy doing, in class or outside it?", simpler: "For example: working with numbers, writing, building things, helping people, leading a team, or designing. Which sound like you?" },
  work: { label: "Experience", ask: "Have you done any kind of work yet? Clubs, tuition and volunteering all count.", simpler: "Simply put: no work yet, clubs or volunteering, tuition or a part-time job, or an internship?" },
  clarity: { label: "Clear on the work they want", ask: "Do you already know what kind of work you want to do?", simpler: "On a scale of 1 to 5, how clear are you about the work you want? 1 means no idea, 5 means very clear." },
  confidence: { label: "Confidence with new people", ask: "How comfortable are you talking to people you’ve just met?", simpler: "From 1 to 5, how confident do you feel meeting new people? 1 is not at all, 5 is completely." },
  worry: { label: "Main worry", ask: "When you think about your career, what worries you the most?", simpler: "Is it mostly not knowing what suits you, having no experience, your CV or interviews, family pressure, or money?" },
  after: { label: "Plans after graduation", ask: "What would you like to do after you graduate?", simpler: "Would you rather get a job here, study abroad, do higher study in Bangladesh, or start a business? It’s fine to say you’re not sure." },
  fields: { label: "Fields of interest", ask: "Which kind of work or industry interests you?", simpler: "Some examples: business, software and data, engineering, marketing, NGOs, research, or government jobs. Which ones?" },
  hours: { label: "Time per week", ask: "Roughly how many hours a week could you spend on career things, like a course or applications?", simpler: "Just a number is fine: about 1 hour, 2 to 3, 4 to 6, or more?" },
  note: { label: "Note for counsellor", ask: "Last one. Is there anything else you’d like your counsellor to know? A question, a worry, a dream job. You can say no.", simpler: "Anything else for your counsellor? Or just say no." },
};

const acks = ["Got it.", "Thanks!", "Okay, noted.", "Okay.", "Thanks for sharing that.", "Great, that helps."];
export const ackFor = (n: number) => acks[n % acks.length];

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const show = (v: string | string[]) => (Array.isArray(v) ? v.map(lower).join(" and ") : lower(v));

// How an answer is named when the assistant lists what it picked up (“I’ve noted your …”).
const nouns: Record<string, string> = { enjoy: "interests", studies: "feelings about your subject", clarity: "clarity about the work you want", confidence: "confidence with new people" };

// A short, human echo of the answer so the student knows it was understood.
const echoes: Record<string, (v: string) => string> = {
  year: (v) => `So you’re in ${v}.`,
  enjoy: (v) => `So you enjoy ${v}.`,
  work: (v) => (v === "not yet" ? "That’s completely fine at this stage." : `${v.charAt(0).toUpperCase() + v.slice(1)}: that counts.`),
  worry: () => "That’s a really common worry, and a good one to talk about.",
  after: (v) => `I’ve noted: ${v}.`,
  fields: (v) => `I’ve noted ${v}.`,
  hours: (v) => `${v.charAt(0).toUpperCase() + v.slice(1)} a week is a good start.`,
};

/** What the assistant says back after a reply: confirms the answer and anything extra it picked up. */
export function reaction(found: Answers, current: string | null, turn: number) {
  const ids = Object.keys(found).filter((id) => id !== "note");
  if (!ids.length) return found.note !== undefined ? (found.note ? "Thanks, I’ll pass that on word for word." : "No problem.") : "";
  const extra = ids.filter((id) => id !== current);
  const echo = current && found[current] && echoes[current] ? " " + echoes[current](show(found[current])) : "";
  const main = ackFor(turn) + echo;
  if (!extra.length) return main;
  const bits = extra.map((id) => `${nouns[id] ?? asks[id].label.toLowerCase()} (${show(found[id])})`);
  const list = bits.length > 1 ? `${bits.slice(0, -1).join(", ")} and ${bits.at(-1)}` : bits[0];
  if (!current) return `${main} I’ve noted your ${list}. I won’t ask about ${extra.length > 1 ? "those" : "that"} again.`;
  return `${main} You also told me your ${list}, so I won’t ask about ${extra.length > 1 ? "those" : "that"}.`;
}

/** Sample replies for the demo, written like a real student would type or say them. */
export const sampleReplies: Record<string, string[]> = {
  intro: ["I’m in 2nd year CSE. I want to do a master’s abroad, maybe in data, but my parents want me to do an MBA.", "Third year, studying EEE. Not sure what to do after."],
  year: ["2nd year", "I’m a second year student"],
  studies: ["It’s okay, some courses are hard", "I like it mostly"],
  enjoy: ["I like maths and organising events for my club", "Coding and designing posters"],
  work: ["I do tuition and I’m in the robotics club", "Nothing yet"],
  clarity: ["Not really, maybe a little", "Kind of"],
  confidence: ["Pretty confident actually", "Not much, I get nervous"],
  worry: ["I don’t know what suits me", "Getting a stable job"],
  after: ["Probably study abroad", "Not sure yet"],
  fields: ["Data and business", "Software and marketing"],
  hours: ["Maybe 2 or 3 hours", "About 5 hours"],
  note: ["No, that’s all", "Can we talk about scholarships?"],
};

export const opening = (name: string, counsellor: string) =>
  `Hi ${name}! I’m the Career Hub assistant. Before you meet ${counsellor}, I’d like to get to know you a little. No forms: just answer in your own words, like texting a friend. To start, tell me a bit about yourself: which year you’re in, and what you’re hoping to do after university?`;
export const openingVoice = (name: string, counsellor: string) =>
  `Hi ${name}, this is the Career Hub assistant. I’ll ask you a few quick questions so ${counsellor} knows you before your session. Just talk normally. To start, which year are you in, and what are you hoping to do after university?`;
