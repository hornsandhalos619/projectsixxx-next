import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function JournalOvermindSlugRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/overmind/journal/${slug}`);
}
