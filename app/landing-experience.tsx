"use client";
import { useState } from "react";
import StudyAbroad from "./study-abroad";
import CareerWorkspace from "./career/workspace";
import UnifiedHub from "./hub/hub";
import HubV3 from "./hub-v3/hub";
import { HeroVariation, type HeroVariant } from "./hero-variations";

const steps = [
  ["প্রোফাইল ও বুকিং", "ক্যারিয়ার লক্ষ্য দিন এবং কাউন্সেলিং কল বুক করুন"],
  ["১:১ কাউন্সেলিং", "আকাঙ্ক্ষা বুঝে কাউন্সেলর মূল্যায়ন নির্ধারণ করবেন"],
  ["দক্ষতা মূল্যায়ন", "আগ্রহ, দক্ষতা ও চাকরি-প্রস্তুতি যাচাই"],
  ["ক্যারিয়ার প্রস্তুতি রিপোর্ট", "শক্তি, ঘাটতি ও উন্নতির অগ্রাধিকার"],
  ["সম্ভাব্য চাকরির ভূমিকা", "মূল্যায়ন অনুযায়ী উপযুক্ত ভূমিকার সুপারিশ"],
  ["ব্যক্তিগত উন্নয়ন পরিকল্পনা", "কোর্স, কাজ ও অগ্রগতি ট্র্যাকিং"],
  ["CV ও মক সাক্ষাৎকার", "ভূমিকাভিত্তিক আবেদন প্রস্তুতি"],
  ["যাচাইকৃত রেফারেল", "প্রাসঙ্গিক সুযোগের সঙ্গে সংযোগ"],
  ["প্লেসমেন্ট ট্র্যাকিং", "আবেদন, সাক্ষাৎকার, অফার ও যোগদান"],
  ["৩ ও ৬ মাসের ফলো-আপ", "ক্যারিয়ার হাবের ফোন ও পরবর্তী সহায়তা"],
];
const exams = [
  ["BCS প্রস্তুতি", "প্রিলিমিনারি · লিখিত · ভাইভা", "বিসিএস", "BCS"],
  ["ব্যাংক জব প্রস্তুতি", "বাংলা · ইংরেজি · গণিত", "ব্যাংক", "BANK"],
  [
    "NTRCA প্রস্তুতি",
    "প্রিলিমিনারি · লিখিত · বিষয়ভিত্তিক",
    "শিক্ষক নিবন্ধন",
    "NTRCA",
  ],
  [
    "প্রাথমিক শিক্ষক নিয়োগ",
    "বাংলা · গণিত · সাধারণ জ্ঞান",
    "প্রাইমারি",
    "PRIMARY",
  ],
  [
    "মন্ত্রণালয় ও অধিদপ্তর",
    "গ্রেড ৯–২০ · নিয়োগ পরীক্ষা",
    "সরকারি নিয়োগ",
    "GOVT",
  ],
  [
    "রেলওয়ে ও অন্যান্য পরীক্ষা",
    "পদভিত্তিক প্রস্তুতি · মক টেস্ট",
    "অন্যান্য পরীক্ষা",
    "OTHER",
  ],
];
const careers = [
  [
    "কাস্টমার এক্সপেরিয়েন্স",
    "যোগাযোগ, সেবা ও সমস্যা সমাধান",
    "প্রারম্ভিক ক্যারিয়ার",
    "☎",
  ],
  ["ডিজিটাল ও IT", "প্রযুক্তি, তথ্য ও ডিজিটাল কাজ", "দ্রুত বিকাশমান", "⌘"],
  ["ব্যাংকিং ও ফাইন্যান্স", "সংখ্যা, ব্যবসা ও গ্রাহকসেবা", "পেশাদার", "▥"],
];

function Mark() {
  return (
    <div className="mark">
      <img src="/careerhub-logo.png" alt="Career Hub — Powered by BRAC" />
    </div>
  );
}

function Home({
  start,
  startStudy,
  heroVariant,
}: {
  start: (n?: number) => void;
  startStudy: () => void;
  heroVariant?: HeroVariant;
}) {
  return (
    <main>
      <div className="responsiveCover">
        <header className="nav wrap homeNav">
          <Mark />
          <nav>
            <a href="#about">About</a>
            <button onClick={() => start(0)}>Career &amp; Jobs</button>
            <button onClick={startStudy}>Study Abroad</button>
            <button onClick={() => start(1)}>Counselling</button>
            <button onClick={() => start(6)}>CV Tools</button>
            <a href="#services">Personal Development</a>
          </nav>
          <div className="navActions">
            <button className="primary small" onClick={startStudy}>
              Log In
            </button>
          </div>
        </header>
        {heroVariant ? <HeroVariation variant={heroVariant} startCareer={() => start(0)} startStudy={startStudy} /> : <section className="choiceHero" id="pathways">
          <div className="wrap">
            <header>
              <h1>আপনার লক্ষ্য বেছে নিন</h1>
              <p>
                একটি প্ল্যাটফর্মে ক্যারিয়ার গাইডেন্স, চাকরির প্রস্তুতি ও বিদেশে
                উচ্চশিক্ষার সহায়তা।
              </p>
            </header>
            <div className="choiceGrid">
              <article className="choiceCard">
                <img
                  src="/career-journey-hero.png"
                  alt="চাকরি ও ক্যারিয়ার প্রস্তুতির পথ"
                />
                <div>
                  <h2>চাকরি ও ক্যারিয়ার প্রস্তুতি</h2>
                  <p>
                    ক্যারিয়ার মূল্যায়ন, দক্ষতা, CV, সাক্ষাৎকার ও যাচাইকৃত
                    সুযোগ।
                  </p>
                  <button className="primary" onClick={() => start(0)}>
                    ক্যারিয়ার যাত্রা শুরু করুন →
                  </button>
                </div>
              </article>
              <article className="choiceCard studyChoice">
                <div className="studyVisual">
                  <img
                    src="/study-abroad-hero.png"
                    alt="AI-এর সহায়তায় বিদেশে উচ্চশিক্ষার পথ পরিকল্পনা করছেন একজন শিক্ষার্থী"
                  />
                </div>
                <div>
                  <h2>বিদেশে উচ্চশিক্ষার পথ</h2>
                  <p>
                    AI বিশ্ববিদ্যালয় ম্যাচিং, শর্টলিস্ট, ডকুমেন্ট টুল ও আবেদন
                    ট্র্যাকিং।
                  </p>
                  <button className="primary" onClick={startStudy}>
                    স্টাডি অ্যাব্রড যাত্রা শুরু করুন →
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>}
      </div>
      <section className="proof">
        <div className="wrap">
          <div>
            <b>ব্যক্তিগত AI মূল্যায়ন</b>
            <span>আপনার আগ্রহ, দক্ষতা ও প্রস্তুতি জানুন</span>
          </div>
          <div>
            <b>ব্যক্তিগত কাউন্সেলিং</b>
            <span>বিশেষজ্ঞের সঙ্গে নিজের পথ ঠিক করুন</span>
          </div>
          <div>
            <b>AI ক্যারিয়ার টুল</b>
            <span>সিভি, সাক্ষাৎকার ও ক্যারিয়ার প্রস্তুতি</span>
          </div>
          <div>
            <b>যাচাইকৃত সুযোগ</b>
            <span>চাকরি, ইন্টার্নশিপ ও শিক্ষানবিশি</span>
          </div>
        </div>
      </section>
      <section className="section wrap" id="services">
        <Header
          kicker="HOW WE SUPPORT YOU"
          title={
            <>
              Personal career support
              <br />
              <em>for you.</em>
            </>
          }
          copy="AI-powered insights and experienced counsellors work together to help you make the right career decisions with confidence."
        />
        <div className="services">
          {[
            [
              "০১",
              "◎",
              "কাউন্সেলর-নির্দেশিত মূল্যায়ন",
              "প্রোফাইল তৈরির পর কাউন্সেলর আপনার লক্ষ্য শুনে উপযুক্ত আগ্রহ, দক্ষতা ও চাকরি-প্রস্তুতি মূল্যায়ন নির্ধারণ করবেন।",
            ],
            [
              "০২",
              "◇",
              "ব্যক্তিগত উন্নয়ন পরিকল্পনা",
              "রিপোর্ট, সম্ভাব্য চাকরির ভূমিকা ও কাউন্সেলরের পরামর্শ অনুযায়ী কোর্স, কাজ ও মাইলস্টোন সম্পন্ন করুন।",
            ],
            [
              "০৩",
              "✦",
              "সিভি ও ক্যারিয়ারের AI টুল",
              "ভূমিকাভিত্তিক সিভি তৈরি, মক সাক্ষাৎকার অনুশীলন এবং আবেদন উন্নত করতে স্মার্ট টুল ব্যবহার করুন।",
            ],
          ].map((s, i) => (
            <article className={i === 1 ? "featured" : ""} key={s[0]}>
              <small>{s[0]}</small>
              <i>{s[1]}</i>
              <h3>{s[2]}</h3>
              <p>{s[3]}</p>
              <button onClick={() => start([1, 5, 6][i])}>
                শুরু করুন <span>→</span>
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="section wrap journey" id="journey">
        <div className="journeyIntro">
          <span className="kicker">YOUR CAREER JOURNEY</span>
          <h2>
            Ten counselor-guided
            <br />
            <em>meaningful steps.</em>
          </h2>
          <p>
            Start with counselling and assessment, understand your readiness and
            suitable job roles, then follow a personalized development,
            application and follow-up journey—all tracked in one place.
          </p>
          <button className="primary" onClick={() => start(0)}>
            Start my journey →
          </button>
        </div>
        <div className="timeline">
          {steps.map((s, i) => (
            <button key={s[0]} onClick={() => start(i)}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              <span>
                <b>{s[0]}</b>
                <small>{s[1]}</small>
              </span>
              <em>→</em>
            </button>
          ))}
        </div>
      </section>
      <section className="explore studyExplore" id="explore">
        <div className="wrap">
          <Header
            light
            kicker="AI-POWERED STUDY ABROAD NAVIGATOR"
            title={
              <>
                আপনার প্রোফাইল থেকে
                <br />
                <em>সঠিক বিশ্ববিদ্যালয়ের শর্টলিস্ট।</em>
              </>
            }
            copy="শিক্ষাগত ফল, বিষয়, বাজেট, দেশ ও ইনটেক জানান। AI সম্ভাব্য বিশ্ববিদ্যালয় সাজাবে, আর Career Hub কাউন্সেলর তথ্য যাচাই ও পরবর্তী পদক্ষেপ নির্ধারণে সহায়তা করবেন।"
          />
          <div className="studySteps">
            {[
              ["01", "প্রোফাইল ও পছন্দ", "ফলাফল, বিষয়, দেশ, বাজেট ও ইনটেক"],
              [
                "02",
                "AI বিশ্ববিদ্যালয় ম্যাচিং",
                "Ambitious, Target ও Safer বিকল্প",
              ],
              ["03", "তুলনা ও শর্টলিস্ট", "খরচ, স্কলারশিপ, যোগ্যতা ও ডেডলাইন"],
              [
                "04",
                "ডকুমেন্ট স্টুডিও",
                "SOP, Academic CV, LOR brief ও essays",
              ],
              ["05", "কাউন্সেলর রিভিউ", "তথ্য যাচাই ও আবেদন পরিকল্পনা"],
              ["06", "আবেদন ট্র্যাকিং", "আবেদন, অফার, ভিসা ও ফলো-আপ"],
            ].map((s) => (
              <article key={s[0]}>
                <i>{s[0]}</i>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </article>
            ))}
          </div>
          <button className="all" onClick={startStudy}>
            আমার বিশ্ববিদ্যালয় ম্যাচ দেখুন →
          </button>
        </div>
      </section>
      <Pricing startStudy={startStudy} />
      <section className="cta" id="opportunities">
        <div className="wrap">
          <div>
            <span className="kicker">আপনি প্রস্তুত হলেই</span>
            <h2>
              ক্যারিয়ারের জন্য নিখুঁত পরিকল্পনা নয়,
              <br />
              প্রয়োজন শুধু <em>প্রথম পদক্ষেপ।</em>
            </h2>
          </div>
          <button onClick={() => start(0)}>যাত্রা শুরু করুন →</button>
        </div>
      </section>
      <footer>
        <div className="wrap footer">
          <Mark />
          <p>
            দক্ষতা। দিকনির্দেশনা। সুযোগ।
            <br />
            সবকিছু এক জায়গায়।
          </p>
          <div>
            <b>অন্বেষণ</b>
            <a href="#explore">ক্যারিয়ার</a>
            <a href="#services">প্রশিক্ষণ</a>
            <a href="#opportunities">চাকরি ও ইভেন্ট</a>
          </div>
          <div>
            <b>সহায়তা</b>
            <a href="#journey">কীভাবে কাজ করে</a>
            <button onClick={() => start(1)}>কাউন্সেলিং বুক করুন</button>
            <a href="#">কেন্দ্র খুঁজুন</a>
          </div>
          <div>
            <b>যোগাযোগ</b>
            <a href="https://careerhub.brac.net/">বর্তমান ক্যারিয়ার হাব</a>
            <a href="https://www.facebook.com/careerhub.brac">ফেসবুক</a>
          </div>
        </div>
        <div className="wrap copyright">
          © BRAC Career Hub <span>প্ল্যাটফর্ম পুনর্নকশার ধারণা</span>
        </div>
      </footer>
    </main>
  );
}

function Pricing({ startStudy }: { startStudy: () => void }) {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState<number | null>(null);
  const plans = [
    [
      "ফ্রি",
      "৳০",
      "স্টুডেন্ট প্রোফাইল",
      "৩টি নমুনা বিশ্ববিদ্যালয় ম্যাচ",
      "প্রাথমিক রেডিনেস স্কোর",
    ],
    [
      "স্মার্ট",
      annual ? "৳১,৫০০/বছর" : "৳১৫০/মাস",
      "সম্পূর্ণ বিশ্ববিদ্যালয় ম্যাচ রিপোর্ট",
      "তুলনা, শর্টলিস্ট ও ডেডলাইন",
      "ব্যক্তিগত আবেদন পরিকল্পনা",
    ],
    [
      "প্রো",
      annual ? "৳৪,০০০/বছর" : "৳৪০০/মাস",
      "স্মার্ট প্ল্যানের সব সুবিধা",
      "AI SOP, CV, LOR ও essay tools",
      "কাউন্সেলর ডকুমেন্ট রিভিউ",
    ],
  ];
  return (
    <section className="pricing" id="subscription">
      <div className="wrap">
        <header>
          <div>
            <span className="kicker">সাবস্ক্রিপশন</span>
            <h2>
              বিনামূল্যে শুরু করুন।
              <br />
              <em>প্রস্তুতি অনুযায়ী আপগ্রেড করুন।</em>
            </h2>
            <p>
              প্রোফাইল তৈরি ও নমুনা ম্যাচ বিনামূল্যে। সম্পূর্ণ ম্যাচ রিপোর্ট,
              ডকুমেন্ট টুল এবং কাউন্সেলর রিভিউয়ের জন্য সুবিধাজনক প্ল্যান বেছে
              নিন।
            </p>
          </div>
          <div className="billing-toggle">
            <button
              className={!annual ? "active" : ""}
              onClick={() => setAnnual(false)}
            >
              মাসিক
            </button>
            <button
              className={annual ? "active" : ""}
              onClick={() => setAnnual(true)}
            >
              বার্ষিক <b>২ মাস সাশ্রয়</b>
            </button>
          </div>
        </header>
        <div className="price-grid">
          {plans.map((p, i) => (
            <article
              className={
                (i === 1 ? "popular " : "") +
                (subscribed === i ? "subscribed" : "")
              }
              key={p[0]}
            >
              {i === 1 && <span className="popular-tag">সবচেয়ে জনপ্রিয়</span>}
              <small>{p[0]} প্ল্যান</small>
              <h3>{p[1]}</h3>
              <p>
                {i === 0
                  ? "আপনার প্রোফাইলের সম্ভাবনা জানুন।"
                  : "বিশ্ববিদ্যালয় নির্বাচন থেকে আবেদন—এক জায়গায়।"}
              </p>
              <ul>
                {p.slice(2).map((x) => (
                  <li key={x}>✓ {x}</li>
                ))}
              </ul>
              <button onClick={() => (i === 0 ? startStudy() : setSelected(i))}>
                {subscribed === i
                  ? "✓ সক্রিয় প্ল্যান"
                  : i === 0
                    ? "বিনামূল্যে শুরু করুন"
                    : "প্ল্যান বেছে নিন →"}
              </button>
            </article>
          ))}
        </div>
        <p className="pricing-note">
          শিক্ষার্থী সহায়তা: নির্বাচিত BRAC Career Hub অংশগ্রহণকারীদের জন্য
          ভর্তুকি বা স্কলারশিপ সুবিধা রাখা যেতে পারে।
        </p>
      </div>
      {selected !== null && (
        <div
          className="checkout-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="সাবস্ক্রিপশন নিশ্চিত করুন"
        >
          <div className="checkout">
            <button
              className="checkout-close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <small>SUBSCRIPTION CHECKOUT</small>
            <h2>{plans[selected][0]} প্ল্যান চালু করুন</h2>
            <p>
              {plans[selected][1]} · {annual ? "বার্ষিক বিলিং" : "মাসিক বিলিং"}
            </p>
            <label>
              মোবাইল নম্বর
              <input defaultValue="০১৭০০ ০০০০০০" />
            </label>
            <div>
              <button onClick={() => setSelected(null)}>পরে করব</button>
              <button
                className="primary"
                onClick={() => {
                  setSubscribed(selected);
                  setSelected(null);
                }}
              >
                সাবস্ক্রিপশন নিশ্চিত করুন →
              </button>
            </div>
            <em>এটি প্রোটোটাইপ চেকআউট—কোনো অর্থ কাটা হবে না।</em>
          </div>
        </div>
      )}
    </section>
  );
}

function Header({
  kicker,
  title,
  copy,
  light = false,
}: {
  kicker: string;
  title: React.ReactNode;
  copy: string;
  light?: boolean;
}) {
  return (
    <div className={"sectionHead " + (light ? "light" : "")}>
      <div>
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      <p>{copy}</p>
    </div>
  );
}

const Content = ({ step, go }: { step: number; go: (n: number) => void }) => {
  const [saved, setSaved] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  const [goal, setGoal] = useState(0);
  const [selectedCareer, setSelectedCareer] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    education: "",
    field: "",
    institution: "",
    certification: "",
    experience: "০ বছর",
    district: "",
  });
  const [answer, setAnswer] = useState(3);
  const [booked, setBooked] = useState(false);
  const [courseEnrolled, setCourseEnrolled] = useState<number[]>([]);
  const [cvReady, setCvReady] = useState(false);
  const [applied, setApplied] = useState<number[]>([]);
  const [joined, setJoined] = useState(true);
  const profileBoost =
    (profile.name ? 2 : 0) +
    (profile.education ? 4 : 0) +
    (profile.certification ? 4 : 0);
  const screens = [
    <>
      <Title
        n="০১"
        name="অন্বেষণ"
        h="আপনি কী জানতে চান?"
        p="অ্যাকাউন্ট তৈরির আগেই স্বাধীনভাবে দেখুন এবং পছন্দের বিষয় সংরক্ষণ করুন।"
      />
      <div className="search">
        ⌕<input placeholder="ক্যারিয়ার, কোর্স, ইভেন্ট বা সুযোগ খুঁজুন" />
        <button>খুঁজুন</button>
      </div>
      <div className="filters">
        {["ক্যারিয়ার", "প্রশিক্ষণ", "ইভেন্ট", "কেন্দ্র", "সুযোগ"].map(
          (x, i) => (
            <button className={i ? "" : "active"} key={x}>
              {x}
            </button>
          ),
        )}
      </div>
      <div className="portalCards">
        {careers.slice(0, 3).map((c, i) => (
          <article key={c[0]}>
            <div className={"thumb art" + i}>{c[3]}</div>
            <small>{c[2]}</small>
            <h3>{c[0]}</h3>
            <p>{c[1]}</p>
            <button
              onClick={() =>
                setSaved((v) =>
                  v.includes(c[0]) ? v.filter((x) => x !== c[0]) : [...v, c[0]],
                )
              }
            >
              {saved.includes(c[0]) ? "✓ সংরক্ষিত" : "পথটি সংরক্ষণ করুন"}
            </button>
          </article>
        ))}
      </div>
    </>,
    <>
      <Title
        n="০১"
        name="অ্যাকাউন্ট"
        h="আপনার ক্যারিয়ার হাব অ্যাকাউন্ট তৈরি করুন"
        p="মাত্র দুই মিনিট সময় লাগবে। আপনার অগ্রগতি নিরাপদে সংরক্ষিত থাকবে।"
      />
      <div className="formCard">
        <label>মোবাইল নম্বর</label>
        <div className="phone">
          <span>+৮৮০</span>
          <input defaultValue="১৭ ০০০০ ০০০০" />
        </div>
        <button className="primary full" onClick={() => setVerified(true)}>
          {verified ? "✓ নম্বর যাচাই হয়েছে" : "যাচাইকরণ কোড পাঠান"}
        </button>
        <div className="or">──────── অথবা ইমেইল ব্যবহার করুন ────────</div>
        <button className="outline full" onClick={() => setVerified(true)}>
          ✉ ইমেইল দিয়ে এগিয়ে যান
        </button>
        <p>
          {verified
            ? "অ্যাকাউন্ট প্রস্তুত। এখন আপনার লক্ষ্য নির্ধারণ করুন।"
            : "এগিয়ে যাওয়ার মাধ্যমে আপনি প্ল্যাটফর্মের শর্ত ও গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন।"}
        </p>
      </div>
    </>,
    <>
      <Title
        n="০২"
        name="ক্যারিয়ার প্রোফাইল প্রশ্নমালা"
        h="আপনার সম্পর্কে জানি"
        p="সঠিক মূল্যায়নের জন্য তথ্যগুলো পূরণ করুন। তারকাচিহ্নিত তথ্য আবশ্যক।"
      />
      <div className="profileForm">
        <section>
          <h3>ব্যক্তিগত তথ্য</h3>
          <div className="fieldGrid">
            <label>
              <span>পূর্ণ নাম *</span>
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="যেমন: রাফিয়া আক্তার"
              />
            </label>
            <label>
              <span>বর্তমান জেলা *</span>
              <select
                value={profile.district}
                onChange={(e) =>
                  setProfile({ ...profile, district: e.target.value })
                }
              >
                <option value="">জেলা নির্বাচন করুন</option>
                <option>ঢাকা</option>
                <option>চট্টগ্রাম</option>
                <option>রাজশাহী</option>
                <option>খুলনা</option>
                <option>সিলেট</option>
                <option>বরিশাল</option>
                <option>রংপুর</option>
                <option>ময়মনসিংহ</option>
              </select>
            </label>
          </div>
        </section>
        <section>
          <h3>শিক্ষাগত যোগ্যতা</h3>
          <div className="fieldGrid">
            <label>
              <span>সর্বোচ্চ শিক্ষার স্তর *</span>
              <select
                value={profile.education}
                onChange={(e) =>
                  setProfile({ ...profile, education: e.target.value })
                }
              >
                <option value="">নির্বাচন করুন</option>
                <option>SSC / সমমান</option>
                <option>HSC / সমমান</option>
                <option>ডিপ্লোমা</option>
                <option>স্নাতক চলমান</option>
                <option>স্নাতক সম্পন্ন</option>
                <option>স্নাতকোত্তর</option>
              </select>
            </label>
            <label>
              <span>বিষয় / বিভাগ</span>
              <input
                value={profile.field}
                onChange={(e) =>
                  setProfile({ ...profile, field: e.target.value })
                }
                placeholder="যেমন: ব্যবসায় প্রশাসন"
              />
            </label>
            <label>
              <span>প্রতিষ্ঠানের নাম</span>
              <input
                value={profile.institution}
                onChange={(e) =>
                  setProfile({ ...profile, institution: e.target.value })
                }
                placeholder="কলেজ বা বিশ্ববিদ্যালয়"
              />
            </label>
            <label>
              <span>কাজের অভিজ্ঞতা</span>
              <select
                value={profile.experience}
                onChange={(e) =>
                  setProfile({ ...profile, experience: e.target.value })
                }
              >
                <option>০ বছর</option>
                <option>১ বছরের কম</option>
                <option>১–২ বছর</option>
                <option>৩–৫ বছর</option>
                <option>৫ বছরের বেশি</option>
              </select>
            </label>
          </div>
        </section>
        <section>
          <h3>সার্টিফিকেশন ও প্রশিক্ষণ</h3>
          <label>
            <span>সার্টিফিকেশন / কোর্স</span>
            <input
              value={profile.certification}
              onChange={(e) =>
                setProfile({ ...profile, certification: e.target.value })
              }
              placeholder="যেমন: Microsoft Office, Digital Marketing"
            />
          </label>
        </section>
        <section>
          <h3>আপনার তাৎক্ষণিক লক্ষ্য *</h3>
          <div className="objectiveGrid">
            {[
              ["এখনই চাকরি চাই", "উপযুক্ত চাকরির মিল"],
              ["দক্ষতা গড়তে চাই", "প্রশিক্ষণ ও কোর্স"],
              ["দিকনির্দেশনা চাই", "ক্যারিয়ার পথ নির্বাচন"],
              ["আবেদন প্রস্তুতি চাই", "CV ও সাক্ষাৎকার"],
            ].map((g, i) => (
              <button
                type="button"
                onClick={() => setGoal(i)}
                className={i === goal ? "selected" : ""}
                key={g[0]}
              >
                <b>{g[0]}</b>
                <small>{g[1]}</small>
                <i>{i === goal ? "✓" : ""}</i>
              </button>
            ))}
          </div>
        </section>
        <div className="profileSummary">
          <div>
            <b>{profile.name || "আপনার নাম"}</b>
            <span>
              {profile.education || "শিক্ষার স্তর দিন"} ·{" "}
              {profile.field || "বিষয় উল্লেখ করুন"}
            </span>
          </div>
          <strong>
            {Math.min(100, 45 + profileBoost + goal * 3)}% প্রোফাইল প্রস্তুত
          </strong>
        </div>
      </div>
    </>,
    <>
      <Title
        n="০৩"
        name="AI দক্ষতা ও প্রস্তুতি মূল্যায়ন"
        h={
          "AI-এর সাহায্যে " +
          (profile.name || "আপনার") +
          " দক্ষতা ও প্রস্তুতি বুঝুন"
        }
        p="শিক্ষা, সার্টিফিকেশন, অভিজ্ঞতা ও উত্তরের ভিত্তিতে AI আপনার চাকরির প্রস্তুতি মূল্যায়ন করবে।"
      />
      <div className="assessment">
        <div>
          <b>ক্যারিয়ারের আগ্রহ</b>
          <span>১২টির মধ্যে ৩ নম্বর প্রশ্ন</span>
        </div>
        <div className="progress">
          <i />
        </div>
        <h2>
          আমি কোনো ধারণা এমনভাবে বোঝাতে পছন্দ করি, যাতে অন্যরা সহজে বুঝতে পারে।
        </h2>
        <div className="scale">
          {[
            "আমার মতো নয়",
            "কিছুটা",
            "মাঝেমধ্যে",
            "বেশিরভাগ সময়",
            "খুব বেশি",
          ].map((x, i) => (
            <button
              onClick={() => setAnswer(i)}
              className={i === answer ? "chosen" : ""}
              key={x}
            >
              <i>{i === answer ? "✓" : i + 1}</i>
              <span>{x}</span>
            </button>
          ))}
        </div>
      </div>
    </>,
    <>
      <Title
        n="০৪"
        name="ক্যারিয়ার প্রস্তুতি রিপোর্ট"
        h={(profile.name || "আপনার") + "-এর ক্যারিয়ার প্রস্তুতি রিপোর্ট"}
        p="আপনার নির্বাচিত উত্তর বিশ্লেষণ করে AI এই রিপোর্ট তৈরি করেছে।"
      />
      <div className="report">
        <div className="score">
          <div>
            <b>{Math.min(100, 65 + answer * 3 + profileBoost)}</b>
            <small>/১০০</small>
          </div>
          <strong>বিকাশমান</strong>
          <p>
            আপনার ভিত্তি শক্ত। প্রমাণ, সাক্ষাৎকারের আত্মবিশ্বাস এবং
            লক্ষ্যভিত্তিক আবেদনে মনোযোগ দিন।
          </p>
        </div>
        <div className="dimensions">
          {[
            ["ক্যারিয়ারের স্পষ্টতা", 75 + goal],
            ["মূল দক্ষতা", 68 + answer],
            ["চাকরি খোঁজার প্রস্তুতি", 54 + goal * 2],
            ["কর্মক্ষেত্রের আত্মবিশ্বাস", 62 + answer * 2],
          ].map((x) => (
            <div key={x[0]}>
              <span>
                {x[0]}
                <b>{x[1]}%</b>
              </span>
              <i>
                <em style={{ width: x[1] + "%" }} />
              </i>
            </div>
          ))}
        </div>
      </div>
      <div className="recommend">
        <b>প্রস্তাবিত পথ</b>
        <span>চাকরি প্রস্তুতি স্প্রিন্ট · ৪ সপ্তাহ</span>
        <button onClick={() => go(4)}>আমার পরিকল্পনা দেখুন →</button>
      </div>
    </>,
    <>
      <Title
        n="০৫"
        name="ব্যক্তিগত ক্যারিয়ার পরিকল্পনা"
        h="কাস্টমার এক্সপেরিয়েন্স ভূমিকায় আপনার পথ"
        p="ক্রম অনুযায়ী কাজগুলো শেষ করুন। অগ্রগতির সঙ্গে পরিকল্পনা হালনাগাদ হবে।"
      />
      <div className="plan">
        {[
          ["done", "ক্যারিয়ার প্রোফাইল সম্পন্ন করুন", "১০ মিনিট"],
          ["current", "গ্রাহকসেবার মৌলিক বিষয়", "২ ঘণ্টা"],
          ["", "ভূমিকাভিত্তিক সিভি তৈরি করুন", "৩০ মিনিট"],
          ["", "মক সাক্ষাৎকার অনুশীলন করুন", "২০ মিনিট"],
          ["", "মিলে যাওয়া ৩টি পদে আবেদন করুন", "এই সপ্তাহে"],
        ].map((x, i) => (
          <div className={x[0]} key={x[1]}>
            <i>{x[0] === "done" ? "✓" : i + 1}</i>
            <span>
              <b>{x[1]}</b>
              <small>{x[2]}</small>
            </span>
            {x[0] === "current" && <button>চালিয়ে যান →</button>}
          </div>
        ))}
      </div>
    </>,
    <>
      <Title
        n="০৭"
        name="কাউন্সেলিং"
        h="ক্যারিয়ার কাউন্সেলরের সঙ্গে কথা বলুন"
        p="আপনার মূল্যায়নে একাধিক আগ্রহ দেখা গেছে, তাই এই সেশনটি সুপারিশ করা হয়েছে।"
      />
      <div className="counselling">
        <div className="counsellor">
          <div>সা</div>
          <span>
            <small>আপনার জন্য সুপারিশকৃত</small>
            <h3>সামিরা আহমেদ</h3>
            <p>ক্যারিয়ার কাউন্সেলর · ৬ বছরের অভিজ্ঞতা</p>
            <em>বাংলা · ইংরেজি · অনলাইন</em>
          </span>
        </div>
        <div className="slots">
          <b>তারিখ নির্বাচন করুন</b>
          <div>
            {["সোম|১৮", "মঙ্গল|১৯", "বুধ|২০", "বৃহঃ|২১"].map((x, i) => (
              <button className={i === 1 ? "chosen" : ""} key={x}>
                {x.split("|")[0]}
                <b>{x.split("|")[1]}</b>
              </button>
            ))}
          </div>
          <b>খালি সময়</b>
          <div>
            {["সকাল ১০:০০", "সকাল ১১:৩০", "বিকেল ৩:০০"].map((x, i) => (
              <button className={i === 1 ? "chosen" : ""} key={x}>
                {x}
              </button>
            ))}
          </div>
          <button onClick={() => setBooked(true)} className="primary full">
            {booked ? "✓ সেশন বুক হয়েছে" : "বিনামূল্যে সেশন বুক করুন →"}
          </button>
        </div>
      </div>
    </>,
    <>
      <Title
        n="০৮"
        name="প্রস্তুতি"
        h="আপনার আবেদনকে আলাদা করে তুলুন"
        p="নির্বাচিত ভূমিকার প্রমাণ তৈরি করুন এবং আত্মবিশ্বাসের সঙ্গে উপস্থাপনের অনুশীলন করুন।"
      />
      <div className="tools">
        {[
          [
            "▤",
            "সিভি নির্মাতা",
            "কাস্টমার এক্সপেরিয়েন্স সিভি",
            "যোগাযোগ, সেবা ও সমস্যা সমাধানের দক্ষতা তুলে ধরতে তৈরি।",
          ],
          [
            "◉",
            "মক সাক্ষাৎকার",
            "এআই কোচের সঙ্গে অনুশীলন",
            "ভূমিকাভিত্তিক ৬টি প্রশ্নের উত্তর দিন এবং কার্যকর মতামত পান।",
          ],
        ].map((x, i) => (
          <article key={x[1]}>
            <i>{x[0]}</i>
            <small>{x[1]}</small>
            <h3>{x[2]}</h3>
            <p>{x[3]}</p>
            <div className="toolbar">
              <em style={{ width: cvReady ? "100%" : "75%" }} />
            </div>
            <b>
              {cvReady
                ? "✓ সম্পন্ন"
                : i === 0
                  ? "৭৫% সম্পন্ন"
                  : "এখনও শুরু হয়নি"}
            </b>
            <button onClick={() => setCvReady(true)}>
              {cvReady ? "ফলাফল দেখুন" : "শুরু করুন →"}
            </button>
          </article>
        ))}
      </div>
    </>,
    <>
      <Title
        n="০৯"
        name="যাচাইকৃত সুযোগের মিল"
        h="ওয়েব ও প্ল্যাটফর্ম থেকে আপনার জন্য সেরা সুযোগ"
        p="কোম্পানির ওয়েবসাইট ও ক্যারিয়ার হাবের চাকরির পোস্ট যাচাই করে প্রোফাইল, দক্ষতা ও পছন্দ অনুযায়ী সাজানো।"
      />
      <div className="jobs">
        {[
          [
            "৯২%",
            "জুনিয়র কাস্টমার এক্সপেরিয়েন্স এক্সিকিউটিভ",
            "আড়ং",
            "ঢাকা · পূর্ণকালীন",
          ],
          [
            "৮৭%",
            "কাস্টমার সাপোর্ট অ্যাসোসিয়েট",
            "বিকাশ",
            "ঢাকা · পূর্ণকালীন",
          ],
          [
            "৮১%",
            "সার্ভিস সেন্টার শিক্ষানবিশ",
            "ব্র্যাক ব্যাংক",
            "ঢাকা · শিক্ষানবিশি",
          ],
        ].map((j, i) => (
          <article key={j[1]}>
            <i>{["A", "b", "B"][i]}</i>
            <div>
              <span>{j[0]} মিল</span>
              <h3>{j[1]}</h3>
              <b>{j[2]}</b>
              <p>{j[3]} · প্রারম্ভিক স্তর</p>
            </div>
            <button
              onClick={() =>
                setApplied((v) =>
                  v.includes(i) ? v.filter((x) => x !== i) : [...v, i],
                )
              }
            >
              {applied.includes(i) ? "✓ আবেদন সম্পন্ন" : "দেখুন ও আবেদন করুন →"}
            </button>
          </article>
        ))}
      </div>
    </>,
    <>
      <Title
        n="১০"
        name="অগ্রগতি"
        h="চাকরিতে যোগদানের পরও আপনার যাত্রা চলবে"
        p="ফলাফল নথিভুক্ত করুন, যাতে ক্যারিয়ার হাব আপনার পরিবর্তন ও বিকাশে সহায়তা করতে পারে।"
      />
      <div className="outcome">
        <div className="success">
          <i>{joined ? "✓" : "○"}</i>
          <div>
            <small>বর্তমান অবস্থা</small>
            <h3>
              {joined ? "নতুন পদে যোগ দিয়েছেন" : "আবেদনের ফলাফল অপেক্ষমাণ"}
            </h3>
            <p>
              {joined
                ? "জুনিয়র কাস্টমার এক্সপেরিয়েন্স এক্সিকিউটিভ · ০২ আগস্ট ২০২৬"
                : `${applied.length}টি আবেদন জমা হয়েছে`}
            </p>
          </div>
          <button onClick={() => setJoined(!joined)}>
            {joined ? "পরিবর্তন" : "যোগদান রেকর্ড করুন"}
          </button>
        </div>
        <div className="follow">
          <h3>আপনার ফলো-আপ যাত্রা</h3>
          {[
            ["done", "যোগদান যাচাই", "সম্পন্ন"],
            ["current", "৩ মাসের ফলো-আপ", "০২ নভেম্বর ২০২৬"],
            ["", "৬ মাসের ফলো-আপ", "০২ ফেব্রুয়ারি ২০২৭"],
          ].map((x, i) => (
            <div className={joined ? x[0] : ""} key={x[1]}>
              <i>{joined && x[0] === "done" ? "✓" : i + 1}</i>
              <span>
                <b>{x[1]}</b>
                <small>{joined ? x[2] : "যোগদানের পর সক্রিয় হবে"}</small>
              </span>
              {joined && x[0] === "current" && <button>রিমাইন্ডার দিন</button>}
            </div>
          ))}
        </div>
      </div>
    </>,
  ];
  const courseScreen = (
    <>
      <Title
        n="০৬"
        name="সুপারিশকৃত কোর্স"
        h="আপনার প্রস্তুতির ঘাটতি পূরণে নির্বাচিত কোর্স"
        p="AI মূল্যায়ন ও ক্যারিয়ার লক্ষ্য অনুযায়ী অগ্রাধিকার দিয়ে সাজানো।"
      />
      <div className="jobs">
        {[
          [
            "৯৬%",
            "গ্রাহকসেবার মৌলিক বিষয়",
            "BRAC Career Hub",
            "২ ঘণ্টা · অনলাইন",
          ],
          [
            "৮৯%",
            "কর্মক্ষেত্রে যোগাযোগ",
            "BRAC Skills Development",
            "৪ সপ্তাহ · মিশ্র",
          ],
          ["৮২%", "ডিজিটাল কর্মদক্ষতা", "মুক্তপাঠ", "৬ ঘণ্টা · অনলাইন"],
        ].map((c, i) => (
          <article key={c[1]}>
            <i>{["◎", "◇", "✦"][i]}</i>
            <div>
              <span>{c[0]} প্রাসঙ্গিক</span>
              <h3>{c[1]}</h3>
              <b>{c[2]}</b>
              <p>{c[3]} · যাচাইকৃত প্রশিক্ষণ</p>
            </div>
            <button
              onClick={() =>
                setCourseEnrolled((v) =>
                  v.includes(i) ? v.filter((x) => x !== i) : [...v, i],
                )
              }
            >
              {courseEnrolled.includes(i)
                ? "✓ পরিকল্পনায় যোগ হয়েছে"
                : "পরিকল্পনায় যোগ করুন →"}
            </button>
          </article>
        ))}
      </div>
    </>
  );
  const careerScreen = (
    <>
      <Title
        n="০৪"
        name="সম্ভাব্য ক্যারিয়ার পথ"
        h={(profile.name || "আপনার") + " জন্য তিনটি সম্ভাবনাময় পথ"}
        p="আপনার শিক্ষা, দক্ষতা, আগ্রহ ও লক্ষ্য বিশ্লেষণ করে AI এগুলো অগ্রাধিকার দিয়েছে।"
      />
      <div className="careerPaths">
        {[
          [
            "৯২%",
            "কাস্টমার এক্সপেরিয়েন্স এক্সিকিউটিভ",
            "মানুষকে সহায়তা, যোগাযোগ ও সমস্যা সমাধান",
            "শুরুর বেতন ৳২২–৩২ হাজার",
          ],
          [
            "৮৫%",
            "বিজনেস ডেভেলপমেন্ট অ্যাসোসিয়েট",
            "সম্পর্ক তৈরি, উপস্থাপনা ও লক্ষ্য অর্জন",
            "শুরুর বেতন ৳২৫–৩৮ হাজার",
          ],
          [
            "৭৯%",
            "প্রজেক্ট অ্যাসিস্ট্যান্ট",
            "সমন্বয়, রিপোর্টিং ও উন্নয়ন খাতের কাজ",
            "শুরুর বেতন ৳২৪–৩৫ হাজার",
          ],
        ].map((c, i) => (
          <button
            className={selectedCareer === i ? "selected" : ""}
            onClick={() => setSelectedCareer(i)}
            key={c[1]}
          >
            <span>{c[0]} মিল</span>
            <h3>{c[1]}</h3>
            <p>{c[2]}</p>
            <small>{c[3]}</small>
            <i>
              {selectedCareer === i ? "✓ নির্বাচিত" : "পথটি নির্বাচন করুন →"}
            </i>
          </button>
        ))}
      </div>
    </>
  );
  const gapReportScreen = (
    <>
      <Title
        n="০৫"
        name="বিস্তারিত ক্যারিয়ার প্রস্তুতি রিপোর্ট"
        h={(profile.name || "আপনার") + "-এর শক্তি ও উন্নতির ক্ষেত্র"}
        p="নির্বাচিত ক্যারিয়ার পথের জন্য কোন দক্ষতা আছে, কোনটি কম এবং কীভাবে ঘাটতি পূরণ করবেন।"
      />
      <div className="report">
        <div className="score">
          <div>
            <b>{Math.min(100, 65 + answer * 3 + profileBoost)}</b>
            <small>/১০০</small>
          </div>
          <strong>চাকরির জন্য বিকাশমান</strong>
          <p>
            আপনার যোগাযোগ ও শেখার সক্ষমতা ভালো। বাস্তব কাজের প্রমাণ এবং
            সাক্ষাৎকারের অনুশীলন দরকার।
          </p>
        </div>
        <div className="dimensions">
          {[
            ["যোগাযোগ দক্ষতা", 78 + answer],
            ["ডিজিটাল দক্ষতা", 62 + profileBoost],
            ["ভূমিকাভিত্তিক জ্ঞান", 56 + selectedCareer * 3],
            ["সাক্ষাৎকার প্রস্তুতি", 48 + goal * 4],
          ].map((x) => (
            <div key={x[0]}>
              <span>
                {x[0]}
                <b>{x[1]}%</b>
              </span>
              <i>
                <em style={{ width: x[1] + "%" }} />
              </i>
            </div>
          ))}
        </div>
      </div>
      <div className="gapGrid">
        <article className="strength">
          <b>আপনার শক্তি</b>
          <h3>যোগাযোগ ও মানুষকে বোঝা</h3>
          <p>
            প্রশ্নমালায় পরিষ্কারভাবে ধারণা বোঝানো এবং দলগত কাজে আগ্রহ দেখা
            গেছে।
          </p>
        </article>
        <article className="gap">
          <b>প্রধান ঘাটতি</b>
          <h3>কাজের বাস্তব প্রমাণ</h3>
          <p>
            পোর্টফোলিও বা প্রকল্পের উদাহরণ নেই। একটি customer-handling case তৈরি
            করুন।
          </p>
        </article>
        <article className="gap">
          <b>উন্নতির অগ্রাধিকার</b>
          <h3>সাক্ষাৎকারে আত্মবিশ্বাস</h3>
          <p>STAR পদ্ধতিতে ৬টি ভূমিকা-ভিত্তিক প্রশ্ন অনুশীলন করুন।</p>
        </article>
      </div>
      <div className="recommend">
        <b>পরবর্তী সেরা পদক্ষেপ</b>
        <span>প্রস্তাবিত কোর্স শেষ করুন · তারপর CV তৈরি করুন</span>
        <button onClick={() => go(5)}>কোর্স দেখুন →</button>
      </div>
    </>
  );
  const profileBookingScreen = (
    <>
      <Title
        n="০১"
        name="ক্যারিয়ার প্রোফাইল ও বুকিং"
        h="আপনার লক্ষ্য জানান এবং কাউন্সেলিং কল বুক করুন"
        p="প্রাথমিক তথ্য কাউন্সেলরকে আপনার পরিস্থিতি বুঝে সঠিক মূল্যায়ন নির্ধারণ করতে সাহায্য করবে।"
      />
      <div className="counselling">
        <div className="formCard">
          <label>
            নাম
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="আপনার পূর্ণ নাম"
            />
          </label>
          <label>
            শিক্ষার স্তর
            <input
              value={profile.education}
              onChange={(e) =>
                setProfile({ ...profile, education: e.target.value })
              }
              placeholder="যেমন: স্নাতক / HSC"
            />
          </label>
          <label>
            বিষয় বা বিভাগ
            <input
              value={profile.field}
              onChange={(e) =>
                setProfile({ ...profile, field: e.target.value })
              }
              placeholder="আপনার অধ্যয়নের বিষয়"
            />
          </label>
          <label>
            তাৎক্ষণিক ক্যারিয়ার লক্ষ্য
            <select
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
            >
              <option value={0}>ক্যারিয়ার দিকনির্দেশনা চাই</option>
              <option value={1}>দক্ষতা গড়তে চাই</option>
              <option value={2}>আবেদন প্রস্তুতি চাই</option>
              <option value={3}>চাকরির সুযোগ চাই</option>
            </select>
          </label>
        </div>
        <div className="slots">
          <b>কাউন্সেলিং কলের তারিখ</b>
          <div>
            {["সোম|১৮", "মঙ্গল|১৯", "বুধ|২০", "বৃহঃ|২১"].map((x, i) => (
              <button className={i === 1 ? "chosen" : ""} key={x}>
                {x.split("|")[0]}
                <b>{x.split("|")[1]}</b>
              </button>
            ))}
          </div>
          <b>খালি সময়</b>
          <div>
            {["সকাল ১০:০০", "সকাল ১১:৩০", "বিকেল ৩:০০"].map((x, i) => (
              <button className={i === 1 ? "chosen" : ""} key={x}>
                {x}
              </button>
            ))}
          </div>
          <button onClick={() => setBooked(true)} className="primary full">
            {booked ? "✓ কল বুক হয়েছে" : "কাউন্সেলিং কল বুক করুন →"}
          </button>
          <p className="bookingNote">
            বুকিং নিশ্চিত হলে SMS-এ কলের তথ্য পাঠানো হবে।
          </p>
        </div>
      </div>
    </>
  );
  const counsellingAssignmentScreen = (
    <>
      <Title
        n="০২"
        name="১:১ কাউন্সেলিং"
        h="কাউন্সেলর আপনার আকাঙ্ক্ষা শুনে মূল্যায়ন নির্ধারণ করবেন"
        p="শিক্ষা, অভিজ্ঞতা, আগ্রহ, বাধা ও তাৎক্ষণিক লক্ষ্য নিয়ে একটি কাঠামোবদ্ধ আলোচনা হবে।"
      />
      <div className="counselling">
        <div className="counsellor">
          <div>সা</div>
          <span>
            <small>নির্ধারিত কাউন্সেলর</small>
            <h3>সামিরা আহমেদ</h3>
            <p>ক্যারিয়ার কাউন্সেলর · ৬ বছরের অভিজ্ঞতা</p>
            <em>বাংলা · ইংরেজি · অনলাইন</em>
          </span>
        </div>
        <div className="assignmentCard">
          <small>COUNSELLOR ACTION NOTE</small>
          <h3>আপনার জন্য নির্ধারিত মূল্যায়ন</h3>
          <ul>
            <li>ক্যারিয়ার আগ্রহ মূল্যায়ন</li>
            <li>মূল দক্ষতা মূল্যায়ন</li>
            <li>চাকরি-প্রস্তুতি মূল্যায়ন</li>
          </ul>
          <button className="primary full" onClick={() => go(2)}>
            নির্ধারিত মূল্যায়ন শুরু করুন →
          </button>
        </div>
      </div>
    </>
  );
  const developmentTasks = [
    ["done", "প্রোফাইল ও কাউন্সেলিং সম্পন্ন", "সম্পন্ন"],
    [
      courseEnrolled.includes(0) ? "done" : "current",
      "গ্রাহকসেবার মৌলিক বিষয়",
      "২ ঘণ্টা · অনলাইন",
    ],
    [
      courseEnrolled.includes(1) ? "done" : "",
      "কর্মক্ষেত্রে যোগাযোগ",
      "৪ সপ্তাহ · মিশ্র",
    ],
    ["", "ভূমিকাভিত্তিক CV তৈরি", "৩০ মিনিট"],
    ["", "মক সাক্ষাৎকার অনুশীলন", "২০ মিনিট"],
  ];
  const developmentPlanScreen = (
    <>
      <Title
        n="০৫"
        name="ব্যক্তিগত উন্নয়ন পরিকল্পনা"
        h="আপনার কোর্স, কাজ ও মাইলস্টোন এক জায়গায়"
        p="কাউন্সেলর-অনুমোদিত পরিকল্পনা অনুযায়ী কাজ শেষ করুন। অগ্রগতির সঙ্গে পরিকল্পনা হালনাগাদ হবে।"
      />
      <div className="planProgress">
        <div>
          <span>পরিকল্পনার অগ্রগতি</span>
          <b>{25 + courseEnrolled.length * 20}%</b>
        </div>
        <i>
          <em style={{ width: 25 + courseEnrolled.length * 20 + "%" }} />
        </i>
      </div>
      <div className="plan">
        {developmentTasks.map((x, i) => (
          <div className={x[0]} key={x[1]}>
            <i>{x[0] === "done" ? "✓" : i + 1}</i>
            <span>
              <b>{x[1]}</b>
              <small>{x[2]}</small>
            </span>
            {i > 0 && i < 3 && (
              <button
                onClick={() =>
                  setCourseEnrolled((v) =>
                    v.includes(i - 1)
                      ? v.filter((x) => x !== i - 1)
                      : [...v, i - 1],
                  )
                }
              >
                {courseEnrolled.includes(i - 1)
                  ? "সম্পন্ন হয়েছে"
                  : "কোর্স শুরু করুন →"}
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
  const placementScreen = (
    <>
      <Title
        n="০৮"
        name="প্লেসমেন্ট ও ফলাফল ট্র্যাকিং"
        h="আবেদন থেকে যোগদান—প্রতিটি ফলাফল নথিভুক্ত করুন"
        p="ক্যারিয়ার হাব আপনার আবেদন, সাক্ষাৎকার, অফার এবং যোগদানের অবস্থা অনুসরণ করবে।"
      />
      <div className="outcome">
        <div className="success">
          <i>{joined ? "✓" : "○"}</i>
          <div>
            <small>বর্তমান অবস্থা</small>
            <h3>
              {joined ? "নতুন পদে যোগ দিয়েছেন" : "আবেদন ও সাক্ষাৎকার চলছে"}
            </h3>
            <p>
              {joined
                ? "জুনিয়র কাস্টমার এক্সপেরিয়েন্স এক্সিকিউটিভ · ০২ আগস্ট ২০২৬"
                : `${applied.length}টি আবেদন জমা হয়েছে`}
            </p>
          </div>
          <button onClick={() => setJoined(!joined)}>
            {joined ? "অবস্থা পরিবর্তন" : "যোগদান রেকর্ড করুন"}
          </button>
        </div>
        <div className="placementStats">
          <div>
            <b>{applied.length}</b>
            <span>আবেদন</span>
          </div>
          <div>
            <b>{Math.min(applied.length, 2)}</b>
            <span>সাক্ষাৎকার</span>
          </div>
          <div>
            <b>{joined ? 1 : 0}</b>
            <span>যোগদান</span>
          </div>
        </div>
      </div>
    </>
  );
  const followUpScreen = (
    <>
      <Title
        n="০৯"
        name="৩ ও ৬ মাসের ফলো-আপ"
        h="চাকরিতে যোগদানের পরও Career Hub পাশে থাকবে"
        p="Career Hub নির্ধারিত সময়ে ফোন করে চাকরির অবস্থা, অগ্রগতি, চ্যালেঞ্জ এবং অতিরিক্ত সহায়তার প্রয়োজন জানবে।"
      />
      <div className="follow followFull">
        <h3>আপনার ফলো-আপ সময়সূচি</h3>
        {[
          ["done", "যোগদান যাচাই কল", "সম্পন্ন · ০৫ আগস্ট ২০২৬"],
          ["current", "৩ মাসের ফলো-আপ কল", "০২ নভেম্বর ২০২৬"],
          ["", "৬ মাসের ফলো-আপ কল", "০২ ফেব্রুয়ারি ২০২৭"],
        ].map((x, i) => (
          <div className={joined ? x[0] : ""} key={x[1]}>
            <i>{joined && x[0] === "done" ? "✓" : i + 1}</i>
            <span>
              <b>{x[1]}</b>
              <small>{joined ? x[2] : "যোগদানের পর সক্রিয় হবে"}</small>
            </span>
            {joined && i > 0 && <button>কল রিমাইন্ডার দিন</button>}
          </div>
        ))}
      </div>
      <div className="followCallout">
        <b>ফলো-আপে যা জানা হবে</b>
        <span>
          চাকরিতে আছেন কি না · ভূমিকার পরিবর্তন · কর্মক্ষেত্রের চ্যালেঞ্জ · নতুন
          দক্ষতার প্রয়োজন · Career Hub-এর অতিরিক্ত সহায়তা
        </span>
      </div>
    </>
  );
  const ordered = [
    profileBookingScreen,
    counsellingAssignmentScreen,
    screens[3],
    screens[4],
    careerScreen,
    developmentPlanScreen,
    screens[7],
    screens[8],
    placementScreen,
    followUpScreen,
  ];
  return ordered[step];
};
function Title({
  n,
  name,
  h,
  p,
}: {
  n: string;
  name: string;
  h: string;
  p: string;
}) {
  const corrected: Record<string, string> = {
    "সম্ভাব্য ক্যারিয়ার পথ": "০৫",
    "ব্যক্তিগত উন্নয়ন পরিকল্পনা": "০৬",
    প্রস্তুতি: "০৭",
    "যাচাইকৃত সুযোগের মিল": "০৮",
    "প্লেসমেন্ট ও ফলাফল ট্র্যাকিং": "০৯",
    "৩ ও ৬ মাসের ফলো-আপ": "১০",
  };
  return (
    <div className="portalTitle">
      <span>
        ধাপ {corrected[name] || n} · {name}
      </span>
      <h1>{h}</h1>
      <p>{p}</p>
    </div>
  );
}

function Portal({ initial, exit }: { initial: number; exit: () => void }) {
  const [step, setStep] = useState(initial);
  return (
    <main className="portal">
      <header className="portalNav">
        <Mark />
        <div>
          <button>English</button>
          <button>◌</button>
          <i>রা</i>
          <span>
            <b>রাফিয়া আক্তার</b>
            <small>আমার যাত্রা</small>
          </span>
          <button onClick={exit}>×</button>
        </div>
      </header>
      <div className="portalLayout">
        <aside>
          <div className="asideHead">
            <small>আপনার অগ্রগতি</small>
            <b>১০টি ধাপের মধ্যে {step + 1}টি</b>
            <div>
              <i style={{ width: ((step + 1) / 10) * 100 + "%" }} />
            </div>
          </div>
          <nav>
            {steps.map((s, i) => (
              <button
                className={
                  (i === step ? "active " : "") + (i < step ? "done" : "")
                }
                onClick={() => setStep(i)}
                key={s[0]}
              >
                <i>{i < step ? "✓" : i + 1}</i>
                <span>
                  <b>{s[0]}</b>
                  <small>{s[1]}</small>
                </span>
              </button>
            ))}
          </nav>
          <div className="help">
            <b>সহায়তা দরকার?</b>
            <p>ক্যারিয়ার হাব কাউন্সেলরের সঙ্গে কথা বলুন।</p>
            <button onClick={() => setStep(1)}>কাউন্সেলিং দেখুন →</button>
          </div>
        </aside>
        <section className="workspace">
          <div className="workspaceInner">
            <Content step={step} go={setStep} />
          </div>
          <footer className="portalFooter">
            <button onClick={() => (step ? setStep(step - 1) : exit())}>
              ← {step ? "পেছনে" : "হোম"}
            </button>
            <button
              className="primary"
              onClick={() => (step < 9 ? setStep(step + 1) : exit())}
            >
              {step < 9 ? "সংরক্ষণ করে এগিয়ে যান →" : "যাত্রা শেষ করুন ✓"}
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default function LandingExperience({ heroVariant, hub }: { heroVariant?: HeroVariant; hub?: "v2" | "v3" }) {
  const [portal, setPortal] = useState<number | null>(null);
  const [studyAbroad, setStudyAbroad] = useState(false);
  const [hubOpened, setHubOpened] = useState(false);
  // One platform: both pathways open the same Career Hub, where Study Abroad is a section.
  // The hub stays mounted after the first visit so going home doesn't reset it.
  if (hub) {
    const openHub = () => { setHubOpened(true); setPortal(0); };
    return <>
      <div hidden={portal !== null}>
        <Home heroVariant={heroVariant} start={openHub} startStudy={openHub} />
      </div>
      <div hidden={portal === null}>
        {hubOpened && (hub === "v3"
          ? <HubV3 active={portal !== null} exit={() => setPortal(null)} />
          : <UnifiedHub active={portal !== null} exit={() => setPortal(null)} />)}
      </div>
    </>;
  }
  return <>
    <div hidden={!studyAbroad}>
      {studyAbroad && (
      <StudyAbroad
        exit={() => setStudyAbroad(false)}
        openCareerGuide={() => {
          setStudyAbroad(false);
          setPortal(1);
        }}
      />
      )}
    </div>
    <div hidden={studyAbroad || portal !== null}>
    <Home
      heroVariant={heroVariant}
      start={(n = 0) => setPortal(n)}
      startStudy={() => setStudyAbroad(true)}
    />
    </div>
    <div hidden={studyAbroad || portal === null}>
      <CareerWorkspace active={!studyAbroad && portal !== null} entry={portal === 1 ? "counselling" : portal === 6 ? "cv" : portal === 5 ? "plan" : "overview"} exit={() => setPortal(null)} />
    </div>
  </>;
}
