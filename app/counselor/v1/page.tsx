import type { Metadata } from "next";
import CounselorApp from "../panel";

// Counsellor panel, v1. Reached only by this URL, not from the student site.
export const metadata: Metadata = { title: "Counsellor portal · BRAC Career Hub", robots: { index: false } };

export default function CounselorV1() {
  return <CounselorApp />;
}
