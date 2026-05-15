"use client";

import { useCallback, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  addTravelerGroupAction,
  renameTravelerGroupAction,
} from "@/app/clients/associated-traveler-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FIELD =
  "h-10 w-full min-w-0 rounded-md border border-fora-border bg-white px-3 text-[15px] text-black shadow-none outline-none transition-colors placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-300/80";

function primaryGivenNameForLabel(primaryClientDisplayName: string): string {
  const t = primaryClientDisplayName.trim();
  if (!t) return "the primary traveler";
  return t.split(/\s+/)[0] ?? t;
}

type FormProps = {
  formKey: number;
  clientId: string;
  mode: "add" | "rename";
  groupId: string | null;
  initialName: string;
  primaryClientDisplayName: string;
  onSaved: () => void;
  onClose: () => void;
};

function TravelerGroupNameForm({
  formKey,
  clientId,
  mode,
  groupId,
  initialName,
  primaryClientDisplayName,
  onSaved,
  onClose,
}: FormProps) {
  const reactId = useId();
  const [name, setName] = useState(initialName);
  const [includePrimaryClient, setIncludePrimaryClient] = useState(true);
  const [pending, setPending] = useState(false);
  const includePrimaryId = `${reactId}-include-primary`;
  const given = primaryGivenNameForLabel(primaryClientDisplayName);

  return (
    <form
      key={formKey}
      className="mt-6 space-y-5"
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
      <div className="space-y-2">
        <Label htmlFor={`${reactId}-name`} className="text-[15px] font-normal text-neutral-700">
          Name
        </Label>
        <Input
          id={`${reactId}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD}
          placeholder="Family, Spring break 2026..."
          autoComplete="off"
          required
        />
      </div>
      {mode === "add" ? (
        <label className="flex cursor-pointer gap-3 rounded-md border border-fora-border bg-white p-4 outline-none transition-colors hover:bg-neutral-50/80 focus-within:ring-2 focus-within:ring-neutral-300/80">
          <input
            id={includePrimaryId}
            type="checkbox"
            checked={includePrimaryClient}
            onChange={(e) => setIncludePrimaryClient(e.target.checked)}
            className="sr-only"
          />
          <span
            className={cn(
              "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-sm border bg-white",
              includePrimaryClient ? "border-black bg-black" : "border-neutral-300 bg-white",
            )}
          >
            {includePrimaryClient ? (
              <Check strokeWidth={3} className="size-3.5 text-white" aria-hidden />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-normal text-black">
              Include {given} in this group
            </span>
            <span className="mt-1 block text-[13px] leading-snug text-neutral-500">
              Uncheck for pets, colleagues, or other lists.
            </span>
          </span>
        </label>
      ) : null}
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
        <Dialog.Close
          type="button"
          disabled={pending}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-fora-border bg-white px-5 text-[15px] font-medium text-black outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-300/80",
            pending && "pointer-events-none opacity-50",
          )}
        >
          Cancel
        </Dialog.Close>
        <Button
          type="submit"
          disabled={pending}
          className="h-10 rounded-md bg-black px-6 text-[15px] font-medium text-white hover:bg-neutral-800"
        >
          {mode === "add" ? "Create" : "Save"}
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
  /** Full display name of the primary client; first word is used in the add-group include checkbox. */
  primaryClientDisplayName: string;
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
  primaryClientDisplayName,
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
            "fixed inset-0 z-50 bg-neutral-300/50 transition-[opacity] duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup
            className={cn(
              "w-full max-w-md rounded-md border border-neutral-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
            )}
          >
            <Dialog.Title className="font-sans text-xl font-semibold tracking-tight text-black">
              {mode === "add" ? "New group" : "Rename group"}
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-[15px] font-normal text-neutral-500">
              {mode === "add"
                ? "Travelers who often book together."
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
                primaryClientDisplayName={primaryClientDisplayName}
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
