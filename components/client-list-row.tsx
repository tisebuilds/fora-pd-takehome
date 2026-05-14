"use client";

import Link from "next/link";
import type { Client } from "@/lib/types";
import { clientAvatarToneClasses } from "@/lib/client-avatar-tone";
import { clientDisplayName, clientInitials, formatCityState } from "@/lib/format";
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
        "flex items-center gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-fora-app",
        active && "bg-clients-list-row-active hover:bg-clients-list-row-active"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-medium tracking-[0.06em]",
          clientAvatarToneClasses(client.id)
        )}
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
      <span className="ml-2 flex shrink-0 flex-col items-end text-right">
        <span className="text-[14px] font-semibold tabular-nums leading-tight text-fora-navy">
          {client.bookingsCount}
        </span>
        <span className="mt-0.5 text-[12.5px] text-fora-muted">
          {client.bookingsCount === 1 ? "Booking" : "Bookings"}
        </span>
      </span>
    </Link>
  );
}
