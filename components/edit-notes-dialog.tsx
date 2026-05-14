"use client";

import { useCallback, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FIELD =
  "min-h-[160px] w-full min-w-0 rounded-lg border-fora-border bg-white px-3 py-2.5 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Increment when opening the dialog so the form remounts with a fresh draft (see AddCreditCardDialog reset-on-close). */
  formKey: number;
  initialNotes: string | null;
  onSave: (notes: string) => void;
};

type FormProps = {
  initialNotes: string | null;
  onSave: (notes: string) => void;
  onClose: () => void;
};

function EditNotesForm({ initialNotes, onSave, onClose }: FormProps) {
  const reactId = useId();
  const [draft, setDraft] = useState(() => initialNotes ?? "");

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft.trim());
        toast.success("Notes saved");
        onClose();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`${reactId}-notes`} className="text-sm font-normal text-fora-muted">
          Notes
        </Label>
        <Textarea
          id={`${reactId}-notes`}
          name="notes"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={FIELD}
          placeholder="e.g. Prefers aisle seats, vegetarian meals, Marriott Bonvoy Titanium…"
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
        <Dialog.Close
          type="button"
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-fora-border bg-white px-4 text-[15px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-border/60",
          )}
        >
          Cancel
        </Dialog.Close>
        <Button
          type="submit"
          className="h-10 rounded-full bg-black px-6 text-[15px] font-medium text-white hover:bg-gray-800"
        >
          Save notes
        </Button>
      </div>
    </form>
  );
}

export function EditNotesDialog({ open, onOpenChange, formKey, initialNotes, onSave }: Props) {
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
              "max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto rounded-[16px] border border-fora-border bg-white p-6 shadow-lg outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
            )}
          >
            <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
              Client notes
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-fora-muted">
              Travel preferences, reminders, and anything else useful for trips. This demo only keeps
              changes until you leave the page.
            </Dialog.Description>

            {open ? (
              <EditNotesForm
                key={formKey}
                initialNotes={initialNotes}
                onSave={onSave}
                onClose={close}
              />
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
