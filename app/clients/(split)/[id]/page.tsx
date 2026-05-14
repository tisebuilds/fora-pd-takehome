import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data";
import { ClientDetailPane } from "@/components/client-detail-pane";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();
  return <ClientDetailPane client={client} />;
}
