"use client";

import { useCallback, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import { deleteTravelerFromGroupAction } from "@/app/clients/associated-traveler-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Target = { groupId: string; travelerId: string; displayName: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  target: Target | null;
  onDeleted: () => void;
};

export function DeleteAssociatedTravelerDialog({
  open,
  onOpenChange,
  clientId,
  target,
  onDeleted,
}: Props) {
  const [pending, setPending] = useState(false);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const close = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const handleConfirm = async () => {
    if (!target) return;
    setPending(true);
    try {
      const result = await deleteTravelerFromGroupAction(
        clientId,
        target.groupId,
        target.travelerId,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Companion removed");
      onDeleted();
      close();
    } finally {
      setPending(false);
    }
  };

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
              Remove companion?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-fora-muted">
              {target ? (
                <>
                  This removes{" "}
                  <span className="font-medium text-fora-navy">{target.displayName}</span> from this
                  client profile.
                </>
              ) : null}
            </Dialog.Description>

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
                disabled={pending || !target}
                onClick={() => void handleConfirm()}
                className="h-10 rounded-full bg-fora-danger px-6 text-[15px] font-medium text-white hover:bg-fora-danger/90"
              >
                Remove
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
