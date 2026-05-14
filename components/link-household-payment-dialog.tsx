"use client";

import { useCallback, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import { setTravelerGroupPaymentCardIdsAction } from "@/app/clients/associated-traveler-actions";
import { Button } from "@/components/ui/button";
import type { CreditCard } from "@/lib/types";
import { cn } from "@/lib/utils";

function cardSummaryLine(card: CreditCard): string {
  const brand =
    card.brand === "visa"
      ? "Visa"
      : card.brand === "mastercard"
        ? "Mastercard"
        : card.brand === "amex"
          ? "Amex"
          : "Card";
  const holder = card.cardholderName.trim();
  return holder ? `${brand} ····${card.last4} · ${holder}` : `${brand} ····${card.last4}`;
}

type CardPickerProps = {
  clientId: string;
  groupId: string;
  cards: CreditCard[];
  initialSelectedIds: string[];
  onSaved: () => void;
  close: () => void;
};

function LinkHouseholdPaymentCardPicker({
  clientId,
  groupId,
  cards,
  initialSelectedIds,
  onSaved,
  close,
}: CardPickerProps) {
  const reactId = useId();
  const [selected, setSelected] = useState(() => new Set(initialSelectedIds));
  const [pending, setPending] = useState(false);

  const toggle = (cardId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const handleSave = async () => {
    setPending(true);
    try {
      const ids = [...selected];
      const result = await setTravelerGroupPaymentCardIdsAction(clientId, groupId, ids);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(ids.length ? "Payment details linked to household." : "Household payment links cleared.");
      onSaved();
      close();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <ul className="mt-6 list-none space-y-2" role="list">
        {cards.map((card) => {
          const id = `${reactId}-${card.id}`;
          const checked = selected.has(card.id);
          return (
            <li key={card.id} className="list-none">
              <label
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-[14px] transition-colors",
                  checked
                    ? "border-fora-navy/30 bg-fora-app"
                    : "border-fora-border bg-white hover:bg-fora-app/40",
                )}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(card.id)}
                  className="mt-0.5 size-4 shrink-0 rounded border-fora-border text-fora-navy"
                />
                <span className="min-w-0 leading-snug text-fora-navy">{cardSummaryLine(card)}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Dialog.Close
          type="button"
          disabled={pending}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-fora-border bg-white px-4 text-[15px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-border/60",
            pending && "pointer-events-none opacity-50",
          )}
        >
          Cancel
        </Dialog.Close>
        <Button
          type="button"
          disabled={pending}
          onClick={() => void handleSave()}
          className="h-10 rounded-full bg-fora-navy px-6 text-[15px] font-medium text-white hover:bg-fora-navy/90"
        >
          Save
        </Button>
      </div>
    </>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formKey: number;
  clientId: string;
  groupId: string | null;
  groupName: string | null;
  cards: CreditCard[];
  initialSelectedIds: string[];
  onSaved: () => void;
  onOpenPrimaryClientProfile: () => void;
};

export function LinkHouseholdPaymentDialog({
  open,
  onOpenChange,
  formKey,
  clientId,
  groupId,
  groupName,
  cards,
  initialSelectedIds,
  onSaved,
  onOpenPrimaryClientProfile,
}: Props) {
  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const close = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/25 transition-[opacity] duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup
            className={cn(
              "max-h-[min(520px,85vh)] w-full max-w-md overflow-y-auto rounded-[16px] border border-fora-border bg-white p-6 shadow-lg outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
            )}
          >
            <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
              Link payment details
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-fora-muted">
              {groupName ? (
                <>
                  Choose profile cards to show under{" "}
                  <span className="font-medium text-fora-navy">{groupName}</span> for bookings and folios.
                </>
              ) : (
                "Choose profile cards to associate with this household."
              )}
            </Dialog.Description>

            {cards.length === 0 ? (
              <>
                <div className="mt-6 rounded-lg border border-fora-border bg-fora-app/50 px-4 py-3.5 text-[14px] leading-snug text-fora-muted">
                  <p>No cards on this client profile yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onOpenPrimaryClientProfile();
                    }}
                    className="mt-2 text-[14px] font-medium text-fora-link underline-offset-2 hover:underline"
                  >
                    Open Details to add a card
                  </button>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <Dialog.Close
                    type="button"
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-fora-border bg-white px-4 text-[15px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-border/60",
                    )}
                  >
                    Cancel
                  </Dialog.Close>
                </div>
              </>
            ) : groupId ? (
              <LinkHouseholdPaymentCardPicker
                key={formKey}
                clientId={clientId}
                groupId={groupId}
                cards={cards}
                initialSelectedIds={initialSelectedIds}
                onSaved={onSaved}
                close={close}
              />
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
