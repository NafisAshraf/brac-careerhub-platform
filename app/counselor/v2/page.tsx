import type { Metadata } from "next";
import CounselorV2 from "./desk";

// Counsellor portal, v2: simpler, in the student site's v4/v14 look. Reached only by this URL.
export const metadata: Metadata = { title: "Counsellor portal · BRAC Career Hub", robots: { index: false } };

export default function CounselorV2Page() {
  return <CounselorV2 />;
}
