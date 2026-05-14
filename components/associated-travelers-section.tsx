"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Search, Trash2, UserRound } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { toast } from "sonner";
import type { AssociatedTraveler, TravelerGroup } from "@/lib/types";
import {
  companionFlightBookingCardRows,
  type FlightBookingCardRow,
} from "@/lib/format";
import { DeleteAssociatedTravelerDialog } from "@/components/delete-associated-traveler-dialog";
import { DeleteTravelerGroupDialog } from "@/components/delete-traveler-group-dialog";
import { DetailSection } from "@/components/detail-section";
import { EditAssociatedTravelerDialog } from "@/components/edit-associated-traveler-dialog";
import {
  InlineSectionEmptyActionLabel,
  InlineSectionEmptyBox,
  inlineSectionEmptyActionTriggerClass,
} from "@/components/inline-section-empty-box";
import { TravelerGroupNameDialog } from "@/components/traveler-group-name-dialog";
import {
  addTravelerGroupAction,
  setTravelerGroupIncludePrimaryAction,
} from "@/app/clients/associated-traveler-actions";
import { travelerGroupIncludesPrimary } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const editLinkCls =
  "text-[13px] font-normal text-fora-link no-underline hover:opacity-80";

const menuItemClass =
  "flex w-full cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-fora-navy outline-none transition-colors data-highlighted:bg-fora-app";

const ROW_CARD =
  "flex items-start gap-3 rounded-[14px] border border-fora-border bg-white px-4 py-3.5";

/** Matches the “Primary” label on the primary client row — also used for relationship / pet role. */
const ROLE_BADGE_CLASS =
  "ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.06em] text-fora-muted";

const AVATAR_BGS = [
  "bg-gradient-to-br from-[#1e3a8a] to-[#172554] text-white",
  "bg-black text-white",
  "bg-gradient-to-br from-[#0f766e] to-[#134e4a] text-white",
  "bg-gradient-to-br from-[#9a3412] to-[#7c2d12] text-white",
] as const;

function placardInitials(label: string): string {
  const parts = label
    .split(/[\s·•,]+/)
    .map((p) => p.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((p) => p.length > 0);
  const stop = new Set(["of", "the", "and", "a", "an", "for"]);
  const sig = parts.filter((p) => !stop.has(p.toLowerCase()));
  if (sig.length === 0) {
    const alnum = label.replace(/[^a-zA-Z0-9]/g, "");
    return (alnum.slice(0, 2) || "?").toUpperCase();
  }
  if (sig.length === 1) return sig[0]!.slice(0, 2).toUpperCase();
  const a = sig[0]![0]!;
  const b = sig[sig.length - 1]![0]!;
  return (a + b).toUpperCase();
}

function placardAvatarClass(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i)) % 997;
  return AVATAR_BGS[h % AVATAR_BGS.length]!;
}

function companionDisplayName(t: AssociatedTraveler): string {
  if (t.companionKind === "pet") return `${t.firstName} (${t.lastName})`;
  return `${t.firstName} ${t.lastName}`;
}

function companionRowKey(t: AssociatedTraveler): string {
  return t.companionKind === "pet" ? `${t.firstName}|${t.lastName}` : `${t.firstName} ${t.lastName}`;
}

function companionInitials(t: AssociatedTraveler): string {
  if (t.companionKind === "pet") {
    const s = t.firstName.replace(/[^a-zA-Z0-9]/g, "");
    return (s.slice(0, 2) || "?").toUpperCase();
  }
  return placardInitials(`${t.firstName} ${t.lastName}`);
}

function FlightBookingCardDetails({
  rows,
  emptyHint,
}: {
  rows: FlightBookingCardRow[];
  emptyHint: string;
}) {
  if (rows.length === 0) {
    return <p className="mt-1 text-[12px] leading-snug text-fora-muted">{emptyHint}</p>;
  }
  return (
    <dl className="mt-1.5 grid gap-x-4 gap-y-1.5 text-[12px] leading-snug sm:grid-cols-2">
      {rows.map((row, i) => (
        <div key={`${row.label}-${i}`} className="min-w-0">
          <dt className="font-medium text-fora-muted">{row.label}</dt>
          <dd className="break-words text-fora-navy" title={row.value}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function flightSearchText(f: AssociatedTraveler["flight"]): string {
  if (!f) return "";
  return Object.values(f)
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .join(" ");
}

function travelerSearchText(t: AssociatedTraveler): string {
  return [
    companionDisplayName(t),
    t.firstName,
    t.lastName,
    t.relationship,
    flightSearchText(t.flight),
  ]
    .filter((s): s is string => typeof s === "string" && s.trim() !== "")
    .join(" ");
}

function groupMatchesSearch(
  group: TravelerGroup,
  primaryClientName: string,
  primaryBookingRows: FlightBookingCardRow[],
  needle: string,
): boolean {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  const bookingBlob = primaryBookingRows.map((r) => `${r.label} ${r.value}`).join(" ");
  const primaryBlob = travelerGroupIncludesPrimary(group)
    ? [primaryClientName, bookingBlob].join(" ")
    : "";
  const hay = [group.name, primaryBlob, ...group.travelers.map(travelerSearchText)]
    .filter((s) => s.length > 0)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

type TravelerDialogState =
  | null
  | { mode: "add"; groupId: string }
  | { mode: "edit"; groupId: string; traveler: AssociatedTraveler };

type GroupNameDialogState =
  | null
  | { mode: "add" }
  | { mode: "rename"; groupId: string; initialName: string };

export function AssociatedTravelersSection({
  clientId,
  groups,
  onRefresh,
  primaryClientName,
  primaryBookingRows,
  onOpenPrimaryClientProfile,
}: {
  clientId: string;
  groups: TravelerGroup[];
  onRefresh: () => void;
  /** When included in a group, shown first with booking-ready fields from the Details tab. */
  primaryClientName: string;
  /** DOB, contact, and airline loyalty from the primary client profile (Details tab). */
  primaryBookingRows: FlightBookingCardRow[];
  /** Switches to the client Details tab (profile, cards, contact, etc.). */
  onOpenPrimaryClientProfile: () => void;
}) {
  const [travelerDialog, setTravelerDialog] = useState<TravelerDialogState>(null);
  const [travelerFormKey, setTravelerFormKey] = useState(0);
  const [groupNameDialog, setGroupNameDialog] = useState<GroupNameDialogState>(null);
  const [groupNameFormKey, setGroupNameFormKey] = useState(0);
  const [deleteTraveler, setDeleteTraveler] = useState<{
    groupId: string;
    travelerId: string;
    displayName: string;
  } | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<{ groupId: string; groupName: string } | null>(
    null,
  );
  const [emptyAddTravelerPending, setEmptyAddTravelerPending] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) => groupMatchesSearch(g, primaryClientName, primaryBookingRows, groupSearchQuery)),
    [groups, primaryBookingRows, primaryClientName, groupSearchQuery],
  );

  const openAddTraveler = (groupId: string) => {
    setTravelerFormKey((k) => k + 1);
    setTravelerDialog({ mode: "add", groupId });
  };

  const openEditTraveler = (groupId: string, traveler: AssociatedTraveler) => {
    setTravelerFormKey((k) => k + 1);
    setTravelerDialog({ mode: "edit", groupId, traveler });
  };

  const openAddGroup = () => {
    setGroupNameFormKey((k) => k + 1);
    setGroupNameDialog({ mode: "add" });
  };

  const openRenameGroup = (g: TravelerGroup) => {
    setGroupNameFormKey((k) => k + 1);
    setGroupNameDialog({ mode: "rename", groupId: g.id, initialName: g.name });
  };

  const handleEmptyStateAddTraveler = async () => {
    setEmptyAddTravelerPending(true);
    try {
      const result = await addTravelerGroupAction(clientId, "Household");
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTravelerFormKey((k) => k + 1);
      setTravelerDialog({ mode: "add", groupId: result.groupId });
      onRefresh();
    } finally {
      setEmptyAddTravelerPending(false);
    }
  };

  const groupSectionTitle = (g: TravelerGroup) => {
    const count = (travelerGroupIncludesPrimary(g) ? 1 : 0) + g.travelers.length;
    return `${g.name} (${count})`;
  };

  const togglePrimaryInGroup = async (group: TravelerGroup) => {
    const next = !travelerGroupIncludesPrimary(group);
    const result = await setTravelerGroupIncludePrimaryAction(clientId, group.id, next);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      next ? "Primary is shown in this group." : "Primary is hidden from this group.",
    );
    onRefresh();
  };

  return (
    <div className={groups.length === 0 ? "mt-4" : "mt-0"}>
      {groups.length === 0 ? (
        <DetailSection
          title="Households"
          action={
            <button type="button" onClick={openAddGroup} className={editLinkCls} aria-label="Add group">
              + Add
            </button>
          }
        >
          <InlineSectionEmptyBox>
            <button
              type="button"
              className={inlineSectionEmptyActionTriggerClass}
              onClick={() => void handleEmptyStateAddTraveler()}
              disabled={emptyAddTravelerPending}
              aria-label="Add companion"
            >
              <InlineSectionEmptyActionLabel>Add companion</InlineSectionEmptyActionLabel>
            </button>
          </InlineSectionEmptyBox>
          <p className="mt-3 text-[13px] leading-snug text-fora-muted">
            Create a household, then add people or pets with booking details.
          </p>
        </DetailSection>
      ) : (
        <>
          <div className="-mx-6 mb-3 bg-fora-app py-2.5 lg:-mx-10">
            <div className="flex flex-col gap-2 px-6 sm:flex-row sm:items-center sm:gap-3 lg:px-10">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-[16px] -translate-y-1/2 text-fora-muted"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <Input
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  placeholder="Search groups, names, relationships, or booking fields…"
                  aria-label="Search companion groups and travelers"
                  className="h-10 w-full rounded-lg border-0 bg-fora-app pl-9 pr-3 text-[14px] shadow-none placeholder:text-fora-muted focus-visible:border-0"
                />
              </div>
              <button
                type="button"
                onClick={openAddGroup}
                className={cn(
                  editLinkCls,
                  "inline-flex shrink-0 items-center self-start rounded-lg border border-fora-border bg-white px-2.5 py-1.5 transition-colors hover:bg-fora-app sm:self-auto",
                )}
              >
                + Add group
              </button>
            </div>
          </div>
          {filteredGroups.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-fora-muted">
              No groups or travelers match your search.
            </p>
          ) : (
            filteredGroups.map((group) => (
            <DetailSection
              key={group.id}
              title={groupSectionTitle(group)}
              action={
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={() => openAddTraveler(group.id)}
                    className={editLinkCls}
                    aria-label="Add companion"
                  >
                    + Add companion
                  </button>
                  <Menu.Root>
                    <Menu.Trigger
                      type="button"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-fora-muted outline-none transition-colors hover:bg-fora-app hover:text-fora-navy aria-expanded:bg-fora-app"
                      aria-label={`Group options for ${group.name}`}
                    >
                      <MoreHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner sideOffset={6} align="end">
                        <Menu.Popup className="z-50 min-w-[180px] rounded-lg border border-fora-border bg-white p-1 text-fora-navy shadow-md outline-none">
                          <Menu.Item
                            className={menuItemClass}
                            onClick={() => openRenameGroup(group)}
                          >
                            <Pencil className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                            Rename group
                          </Menu.Item>
                          <Menu.Item
                            className={menuItemClass}
                            onClick={() => void togglePrimaryInGroup(group)}
                          >
                            <UserRound className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                            {travelerGroupIncludesPrimary(group)
                              ? "Hide primary from group"
                              : "Show primary in group"}
                          </Menu.Item>
                          <Menu.Item
                            className={cn(menuItemClass, "text-fora-danger")}
                            onClick={() => {
                              if (group.travelers.length > 0) {
                                toast.error("Remove travelers from this group before deleting it.");
                                return;
                              }
                              setDeleteGroup({ groupId: group.id, groupName: group.name });
                            }}
                          >
                            <Trash2 className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                            Delete group
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                </div>
              }
            >
              <ul className="list-none space-y-2.5">
                {travelerGroupIncludesPrimary(group) ? (
                <li className={cn(ROW_CARD, "list-none")}>
                  <div
                    className={cn(
                      "mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-lg text-[15px] font-bold leading-none tracking-tight",
                      placardAvatarClass(primaryClientName),
                    )}
                    aria-hidden
                  >
                    {placardInitials(primaryClientName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold leading-tight text-fora-navy">
                      {primaryClientName}
                      <span className={ROLE_BADGE_CLASS}>Primary</span>
                    </p>
                    <FlightBookingCardDetails
                      rows={primaryBookingRows}
                      emptyHint="Add birthday, contact, and airline loyalty on the Details tab to show booking-ready fields here."
                    />
                  </div>
                  <Menu.Root>
                    <Menu.Trigger
                      type="button"
                      className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] outline-none transition-colors hover:bg-fora-app hover:text-fora-muted aria-expanded:bg-fora-app"
                      aria-label={`More options for ${primaryClientName}`}
                    >
                      <MoreHorizontal className="size-[18px]" strokeWidth={1.85} aria-hidden />
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner sideOffset={6} align="end">
                        <Menu.Popup className="z-50 min-w-[200px] rounded-lg border border-fora-border bg-white p-1 text-fora-navy shadow-md outline-none">
                          <Menu.Item
                            className={menuItemClass}
                            onClick={() => onOpenPrimaryClientProfile()}
                          >
                            <Pencil className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                            View profile details
                          </Menu.Item>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                </li>
                ) : null}

                {group.travelers.length > 0
                  ? group.travelers.map((t) => {
                    const bookingRows = companionFlightBookingCardRows(t.flight);
                    return (
                      <li key={t.id} className={cn(ROW_CARD, "list-none")}>
                        <div
                          className={cn(
                            "mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-lg text-[15px] font-bold leading-none tracking-tight",
                            placardAvatarClass(companionRowKey(t)),
                          )}
                          aria-hidden
                        >
                          {companionInitials(t)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold leading-tight text-fora-navy">
                            {t.companionKind === "pet" ? (
                              <>
                                {t.firstName}
                                <span className={ROLE_BADGE_CLASS}>Pet</span>
                                {t.lastName?.trim() ? (
                                  <span className={ROLE_BADGE_CLASS}>{t.lastName.trim()}</span>
                                ) : null}
                              </>
                            ) : (
                              <>
                                {t.firstName} {t.lastName}
                                {t.relationship?.trim() ? (
                                  <span className={ROLE_BADGE_CLASS}>{t.relationship.trim()}</span>
                                ) : null}
                              </>
                            )}
                          </p>
                          <FlightBookingCardDetails
                            rows={bookingRows}
                            emptyHint="No traveler IDs on file — use “Edit for booking” to add DOB, gender, passport, contact, and Known Traveler Number."
                          />
                        </div>
                        <Menu.Root>
                          <Menu.Trigger
                            type="button"
                            className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] outline-none transition-colors hover:bg-fora-app hover:text-fora-muted aria-expanded:bg-fora-app"
                            aria-label={`More options for ${companionDisplayName(t)}`}
                          >
                            <MoreHorizontal className="size-[18px]" strokeWidth={1.85} aria-hidden />
                          </Menu.Trigger>
                          <Menu.Portal>
                            <Menu.Positioner sideOffset={6} align="end">
                              <Menu.Popup className="z-50 min-w-[180px] rounded-lg border border-fora-border bg-white p-1 text-fora-navy shadow-md outline-none">
                                <Menu.Item
                                  className={menuItemClass}
                                  onClick={() => openEditTraveler(group.id, t)}
                                >
                                  <Pencil className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                                  Edit for booking
                                </Menu.Item>
                                <Menu.Item
                                  className={cn(menuItemClass, "text-fora-danger")}
                                  onClick={() =>
                                    setDeleteTraveler({
                                      groupId: group.id,
                                      travelerId: t.id,
                                      displayName: companionDisplayName(t),
                                    })
                                  }
                                >
                                  <Trash2 className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                                  Remove
                                </Menu.Item>
                              </Menu.Popup>
                            </Menu.Positioner>
                          </Menu.Portal>
                        </Menu.Root>
                      </li>
                    );
                  })
                  : null}
              </ul>
            </DetailSection>
            ))
          )}
        </>
      )}

      <EditAssociatedTravelerDialog
        open={travelerDialog !== null}
        onOpenChange={(next) => {
          if (!next) setTravelerDialog(null);
        }}
        formKey={travelerFormKey}
        clientId={clientId}
        groupId={travelerDialog?.groupId ?? ""}
        mode={travelerDialog?.mode === "edit" ? "edit" : "add"}
        traveler={travelerDialog?.mode === "edit" ? travelerDialog.traveler : null}
        onSaved={onRefresh}
      />

      <TravelerGroupNameDialog
        open={groupNameDialog !== null}
        onOpenChange={(next) => {
          if (!next) setGroupNameDialog(null);
        }}
        formKey={groupNameFormKey}
        clientId={clientId}
        mode={groupNameDialog?.mode ?? "add"}
        groupId={groupNameDialog?.mode === "rename" ? groupNameDialog.groupId : null}
        initialName={groupNameDialog?.mode === "rename" ? groupNameDialog.initialName : ""}
        onSaved={onRefresh}
      />

      <DeleteAssociatedTravelerDialog
        open={deleteTraveler !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTraveler(null);
        }}
        clientId={clientId}
        target={deleteTraveler}
        onDeleted={onRefresh}
      />

      <DeleteTravelerGroupDialog
        open={deleteGroup !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteGroup(null);
        }}
        clientId={clientId}
        groupId={deleteGroup?.groupId ?? null}
        groupName={deleteGroup?.groupName ?? null}
        onDeleted={onRefresh}
      />
    </div>
  );
}
