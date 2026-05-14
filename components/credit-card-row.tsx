"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { CreditCard } from "@/lib/types";
import { cardExpiry } from "@/lib/format";
import { cn } from "@/lib/utils";

function brandLabel(brand: CreditCard["brand"]): string {
  switch (brand) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "Amex";
    default:
      return "Card";
  }
}

/** Short uppercase mark for non-Visa brands (Visa uses `/VisaLogo.svg`). */
function brandBadgeText(brand: CreditCard["brand"]): string {
  switch (brand) {
    case "mastercard":
      return "MC";
    case "amex":
      return "AMEX";
    default:
      return "CARD";
  }
}

type Props = {
  card: CreditCard;
  variant?: "list" | "detail";
  className?: string;
  /**
   * List layout: show full details under the summary with a copy control per field
   * (e.g. expanded client list card). No reveal toggle.
   */
  embeddedListWithCopy?: boolean;
};

function CopyValueButton({
  value,
  toastLabel,
  ariaLabel,
}: {
  value: string;
  toastLabel: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      title={ariaLabel}
      className="mt-0.5 shrink-0 self-start rounded p-1 text-fora-muted transition-colors hover:bg-fora-app hover:text-fora-navy"
      aria-label={ariaLabel}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(
          () => {
            toast.success(toastLabel);
          },
          () => {
            toast.error("Could not copy");
          },
        );
      }}
    >
      <Copy className="size-3.5" strokeWidth={2} aria-hidden />
    </button>
  );
}

function CardDetailFields({
  card,
  copyable,
}: {
  card: CreditCard;
  copyable: boolean;
}) {
  const expiry = cardExpiry(card.expMonth, card.expYearTwoDigit);
  const brand = brandLabel(card.brand);

  const rows: Array<{
    label: string;
    value: string;
    mono?: boolean;
    toast: string;
    aria: string;
  }> = [
    {
      label: "Cardholder",
      value: card.cardholderName,
      toast: "Cardholder copied",
      aria: "Copy cardholder name",
    },
    {
      label: "Last 4 digits",
      value: card.last4,
      mono: true,
      toast: "Last 4 digits copied",
      aria: "Copy last 4 digits",
    },
    {
      label: "Expires",
      value: expiry,
      toast: "Expiry copied",
      aria: "Copy expiry date",
    },
    {
      label: "Brand",
      value: brand,
      toast: "Brand copied",
      aria: "Copy card brand",
    },
  ];

  return (
    <dl className="space-y-2 text-[13px] text-fora-navy">
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(copyable && "flex items-start justify-between gap-3")}
        >
          <div className="min-w-0 flex-1">
            <dt className="text-fora-muted">{row.label}</dt>
            <dd
              className={cn(
                row.label === "Cardholder" && "font-semibold",
                row.mono && "font-mono",
                copyable && "font-semibold"
              )}
            >
              {row.value}
            </dd>
          </div>
          {copyable ? <CopyValueButton value={row.value} toastLabel={row.toast} ariaLabel={row.aria} /> : null}
        </div>
      ))}
    </dl>
  );
}

export function CreditCardRow({ card, variant = "list", className, embeddedListWithCopy }: Props) {
  const embed = Boolean(embeddedListWithCopy);
  const [revealed, setRevealed] = useState(false);
  const isDetail = variant === "detail";
  const detailsId = useId();
  const groupLabel = `${brandLabel(card.brand)} ending in ${card.last4}`;

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn(
        "rounded-[10px] border border-fora-border bg-white px-3 py-3",
        isDetail && "px-4 py-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex min-h-[28px] shrink-0 items-center justify-center rounded border border-fora-border px-2 py-0.5",
            card.brand !== "visa" && "text-[11px] font-bold tracking-wide text-fora-link"
          )}
          aria-hidden
        >
          {card.brand === "visa" ? (
            <Image
              src="/VisaLogo.svg"
              alt=""
              width={40}
              height={16}
              unoptimized
              className="h-[14px] w-auto max-w-[40px] object-contain object-center"
              draggable={false}
            />
          ) : (
            brandBadgeText(card.brand)
          )}
        </span>
        {!embed && isDetail ? (
          <div className="flex items-center gap-3 text-[13px]">
            <button type="button" className="text-fora-danger no-underline hover:opacity-80">
              Delete
            </button>
            <button
              type="button"
              className="text-fora-link no-underline hover:opacity-80"
              aria-expanded={revealed}
              aria-controls={detailsId}
              aria-label={revealed ? "Hide full card details" : "Reveal full card details"}
              onClick={() => setRevealed((open) => !open)}
            >
              {revealed ? "Hide" : "Reveal"}
            </button>
          </div>
        ) : !embed ? (
          <button
            type="button"
            className="text-[13px] text-fora-link no-underline hover:opacity-80"
            aria-expanded={revealed}
            aria-controls={detailsId}
            aria-label={revealed ? "Hide full card details" : "Reveal full card details"}
            onClick={() => setRevealed((open) => !open)}
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-fora-navy">{card.cardholderName}</p>
      <p className="mt-0.5 text-[15px] text-fora-muted">
        Ending in {card.last4}
        {"\u00a0\u00a0"}
        Exp. {cardExpiry(card.expMonth, card.expYearTwoDigit)}
      </p>

      {embed ? (
        <div className="mt-3 border-t border-fora-border pt-3">
          <CardDetailFields card={card} copyable />
        </div>
      ) : (
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0",
            revealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div id={detailsId} className="min-h-0" inert={revealed ? undefined : true}>
            <div className="mt-3 border-t border-fora-border pt-3">
              <CardDetailFields card={card} copyable={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
