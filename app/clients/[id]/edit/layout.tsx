import type { ReactNode } from "react";

/** Keeps edit scrolling inside the main column so the page cannot overscroll into empty space. */
export default function EditClientLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      {children}
    </div>
  );
}
