"use client";

import { useCallback } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddImportantDateDialog({ open, onOpenChange }: Props) {
  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
    },
    [onOpenChange],
  );

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
              "w-full max-w-md rounded-[16px] border border-fora-border bg-white p-6 shadow-lg outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
            )}
          >
            <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
              Add important date
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-fora-muted">
              This demo lists Birthday and Anniversary only. A full product would let you add
              other milestones (renewals, passport expiry, and so on).
            </Dialog.Description>
            <div className="mt-6 flex justify-end">
              <Dialog.Close
                type="button"
                className={cn(
                  "inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-black px-6 text-[15px] font-medium text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-fora-border/60",
                )}
              >
                Got it
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
