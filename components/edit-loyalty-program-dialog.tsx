"use client";

import { useCallback, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import type { LoyaltyProgram } from "@/lib/types";
import {
  addLoyaltyProgramAction,
  saveLoyaltyProgramAction,
} from "@/app/clients/loyalty-program-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FIELD =
  "h-10 w-full min-w-0 rounded-lg border-fora-border bg-white px-3 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formKey: number;
  clientId: string;
  mode: "add" | "edit";
  program: LoyaltyProgram | null;
  onSaved: () => void;
};

type FormProps = {
  clientId: string;
  mode: "add" | "edit";
  program: LoyaltyProgram | null;
  onSaved: () => void;
  onClose: () => void;
};

function LoyaltyProgramForm({ clientId, mode, program, onSaved, onClose }: FormProps) {
  const reactId = useId();
  const [programName, setProgramName] = useState(program?.programName ?? "");
  const [accountNumber, setAccountNumber] = useState(program?.accountNumber ?? "");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        try {
          if (mode === "add") {
            const result = await addLoyaltyProgramAction(clientId, programName, accountNumber);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Loyalty program added");
          } else {
            if (!program) {
              toast.error("Missing program to edit.");
              return;
            }
            const result = await saveLoyaltyProgramAction(
              clientId,
              program.id,
              programName,
              accountNumber,
            );
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Loyalty program updated");
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
          Program name
        </Label>
        <Input
          id={`${reactId}-name`}
          name="programName"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          className={FIELD}
          autoComplete="off"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${reactId}-acct`} className="text-sm font-normal text-fora-muted">
          Account number
        </Label>
        <Input
          id={`${reactId}-acct`}
          name="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className={FIELD}
          autoComplete="off"
        />
      </div>

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
          {mode === "add" ? "Add program" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function EditLoyaltyProgramDialog({
  open,
  onOpenChange,
  formKey,
  clientId,
  mode,
  program,
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

  const showForm = open && (mode === "add" || program !== null);

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
              {mode === "add" ? "Add loyalty program" : "Edit loyalty program"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-fora-muted">
              {mode === "add"
                ? "Enter the program name and account number. Changes apply to this demo profile until the server restarts."
                : "Update the program name and account number. Changes apply to this demo profile until the server restarts."}
            </Dialog.Description>

            {showForm ? (
              <LoyaltyProgramForm
                key={formKey}
                clientId={clientId}
                mode={mode}
                program={program}
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
