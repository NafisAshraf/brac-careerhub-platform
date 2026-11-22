import type { Metadata } from "next";
import CounselorV3 from "./desk";

// Counsellor portal, v3: meet the student, then set up and update what they get. Reached only by this URL.
export const metadata: Metadata = { title: "Counsellor portal · BRAC Career Hub", robots: { index: false } };

export default function CounselorV3Page() {
  return <CounselorV3 />;
}
