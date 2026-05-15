"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Mail, MoreHorizontal, Phone, Receipt, UserRound, Wallet } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import type { AssociatedTraveler, Client, ClientPhone } from "@/lib/types";
import { clientDisplayName, clientInitials, formatPhoneDisplay } from "@/lib/format";
import { getTravelerGroupsForDisplay } from "@/lib/data";
import { AddCreditCardDialog } from "@/components/add-credit-card-dialog";
import { CreditCardRow } from "@/components/credit-card-row";
import {
  InlineSectionEmptyActionLabel,
  InlineSectionEmptyBox,
  inlineSectionEmptyActionTriggerClass,
} from "@/components/inline-section-empty-box";
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

function companionInlineName(t: AssociatedTraveler): string {
  if (t.companionKind === "pet") return `${t.firstName} (${t.lastName})`;
  return `${t.firstName} ${t.lastName}`;
}

function companionInlineInitials(t: AssociatedTraveler): string {
  if (t.companionKind === "pet") {
    const s = t.firstName.replace(/[^a-zA-Z0-9]/g, "");
    return (s.slice(0, 2) || "?").toUpperCase();
  }
  return clientInitials({ firstName: t.firstName, lastName: t.lastName });
}

function companionInlineRelationship(t: AssociatedTraveler): string | null {
  if (t.companionKind === "pet") return null;
  const rel = t.relationship?.trim();
  return rel && rel.length > 0 ? rel : null;
}

function companionInlinePetNotes(t: AssociatedTraveler): string | null {
  if (t.companionKind !== "pet") return null;
  const notes = t.petNotes?.trim();
  return notes && notes.length > 0 ? notes : null;
}

/** `TravelerFlightBookingInfo.dateOfBirth` is stored as YYYY-MM-DD in seed data. */
function formatCompanionFlightDob(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const d = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(d.getTime())) return trimmed;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function companionInlineDobLine(t: AssociatedTraveler): string | null {
  const raw = t.flight?.dateOfBirth?.trim();
  if (!raw) return null;
  const formatted = formatCompanionFlightDob(raw);
  return `DOB ${formatted ?? raw}`;
}

const menuItemClass =
  "flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-fora-navy outline-none transition-colors data-highlighted:bg-fora-app";

/** Shared grid for cards-mode table header (shell) and each data row: five columns (client avatar+text, email, bookings, actions). */
export const clientListTableGridClass =
  "grid w-full grid-cols-[auto_minmax(0,1fr)_minmax(0,12rem)_3.5rem_2.75rem] gap-x-3 items-center sm:gap-x-4";

const navCellClass =
  "cursor-pointer rounded-md text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fora-navy/20 focus-visible:ring-offset-0";

export function ClientListCard({ client, onViewDetails }: Props) {
  const [addCreditOpen, setAddCreditOpen] = useState(false);
  const [creditPanelOpen, setCreditPanelOpen] = useState(false);
  const [companionsPanelOpen, setCompanionsPanelOpen] = useState(false);
  const phone = primaryPhone(client);
  const phoneText = phone ? formatPhoneDisplay(phone) : null;
  const telHref = phone ? phoneToTelHref(phone) : null;
  const email = primaryEmail(client);

  const profileHref = `/clients/${client.id}`;
  const bookingsHref = `${profileHref}#bookings`;

  const travelerGroups = useMemo(() => getTravelerGroupsForDisplay(client), [client]);
  const groupsWithCompanions = useMemo(
    () => travelerGroups.filter((g) => g.travelers.length > 0),
    [travelerGroups],
  );
  const showCompanionGroupLabels = groupsWithCompanions.length > 1;

  const avatarCell = (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8D6] text-[13px] font-semibold text-[#111827]"
      aria-hidden
    >
      {clientInitials(client)}
    </div>
  );

  const nameAndPhoneCell = (
    <div className="min-w-0">
      <p className="truncate text-[15px] font-semibold text-[#111827]">{clientDisplayName(client)}</p>
      <p className="mt-0.5 text-[13px] text-[#6B7280]">
        {phone && phoneText ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Flag code={phone.country} className="shrink-0 text-[14px] leading-none" />
            <span>{phoneText}</span>
          </span>
        ) : (
          <span className="italic">No phone</span>
        )}
      </p>
    </div>
  );

  const emailCell = (
    <div className="flex min-w-0 w-full items-center overflow-hidden">
      {email ? (
        <a
          href={`mailto:${email}`}
          title={email}
          className="block w-full min-w-0 truncate text-[13px] font-semibold text-[#111827] underline-offset-2 hover:underline sm:text-[14px]"
        >
          {email}
        </a>
      ) : (
        <span className="text-[13px] font-medium italic text-[#6B7280]">-</span>
      )}
    </div>
  );

  const bookingsCell = (
    <p className="text-right text-[14px] font-semibold tabular-nums text-[#111827] underline-offset-2 transition-colors group-hover:text-fora-link group-hover:underline">
      {client.bookingsCount}
    </p>
  );

  return (
    <div className="flex flex-col bg-white">
      <div
        className={cn(
          clientListTableGridClass,
          "px-4 py-3.5 transition-colors hover:bg-black/[0.02]",
          onViewDetails != null && "active:bg-black/[0.03]"
        )}
      >
        {onViewDetails ? (
          <>
            <button type="button" onClick={onViewDetails} className={cn(navCellClass, "flex justify-center")}>
              {avatarCell}
            </button>
            <button type="button" onClick={onViewDetails} className={navCellClass}>
              {nameAndPhoneCell}
            </button>
            <div className="min-w-0">{emailCell}</div>
            <button
              type="button"
              onClick={onViewDetails}
              className={cn(navCellClass, "group flex justify-end")}
            >
              {bookingsCell}
            </button>
          </>
        ) : (
          <>
            <Link href={profileHref} className={cn(navCellClass, "flex justify-center no-underline")}>
              {avatarCell}
            </Link>
            <Link href={profileHref} className={cn(navCellClass, "no-underline")}>
              {nameAndPhoneCell}
            </Link>
            <div className="min-w-0">{emailCell}</div>
            <Link href={profileHref} className={cn(navCellClass, "group flex justify-end no-underline")}>
              {bookingsCell}
            </Link>
          </>
        )}

        <div className="flex shrink-0 justify-end">
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
                      <ArrowRight className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                      View client details
                    </Menu.Item>
                  ) : (
                    <Menu.LinkItem href={profileHref} className={menuItemClass} closeOnClick>
                      <ArrowRight className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                      View client details
                    </Menu.LinkItem>
                  )}
                  <Menu.LinkItem href={bookingsHref} className={menuItemClass} closeOnClick>
                    <Receipt className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                    View bookings
                  </Menu.LinkItem>
                  <Menu.Item onClick={() => setCompanionsPanelOpen(true)} className={menuItemClass}>
                    <UserRound className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                    Show companions inline
                  </Menu.Item>
                  <Menu.Item onClick={() => setCreditPanelOpen(true)} className={menuItemClass}>
                    <Wallet className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                    View credit card details
                  </Menu.Item>
                  <Menu.Item onClick={() => setAddCreditOpen(true)} className={menuItemClass}>
                    <CreditCard className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                    Add credit card
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
      </div>

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0",
          companionsPanelOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">
          <div
            className="border-t border-[#E5E7EB] px-4 pb-3 pt-3 sm:pb-3.5 sm:pt-3.5"
            inert={companionsPanelOpen ? undefined : true}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Companions</h3>
              {companionsPanelOpen ? (
                <button
                  type="button"
                  className="shrink-0 rounded-sm text-[13px] font-medium text-[#9CA3AF] no-underline outline-none transition-colors hover:text-[#6B7280] focus-visible:ring-2 focus-visible:ring-fora-navy/20"
                  onClick={() => setCompanionsPanelOpen(false)}
                >
                  Hide
                </button>
              ) : null}
            </div>
            {groupsWithCompanions.length === 0 ? (
              <InlineSectionEmptyBox className="mt-2 px-4 py-3.5 text-[13px] leading-snug text-[#6B7280]">
                No companions on file.{" "}
                <Link href={profileHref} className="font-medium text-fora-link no-underline hover:opacity-80">
                  Open profile
                </Link>
              </InlineSectionEmptyBox>
            ) : (
              <div className="mt-2 flex flex-col gap-3">
                {groupsWithCompanions.map((group) => (
                  <div key={group.id}>
                    {showCompanionGroupLabels ? (
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                        {group.name}
                      </p>
                    ) : null}
                    <div className="flex flex-col divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
                      {group.travelers.map((t) => {
                        const relationship = companionInlineRelationship(t);
                        const petNotes = companionInlinePetNotes(t);
                        const dobLine = companionInlineDobLine(t);
                        return (
                          <div key={t.id} className="flex items-start gap-3 px-3 py-2.5 sm:px-3.5 sm:py-3">
                            <div
                              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F3E8D6] text-[12px] font-semibold text-[#111827]"
                              aria-hidden
                            >
                              {companionInlineInitials(t)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <span className="min-w-0 truncate text-[13px] font-semibold text-[#111827]">
                                  {companionInlineName(t)}
                                </span>
                                {relationship ? (
                                  <span className="shrink-0 text-[12px] leading-snug text-[#6B7280]">
                                    {relationship}
                                  </span>
                                ) : null}
                              </div>
                              {petNotes ? (
                                <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#6B7280]">
                                  {petNotes}
                                </p>
                              ) : null}
                              {dobLine ? (
                                <p className="mt-0.5 text-[12px] leading-snug text-[#6B7280]">{dobLine}</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0",
          creditPanelOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <div
            className="border-t border-[#E5E7EB] px-4 pb-3 pt-3 sm:pb-3.5 sm:pt-3.5"
            inert={creditPanelOpen ? undefined : true}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Credit cards</h3>
              {creditPanelOpen ? (
                <button
                  type="button"
                  className="shrink-0 rounded-sm text-[13px] font-medium text-[#9CA3AF] no-underline outline-none transition-colors hover:text-[#6B7280] focus-visible:ring-2 focus-visible:ring-fora-navy/20"
                  onClick={() => setCreditPanelOpen(false)}
                >
                  Hide
                </button>
              ) : null}
            </div>
            {client.creditCards.length === 0 ? (
              <InlineSectionEmptyBox className="mt-2">
                <button
                  type="button"
                  className={inlineSectionEmptyActionTriggerClass}
                  onClick={() => setAddCreditOpen(true)}
                >
                  <InlineSectionEmptyActionLabel>Add card</InlineSectionEmptyActionLabel>
                </button>
              </InlineSectionEmptyBox>
            ) : (
              <div className="mt-2 flex flex-col divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
                {client.creditCards.map((c) => (
                  <CreditCardRow
                    key={c.id}
                    card={c}
                    embeddedListWithCopy
                    billingAddress={client.addresses[0]}
                    showHideInEmbedRow={false}
                    showEmbedChromeActions={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCreditCardDialog open={addCreditOpen} onOpenChange={setAddCreditOpen} />
    </div>
  );
}
