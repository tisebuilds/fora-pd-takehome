import { AppSidebar } from "@/components/app-sidebar";

export default function ClientsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <AppSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-fora-app px-6 py-6 lg:px-8 lg:py-6">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
