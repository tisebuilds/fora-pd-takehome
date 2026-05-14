import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen min-w-[1100px] flex-col items-center justify-center bg-[#F9FAFB] px-6 text-center">
      <p className="text-2xl font-semibold text-gray-900">Page not found</p>
      <p className="mt-2 text-sm text-gray-600">This client or route does not exist in the scaffold.</p>
      <Link href="/clients" className="mt-6 text-sm text-fora-link hover:underline">
        ← Back to Clients
      </Link>
    </div>
  );
}
