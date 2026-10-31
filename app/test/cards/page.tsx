import CardLab from "./card-lab";

export default async function CardLabPage({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  const { variant } = await searchParams;
  return <CardLab initialVariant={variant} />;
}
