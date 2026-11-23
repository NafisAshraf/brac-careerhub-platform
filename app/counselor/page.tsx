import type { Metadata } from "next";
import CounselorV3 from "./v3/desk";

// /counselor is the final counsellor portal (v3). Earlier versions stay at /counselor/v1 and /counselor/v2.
export const metadata: Metadata = { title: "Counsellor portal · BRAC Career Hub", robots: { index: false } };

export default function CounselorPage() {
  return <CounselorV3 />;
}
