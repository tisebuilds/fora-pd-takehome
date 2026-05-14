"use client";

import { useCallback, useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { toast } from "sonner";
import type { AssociatedTraveler, CompanionKind, TravelerFlightBookingInfo } from "@/lib/types";
import {
  addTravelerToGroupAction,
  saveTravelerInGroupAction,
} from "@/app/clients/associated-traveler-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FIELD =
  "h-10 w-full min-w-0 rounded-lg border-fora-border bg-white px-3 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

function flightFromTraveler(t: AssociatedTraveler | null): TravelerFlightBookingInfo {
  return {
    dateOfBirth: t?.flight?.dateOfBirth ?? "",
    gender: t?.flight?.gender ?? "",
    email: t?.flight?.email ?? "",
    phone: t?.flight?.phone ?? "",
    passportNumber: t?.flight?.passportNumber ?? "",
    passportExpiry: t?.flight?.passportExpiry ?? "",
    nationality: t?.flight?.nationality ?? "",
    knownTravelerNumber: t?.flight?.knownTravelerNumber ?? "",
  };
}

type PetSpeciesPreset = "cat" | "dog" | "other";

function initialCompanionKind(t: AssociatedTraveler | null): CompanionKind {
  return t?.companionKind === "pet" ? "pet" : "person";
}

function initialPetSpecies(t: AssociatedTraveler | null): { preset: PetSpeciesPreset; other: string } {
  if (t?.companionKind !== "pet") return { preset: "cat", other: "" };
  const ln = (t.lastName ?? "").trim();
  const lower = ln.toLowerCase();
  if (lower === "cat") return { preset: "cat", other: "" };
  if (lower === "dog") return { preset: "dog", other: "" };
  return { preset: "other", other: ln };
}

const segmentWrap =
  "flex rounded-lg border border-fora-border bg-fora-app/80 p-0.5 gap-0.5 sm:inline-flex sm:w-auto w-full";

function segmentBtn(active: boolean) {
  return cn(
    "inline-flex h-9 flex-1 items-center justify-center rounded-md px-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fora-border/60",
    active ? "bg-fora-navy text-white shadow-sm" : "bg-white text-fora-navy hover:bg-white/90",
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formKey: number;
  clientId: string;
  groupId: string;
  mode: "add" | "edit";
  traveler: AssociatedTraveler | null;
  onSaved: () => void;
};

type FormProps = {
  clientId: string;
  groupId: string;
  mode: "add" | "edit";
  traveler: AssociatedTraveler | null;
  onSaved: () => void;
  onClose: () => void;
};

function AssociatedTravelerForm({
  clientId,
  groupId,
  mode,
  traveler,
  onSaved,
  onClose,
}: FormProps) {
  const reactId = useId();
  const [companionKind, setCompanionKind] = useState<CompanionKind>(() => initialCompanionKind(traveler));
  const petInit = initialPetSpecies(traveler);
  const [petSpeciesPreset, setPetSpeciesPreset] = useState<PetSpeciesPreset>(() => petInit.preset);
  const [petSpeciesOther, setPetSpeciesOther] = useState(() => petInit.other);
  const [firstName, setFirstName] = useState(traveler?.firstName ?? "");
  const [lastName, setLastName] = useState(traveler?.lastName ?? "");
  const [relationship, setRelationship] = useState(traveler?.relationship ?? "");
  const [flight, setFlight] = useState<TravelerFlightBookingInfo>(() => flightFromTraveler(traveler));
  const [pending, setPending] = useState(false);

  const setFlightField = (key: keyof TravelerFlightBookingInfo, value: string) => {
    setFlight((prev) => ({ ...prev, [key]: value }));
  };

  const resolvedLastName = () => {
    if (companionKind === "person") return lastName.trim();
    if (petSpeciesPreset === "cat") return "Cat";
    if (petSpeciesPreset === "dog") return "Dog";
    return petSpeciesOther.trim();
  };

  const resolvedCompanionKindForSave = (): CompanionKind | undefined =>
    companionKind === "pet" ? "pet" : undefined;

  return (
    <form
      className="mt-5 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (companionKind === "pet" && petSpeciesPreset === "other" && !petSpeciesOther.trim()) {
          toast.error("Enter a species or breed for this pet.");
          return;
        }
        const ln = resolvedLastName();
        const fn = firstName.trim();
        if (!fn || !ln) {
          toast.error(
            companionKind === "pet" ? "Pet name and species are required." : "First and last name are required.",
          );
          return;
        }
        setPending(true);
        try {
          const ck = resolvedCompanionKindForSave();
          if (mode === "add") {
            const result = await addTravelerToGroupAction(
              clientId,
              groupId,
              ck,
              fn,
              ln,
              relationship,
              flight,
            );
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Companion added");
          } else {
            if (!traveler) {
              toast.error("Missing traveler to edit.");
              return;
            }
            const result = await saveTravelerInGroupAction(
              clientId,
              groupId,
              traveler.id,
              ck,
              fn,
              ln,
              relationship,
              flight,
            );
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Companion updated");
          }
          onSaved();
          onClose();
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fora-muted">Profile</p>
        <div className="space-y-1.5">
          <p className="text-sm font-normal text-fora-muted">Companion type</p>
          <div className={segmentWrap} role="group" aria-label="Companion type">
            <button
              type="button"
              onClick={() => setCompanionKind("person")}
              className={segmentBtn(companionKind === "person")}
            >
              Person
            </button>
            <button
              type="button"
              onClick={() => setCompanionKind("pet")}
              className={segmentBtn(companionKind === "pet")}
            >
              Pet
            </button>
          </div>
        </div>

        {companionKind === "person" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`${reactId}-fn`} className="text-sm font-normal text-fora-muted">
                  First name
                </Label>
                <Input
                  id={`${reactId}-fn`}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={FIELD}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${reactId}-ln`} className="text-sm font-normal text-fora-muted">
                  Last name
                </Label>
                <Input
                  id={`${reactId}-ln`}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={FIELD}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${reactId}-rel`} className="text-sm font-normal text-fora-muted">
                Relationship
              </Label>
              <Input
                id={`${reactId}-rel`}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className={FIELD}
                placeholder="e.g. Spouse, colleague"
                autoComplete="off"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`${reactId}-petname`} className="text-sm font-normal text-fora-muted">
                Pet name
              </Label>
              <Input
                id={`${reactId}-petname`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={FIELD}
                placeholder="e.g. Whiskers"
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-normal text-fora-muted">Species</p>
              <div className={segmentWrap} role="group" aria-label="Pet species">
                <button
                  type="button"
                  onClick={() => setPetSpeciesPreset("cat")}
                  className={segmentBtn(petSpeciesPreset === "cat")}
                >
                  Cat
                </button>
                <button
                  type="button"
                  onClick={() => setPetSpeciesPreset("dog")}
                  className={segmentBtn(petSpeciesPreset === "dog")}
                >
                  Dog
                </button>
                <button
                  type="button"
                  onClick={() => setPetSpeciesPreset("other")}
                  className={segmentBtn(petSpeciesPreset === "other")}
                >
                  Other
                </button>
              </div>
              {petSpeciesPreset === "other" ? (
                <Input
                  id={`${reactId}-species-other`}
                  value={petSpeciesOther}
                  onChange={(e) => setPetSpeciesOther(e.target.value)}
                  className={cn(FIELD, "mt-2")}
                  placeholder="e.g. Rabbit, parrot"
                  autoComplete="off"
                />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${reactId}-rel-pet`} className="text-sm font-normal text-fora-muted">
                Notes
              </Label>
              <Input
                id={`${reactId}-rel-pet`}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className={FIELD}
                placeholder="e.g. Client's cat, emotional support animal"
                autoComplete="off"
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-3 border-t border-fora-border pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fora-muted">
          Flight booking
        </p>
        <p className="text-[13px] leading-snug text-fora-muted">
          {companionKind === "pet"
            ? "These fields are for human ticketed travelers. Leave blank for pets, or add anything the airline keeps on file for this animal."
            : "Legal name above should match their ID. Add government and contact details you use when ticketing."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${reactId}-dob`} className="text-sm font-normal text-fora-muted">
              Date of birth
            </Label>
            <Input
              id={`${reactId}-dob`}
              type="date"
              value={flight.dateOfBirth ?? ""}
              onChange={(e) => setFlightField("dateOfBirth", e.target.value)}
              className={FIELD}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${reactId}-gender`} className="text-sm font-normal text-fora-muted">
              Gender marker
            </Label>
            <Input
              id={`${reactId}-gender`}
              value={flight.gender ?? ""}
              onChange={(e) => setFlightField("gender", e.target.value)}
              className={FIELD}
              placeholder="As on government ID"
              autoComplete="sex"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${reactId}-em`} className="text-sm font-normal text-fora-muted">
              Email
            </Label>
            <Input
              id={`${reactId}-em`}
              type="email"
              value={flight.email ?? ""}
              onChange={(e) => setFlightField("email", e.target.value)}
              className={FIELD}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${reactId}-ph`} className="text-sm font-normal text-fora-muted">
              Phone
            </Label>
            <Input
              id={`${reactId}-ph`}
              value={flight.phone ?? ""}
              onChange={(e) => setFlightField("phone", e.target.value)}
              className={FIELD}
              autoComplete="tel"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${reactId}-pp`} className="text-sm font-normal text-fora-muted">
              Passport number
            </Label>
            <Input
              id={`${reactId}-pp`}
              value={flight.passportNumber ?? ""}
              onChange={(e) => setFlightField("passportNumber", e.target.value)}
              className={FIELD}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${reactId}-nat`} className="text-sm font-normal text-fora-muted">
              Nationality
            </Label>
            <Input
              id={`${reactId}-nat`}
              value={flight.nationality ?? ""}
              onChange={(e) => setFlightField("nationality", e.target.value)}
              className={FIELD}
              placeholder="Country code or name"
              autoComplete="country"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${reactId}-ppe`} className="text-sm font-normal text-fora-muted">
              Passport expiry
            </Label>
            <Input
              id={`${reactId}-ppe`}
              type="date"
              value={flight.passportExpiry ?? ""}
              onChange={(e) => setFlightField("passportExpiry", e.target.value)}
              className={FIELD}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${reactId}-ktn`} className="text-sm font-normal text-fora-muted">
              Known Traveler Number
            </Label>
            <Input
              id={`${reactId}-ktn`}
              value={flight.knownTravelerNumber ?? ""}
              onChange={(e) => setFlightField("knownTravelerNumber", e.target.value)}
              className={FIELD}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-fora-border pt-4 sm:flex-row sm:justify-end sm:gap-3">
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
          {mode === "add" ? "Add companion" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function EditAssociatedTravelerDialog({
  open,
  onOpenChange,
  formKey,
  clientId,
  groupId,
  mode,
  traveler,
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

  const showForm = open && groupId && (mode === "add" || traveler !== null);

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
              "max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-[16px] border border-fora-border bg-white p-6 shadow-lg outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
            )}
          >
            <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
              {mode === "add" ? "Add companion" : "Edit companion"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-fora-muted">
              {mode === "add"
                ? "Add a person or pet who travels with this client. Flight details are optional; they matter most for ticketed passengers."
                : "Update profile and booking details. Changes apply to this demo profile until the server restarts."}
            </Dialog.Description>

            {showForm ? (
              <AssociatedTravelerForm
                key={formKey}
                clientId={clientId}
                groupId={groupId}
                mode={mode}
                traveler={traveler}
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
