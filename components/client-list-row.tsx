"use client";

import Link from "next/link";
import type { Client } from "@/lib/types";
import {
  clientDisplayName,
  clientInitials,
  formatCityState,
  formatCurrency,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  client: Client;
  active: boolean;
};

export function ClientListRow({ client, active }: Props) {
  return (
    <Link
      href={`/clients/${client.id}`}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-fora-app",
        active && "bg-paper-lift hover:bg-paper-lift"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-ink",
          active ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper-lift text-[12px] font-medium tracking-[0.06em] text-ink"
      >
        {clientInitials(client)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold leading-tight text-fora-navy">
          {clientDisplayName(client)}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-fora-muted">
          {formatCityState(client) || "—"}
        </span>
      </span>
      <span className="ml-2 flex shrink-0 flex-col items-end">
        <span className="text-[14px] font-semibold tabular-nums text-fora-navy">
          {formatCurrency(client.commissions)}
        </span>
        <span className="mt-0.5 text-[12px] tabular-nums text-fora-muted">
          {client.bookingsCount} {client.bookingsCount === 1 ? "booking" : "bookings"}
        </span>
      </span>
    </Link>
  );
}
