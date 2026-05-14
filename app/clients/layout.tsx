import { AppSidebar } from "@/components/app-sidebar";

export default function ClientsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <main className="min-w-0 flex-1 bg-fora-app px-6 py-6 lg:px-8 lg:py-6">{children}</main>
    </div>
  );
}
