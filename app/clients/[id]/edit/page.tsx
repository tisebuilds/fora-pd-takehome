import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data";
import { EditPersonalInfoForm } from "@/components/edit-personal-info-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();
  return <EditPersonalInfoForm client={client} />;
}
