"use client";
import { useEffect, useState } from "react";
import { DocumentPaper } from "../shared/document-paper";
import { groups, fieldValue, text, type Language, type Profile } from "./data";
type Inputs={education:string;experience:string;skills:string;direction:string};
function fromProfile(profile:Profile,language:Language):Inputs {
  const t=(copy:readonly[string,string])=>text(language,copy);
  const role=fieldValue(groups[2].fields[0],profile,language);
  const qualification=fieldValue(groups[0].fields[1],profile,language);
  return {
    // Parts can be missing after the short questionnaire, so empty ones are skipped.
    education:[[profile.institution,qualification].filter(Boolean).join(" — "),[profile.subject,profile.graduation].filter(Boolean).join(" · "),profile.scale&&profile.scale!=="pending"?t(["Grade","ফলাফল"])+": "+profile.grade+"/"+profile.scale:""].filter(Boolean).join("\n"),
    experience:[profile.experience!=="none"?profile.experienceDetail:"",profile.projects].filter(Boolean).join("\n\n"),
    skills:[profile.skills,profile.certifications].filter(Boolean).join("\n"),
    direction:t(["Interested in ","আগ্রহের ক্ষেত্র: "])+role,
  };
}
export function CVStudio({language,profile,seeded,onDraft}:{language:Language;profile:Profile;seeded:boolean;onDraft:()=>void}) {
  const t=(copy:readonly[string,string])=>text(language,copy);
  const [inputs,setInputs]=useState<Record<Language,Inputs>>(()=>({en:fromProfile(profile,"en"),bn:fromProfile(profile,"bn")}));
  const makeDocument=(lang:Language,values:Inputs)=>{
    const copy=(en:string,bn:string)=>text(lang,[en,bn]);
    return profile.name+"\n"+profile.email+"\n\n"+copy("PROFESSIONAL DIRECTION","পেশাগত লক্ষ্য")+"\n"+values.direction+"\n\n"+copy("EDUCATION","শিক্ষা")+"\n"+values.education+"\n\n"+copy("EXPERIENCE & PROJECTS","অভিজ্ঞতা ও প্রকল্প")+"\n"+values.experience+"\n\n"+copy("SKILLS & CERTIFICATIONS","দক্ষতা ও সার্টিফিকেট")+"\n"+values.skills;
  };
  const [documents,setDocuments]=useState<Record<Language,string>>(()=>({en:seeded?makeDocument("en",fromProfile(profile,"en")):"",bn:seeded?makeDocument("bn",fromProfile(profile,"bn")):""}));
  const [titles,setTitles]=useState<Record<Language,string>>({en:profile.name+" · Career CV",bn:profile.name+" · পেশাগত সিভি"});
  const [stream,setStream]=useState<{language:Language;content:string;visible:number}|null>(null);
  const [mode,setMode]=useState<"edit"|"preview">("preview");
  const [mobileTab,setMobileTab]=useState<"inputs"|"document">("inputs");
  const [template,setTemplate]=useState("classic");
  const [notice,setNotice]=useState<"copied"|"failed"|"updated"|null>(null);
  useEffect(()=>{
    if(!stream||stream.visible>=stream.content.length)return;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer=setTimeout(()=>setStream(s=>s?{...s,visible:reduced?s.content.length:Math.min(s.visible+8,s.content.length)}:null),16);
    return ()=>clearTimeout(timer);
  },[stream]);
  const busy=!!stream&&stream.visible<stream.content.length;
  const output=stream?.language===language?stream.content.slice(0,stream.visible):documents[language];
  function generate(){
    const content=makeDocument(language,inputs[language]);
    setDocuments(d=>({...d,[language]:content}));setStream({language,content,visible:0});setMode("preview");setMobileTab("document");setNotice(null);onDraft();
  }
  const inputLabels={education:["Education and qualifications","শিক্ষা ও যোগ্যতা"],experience:["Experience and projects","অভিজ্ঞতা ও প্রকল্প"],skills:["Skills and achievements","দক্ষতা ও অর্জন"],direction:["Target role and professional direction","পছন্দের পদ ও পেশাগত লক্ষ্য"]} as const;
  return <div className="career-cv">
    <header className="career-heading"><h1>{t(["CV Studio","সিভি স্টুডিও"])}</h1><p>{t(["Shape your experience into a clear, focused CV.","আপনার অভিজ্ঞতা দিয়ে স্পষ্ট, লক্ষ্যভিত্তিক সিভি তৈরি করুন।"])}</p></header>
    <div className="career-tabs career-cv-tabs" role="group" aria-label={t(["CV workspace view","সিভি ওয়ার্কস্পেস ভিউ"])}>{(["inputs","document"] as const).map(value=><button key={value} className={value===mobileTab?"active":""} aria-pressed={value===mobileTab} onClick={()=>setMobileTab(value)}>{value==="inputs"?t(["Your information","আপনার তথ্য"]):t(["Your CV","আপনার সিভি"])}</button>)}</div>
    <div className="career-cv-split">
      <section className={"career-cv-input "+(mobileTab!=="inputs"?"mobile-hidden":"")}><header><h2>{t(["Your information","আপনার তথ্য"])}</h2><p>{t(["Prefilled from your profile. Add detail before generating.","প্রোফাইল থেকে পূরণ করা হয়েছে। তৈরির আগে বিস্তারিত যোগ করুন।"])}</p></header>
        <form onSubmit={e=>{e.preventDefault();generate();}}>
          {(Object.keys(inputLabels) as (keyof Inputs)[]).map(key=><label key={key}><span>{t(inputLabels[key])}</span><textarea rows={4} required value={inputs[language][key]} onChange={e=>{const value=e.target.value;setInputs(s=>({...s,[language]:{...s[language],[key]:value}}));}}/></label>)}
          <button className="career-button primary" disabled={busy} type="submit">{busy?t(["Generating…","তৈরি হচ্ছে…"]):documents[language]?t(["Generate another draft","নতুন খসড়া তৈরি"]):t(["Generate CV","সিভি তৈরি করুন"])} <span aria-hidden="true">✦</span></button>
          <button className="career-link" type="button" disabled={busy} onClick={()=>{setInputs(s=>({...s,[language]:fromProfile(profile,language)}));setNotice("updated");}}>{t(["Refresh inputs from my profile","প্রোফাইল থেকে তথ্য আবার আনুন"])}</button>
          <small>{t(["Sample generation uses your inputs. Review all details before sharing.","নমুনা তৈরিতে আপনার তথ্য ব্যবহার হয়। শেয়ার করার আগে সব তথ্য যাচাই করুন।"])}</small>
        </form>
      </section>
      <section className={"career-cv-output "+(mobileTab!=="document"?"mobile-hidden":"")}><header><h2>{t(["Your CV","আপনার সিভি"])}</h2><span className="career-small">{t(["Drafts stay in this session","খসড়া এই সেশনে থাকবে"])}</span></header>
        {documents[language]?<>
          <input className="career-document-title" aria-label={t(["Document title","ডকুমেন্টের শিরোনাম"])} value={titles[language]} onChange={e=>{const value=e.target.value;setTitles(s=>({...s,[language]:value}));}}/>
          <div className="career-cv-toolbar"><div className="career-language" role="group" aria-label={t(["Editor mode","সম্পাদনার মোড"])}><button disabled={busy} aria-pressed={mode==="edit"} onClick={()=>{setStream(null);setMode("edit");}}>{t(["Edit","সম্পাদনা"])}</button><button aria-pressed={mode==="preview"} onClick={()=>setMode("preview")}>{t(["Preview","প্রিভিউ"])}</button></div>
            <select aria-label={t(["CV template","সিভি টেমপ্লেট"])} value={template} onChange={e=>setTemplate(e.target.value)}><option value="classic">{t(["Classic","ক্লাসিক"])}</option><option value="modern">{t(["Modern","আধুনিক"])}</option><option value="minimal">{t(["Minimal","সাধারণ"])}</option></select></div>
          <DocumentPaper value={output} editing={mode==="edit"&&!busy} label={t(["CV content","সিভির লেখা"])} template={template} streaming={busy&&stream?.language===language} onChange={value=>setDocuments(s=>({...s,[language]:value}))}/>
          <div className="career-inline-actions"><button className="career-button" disabled={busy} onClick={async()=>{try{await navigator.clipboard.writeText(documents[language]);setNotice("copied");}catch{setNotice("failed");}}}>{t(["Copy","কপি"])}</button><button className="career-button" disabled={busy} onClick={()=>{const url=URL.createObjectURL(new Blob([documents[language]],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=titles[language]+".txt";a.click();URL.revokeObjectURL(url);}}>{t(["Download text","টেক্সট ডাউনলোড"])}</button><span className="career-small">{output.trim().split(/\s+/).length} {t(["words","শব্দ"])}</span></div>
        </>:<div className="career-cv-empty"><h3>{t(["Your next chapter, on paper.","আপনার পরবর্তী অধ্যায়, কাগজে।"])}</h3><p>{t(["Add your experience on the left, then generate a draft to edit here.","আপনার অভিজ্ঞতা যোগ করুন, তারপর এখানে সম্পাদনার জন্য খসড়া তৈরি করুন।"])}</p></div>}
        <p role="status" className="career-small">{notice==="copied"?t(["Copied to clipboard.","ক্লিপবোর্ডে কপি হয়েছে।"]):notice==="failed"?t(["Copy unavailable. Select the text in Edit mode or download it.","কপি করা যায়নি। সম্পাদনা মোডে লেখা নির্বাচন করুন বা ডাউনলোড করুন।"]):notice==="updated"?t(["Inputs refreshed from your profile.","প্রোফাইল থেকে তথ্য আনা হয়েছে।"]):busy?t(["Generating your sample CV…","আপনার নমুনা সিভি তৈরি হচ্ছে…"]):""}</p>
      </section>
    </div>
  </div>;
}
