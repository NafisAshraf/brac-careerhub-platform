import GenerateLab from "./generate-lab";

export default async function GenerateLabPage({ searchParams }: { searchParams: Promise<{ program?: string; tool?: string; from?: string; back?: string }> }) {
  const { program, tool, from, back } = await searchParams;
  return <GenerateLab program={program} tool={tool} from={from} back={back} />;
}
