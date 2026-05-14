"use client";

import Image from "next/image";
import { useId, useState } from "react";
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
};

export function CreditCardRow({ card, variant = "list", className }: Props) {
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
        {isDetail ? (
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
        ) : (
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
        )}
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-fora-navy">{card.cardholderName}</p>
      <p className="mt-0.5 text-[15px] text-fora-muted">
        Ending in {card.last4}
        {"\u00a0\u00a0"}
        Exp. {cardExpiry(card.expMonth, card.expYearTwoDigit)}
      </p>

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0",
          revealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div id={detailsId} className="min-h-0" inert={revealed ? undefined : true}>
          <div className="mt-3 border-t border-fora-border pt-3">
            <dl className="space-y-1.5 text-[13px] text-fora-navy">
              <div>
                <dt className="text-fora-muted">Cardholder</dt>
                <dd className="font-semibold">{card.cardholderName}</dd>
              </div>
              <div>
                <dt className="text-fora-muted">Last 4 digits</dt>
                <dd className="font-mono">{card.last4}</dd>
              </div>
              <div>
                <dt className="text-fora-muted">Expires</dt>
                <dd>{cardExpiry(card.expMonth, card.expYearTwoDigit)}</dd>
              </div>
              <div>
                <dt className="text-fora-muted">Brand</dt>
                <dd>{brandLabel(card.brand)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
