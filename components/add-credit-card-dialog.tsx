"use client";

import { useCallback, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FIELD =
  "h-10 w-full min-w-0 rounded-lg border-fora-border bg-white px-3 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCreditCardDialog({ open, onOpenChange }: Props) {
  const reactId = useId();

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingZip, setBillingZip] = useState("");

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
      if (!next) {
        setCardholderName("");
        setCardNumber("");
        setExpiration("");
        setCvc("");
        setBillingZip("");
      }
    },
    [onOpenChange]
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/25 transition-[opacity] duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup
            className={cn(
              "max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto rounded-[16px] border border-fora-border bg-white p-6 shadow-lg outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0"
            )}
          >
            <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
              Add credit card
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-fora-muted">
              Enter card details. This demo does not store payment information.
            </Dialog.Description>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                console.log({
                  cardholderName,
                  cardNumber,
                  expiration,
                  cvc,
                  billingZip: billingZip.trim() || undefined,
                });
                toast.success("Card added");
                handleOpenChange(false);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor={`${reactId}-name`} className="text-sm font-normal text-fora-muted">
                  Cardholder name
                </Label>
                <Input
                  id={`${reactId}-name`}
                  name="cardholderName"
                  autoComplete="cc-name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className={FIELD}
                  placeholder="Name on card"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${reactId}-number`} className="text-sm font-normal text-fora-muted">
                  Card number
                </Label>
                <Input
                  id={`${reactId}-number`}
                  name="cardNumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className={cn(FIELD, "font-mono")}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`${reactId}-exp`} className="text-sm font-normal text-fora-muted">
                    Expiration (MM/YY)
                  </Label>
                  <Input
                    id={`${reactId}-exp`}
                    name="expiration"
                    autoComplete="cc-exp"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className={cn(FIELD, "font-mono")}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${reactId}-cvc`} className="text-sm font-normal text-fora-muted">
                    CVC / CVV
                  </Label>
                  <Input
                    id={`${reactId}-cvc`}
                    name="cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className={cn(FIELD, "font-mono")}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${reactId}-zip`} className="text-sm font-normal text-fora-muted">
                  Billing ZIP <span className="font-normal text-fora-muted/80">(optional)</span>
                </Label>
                <Input
                  id={`${reactId}-zip`}
                  name="billingZip"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={billingZip}
                  onChange={(e) => setBillingZip(e.target.value)}
                  className={FIELD}
                  placeholder="12345"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                <Dialog.Close
                  type="button"
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-fora-border bg-white px-4 text-[15px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-border/60"
                  )}
                >
                  Cancel
                </Dialog.Close>
                <Button
                  type="submit"
                  className="h-10 rounded-full bg-black px-6 text-[15px] font-medium text-white hover:bg-gray-800"
                >
                  Add card
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
