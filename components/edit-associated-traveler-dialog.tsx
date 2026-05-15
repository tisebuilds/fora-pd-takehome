"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import type {
  AssociatedTraveler,
  CompanionKind,
  CompanionLinkableClient,
  TravelerFlightBookingInfo,
} from "@/lib/types";
import {
  addTravelerToGroupAction,
  saveTravelerInGroupAction,
} from "@/app/clients/associated-traveler-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FIELD =
  "h-10 w-full min-w-0 rounded-[10px] border-fora-border bg-white px-3 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

const TEXTAREA_FIELD =
  "min-h-[120px] w-full min-w-0 resize-y rounded-[10px] border border-fora-border bg-white px-3 py-2.5 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

const SELECT_TRIGGER = cn(
  FIELD,
  "flex items-center justify-between gap-2 py-0 pr-2 text-left font-normal data-placeholder:text-fora-muted",
);

const segmentWrap =
  "flex shrink-0 rounded-full border border-fora-border bg-neutral-100/80 p-0.5 gap-0.5 sm:inline-flex";

function segmentBtn(active: boolean) {
  return cn(
    "inline-flex h-9 min-w-[4.5rem] flex-1 items-center justify-center rounded-full px-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-fora-border/60 sm:flex-none",
    active
      ? "bg-fora-navy text-white shadow-sm"
      : "bg-transparent text-fora-muted hover:bg-white/60 hover:text-fora-navy",
  );
}

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

type PetTypeKind = "Dog" | "Cat" | "__other__";

function initialCompanionKind(t: AssociatedTraveler | null): CompanionKind {
  return t?.companionKind === "pet" ? "pet" : "person";
}

function initialPetType(t: AssociatedTraveler | null): PetTypeKind {
  if (!t || t.companionKind !== "pet") return "Dog";
  const ln = (t.lastName ?? "").trim();
  const lower = ln.toLowerCase();
  if (lower === "dog") return "Dog";
  if (lower === "cat") return "Cat";
  return "__other__";
}

function initialPetTypeCustom(t: AssociatedTraveler | null): string {
  if (!t || t.companionKind !== "pet") return "";
  const ln = (t.lastName ?? "").trim();
  const lower = ln.toLowerCase();
  if (lower === "dog" || lower === "cat") return "";
  return ln;
}

function initialLegalName(t: AssociatedTraveler | null): string {
  if (!t || t.companionKind === "pet") return "";
  return `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim();
}

/** Single “legal name or link” field: show linked profile’s list label when applicable. */
function initialPersonNameInput(t: AssociatedTraveler | null, rows: CompanionLinkableClient[]): string {
  if (!t || t.companionKind === "pet") return "";
  if (t.linkedClientId) {
    const row = rows.find((c) => c.id === t.linkedClientId);
    if (row) return row.displayName;
  }
  return initialLegalName(t);
}

function normalizeNameLine(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

const GENDER_SELECT_OPTIONS = ["Female", "Male", "Unspecified", "X"] as const;

function parseLegalName(raw: string): { ok: true; firstName: string; lastName: string } | { ok: false } {
  const trimmed = raw.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { ok: false };
  return { ok: true, firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-normal text-fora-muted">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(FIELD, "pr-10 [color-scheme:light]")}
        />
        <CalendarIcon
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fora-muted"
        />
      </div>
    </div>
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
  companionLinkableClients: CompanionLinkableClient[];
  onSaved: () => void;
};

type FormProps = {
  clientId: string;
  groupId: string;
  mode: "add" | "edit";
  traveler: AssociatedTraveler | null;
  companionLinkableClients: CompanionLinkableClient[];
  onSaved: () => void;
  onClose: () => void;
  onPetLayoutChange?: (narrow: boolean) => void;
};

function AssociatedTravelerForm({
  clientId,
  groupId,
  mode,
  traveler,
  companionLinkableClients,
  onSaved,
  onClose,
  onPetLayoutChange,
}: FormProps) {
  const reactId = useId();
  const [companionKind, setCompanionKind] = useState<CompanionKind>(() => initialCompanionKind(traveler));
  const [petType, setPetType] = useState<PetTypeKind>(() => initialPetType(traveler));
  const [petTypeCustom, setPetTypeCustom] = useState(() => initialPetTypeCustom(traveler));
  const [legalName, setLegalName] = useState(() => initialPersonNameInput(traveler, companionLinkableClients));
  const [firstName, setFirstName] = useState(traveler?.firstName ?? "");
  const [relationship, setRelationship] = useState(traveler?.relationship ?? "");
  const [petNotes, setPetNotes] = useState(traveler?.petNotes ?? "");
  const [flight, setFlight] = useState<TravelerFlightBookingInfo>(() => flightFromTraveler(traveler));
  const [pending, setPending] = useState(false);
  const [linkedClientId, setLinkedClientId] = useState<string | null>(() => traveler?.linkedClientId ?? null);
  const [linkListOpen, setLinkListOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const blurListTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightedIndexRef = useRef(0);

  const clientPickerRows = useMemo(() => {
    const q = legalName.trim().toLowerCase();
    let rows: CompanionLinkableClient[];
    if (q) {
      rows = companionLinkableClients.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    } else {
      rows = [...companionLinkableClients]
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .slice(0, 20);
    }
    if (linkedClientId && !rows.some((c) => c.id === linkedClientId)) {
      const missing = companionLinkableClients.find((c) => c.id === linkedClientId);
      if (missing) return [missing, ...rows];
    }
    return rows;
  }, [legalName, linkedClientId, companionLinkableClients]);

  useEffect(() => {
    return () => {
      if (blurListTimeoutRef.current) clearTimeout(blurListTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    onPetLayoutChange?.(companionKind === "pet");
  }, [companionKind, onPetLayoutChange]);

  useEffect(() => {
    if (companionKind === "pet") {
      setLinkedClientId(null);
      setLinkListOpen(false);
    }
  }, [companionKind]);

  const pickLinkedClient = (row: CompanionLinkableClient) => {
    cancelCloseLinkList();
    setLinkedClientId(row.id);
    setLegalName(row.displayName);
    setFlight({ ...row.flight });
    setLinkListOpen(false);
    highlightedIndexRef.current = 0;
    setHighlightedIndex(0);
  };

  const scheduleCloseLinkList = () => {
    if (blurListTimeoutRef.current) clearTimeout(blurListTimeoutRef.current);
    blurListTimeoutRef.current = setTimeout(() => {
      setLinkListOpen(false);
      blurListTimeoutRef.current = null;
    }, 120);
  };

  const cancelCloseLinkList = () => {
    if (blurListTimeoutRef.current) {
      clearTimeout(blurListTimeoutRef.current);
      blurListTimeoutRef.current = null;
    }
  };

  const handleLegalNameChange = (raw: string) => {
    setLegalName(raw);
    highlightedIndexRef.current = 0;
    setHighlightedIndex(0);
    if (linkedClientId) {
      const row = companionLinkableClients.find((c) => c.id === linkedClientId);
      if (!row || normalizeNameLine(raw) !== normalizeNameLine(row.displayName)) {
        setLinkedClientId(null);
      }
    }
    if (companionLinkableClients.length > 0) setLinkListOpen(true);
  };

  const handleLegalNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!linkListOpen || clientPickerRows.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(highlightedIndexRef.current + 1, clientPickerRows.length - 1);
      highlightedIndexRef.current = next;
      setHighlightedIndex(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(highlightedIndexRef.current - 1, 0);
      highlightedIndexRef.current = next;
      setHighlightedIndex(next);
    } else if (e.key === "Enter") {
      const row = clientPickerRows[highlightedIndexRef.current];
      if (row) {
        e.preventDefault();
        pickLinkedClient(row);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setLinkListOpen(false);
    }
  };

  const setFlightField = (key: keyof TravelerFlightBookingInfo, value: string) => {
    setFlight((prev) => ({ ...prev, [key]: value }));
  };

  const resolvedPetLastName = () => {
    if (petType === "__other__") return petTypeCustom.trim();
    return petType;
  };

  const genderRaw = flight.gender?.trim() ?? "";
  const isPresetGender = (GENDER_SELECT_OPTIONS as readonly string[]).includes(genderRaw);
  const genderSelectValue = genderRaw ? genderRaw : null;

  const resolvedCompanionKindForSave = (): CompanionKind | undefined =>
    companionKind === "pet" ? "pet" : undefined;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
            {mode === "add" ? "Add companion" : "Edit companion"}
          </Dialog.Title>
        </div>
        <div className={segmentWrap} role="group" aria-label="Companion type">
          <button
            type="button"
            onClick={() => setCompanionKind("person")}
            className={segmentBtn(companionKind === "person")}
          >
            Person
          </button>
          <button type="button" onClick={() => setCompanionKind("pet")} className={segmentBtn(companionKind === "pet")}>
            Pet
          </button>
        </div>
      </div>

      {companionKind === "person" ? (
        <p className="mt-2 text-[13px] leading-snug text-fora-muted">
          Use one field for their legal name as on ID, or type to find a saved client profile — choosing a profile links
          them and pre-fills booking details. You can still edit everything before saving.
        </p>
      ) : null}

      <form
        className="mt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (companionKind === "pet" && petType === "__other__" && !petTypeCustom.trim()) {
            toast.error("Enter a type or breed for this pet.");
            return;
          }

          let fn = firstName.trim();
          let ln = "";

          if (companionKind === "person") {
            const parsed = parseLegalName(legalName);
            if (!parsed.ok) {
              toast.error("Enter their full legal name as it appears on their ID.");
              return;
            }
            fn = parsed.firstName;
            ln = parsed.lastName;
          } else {
            ln = resolvedPetLastName();
          }

          if (!fn || !ln) {
            toast.error(
              companionKind === "pet" ? "Pet name and type are required." : "Legal name is incomplete.",
            );
            return;
          }

          const notesPayload = companionKind === "pet" ? petNotes : "";
          const linkPayload = companionKind === "pet" ? null : linkedClientId;
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
                notesPayload,
                flight,
                linkPayload,
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
                notesPayload,
                flight,
                linkPayload,
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
        {companionKind === "pet" ? (
          <div className="mx-auto w-full max-w-[440px] space-y-8">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`${reactId}-petname`} className="text-sm font-normal text-fora-muted">
                    Name
                  </Label>
                  <Input
                    id={`${reactId}-petname`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={FIELD}
                    placeholder="e.g. Biscuit"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${reactId}-pet-type`} className="text-sm font-normal text-fora-muted">
                    Type
                  </Label>
                  <Select
                    modal={false}
                    value={petType}
                    onValueChange={(value) => {
                      const next = value as PetTypeKind;
                      setPetType(next);
                      if (next !== "__other__") setPetTypeCustom("");
                    }}
                  >
                    <SelectTrigger id={`${reactId}-pet-type`} className={cn(SELECT_TRIGGER, "w-full")} size="default">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="__other__">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {petType === "__other__" ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`${reactId}-pet-type-custom`} className="sr-only">
                    Describe pet type
                  </Label>
                  <Input
                    id={`${reactId}-pet-type-custom`}
                    value={petTypeCustom}
                    onChange={(e) => setPetTypeCustom(e.target.value)}
                    className={FIELD}
                    placeholder="e.g. Rabbit, parrot"
                    autoComplete="off"
                  />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor={`${reactId}-rel-pet`} className="text-sm font-normal text-fora-muted">
                  Relationship
                </Label>
                <Input
                  id={`${reactId}-rel-pet`}
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className={FIELD}
                  placeholder="e.g. Family dog"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${reactId}-pet-notes`} className="text-sm font-normal text-fora-muted">
                  Notes
                </Label>
                <Textarea
                  id={`${reactId}-pet-notes`}
                  value={petNotes}
                  onChange={(e) => setPetNotes(e.target.value)}
                  className={TEXTAREA_FIELD}
                  placeholder="Carrier size, dietary needs…"
                  autoComplete="off"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-fora-border pt-5 sm:flex-row sm:justify-end sm:gap-3">
              <Dialog.Close
                type="button"
                disabled={pending}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-fora-border bg-white px-5 text-[15px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-border/60",
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
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-0">
              <div className="min-w-0 flex-1 space-y-5 lg:pr-10">
                <div className="relative space-y-1.5">
                  <Label htmlFor={`${reactId}-legal`} className="text-sm font-normal text-fora-muted">
                    Legal name or linked profile
                  </Label>
                  <Input
                    id={`${reactId}-legal`}
                    value={legalName}
                    onChange={(e) => handleLegalNameChange(e.target.value)}
                    onKeyDown={handleLegalNameKeyDown}
                    onFocus={() => {
                      cancelCloseLinkList();
                      if (companionLinkableClients.length > 0) setLinkListOpen(true);
                    }}
                    onBlur={scheduleCloseLinkList}
                    className={FIELD}
                    placeholder="Legal name as on ID, or search a saved profile…"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={linkListOpen}
                    aria-controls={companionLinkableClients.length > 0 ? `${reactId}-client-picker` : undefined}
                    aria-autocomplete="list"
                    required
                  />
                  {linkedClientId ? (
                    <p className="text-[11px] leading-snug text-fora-muted">
                      Linked to a saved client profile. Change this line to something other than that profile’s list name
                      to unlink and use a typed legal name only.
                    </p>
                  ) : companionLinkableClients.length > 0 ? (
                    <p className="text-[11px] leading-snug text-fora-muted">
                      Suggestions appear while you type; click a row or press Enter to link and pre-fill optional fields.
                    </p>
                  ) : (
                    <p className="text-[11px] leading-snug text-fora-muted">No other client profiles to link.</p>
                  )}
                  {linkListOpen && companionLinkableClients.length > 0 && clientPickerRows.length > 0 ? (
                    <ul
                      id={`${reactId}-client-picker`}
                      role="listbox"
                      aria-label="Matching client profiles"
                      className="absolute top-full z-50 mt-1 max-h-[min(240px,40vh)] w-full overflow-y-auto rounded-[10px] border border-fora-border bg-white py-1 shadow-lg outline-none"
                      onMouseDown={cancelCloseLinkList}
                    >
                      {clientPickerRows.map((c, i) => (
                        <li key={c.id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={i === highlightedIndex}
                            className={cn(
                              "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[14px] outline-none transition-colors",
                              i === highlightedIndex ? "bg-fora-app text-fora-navy" : "text-fora-navy hover:bg-fora-app/70",
                            )}
                            onMouseEnter={() => {
                              highlightedIndexRef.current = i;
                              setHighlightedIndex(i);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pickLinkedClient(c);
                            }}
                          >
                            <span className="font-medium leading-tight">{c.displayName}</span>
                            <span className="text-[12px] text-fora-muted">{c.location}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : linkListOpen &&
                    companionLinkableClients.length > 0 &&
                    legalName.trim() &&
                    clientPickerRows.length === 0 ? (
                    <div
                      className="absolute top-full z-50 mt-1 w-full rounded-[10px] border border-fora-border bg-white px-3 py-2 text-[13px] text-fora-muted shadow-lg"
                      onMouseDown={cancelCloseLinkList}
                    >
                      No profiles match — keep typing a legal name, or clear the filter.
                    </div>
                  ) : null}
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
                    placeholder="Spouse, child, colleague…"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div
                className="hidden w-px shrink-0 self-stretch bg-fora-border lg:block"
                aria-hidden
                role="presentation"
              />

              <div className="min-w-0 flex-1 space-y-5 lg:pl-10">
                <p className="text-[11px] font-medium tracking-[0.08em] text-fora-muted">Optional</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DateField
                    id={`${reactId}-dob`}
                    label="Date of birth"
                    value={flight.dateOfBirth ?? ""}
                    onChange={(v) => setFlightField("dateOfBirth", v)}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor={`${reactId}-gender`} className="text-sm font-normal text-fora-muted">
                      Gender
                    </Label>
                    <Select
                      modal={false}
                      value={genderSelectValue}
                      onValueChange={(value) => setFlightField("gender", value ?? "")}
                    >
                      <SelectTrigger id={`${reactId}-gender`} className={cn(SELECT_TRIGGER, "w-full")} size="default">
                        <SelectValue placeholder="As on ID" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderRaw && !isPresetGender ? (
                          <SelectItem value={genderRaw}>{genderRaw}</SelectItem>
                        ) : null}
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Unspecified">Unspecified</SelectItem>
                        <SelectItem value="X">X</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
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
                  <div className="space-y-1.5">
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
                      placeholder="Country"
                      autoComplete="country"
                    />
                  </div>
                  <DateField
                    id={`${reactId}-ppe`}
                    label="Passport expiry"
                    value={flight.passportExpiry ?? ""}
                    onChange={(v) => setFlightField("passportExpiry", v)}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor={`${reactId}-ktn`} className="text-sm font-normal text-fora-muted">
                      Known Traveler #
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
            </div>

            <div className="mt-10 flex flex-col-reverse gap-2 border-t border-fora-border pt-5 sm:mt-8 sm:flex-row sm:justify-end sm:gap-3">
              <Dialog.Close
                type="button"
                disabled={pending}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-fora-border bg-white px-5 text-[15px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-border/60",
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
          </>
        )}
      </form>
    </>
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
  companionLinkableClients,
  onSaved,
}: Props) {
  const [narrowPetLayout, setNarrowPetLayout] = useState(false);

  useEffect(() => {
    if (!open) setNarrowPetLayout(false);
  }, [open]);

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
              "max-h-[min(92vh,800px)] w-full overflow-y-auto rounded-[16px] border border-fora-border bg-white p-6 shadow-lg outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 sm:p-8",
              narrowPetLayout ? "max-w-[min(92vw,520px)]" : "max-w-[min(92vw,800px)]",
            )}
          >
            {showForm ? (
              <AssociatedTravelerForm
                key={formKey}
                clientId={clientId}
                groupId={groupId}
                mode={mode}
                traveler={traveler}
                companionLinkableClients={companionLinkableClients}
                onSaved={onSaved}
                onClose={close}
                onPetLayoutChange={setNarrowPetLayout}
              />
            ) : (
              <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
                {mode === "add" ? "Add companion" : "Edit companion"}
              </Dialog.Title>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
