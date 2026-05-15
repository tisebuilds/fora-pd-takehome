"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Menu } from "@base-ui/react/menu";
import { Copy, Eye, EyeOff, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ClientAddress, CreditCard } from "@/lib/types";
import { cardExpiry, cardExpirySpaced } from "@/lib/format";
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

/** Short uppercase mark for non-Visa brands (Visa uses `/VisaLogo.svg` in the embed pill and badge cells). */
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

/** Demo PAN lines for prototype table rows (seed data only stores last4). */
function demoPanLine(card: CreditCard): string {
  switch (card.brand) {
    case "visa":
      return `4111 1111 1111 ${card.last4}`;
    case "mastercard":
      return `5555 5555 5555 ${card.last4}`;
    case "amex":
      return `3782 822463 ${card.last4}`;
    default:
      return `${typedMask(4)} ${typedMask(4)} ${typedMask(4)} ${card.last4}`;
  }
}

/** Middle-dot mask (matches `demoPanLine` default / household card summaries). */
const TYPED_MASK_DOT = "·";

function typedMask(count: number): string {
  return TYPED_MASK_DOT.repeat(count);
}

function maskedPanLine(card: CreditCard): string {
  if (card.brand === "amex") {
    return `${typedMask(4)} ${typedMask(6)} ${card.last4}`;
  }
  return `${typedMask(4)} ${typedMask(4)} ${typedMask(4)} ${card.last4}`;
}

function brandMarkUpper(brand: CreditCard["brand"]): string {
  switch (brand) {
    case "visa":
      return "VISA";
    case "mastercard":
      return "MASTERCARD";
    case "amex":
      return "AMEX";
    default:
      return "CARD";
  }
}

/** Single-line billing: `Street · City, ST ZIP` (table inline card). */
function billingSingleLineDot(addr: ClientAddress | null | undefined): string {
  if (!addr) return "-";
  const street = [addr.line1, addr.line2].map((s) => s?.trim()).filter(Boolean).join(", ");
  const cityState = [addr.city?.trim(), addr.state?.trim()].filter(Boolean).join(", ");
  const zip = addr.zip?.trim() ?? "";
  const tail = [cityState, zip].filter(Boolean).join(" ").trim();
  if (!street && !tail) return "-";
  if (!street) return tail;
  if (!tail) return street;
  return `${street} · ${tail}`;
}

function copyToClipboard(value: string, toastLabel: string) {
  if (!value || value === "-") {
    toast.error("Nothing to copy");
    return;
  }
  void navigator.clipboard.writeText(value).then(
    () => toast.success(toastLabel),
    () => toast.error("Could not copy"),
  );
}

function useShortcutCopyLabel(): string {
  return useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘C" : "Ctrl+C"),
    () => "⌘C",
  );
}

const cardActionsMenuItemClass =
  "flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-fora-navy outline-none transition-colors data-highlighted:bg-fora-app";

function CreditCardBrandMark({
  brand,
  className,
}: {
  brand: CreditCard["brand"];
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)} aria-hidden>
      {brand === "visa" ? (
        <Image
          src="/VisaLogo.svg"
          alt=""
          width={60}
          height={24}
          unoptimized
          className="h-[19.5px] w-auto max-w-[78px] shrink-0 object-contain object-left"
          draggable={false}
        />
      ) : (
        <span className="text-[13px] font-semibold tracking-wide text-[#111827]">
          {brandMarkUpper(brand)}
        </span>
      )}
    </span>
  );
}

function CreditCardActionsMenu({ muted }: { muted?: boolean }) {
  return (
    <Menu.Root>
      <Menu.Trigger
        type="button"
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#9CA3AF] outline-none transition-colors hover:bg-[#F9FAFB] hover:text-[#6B7280] focus-visible:ring-2 focus-visible:ring-fora-navy/20 aria-expanded:bg-[#F9FAFB]",
          muted && "border-fora-border/70",
        )}
        aria-label="More card options"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end">
          <Menu.Popup className="z-50 min-w-[188px] rounded-lg border border-fora-border bg-white p-1 text-fora-navy shadow-md outline-none">
            <Menu.Item
              className={cardActionsMenuItemClass}
              onClick={() => toast("Rename card (demo)")}
            >
              <Pencil className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
              Rename card
            </Menu.Item>
            <Menu.Item
              className={cardActionsMenuItemClass}
              onClick={() => toast("Set as default (demo)")}
            >
              <Star className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
              Set as default
            </Menu.Item>
            <Menu.Item
              className={cn(cardActionsMenuItemClass, "text-fora-danger")}
              onClick={() => toast("Delete card (demo)")}
            >
              <Trash2 className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
              Delete card
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

type Props = {
  card: CreditCard;
  variant?: "list" | "detail";
  /**
   * When `variant` is `detail`, `"muted"` reads as secondary context (e.g. household FYI)
   * with lighter chrome; `"default"` is the prominent profile card treatment.
   */
  detailTone?: "default" | "muted";
  /** Shown under the “Brand ending in …” line in `detail` layout (e.g. household context). */
  detailSubcaption?: ReactNode;
  className?: string;
  /**
   * Table-style clients list: inline “card on file” panel with five-column copy fields.
   */
  embeddedListWithCopy?: boolean;
  /** Primary billing address when shown next to the card (prototype). */
  billingAddress?: ClientAddress | null;
  /** Collapse the list credit panel (table layout). */
  onHide?: () => void;
  /**
   * When `embeddedListWithCopy`, controls whether the Hide control appears in the card row
   * header next to Edit. Set `false` when the parent renders Hide (e.g. section header).
   * Ignored if `onHide` is omitted. @default true
   */
  showHideInEmbedRow?: boolean;
  /**
   * When `embeddedListWithCopy`, show Edit and Hide in the header and Remove below the copy hint.
   * Set `false` for table-expanded panels where the parent owns section chrome. @default true
   */
  showEmbedChromeActions?: boolean;
  /**
   * When this number increases, full card details (PAN, etc.) expand - used by the profile header
   * “jump to credit cards” control so rows are not left in the default collapsed state.
   */
  expandDetailsSignal?: number;
};

function CopyValueButton({
  value,
  toastLabel,
  ariaLabel,
  pill = false,
  onDark = false,
}: {
  value: string;
  toastLabel: string;
  ariaLabel: string;
  /** Compact control aligned with inline pill rows (table prototype). */
  pill?: boolean;
  /** Lighter icon for navy card chrome. */
  onDark?: boolean;
}) {
  return (
    <button
      type="button"
      title={ariaLabel}
      className={cn(
        "shrink-0 rounded p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fora-navy/25",
        onDark
          ? "self-start text-white/65 hover:bg-white/10 hover:text-white focus-visible:ring-white/40"
          : cn(
              "text-fora-muted",
              pill
                ? "self-center text-[#6B7280] hover:bg-black/[0.06] hover:text-[#374151]"
                : "mt-0.5 self-start hover:bg-fora-app hover:text-fora-navy",
            ),
      )}
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
      <Copy className={pill ? "size-3" : "size-3.5"} strokeWidth={2} aria-hidden />
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

/** Two-row card: brand + PAN + actions, then Cardholder · Expires · CVV · Billing. */
function CreditCardPanel({
  card,
  billingAddress,
  masked,
  onToggleMasked,
  showVisibilityToggle = false,
  showActionsMenu = false,
  mutedChrome = false,
}: {
  card: CreditCard;
  billingAddress?: ClientAddress | null;
  masked: boolean;
  onToggleMasked?: () => void;
  showVisibilityToggle?: boolean;
  showActionsMenu?: boolean;
  mutedChrome?: boolean;
}) {
  const panFull = demoPanLine(card);
  const panDisplay = masked ? maskedPanLine(card) : panFull;
  const expirySpaced = cardExpirySpaced(card.expMonth, card.expYearTwoDigit);
  const expiryCopy = cardExpiry(card.expMonth, card.expYearTwoDigit);
  const cvvFull = card.cvvDemo ?? "";
  const cvvMasked = typedMask(card.brand === "amex" ? 4 : 3);
  const cvvDisplay = masked || !cvvFull ? cvvMasked : cvvFull;
  const billingLine = billingSingleLineDot(billingAddress ?? undefined);

  const colLabel = "text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]";
  const colValue = "mt-1 text-[14px] font-semibold leading-snug text-[#111827]";
  const colBtn =
    "flex w-full min-w-0 flex-col rounded-md px-3 py-2.5 text-left outline-none transition-colors hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-fora-navy/20 sm:px-4 sm:py-3";
  const panBtn =
    "min-w-0 rounded-md text-left outline-none transition-colors hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-fora-navy/20";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)]",
        mutedChrome ? "border-fora-border/70" : "border-[#E5E7EB]",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#E5E7EB] px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <CreditCardBrandMark brand={card.brand} />
          <button
            type="button"
            className={panBtn}
            onClick={() => copyToClipboard(panFull, "Card number copied")}
          >
            <span className="font-mono text-[15px] font-semibold tabular-nums tracking-wide text-[#111827] sm:text-[16px]">
              {panDisplay}
            </span>
          </button>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5">
          <p className="text-[11px] leading-snug text-[#9CA3AF]">Click any field to copy</p>
          {showVisibilityToggle && onToggleMasked ? (
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] outline-none transition-colors hover:bg-black/[0.04] hover:text-[#6B7280] focus-visible:ring-2 focus-visible:ring-fora-navy/20"
              aria-label={masked ? "Show card number and security code" : "Hide card number and security code"}
              aria-pressed={!masked}
              onClick={onToggleMasked}
            >
              {masked ? (
                <Eye className="size-4" strokeWidth={2} aria-hidden />
              ) : (
                <EyeOff className="size-4" strokeWidth={2} aria-hidden />
              )}
            </button>
          ) : null}
          {showActionsMenu ? <CreditCardActionsMenu muted={mutedChrome} /> : null}
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-2 divide-y divide-[#E5E7EB] sm:grid-cols-[minmax(0,1.1fr)_auto_auto_minmax(0,1.65fr)] sm:divide-x sm:divide-y-0">
        <button
          type="button"
          className={colBtn}
          onClick={() => copyToClipboard(card.cardholderName, "Cardholder copied")}
        >
          <span className={colLabel}>Cardholder</span>
          <span className={cn(colValue, "break-words")}>{card.cardholderName}</span>
        </button>
        <button
          type="button"
          className={colBtn}
          onClick={() => copyToClipboard(expiryCopy, "Expiry copied")}
        >
          <span className={colLabel}>Expires</span>
          <span className={cn(colValue, "font-mono tabular-nums")}>{expirySpaced}</span>
        </button>
        <button
          type="button"
          className={cn(colBtn, !cvvFull && "cursor-not-allowed opacity-50 hover:bg-transparent")}
          disabled={!cvvFull}
          onClick={() => copyToClipboard(cvvFull, "Security code copied")}
        >
          <span className={colLabel}>CVV</span>
          <span className={cn(colValue, "font-mono tracking-wide")}>{cvvFull ? cvvDisplay : "-"}</span>
        </button>
        <button
          type="button"
          className={cn(
            colBtn,
            "col-span-2 sm:col-span-1",
            billingLine === "-" && "cursor-not-allowed opacity-50 hover:bg-transparent",
          )}
          disabled={billingLine === "-"}
          onClick={() => copyToClipboard(billingLine, "Billing address copied")}
        >
          <span className={colLabel}>Billing</span>
          <span className={cn(colValue, "truncate sm:break-words sm:whitespace-normal")}>{billingLine}</span>
        </button>
      </div>
    </div>
  );
}

export function CreditCardRow({
  card,
  variant = "list",
  detailTone = "default",
  detailSubcaption,
  className,
  embeddedListWithCopy,
  billingAddress,
  onHide,
  showHideInEmbedRow = true,
  showEmbedChromeActions = true,
  expandDetailsSignal = 0,
}: Props) {
  const embed = Boolean(embeddedListWithCopy);
  const [revealed, setRevealed] = useState(false);
  const [masked, setMasked] = useState(true);
  const isDetail = variant === "detail";
  const mutedDetail = isDetail && detailTone === "muted";
  const detailsId = useId();
  const groupLabel = `${brandLabel(card.brand)} ending in ${card.last4}`;
  const expiry = cardExpiry(card.expMonth, card.expYearTwoDigit);
  const profileLayout = isDetail && !embed;
  const embedRootRef = useRef<HTMLDivElement>(null);
  const shortcutLabel = useShortcutCopyLabel();

  useEffect(() => {
    if (expandDetailsSignal <= 0) return;
    setRevealed(true);
    setMasked(false);
  }, [expandDetailsSignal]);

  const copyAllFormReady = useCallback(() => {
    const panFull = demoPanLine(card);
    const expirySpaced = cardExpirySpaced(card.expMonth, card.expYearTwoDigit);
    const cvvFull = card.cvvDemo ?? "";
    const bill = billingSingleLineDot(billingAddress ?? undefined);
    const block = [panFull, expirySpaced, cvvFull, card.cardholderName, bill === "-" ? "" : bill].join("\n");
    void navigator.clipboard.writeText(block).then(
      () => toast.success("Copied form-ready card text"),
      () => toast.error("Could not copy"),
    );
  }, [card, billingAddress]);

  useEffect(() => {
    if (!embeddedListWithCopy) return;
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "c" || e.repeat) return;
      const root = embedRootRef.current;
      if (!root) return;
      const target = e.target;
      if (!(target instanceof Node) || !root.contains(target)) return;
      const sel = typeof window !== "undefined" ? (window.getSelection()?.toString() ?? "") : "";
      if (sel) return;
      e.preventDefault();
      copyAllFormReady();
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [embeddedListWithCopy, copyAllFormReady]);

  if (embed) {
    const embedChromeLink =
      "rounded-sm text-[13px] font-medium text-[#9CA3AF] no-underline outline-none transition-colors hover:text-[#6B7280] focus-visible:ring-2 focus-visible:ring-fora-navy/20";

    return (
      <div
        ref={embedRootRef}
        role="group"
        aria-label={groupLabel}
        className={cn(
          "flex flex-col gap-2",
          showEmbedChromeActions && "gap-3 px-3 py-3 sm:px-4",
          className,
        )}
      >
        {showEmbedChromeActions ? (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <span className="min-w-0 flex-1 text-[13px] font-semibold text-[#111827]">{groupLabel}</span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <button type="button" className={embedChromeLink} onClick={() => toast("Edit card (demo)")}>
                Edit
              </button>
              {onHide && showHideInEmbedRow ? (
                <>
                  <span className="text-[13px] font-medium text-[#D1D5DB]" aria-hidden>
                    |
                  </span>
                  <button type="button" className={embedChromeLink} onClick={onHide}>
                    Hide
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <CreditCardPanel masked={false} card={card} billingAddress={billingAddress} />

        {showEmbedChromeActions ? (
          <p className="min-w-0 text-[11px] leading-relaxed text-[#9CA3AF]">
            <kbd
              suppressHydrationWarning
              className="mx-0.5 inline-flex items-center rounded border border-[#E5E7EB] bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-[#374151] shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]"
            >
              [{shortcutLabel}]
            </kbd>{" "}
            copies all as form-ready text
          </p>
        ) : null}

        {showEmbedChromeActions ? (
          <div className="flex flex-wrap justify-end">
            <button type="button" className={embedChromeLink} onClick={() => toast("Remove card (demo)")}>
              Remove
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (profileLayout) {
    return (
      <div role="group" aria-label={groupLabel} className={cn("flex flex-col gap-2", className)}>
        {detailSubcaption ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fora-muted">{detailSubcaption}</p>
        ) : null}
        <CreditCardPanel
          card={card}
          billingAddress={billingAddress}
          masked={masked}
          onToggleMasked={() => setMasked((m) => !m)}
          showVisibilityToggle
          showActionsMenu
          mutedChrome={mutedDetail}
        />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn("rounded-[10px] border border-fora-border bg-white px-3 py-3", className)}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex min-h-[28px] shrink-0 items-center justify-center rounded border border-fora-border px-2 py-0.5",
            card.brand !== "visa" && "text-[11px] font-bold tracking-wide text-fora-link",
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
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug text-fora-navy">{card.cardholderName}</p>
      <p className="mt-0.5 text-[15px] text-fora-muted">
        Ending in {card.last4}
        {"\u00a0\u00a0"}
        Exp. {expiry}
      </p>

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0",
          revealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div id={detailsId} className="min-h-0" inert={revealed ? undefined : true}>
          <div className="mt-3 border-t border-fora-border pt-3">
            <CardDetailFields card={card} copyable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

