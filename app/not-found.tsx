import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[#F9FAFB] px-6 py-10">
      <div className="flex min-h-0 min-w-[1100px] flex-1 flex-col items-center justify-center text-center">
        <p className="text-2xl font-semibold text-gray-900">Page not found</p>
        <p className="mt-2 text-sm text-gray-600">This client or route does not exist in the scaffold.</p>
        <Link href="/clients" className="mt-6 text-sm text-fora-link hover:underline">
          ← Back to Clients
        </Link>
      </div>
    </div>
  );
}
