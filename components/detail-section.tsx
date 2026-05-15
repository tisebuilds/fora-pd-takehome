"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/** Left inset for section headers and row icons (matches collapse chevron). */
export const detailSectionIconGutterClass = "pl-1.5";

export function DetailSection({
  title,
  action,
  children,
  className,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** When false, the section starts collapsed. */
  defaultOpen?: boolean;
  /** When set with `onOpenChange`, the section is controlled (e.g. open from header). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    if (isControlled) {
      onOpenChange?.(!open);
    } else {
      setInternalOpen((o) => !o);
    }
  };

  const contentId = useId();

  return (
    <section
      className={cn(
        "transition-[padding] duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0",
        open ? "py-7" : "py-2",
        className,
      )}
    >
      <div
        className={cn(
          "w-full min-w-0 transition-[padding] duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0",
          open ? "pb-4" : "pb-0",
        )}
      >
        <div
          className={cn(
            "flex w-full min-w-0 flex-nowrap items-center gap-2 rounded-sm py-1 pr-1 transition-colors hover:bg-fora-app/60 sm:gap-3",
            detailSectionIconGutterClass,
          )}
        >
          <button
            type="button"
            onClick={toggle}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-sm py-0.5 pr-1 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fora-navy/20 sm:gap-2.5"
            aria-expanded={open}
            aria-controls={contentId}
          >
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-fora-muted transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0",
                open ? "rotate-0" : "-rotate-90",
              )}
              aria-hidden
            />
            <h3 className="min-w-0 flex-1 truncate text-[11px] font-medium uppercase tracking-[0.08em] text-fora-muted">
              {title}
            </h3>
          </button>
          {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
        </div>
      </div>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          id={contentId}
          className={cn(
            "min-h-0 overflow-hidden",
            detailSectionIconGutterClass,
            !open && "max-h-0",
          )}
          inert={open ? undefined : true}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
