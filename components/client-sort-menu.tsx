"use client";

import type { ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClientSortKey = "commissions-desc" | "bookings-desc" | "name-asc";

const SORT_OPTIONS: Array<{ value: ClientSortKey; label: string }> = [
  { value: "commissions-desc", label: "Highest commission" },
  { value: "bookings-desc", label: "Most bookings" },
  { value: "name-asc", label: "Name A–Z" },
];

export function sortLabel(value: ClientSortKey): string {
  return SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";
}

type Props = {
  value: ClientSortKey;
  onChange: (next: ClientSortKey) => void;
  /** "pill" = full text trigger ("Sort: Highest commission ▾"); "icon" = compact icon button. */
  variant?: "pill" | "icon";
  triggerClassName?: string;
};

export function ClientSortMenu({ value, onChange, variant = "pill", triggerClassName }: Props) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          variant === "pill"
            ? "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-fora-border bg-white px-3.5 text-[13px] text-fora-navy transition-colors hover:bg-fora-app aria-expanded:bg-fora-app"
            : "inline-flex size-8 items-center justify-center rounded-md text-fora-muted transition-colors hover:bg-fora-app hover:text-fora-navy aria-expanded:bg-fora-app aria-expanded:text-fora-navy",
          triggerClassName
        )}
        aria-label={variant === "icon" ? `Sort list (${sortLabel(value)})` : undefined}
      >
        {variant === "pill" ? (
          <>
            <span className="text-fora-muted">Sort:</span>
            <span className="font-medium">{sortLabel(value)}</span>
            <ChevronDown className="size-3.5 text-fora-muted" strokeWidth={1.75} aria-hidden />
          </>
        ) : (
          <Filter className="size-4" strokeWidth={1.75} aria-hidden />
        )}
      </Menu.Trigger>
      <SortMenuPopup value={value} onChange={onChange} />
    </Menu.Root>
  );
}

function SortMenuPopup({
  value,
  onChange,
}: {
  value: ClientSortKey;
  onChange: (next: ClientSortKey) => void;
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={6} align="end">
        <Menu.Popup className="z-50 min-w-[200px] rounded-lg border border-fora-border bg-white p-1 text-[13px] text-fora-navy shadow-md outline-none">
          <Menu.RadioGroup value={value} onValueChange={(v) => onChange(v as ClientSortKey)}>
            {SORT_OPTIONS.map((opt) => (
              <Menu.RadioItem
                key={opt.value}
                value={opt.value}
                closeOnClick
                className="relative flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 pr-7 text-[13px] outline-none transition-colors data-highlighted:bg-fora-app"
              >
                <RadioRow>{opt.label}</RadioRow>
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

function RadioRow({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="flex-1">{children}</span>
      <Menu.RadioItemIndicator
        render={<span className="pointer-events-none absolute right-2 inline-flex size-4 items-center justify-center" />}
      >
        <Check className="size-3.5 text-fora-navy" strokeWidth={2} aria-hidden />
      </Menu.RadioItemIndicator>
    </>
  );
}
