"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Cake,
  Copy,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { toast } from "sonner";
import type {
  Client,
  ClientAddress,
  CompanionLinkableClient,
  ImportantDate,
  LoyaltyProgram,
} from "@/lib/types";
import {
  clientDisplayName,
  formatAnnualEventCountdown,
  formatCityState,
  formatImportantDate,
  formatPhoneDisplay,
  primaryClientProfileDetailFields,
} from "@/lib/format";
import { Flag } from "@/components/flag";
import { StatsStrip } from "@/components/stats-strip";
import { CreditCardRow } from "@/components/credit-card-row";
import { AddCreditCardDialog } from "@/components/add-credit-card-dialog";
import { AddImportantDateDialog } from "@/components/add-important-date-dialog";
import { DeleteLoyaltyProgramDialog } from "@/components/delete-loyalty-program-dialog";
import { EditLoyaltyProgramDialog } from "@/components/edit-loyalty-program-dialog";
import { AssociatedTravelersSection } from "@/components/associated-travelers-section";
import { ClientProfileNotesTab } from "@/components/client-profile-notes-tab";
import { DetailSection } from "@/components/detail-section";
import {
  InlineSectionEmptyActionLabel,
  InlineSectionEmptyBox,
  inlineSectionEmptyActionTriggerClass,
} from "@/components/inline-section-empty-box";
import { cn } from "@/lib/utils";
import { getTravelerGroupsForDisplay } from "@/lib/data";

const editLinkCls =
  "text-[13px] font-normal text-fora-link no-underline hover:opacity-80";

const headerMoreMenuItemClass =
  "flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] outline-none transition-colors data-highlighted:bg-fora-app";

const loyaltyRowMenuItemClass =
  "flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-fora-navy outline-none transition-colors data-highlighted:bg-fora-app";

function personalMobile(client: Client) {
  return client.phones.find((p) => p.type === "mobile") ?? client.phones[0];
}

function personalEmail(client: Client) {
  return client.emails.find((e) => e.type === "personal") ?? client.emails[0];
}

function loyaltyProgramsRequestMailto(to: string, firstName: string) {
  const subject = encodeURIComponent("Your loyalty program details");
  const greet = firstName.trim() ? `Hi ${firstName.trim()},` : "Hi,";
  const body = encodeURIComponent(
    `${greet}\n\nWhen you have a moment, could you reply with your airline, hotel, car rental, and other loyalty program numbers (and any status levels) you would like us to save on your profile?\n\nThank you!`,
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

const LOYALTY_AVATAR_BGS = [
  "bg-gradient-to-br from-[#1e3a8a] to-[#172554] text-white",
  "bg-black text-white",
  "bg-gradient-to-br from-[#0f766e] to-[#134e4a] text-white",
  "bg-gradient-to-br from-[#9a3412] to-[#7c2d12] text-white",
] as const;

function loyaltyProgramInitials(programName: string): string {
  const parts = programName
    .split(/[\s·•,]+/)
    .map((p) => p.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((p) => p.length > 0);
  const stop = new Set(["of", "the", "and", "a", "an", "for"]);
  const sig = parts.filter((p) => !stop.has(p.toLowerCase()));
  if (sig.length === 0) {
    const alnum = programName.replace(/[^a-zA-Z0-9]/g, "");
    return (alnum.slice(0, 2) || "?").toUpperCase();
  }
  if (sig.length === 1) return sig[0]!.slice(0, 2).toUpperCase();
  const a = sig[0]![0]!;
  const b = sig[sig.length - 1]![0]!;
  return (a + b).toUpperCase();
}

function loyaltyProgramAvatarClass(programName: string): string {
  let h = 0;
  for (let i = 0; i < programName.length; i++) h = (h + programName.charCodeAt(i)) % 997;
  return LOYALTY_AVATAR_BGS[h % LOYALTY_AVATAR_BGS.length]!;
}

function NotProvided() {
  return <span className="italic text-fora-muted">Not Provided</span>;
}

const copyFieldButtonClass =
  "shrink-0 rounded p-1 text-fora-muted hover:bg-fora-app hover:text-fora-navy";

function CopyFieldButton({
  text,
  title,
  "aria-label": ariaLabel,
  successMessage = "Copied to clipboard",
}: {
  text: string;
  title: string;
  "aria-label": string;
  /** Toast after successful copy */
  successMessage?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      className={copyFieldButtonClass}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(
          () => {
            toast.success(successMessage);
          },
          () => {
            toast.error("Could not copy");
          },
        );
      }}
      aria-label={ariaLabel}
    >
      <Copy className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function PersonalInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-fora-muted"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,9.5rem)_1fr] items-start gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,10.5rem)_1fr] sm:gap-x-10">
        <p className="text-[13px] leading-5 text-fora-muted">{label}</p>
        <div className="min-w-0 text-[14px] leading-5 text-fora-navy">{value}</div>
      </div>
    </div>
  );
}

/** Street line for display: line1, optional line2 (comma-separated). */
function addressStreetDisplay(a: ClientAddress): string {
  return [a.line1, a.line2].map((s) => s?.trim()).filter(Boolean).join(", ");
}

/** Street block for clipboard: line breaks between lines. */
function addressStreetClipboard(a: ClientAddress): string {
  return [a.line1, a.line2].map((s) => s?.trim()).filter(Boolean).join("\n");
}

/** City, state, country on one line (matches mailing-label style). */
function addressCityStateCountryLine(a: ClientAddress): string {
  return [a.city, a.state, a.country].map((s) => s?.trim()).filter(Boolean).join(", ");
}

function ImportantDateRow({
  icon: Icon,
  label,
  date,
}: {
  icon: LucideIcon;
  label: string;
  date: ImportantDate | undefined;
}) {
  const formatted = date ? formatImportantDate(date.month, date.day, date.year) : null;
  const countdown =
    date && date.month != null && date.day != null
      ? formatAnnualEventCountdown(date.month, date.day)
      : null;

  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-fora-muted"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,9.5rem)_1fr] items-start gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,10.5rem)_1fr] sm:gap-x-10">
        <p className="text-[13px] leading-5 text-fora-muted">{label}</p>
        <div className="min-w-0 text-[14px] leading-5 text-fora-navy">
          {formatted ? (
            <span className="inline-flex max-w-full min-w-0 flex-wrap items-center gap-2">
              <span className="min-w-0 shrink">{formatted}</span>
              {countdown ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-medium leading-none text-[#374151]">
                  {countdown}
                </span>
              ) : null}
            </span>
          ) : (
            <NotProvided />
          )}
        </div>
      </div>
    </div>
  );
}

const SCROLL_TOP_PADDING_THRESHOLD_PX = 8;

type ClientDetailTab = "details" | "associated" | "notes";

const clientDetailTabButtonClass =
  "relative -mb-px border-b-2 border-transparent bg-transparent pb-2.5 text-[14px] font-normal leading-normal text-fora-muted outline-none transition-[color,border-color] duration-150 hover:text-black/70 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2";

const clientDetailTabButtonSelectedClass =
  "border-black text-black font-medium hover:border-black hover:text-black";

type LoyaltyDialogState = null | { kind: "add" } | { kind: "edit"; program: LoyaltyProgram };

export function ClientDetailPane({
  client,
  companionLinkableClients = [],
  onClose,
}: {
  client: Client;
  /** Other profiles available when linking a person companion (from server; omit on routes that do not load it). */
  companionLinkableClients?: CompanionLinkableClient[];
  onClose?: () => void;
}) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addImportantDateOpen, setAddImportantDateOpen] = useState(false);
  const [loyaltyDialog, setLoyaltyDialog] = useState<LoyaltyDialogState>(null);
  const [loyaltyDeleteProgram, setLoyaltyDeleteProgram] = useState<LoyaltyProgram | null>(null);
  const [loyaltyDialogFormKey, setLoyaltyDialogFormKey] = useState(0);
  const [creditCardsOpen, setCreditCardsOpen] = useState(true);
  const [creditCardDetailsSignal, setCreditCardDetailsSignal] = useState(0);
  const creditCardsAnchorRef = useRef<HTMLDivElement>(null);
  const [detailTab, setDetailTab] = useState<ClientDetailTab>("details");

  const openLoyaltyEdit = (lp: LoyaltyProgram) => {
    setLoyaltyDialogFormKey((k) => k + 1);
    setLoyaltyDialog({ kind: "edit", program: lp });
  };

  const openLoyaltyAdd = () => {
    setLoyaltyDialogFormKey((k) => k + 1);
    setLoyaltyDialog({ kind: "add" });
  };

  const refreshAfterLoyaltyChange = () => {
    router.refresh();
  };

  const revealCreditCardsSection = () => {
    flushSync(() => {
      setCreditCardsOpen(true);
      setCreditCardDetailsSignal((n) => n + 1);
    });

    const behavior =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? ("auto" as const)
        : ("smooth" as const);

    const scrollPaneToCreditCards = () => {
      const scroller = scrollContainerRef.current;
      const target = creditCardsAnchorRef.current;
      if (!scroller || !target) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const scrollMarginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const delta = targetRect.top - scrollerRect.top + scroller.scrollTop - scrollMarginTop;
      scroller.scrollTo({ top: Math.max(0, delta), behavior });
    };

    // Section accordion + per-card detail grids need layout time before scrolling.
    if (behavior === "auto") {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollPaneToCreditCards);
      });
    } else {
      window.setTimeout(scrollPaneToCreditCards, 280);
      window.setTimeout(scrollPaneToCreditCards, 600);
    }
  };

  const mobile = personalMobile(client);
  const email = personalEmail(client);
  const address = client.addresses[0];
  const addressStreetLine = address ? addressStreetDisplay(address) : "";
  const addressStreetClipboardText = address ? addressStreetClipboard(address) : "";
  const addressCityStateCountry = address ? addressCityStateCountryLine(address) : "";
  const addressZipLine = address?.zip?.trim() ?? "";
  const addressFieldHasValue = Boolean(
    addressStreetLine || addressCityStateCountry || addressZipLine,
  );
  const birthday = client.importantDates.find((d) => d.label === "Birthday");
  const anniversary = client.importantDates.find((d) => d.label === "Anniversary");
  const cityState = formatCityState(client);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const sync = () => {
      setHeaderScrolled(el.scrollTop > SCROLL_TOP_PADDING_THRESHOLD_PX);
    };
    sync();

    el.addEventListener("scroll", sync, { passive: true });
    return () => el.removeEventListener("scroll", sync);
  }, [client.id]);

  useEffect(() => {
    setCreditCardsOpen(true);
    setCreditCardDetailsSignal(0);
    setDetailTab("details");
  }, [client.id]);

  return (
    <div ref={scrollContainerRef} className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="w-full min-w-0 px-6 py-7 lg:px-10 lg:py-9">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mb-5 inline-flex text-sm text-fora-link no-underline hover:opacity-80"
          >
            Close
          </button>
        ) : null}

        {/* Header: extra top padding while scrolled so the sticky title clears the viewport edge */}
        <div
          className={cn(
            "sticky top-0 z-10 -mx-6 border-b border-fora-border bg-white px-6 pb-0 transition-[padding-top] duration-200 ease-out lg:-mx-10 lg:px-10",
            headerScrolled ? "pt-4" : "pt-0",
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-sans text-[34px] font-bold leading-tight tracking-tight text-fora-navy">
                {clientDisplayName(client)}
              </h1>
              <p className="mt-1 text-[14px] text-fora-muted">
                {cityState || ""}
              </p>
              <div
                role="tablist"
                aria-label="Client profile sections"
                className="mt-5 flex flex-wrap gap-x-8 gap-y-1"
              >
                <button
                  type="button"
                  role="tab"
                  id="client-tab-details-trigger"
                  aria-selected={detailTab === "details"}
                  aria-controls="client-tab-details-panel"
                  tabIndex={detailTab === "details" ? 0 : -1}
                  onClick={() => setDetailTab("details")}
                  className={cn(
                    clientDetailTabButtonClass,
                    detailTab === "details" && clientDetailTabButtonSelectedClass,
                  )}
                >
                  Details
                </button>
                <button
                  type="button"
                  role="tab"
                  id="client-tab-associated-trigger"
                  aria-selected={detailTab === "associated"}
                  aria-controls="client-tab-associated-panel"
                  tabIndex={detailTab === "associated" ? 0 : -1}
                  onClick={() => setDetailTab("associated")}
                  className={cn(
                    clientDetailTabButtonClass,
                    detailTab === "associated" && clientDetailTabButtonSelectedClass,
                  )}
                >
                  Companions
                </button>
                <button
                  type="button"
                  role="tab"
                  id="client-tab-notes-trigger"
                  aria-selected={detailTab === "notes"}
                  aria-controls="client-tab-notes-panel"
                  tabIndex={detailTab === "notes" ? 0 : -1}
                  onClick={() => setDetailTab("notes")}
                  className={cn(
                    clientDetailTabButtonClass,
                    detailTab === "notes" && clientDetailTabButtonSelectedClass,
                  )}
                >
                  Notes
                </button>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:pt-1">
              <button
                type="button"
                onClick={() => {
                  setDetailTab("details");
                  revealCreditCardsSection();
                }}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-fora-border bg-white text-fora-muted transition-colors hover:bg-fora-app hover:text-fora-navy"
                aria-label="Show credit card details"
              >
                <CreditCard className="size-4" strokeWidth={1.75} aria-hidden />
              </button>
              <Menu.Root>
                <Menu.Trigger
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-fora-border bg-white text-fora-muted transition-colors hover:bg-fora-app hover:text-fora-navy aria-expanded:bg-fora-app aria-expanded:text-fora-navy"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner className="z-50" sideOffset={6} align="end">
                    <Menu.Popup className="z-50 min-w-[200px] rounded-lg border border-fora-border bg-white p-1 text-fora-navy shadow-md outline-none">
                      <Menu.Item
                        className={cn(headerMoreMenuItemClass, "font-normal text-fora-danger")}
                      >
                        <Trash2 className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                        Delete client
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </div>
          </div>
        </div>

        {detailTab === "details" ? (
          <div id="client-tab-details-panel" role="tabpanel" aria-labelledby="client-tab-details-trigger">
            {/* KPI strip: anchor for "View bookings" from list row menus */}
            <div id="bookings" className="scroll-mt-6">
              <StatsStrip
                bookingsCount={client.bookingsCount}
                commissionableValue={client.commissionableValue}
                commissions={client.commissions}
                bookingsHref="#bookings"
                className="mt-6"
              />
            </div>

            {/* Sections */}
            <div className="mt-4">
          <DetailSection
            title="Personal information"
            action={
              <Link
                href={`/clients/${client.id}/edit`}
                className={editLinkCls}
                aria-label="Edit personal information"
              >
                Edit
              </Link>
            }
          >
            <div className="flex flex-col">
              <PersonalInfoRow
                icon={User}
                label="First name"
                value={
                  client.firstName.trim() ? (
                    <span className="inline-flex max-w-full min-w-0 items-center gap-2">
                      <span className="min-w-0 shrink">{client.firstName}</span>
                      <CopyFieldButton
                        text={client.firstName}
                        title="Copy first name"
                        aria-label="Copy first name"
                        successMessage="First name copied to clipboard"
                      />
                    </span>
                  ) : (
                    <NotProvided />
                  )
                }
              />
              <PersonalInfoRow
                icon={User}
                label="Last name"
                value={
                  client.lastName.trim() ? (
                    <span className="inline-flex max-w-full min-w-0 items-center gap-2">
                      <span className="min-w-0 shrink">{client.lastName}</span>
                      <CopyFieldButton
                        text={client.lastName}
                        title="Copy last name"
                        aria-label="Copy last name"
                        successMessage="Last name copied to clipboard"
                      />
                    </span>
                  ) : (
                    <NotProvided />
                  )
                }
              />
              <PersonalInfoRow
                icon={Mail}
                label="Personal email"
                value={
                  email ? (
                    <span className="inline-flex max-w-full min-w-0 items-center gap-2">
                      <a
                        href={`mailto:${email.address}`}
                        className="min-w-0 shrink truncate text-[14px] text-fora-navy underline-offset-2 hover:underline"
                      >
                        {email.address}
                      </a>
                      <CopyFieldButton
                        text={email.address}
                        title="Copy email"
                        aria-label="Copy email address"
                        successMessage="Email copied to clipboard"
                      />
                    </span>
                  ) : (
                    <NotProvided />
                  )
                }
              />
              <PersonalInfoRow
                icon={Phone}
                label="Mobile number"
                value={
                  mobile && formatPhoneDisplay(mobile) ? (
                    <span className="inline-flex max-w-full min-w-0 items-center gap-2">
                      <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
                        <Flag code={mobile.country} />
                        <span className="min-w-0 shrink">{formatPhoneDisplay(mobile)}</span>
                      </span>
                      <CopyFieldButton
                        text={formatPhoneDisplay(mobile)!}
                        title="Copy mobile number"
                        aria-label="Copy mobile number"
                        successMessage="Mobile number copied to clipboard"
                      />
                    </span>
                  ) : (
                    <NotProvided />
                  )
                }
              />
              <PersonalInfoRow
                icon={MapPin}
                label="Address"
                value={
                  !address ? (
                    <NotProvided />
                  ) : !addressFieldHasValue ? (
                    <NotProvided />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {addressStreetLine ? (
                        <div className="inline-flex max-w-full items-center gap-2">
                          <span className="min-w-0 break-words">{addressStreetLine}</span>
                          <CopyFieldButton
                            text={addressStreetClipboardText}
                            title="Copy street address"
                            aria-label="Copy street address"
                            successMessage="Street address copied to clipboard"
                          />
                        </div>
                      ) : null}
                      {addressCityStateCountry ? (
                        <div className="inline-flex max-w-full items-center gap-2">
                          <span className="min-w-0 break-words">{addressCityStateCountry}</span>
                          <CopyFieldButton
                            text={addressCityStateCountry}
                            title="Copy city, state, and country"
                            aria-label="Copy city, state, and country"
                            successMessage="City and region copied to clipboard"
                          />
                        </div>
                      ) : null}
                      {addressZipLine ? (
                        <div className="inline-flex max-w-full items-center gap-2">
                          <span className="min-w-0 break-words">{addressZipLine}</span>
                          <CopyFieldButton
                            text={addressZipLine}
                            title="Copy ZIP code"
                            aria-label="Copy ZIP code"
                            successMessage="ZIP code copied to clipboard"
                          />
                        </div>
                      ) : null}
                    </div>
                  )
                }
              />
            </div>
          </DetailSection>

          <DetailSection
            title="Important dates"
            action={
              <button
                type="button"
                onClick={() => setAddImportantDateOpen(true)}
                className={editLinkCls}
                aria-label="Add important date"
              >
                + Add
              </button>
            }
          >
            <div className="flex flex-col">
              {birthday &&
              formatImportantDate(birthday.month, birthday.day, birthday.year) ? (
                <ImportantDateRow icon={Cake} label="Birthday" date={birthday} />
              ) : null}
              {anniversary &&
              formatImportantDate(anniversary.month, anniversary.day, anniversary.year) ? (
                <ImportantDateRow icon={Heart} label="Anniversary" date={anniversary} />
              ) : null}
            </div>
            <AddImportantDateDialog open={addImportantDateOpen} onOpenChange={setAddImportantDateOpen} />
          </DetailSection>

          <div
            id="credit-cards"
            ref={creditCardsAnchorRef}
            className="scroll-mt-28"
          >
            <DetailSection
              title="Credit cards"
              open={creditCardsOpen}
              onOpenChange={setCreditCardsOpen}
              action={
                client.creditCards.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setAddCardOpen(true)}
                    className={editLinkCls}
                  >
                    + Add
                  </button>
                ) : undefined
              }
            >
              <div className="space-y-3">
                {client.creditCards.length === 0 ? (
                  <InlineSectionEmptyBox>
                    <button
                      type="button"
                      className={inlineSectionEmptyActionTriggerClass}
                      onClick={() => setAddCardOpen(true)}
                    >
                      <InlineSectionEmptyActionLabel>Add card</InlineSectionEmptyActionLabel>
                    </button>
                  </InlineSectionEmptyBox>
                ) : (
                  client.creditCards.map((c) => (
                    <CreditCardRow
                      key={c.id}
                      card={c}
                      variant="detail"
                      billingAddress={client.addresses[0] ?? null}
                      expandDetailsSignal={creditCardDetailsSignal}
                    />
                  ))
                )}
              </div>
              <AddCreditCardDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
            </DetailSection>
          </div>

          <DetailSection
            title="Loyalty programs"
            action={
              email ? (
                <button
                  type="button"
                  onClick={openLoyaltyAdd}
                  className={editLinkCls}
                  aria-label="Add loyalty program"
                >
                  + Add
                </button>
              ) : (
                <Link
                  href={`/clients/${client.id}/edit`}
                  className={editLinkCls}
                  aria-label="Add an email address to add loyalty programs"
                >
                  + Add
                </Link>
              )
            }
          >
            {client.loyaltyPrograms.length === 0 ? (
              <InlineSectionEmptyBox>
                {email ? (
                  <button
                    type="button"
                    className={inlineSectionEmptyActionTriggerClass}
                    onClick={openLoyaltyAdd}
                    aria-label="Add loyalty program"
                  >
                    <InlineSectionEmptyActionLabel>Add loyalty program</InlineSectionEmptyActionLabel>
                  </button>
                ) : (
                  <Link
                    href={`/clients/${client.id}/edit`}
                    className={cn(inlineSectionEmptyActionTriggerClass, "no-underline")}
                  >
                    <InlineSectionEmptyActionLabel>Add email</InlineSectionEmptyActionLabel>
                  </Link>
                )}
              </InlineSectionEmptyBox>
            ) : (
              <ul className="space-y-2.5">
                {client.loyaltyPrograms.map((lp) => (
                  <li
                    key={lp.id}
                    className="flex items-center gap-3 rounded-[14px] border border-fora-border bg-white py-3.5 pl-4 pr-4"
                  >
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-lg text-[15px] font-bold leading-none tracking-tight",
                        loyaltyProgramAvatarClass(lp.programName),
                      )}
                      aria-hidden
                    >
                      {loyaltyProgramInitials(lp.programName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold leading-tight text-fora-navy">
                        {lp.programName}
                      </p>
                      <p className="mt-0.5 truncate text-[13px] font-normal leading-tight text-fora-muted">
                        {lp.accountNumber}
                      </p>
                    </div>
                    <Menu.Root>
                      <Menu.Trigger
                        type="button"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] outline-none transition-colors hover:bg-fora-app hover:text-fora-muted aria-expanded:bg-fora-app"
                        aria-label={`More options for ${lp.programName}`}
                      >
                        <MoreHorizontal className="size-[18px]" strokeWidth={1.85} aria-hidden />
                      </Menu.Trigger>
                      <Menu.Portal>
                        <Menu.Positioner sideOffset={6} align="end">
                          <Menu.Popup className="z-50 min-w-[180px] rounded-lg border border-fora-border bg-white p-1 text-fora-navy shadow-md outline-none">
                            <Menu.Item
                              className={loyaltyRowMenuItemClass}
                              onClick={() => openLoyaltyEdit(lp)}
                            >
                              <Pencil className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              className={cn(loyaltyRowMenuItemClass, "text-fora-danger")}
                              onClick={() => setLoyaltyDeleteProgram(lp)}
                            >
                              <Trash2 className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                              Delete
                            </Menu.Item>
                          </Menu.Popup>
                        </Menu.Positioner>
                      </Menu.Portal>
                    </Menu.Root>
                  </li>
                ))}
              </ul>
            )}
            {email ? (
              <p className="mt-3 text-[13px] leading-snug">
                <a
                  href={loyaltyProgramsRequestMailto(email.address, client.firstName)}
                  className={cn(editLinkCls, "inline-flex items-center gap-1")}
                  aria-label="Email client to request loyalty program details"
                >
                  <Mail className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  Request from client
                </a>
              </p>
            ) : null}
            <EditLoyaltyProgramDialog
              open={loyaltyDialog !== null}
              onOpenChange={(next) => {
                if (!next) setLoyaltyDialog(null);
              }}
              formKey={loyaltyDialogFormKey}
              clientId={client.id}
              mode={loyaltyDialog?.kind === "add" ? "add" : "edit"}
              program={loyaltyDialog?.kind === "edit" ? loyaltyDialog.program : null}
              onSaved={refreshAfterLoyaltyChange}
            />
            <DeleteLoyaltyProgramDialog
              open={loyaltyDeleteProgram !== null}
              onOpenChange={(next) => {
                if (!next) setLoyaltyDeleteProgram(null);
              }}
              clientId={client.id}
              program={loyaltyDeleteProgram}
              onDeleted={refreshAfterLoyaltyChange}
            />
          </DetailSection>
            </div>
          </div>
        ) : detailTab === "associated" ? (
          <div
            id="client-tab-associated-panel"
            role="tabpanel"
            aria-labelledby="client-tab-associated-trigger"
          >
            <AssociatedTravelersSection
              clientId={client.id}
              groups={getTravelerGroupsForDisplay(client)}
              onRefresh={refreshAfterLoyaltyChange}
              primaryClientName={clientDisplayName(client)}
              primaryBookingRows={primaryClientProfileDetailFields(client)}
              onOpenPrimaryClientProfile={() => setDetailTab("details")}
              clientCreditCards={client.creditCards}
              clientBillingAddress={client.addresses[0] ?? null}
              companionLinkableClients={companionLinkableClients}
            />
          </div>
        ) : (
          <ClientProfileNotesTab client={client} />
        )}
      </div>
    </div>
  );
}
