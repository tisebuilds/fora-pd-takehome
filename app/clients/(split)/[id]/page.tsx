import { notFound } from "next/navigation";
import { getClientById, getCompanionLinkableClients } from "@/lib/data";
import { ClientDetailPane } from "@/components/client-detail-pane";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();
  const companionLinkableClients = getCompanionLinkableClients(id);
  return <ClientDetailPane client={client} companionLinkableClients={companionLinkableClients} />;
}
