import Link from "next/link";

export default function ClientsNotFound() {
  return (
    <div>
      <p className="text-2xl font-semibold text-gray-900">Client not found</p>
      <p className="mt-2 text-sm text-gray-600">There is no seed client for this URL.</p>
      <Link href="/clients" className="mt-6 inline-block text-sm text-fora-link hover:underline">
        ← Back to Clients
      </Link>
    </div>
  );
}
