"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Copy, Lock, Mail, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Client } from "@/lib/types";
import {
  clientDisplayName,
  formatCityState,
  formatImportantDate,
  formatPhoneDisplay,
} from "@/lib/format";
import { Flag } from "@/components/flag";
import { StatsStrip } from "@/components/stats-strip";
import { CreditCardRow } from "@/components/credit-card-row";
import { AddCreditCardDialog } from "@/components/add-credit-card-dialog";
import { cn } from "@/lib/utils";

const editLinkCls =
  "text-[13px] font-normal text-fora-link no-underline hover:opacity-80";

function personalMobile(client: Client) {
  return client.phones.find((p) => p.type === "mobile") ?? client.phones[0];
}

function personalEmail(client: Client) {
  return client.emails.find((e) => e.type === "personal") ?? client.emails[0];
}

function NotProvided() {
  return <span className="italic text-fora-muted">Not Provided</span>;
}

function CopyEmailButton({ address }: { address: string }) {
  return (
    <button
      type="button"
      title="Copy email"
      className="shrink-0 rounded p-1 text-fora-muted hover:bg-fora-app hover:text-fora-navy"
      onClick={() => {
        void navigator.clipboard.writeText(address).then(
          () => {
            toast.success("Email copied to clipboard");
          },
          () => {
            toast.error("Could not copy email");
          },
        );
      }}
      aria-label="Copy email address"
    >
      <Copy className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function Section({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-7", className)}>
      <div className="flex items-center justify-between gap-4 pb-4">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-fora-muted">
          {title}
        </h3>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-0 border-b border-fora-border py-3 last:border-b-0">
      <p className="text-[13px] text-fora-muted">{label}</p>
      <div className="text-[14px] text-fora-navy">{value}</div>
    </div>
  );
}

function PillButton({
  children,
  href,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const cls =
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-fora-border bg-white px-3.5 text-[13px] text-fora-navy transition-colors hover:bg-fora-app";
  if (href) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function ClientDetailPane({ client, onClose }: { client: Client; onClose?: () => void }) {
  const [addCardOpen, setAddCardOpen] = useState(false);

  const mobile = personalMobile(client);
  const email = personalEmail(client);
  const address = client.addresses[0];
  const birthday = client.importantDates.find((d) => d.label === "Birthday");
  const anniversary = client.importantDates.find((d) => d.label === "Anniversary");
  const cityState = formatCityState(client);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-[860px] px-6 py-7 lg:px-10 lg:py-9">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mb-5 inline-flex text-sm text-fora-link no-underline hover:opacity-80"
          >
            Close
          </button>
        ) : (
          <Link
            href="/clients"
            className="mb-5 inline-flex text-sm text-fora-link no-underline hover:opacity-80 lg:hidden"
          >
            ← All clients
          </Link>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-sans text-[34px] font-bold leading-tight tracking-tight text-fora-navy">
              {clientDisplayName(client)}
            </h1>
            <p className="mt-1 text-[14px] text-fora-muted">
              {[cityState, email?.address].filter(Boolean).join(" · ") || ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PillButton
              href={email ? `mailto:${email.address}` : undefined}
              ariaLabel="Send email"
            >
              <Mail className="size-3.5" strokeWidth={1.75} aria-hidden />
              Email
            </PillButton>
            <PillButton ariaLabel="Add booking">
              <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
              Add booking
            </PillButton>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-fora-border bg-white text-fora-muted transition-colors hover:bg-fora-app hover:text-fora-navy"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <StatsStrip
          bookingsCount={client.bookingsCount}
          commissionableValue={client.commissionableValue}
          commissions={client.commissions}
          className="mt-6"
        />

        {/* Sections */}
        <div className="mt-4 divide-y divide-fora-border">
          <Section
            title="Personal information"
            action={
              <Link href={`/clients/${client.id}/edit`} className={editLinkCls}>
                Edit
              </Link>
            }
          >
            <div>
              <FieldRow label="First name" value={client.firstName} />
              <FieldRow label="Last name" value={client.lastName} />
              <FieldRow
                label="Personal email"
                value={
                  email ? (
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 flex-1 truncate">{email.address}</span>
                      <CopyEmailButton address={email.address} />
                    </span>
                  ) : (
                    <NotProvided />
                  )
                }
              />
              <FieldRow
                label="Mobile number"
                value={
                  mobile && formatPhoneDisplay(mobile) ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Flag code={mobile.country} />
                      {formatPhoneDisplay(mobile)}
                    </span>
                  ) : (
                    <NotProvided />
                  )
                }
              />
              <FieldRow
                label="Address"
                value={
                  address ? (
                    <span className="whitespace-pre-line">
                      {[
                        address.line1,
                        address.line2,
                        [address.city, address.state].filter((s) => s && s.trim()).join(", ") +
                          (address.zip ? ` ${address.zip}` : ""),
                      ]
                        .filter((s) => s && String(s).trim())
                        .join("\n")}
                    </span>
                  ) : (
                    <NotProvided />
                  )
                }
              />
            </div>
          </Section>

          <Section
            title="Important dates"
            action={
              <Link href="#" className={editLinkCls}>
                Edit
              </Link>
            }
          >
            <div>
              <FieldRow
                label="Birthday"
                value={
                  birthday
                    ? formatImportantDate(birthday.month, birthday.day, birthday.year) ?? "—"
                    : "—"
                }
              />
              <FieldRow
                label="Anniversary"
                value={
                  anniversary
                    ? formatImportantDate(
                        anniversary.month,
                        anniversary.day,
                        anniversary.year
                      ) ?? "—"
                    : "—"
                }
              />
            </div>
          </Section>

          <Section
            title="Notes"
            action={
              <Link href="#" className={editLinkCls}>
                Edit
              </Link>
            }
          >
            {client.notes ? (
              <div className="rounded-lg bg-fora-app px-4 py-3 text-[14px] text-fora-navy">
                {client.notes}
              </div>
            ) : (
              <p className="text-[14px] text-fora-muted">
                Add your client&apos;s travel preferences…{" "}
                <button
                  type="button"
                  className="cursor-pointer bg-transparent p-0 text-fora-link no-underline hover:opacity-80"
                >
                  Add notes
                </button>
              </p>
            )}
          </Section>

          <Section
            title={
              <span className="inline-flex items-center gap-2">
                <Lock className="size-3 shrink-0 text-fora-muted" strokeWidth={1.75} aria-hidden />
                Credit cards
              </span>
            }
            action={
              <button
                type="button"
                onClick={() => setAddCardOpen(true)}
                className={editLinkCls}
              >
                + Add
              </button>
            }
          >
            <div className="space-y-3">
              {client.creditCards.length === 0 ? (
                <p className="text-[14px] text-fora-muted">There are no credit cards saved</p>
              ) : (
                client.creditCards.map((c) => (
                  <CreditCardRow key={c.id} card={c} variant="detail" />
                ))
              )}
            </div>
            <AddCreditCardDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
          </Section>

          <Section
            title="Loyalty programs"
            action={
              <Link href="#" className={editLinkCls}>
                Edit
              </Link>
            }
          >
            {client.loyaltyPrograms.length === 0 ? (
              <p className="text-[14px] text-fora-muted">No loyalty programs on file.</p>
            ) : (
              <ul className="space-y-3">
                {client.loyaltyPrograms.map((lp) => (
                  <li
                    key={lp.id}
                    className="rounded-lg border border-fora-border bg-fora-app px-4 py-3 text-[14px] text-fora-navy"
                  >
                    <span className="font-semibold">{lp.programName}</span>{" "}
                    <span className="text-fora-muted">{lp.accountNumber}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="mt-6 border-t border-fora-border pt-6">
          <button
            type="button"
            className="cursor-pointer bg-transparent p-0 text-left text-[13px] font-normal text-fora-danger no-underline hover:opacity-80"
          >
            Delete client
          </button>
        </div>
      </div>
    </div>
  );
}
