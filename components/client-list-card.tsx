"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { CreditCard, Mail, MoreHorizontal, Phone } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import type { Client, ClientPhone } from "@/lib/types";
import {
  clientDisplayName,
  clientInitials,
  formatCityState,
  formatCurrency,
  formatPhoneDisplay,
} from "@/lib/format";
import { AddCreditCardDialog } from "@/components/add-credit-card-dialog";
import { Flag } from "@/components/flag";
import { cn } from "@/lib/utils";

type Props = {
  client: Client;
  onViewDetails?: () => void;
};

function primaryPhone(client: Client) {
  const mobile = client.phones.find((p) => p.type === "mobile");
  return mobile ?? client.phones[0];
}

function primaryEmail(client: Client) {
  return client.emails[0]?.address ?? null;
}

function phoneToTelHref(p: ClientPhone): string | null {
  const national = p.nationalNumber.replace(/\D/g, "");
  if (!national) return null;
  const dial = p.dialCode.replace(/\D/g, "");
  if (!dial) return null;
  return `tel:+${dial}${national}`;
}

const menuItemClass =
  "flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-fora-navy outline-none transition-colors data-highlighted:bg-fora-app";

function StatBlock({
  label,
  align = "left",
  className,
  children,
}: {
  label: string;
  align?: "left" | "right";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0 shrink-0", align === "right" && "text-right", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B7280]">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

export function ClientListCard({ client, onViewDetails }: Props) {
  const [addCreditOpen, setAddCreditOpen] = useState(false);
  const phone = primaryPhone(client);
  const phoneText = phone ? formatPhoneDisplay(phone) : null;
  const telHref = phone ? phoneToTelHref(phone) : null;
  const email = primaryEmail(client);
  const cityState = formatCityState(client);
  const subParts = [cityState, email].filter(Boolean);
  const subline = subParts.length > 0 ? subParts.join(" \u00B7 ") : null;

  const profileHref = `/clients/${client.id}`;

  const rowClassName = cn(
    "grid min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-3 text-left outline-none sm:grid-cols-[auto_1fr_minmax(0,7rem)] sm:gap-4 md:grid-cols-[auto_1fr_7.5rem_3.5rem_4.25rem] md:gap-5",
    "rounded-l-xl transition-colors focus-visible:ring-2 focus-visible:ring-fora-navy/20 focus-visible:ring-offset-0",
    onViewDetails != null
      ? "cursor-pointer hover:bg-black/[0.02] active:bg-black/[0.03]"
      : "cursor-pointer hover:bg-black/[0.02]"
  );

  const rowBody = (
    <>
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8D6] text-[13px] font-semibold text-[#111827]"
        aria-hidden
      >
        {clientInitials(client)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-[#111827]">{clientDisplayName(client)}</p>
        <p className="mt-0.5 truncate text-[13px] text-[#6B7280]">
          {subline ?? <span className="italic">No location or email</span>}
        </p>
      </div>

      <StatBlock label="Phone" className="col-span-2 mt-2 min-w-0 sm:col-span-1 sm:mt-0 md:min-w-0">
        {phone && phoneText ? (
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111827] sm:text-[14px]">
            <Flag code={phone.country} className="text-[14px] leading-none" />
            <span className="min-w-0 truncate">{phoneText}</span>
          </p>
        ) : (
          <p className="text-[13px] font-medium italic text-[#6B7280]">—</p>
        )}
      </StatBlock>

      <StatBlock label="Bookings" align="right" className="hidden md:block">
        <p className="text-[14px] font-semibold tabular-nums text-[#111827]">{client.bookingsCount}</p>
      </StatBlock>

      <StatBlock label="Commissions" align="right" className="hidden md:block">
        <p className="text-[14px] font-semibold tabular-nums text-[#059669]">
          {formatCurrency(client.commissions)}
        </p>
      </StatBlock>
    </>
  );

  return (
    <article className="flex items-stretch gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
      {onViewDetails ? (
        <button type="button" onClick={onViewDetails} className={rowClassName}>
          {rowBody}
        </button>
      ) : (
        <Link href={profileHref} className={cn(rowClassName, "no-underline")}>
          {rowBody}
        </Link>
      )}

      <div className="flex shrink-0 items-center">
        <Menu.Root>
          <Menu.Trigger
            className="inline-flex size-9 items-center justify-center rounded-full bg-transparent text-[#6B7280] transition-colors hover:bg-[#F9F7F2] hover:text-[#111827] aria-expanded:bg-[#F9F7F2]"
            aria-label={`Actions for ${clientDisplayName(client)}`}
          >
            <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6} align="end">
              <Menu.Popup className="z-50 min-w-[200px] rounded-lg border border-fora-border bg-white p-1 text-fora-navy shadow-md outline-none">
                {onViewDetails ? (
                  <Menu.Item onClick={onViewDetails} className={menuItemClass}>
                    View card details
                  </Menu.Item>
                ) : (
                  <Menu.LinkItem href={profileHref} className={menuItemClass} closeOnClick>
                    View card details
                  </Menu.LinkItem>
                )}
                <Menu.Item onClick={() => setAddCreditOpen(true)} className={menuItemClass}>
                  <CreditCard className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                  Add credit
                </Menu.Item>
                {telHref ? (
                  <Menu.LinkItem href={telHref} className={menuItemClass} closeOnClick>
                    <Phone className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                    Call
                  </Menu.LinkItem>
                ) : null}
                {email ? (
                  <Menu.LinkItem href={`mailto:${email}`} className={menuItemClass} closeOnClick>
                    <Mail className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                    Email
                  </Menu.LinkItem>
                ) : null}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
      <AddCreditCardDialog open={addCreditOpen} onOpenChange={setAddCreditOpen} />
    </article>
  );
}
