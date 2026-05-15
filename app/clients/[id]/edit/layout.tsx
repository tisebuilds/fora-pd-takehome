import type { ReactNode } from "react";

/** Shell for `/clients/[id]/edit`: padded card; scroll lives inside page content. */
export default function EditClientLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-fora-border bg-white">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </section>
    </div>
  );
}
