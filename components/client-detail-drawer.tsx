"use client";

import { useCallback } from "react";
import { Dialog } from "@base-ui/react/dialog";
import type { Client } from "@/lib/types";
import { ClientDetailPane } from "@/components/client-detail-pane";
import { cn } from "@/lib/utils";

type Props = {
  client: Client | null;
  onClose: () => void;
};

export function ClientDetailDrawer({ client, onClose }: Props) {
  const open = client !== null;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) onClose();
    },
    [onClose]
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/25 transition-[opacity] duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-50 flex justify-end p-0">
          <Dialog.Popup
            className={cn(
              "flex h-full max-h-dvh w-full max-w-[min(100vw,540px)] flex-col overflow-hidden border-l border-fora-border bg-white shadow-xl outline-none",
              "transition-transform duration-300 ease-out",
              "data-[ending-style]:translate-x-full",
              "data-[starting-style]:translate-x-full"
            )}
          >
            <Dialog.Title className="sr-only">Client details</Dialog.Title>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {client ? <ClientDetailPane client={client} onClose={onClose} /> : null}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
