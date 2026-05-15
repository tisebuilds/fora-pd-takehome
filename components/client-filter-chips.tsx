"use client";

import { cn } from "@/lib/utils";

export type ClientFilterKey = "all" | "withBookings" | "noBookings" | "birthday";

type Counts = Record<ClientFilterKey, number>;

type Chip = {
  key: ClientFilterKey;
  label: string;
};

const CHIPS: Chip[] = [
  { key: "all", label: "All" },
  { key: "withBookings", label: "With bookings" },
  { key: "noBookings", label: "No bookings yet" },
  { key: "birthday", label: "Birthday this month" },
];

type Props = {
  value: ClientFilterKey;
  onChange: (next: ClientFilterKey) => void;
  counts: Counts;
  className?: string;
};

export function ClientFilterChips({ value, onChange, counts, className }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filter clients"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {CHIPS.map((chip) => {
        const active = value === chip.key;
        return (
          <button
            key={chip.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(chip.key)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3.5 text-[13px] leading-none transition-colors",
              "border border-fora-border bg-white text-fora-navy hover:bg-fora-app",
              active && "border-ink bg-ink text-paper hover:bg-ink"
            )}
          >
            <span>{chip.label}</span>
            <span
              className={cn(
                "inline-flex min-w-[20px] items-center justify-center rounded-sm px-1.5 text-[11px] tabular-nums",
                active ? "bg-white/20 text-paper" : "bg-ink/[0.08] text-fora-muted"
              )}
            >
              {counts[chip.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
