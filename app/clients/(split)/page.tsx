import { clients, getCompanionLinkableClients } from "@/lib/data";
import { ClientDetailPane } from "@/components/client-detail-pane";
import { ClientsDetailEmptyState } from "@/components/clients-split-shell";

export default function ClientsIndexPage() {
  const first = clients[0];
  if (!first) return <ClientsDetailEmptyState />;
  const companionLinkableClients = getCompanionLinkableClients(first.id);
  return <ClientDetailPane client={first} companionLinkableClients={companionLinkableClients} />;
}
