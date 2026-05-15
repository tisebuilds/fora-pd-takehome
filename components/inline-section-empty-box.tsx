import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/** Full-width interactive surface for an empty section row (use on `button`, `a`, or Next `Link`). */
export const inlineSectionEmptyActionTriggerClass =
  "flex min-h-[52px] w-full items-center gap-2 border-0 bg-transparent py-3.5 pl-0 pr-4 text-left text-[15px] font-normal text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-navy/20 focus-visible:ring-inset";

/** Bordered white row shell for empty credit / loyalty actions. */
export function InlineSectionEmptyBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-fora-border bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Leading plus icon + label for empty section action rows. */
export function InlineSectionEmptyActionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <Plus className="size-4 shrink-0 text-fora-navy" strokeWidth={2} aria-hidden />
      <span className={cn("min-w-0", className)}>{children}</span>
    </>
  );
}
