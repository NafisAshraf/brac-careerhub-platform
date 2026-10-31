import CombinedLab from "./combined-lab";

export default async function CombinedLabPage({ searchParams }: { searchParams: Promise<{ program?: string }> }) {
  const { program } = await searchParams;
  return <CombinedLab initialProgram={program} />;
}
