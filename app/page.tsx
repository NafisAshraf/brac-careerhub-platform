import LandingExperience from "./landing-experience";

// The site root is the final version, v14: v11's questionnaire flow, then the v14 Career Hub.
// The previous root lives at /v0; every earlier version keeps its own /vN route.
export default function Page() {
  return <LandingExperience heroVariant="career" hub="v14" />;
}
