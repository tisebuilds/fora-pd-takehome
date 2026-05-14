"use client";

import { useCallback, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import {
  addTravelerGroupAction,
  renameTravelerGroupAction,
} from "@/app/clients/associated-traveler-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const segmentWrap =
  "flex w-full rounded-lg border border-fora-border bg-fora-app/80 p-0.5 gap-0.5 sm:inline-flex sm:w-auto";

function segmentBtn(active: boolean) {
  return cn(
    "inline-flex h-9 flex-1 items-center justify-center rounded-md px-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fora-border/60",
    active ? "bg-fora-navy text-white shadow-sm" : "bg-white text-fora-navy hover:bg-white/90",
  );
}

const FIELD =
  "h-10 w-full min-w-0 rounded-lg border-fora-border bg-white px-3 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

type FormProps = {
  formKey: number;
  clientId: string;
  mode: "add" | "rename";
  groupId: string | null;
  initialName: string;
  onSaved: () => void;
  onClose: () => void;
};

function TravelerGroupNameForm({
  formKey,
  clientId,
  mode,
  groupId,
  initialName,
  onSaved,
  onClose,
}: FormProps) {
  const reactId = useId();
  const [name, setName] = useState(initialName);
  const [includePrimaryClient, setIncludePrimaryClient] = useState(true);
  const [pending, setPending] = useState(false);

  return (
    <form
      key={formKey}
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        try {
          if (mode === "add") {
            const result = await addTravelerGroupAction(clientId, name, includePrimaryClient);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Group created");
          } else {
            if (!groupId) {
              toast.error("Missing group.");
              return;
            }
            const result = await renameTravelerGroupAction(clientId, groupId, name);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Group renamed");
          }
          onSaved();
          onClose();
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`${reactId}-name`} className="text-sm font-normal text-fora-muted">
          Group name
        </Label>
        <Input
          id={`${reactId}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD}
          placeholder="e.g. Family, Spring break 2026"
          autoComplete="off"
          required
        />
      </div>
      {mode === "add" ? (
        <div className="space-y-1.5">
          <p className="text-sm font-normal text-fora-muted">Primary client on this group</p>
          <div className={segmentWrap} role="group" aria-label="Include primary client in group">
            <button
              type="button"
              onClick={() => setIncludePrimaryClient(true)}
              className={segmentBtn(includePrimaryClient)}
            >
              Include primary
            </button>
            <button
              type="button"
              onClick={() => setIncludePrimaryClient(false)}
              className={segmentBtn(!includePrimaryClient)}
            >
              Companions only
            </button>
          </div>
          <p className="text-[12px] leading-snug text-fora-muted">
            “Companions only” hides this client’s profile row here — useful for lists like pets or colleagues.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
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
          type="submit"
          disabled={pending}
          className="h-10 rounded-full bg-black px-6 text-[15px] font-medium text-white hover:bg-gray-800"
        >
          {mode === "add" ? "Create group" : "Save"}
        </Button>
      </div>
    </form>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formKey: number;
  clientId: string;
  mode: "add" | "rename";
  groupId: string | null;
  initialName?: string;
  onSaved: () => void;
};

export function TravelerGroupNameDialog({
  open,
  onOpenChange,
  formKey,
  clientId,
  mode,
  groupId,
  initialName = "",
  onSaved,
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

  const showForm = open && (mode === "add" || (mode === "rename" && groupId));

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
              {mode === "add" ? "New traveler group" : "Rename group"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-fora-muted">
              {mode === "add"
                ? "Create a set of people who often travel together (family, work trips, etc.)."
                : "Update how this group appears on the profile."}
            </Dialog.Description>

            {showForm ? (
              <TravelerGroupNameForm
                key={`${formKey}-${mode}-${groupId ?? "new"}`}
                formKey={formKey}
                clientId={clientId}
                mode={mode}
                groupId={groupId}
                initialName={initialName}
                onSaved={onSaved}
                onClose={close}
              />
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
