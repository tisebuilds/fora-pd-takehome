"use server";

import { revalidatePath } from "next/cache";
import {
  addTravelerGroup,
  addTravelerToGroup,
  deleteTravelerFromGroup,
  deleteTravelerGroup,
  renameTravelerGroup,
  setTravelerGroupIncludePrimary,
  setTravelerGroupPaymentCardIds,
  updateTravelerInGroup,
} from "@/lib/data";
import type { CompanionKind, TravelerFlightBookingInfo } from "@/lib/types";

export type TravelerMutationResult = { ok: true } | { ok: false; error: string };

export type AddTravelerGroupResult =
  | { ok: true; groupId: string }
  | { ok: false; error: string };

function revalidateClientPaths(clientId: string) {
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/edit`);
}

export async function addTravelerGroupAction(
  clientId: string,
  name: string,
  includePrimaryClient = true,
): Promise<AddTravelerGroupResult> {
  const result = addTravelerGroup(clientId, name, includePrimaryClient);
  if (!result.ok) return result;
  revalidateClientPaths(clientId);
  return { ok: true, groupId: result.groupId };
}

export async function setTravelerGroupIncludePrimaryAction(
  clientId: string,
  groupId: string,
  includePrimaryClient: boolean,
): Promise<TravelerMutationResult> {
  const ok = setTravelerGroupIncludePrimary(clientId, groupId, includePrimaryClient);
  if (!ok) {
    return { ok: false, error: "Could not update group." };
  }
  revalidateClientPaths(clientId);
  return { ok: true };
}

export async function renameTravelerGroupAction(
  clientId: string,
  groupId: string,
  name: string,
): Promise<TravelerMutationResult> {
  const ok = renameTravelerGroup(clientId, groupId, name);
  if (!ok) {
    return { ok: false, error: "Could not rename group." };
  }
  revalidateClientPaths(clientId);
  return { ok: true };
}

export async function setTravelerGroupPaymentCardIdsAction(
  clientId: string,
  groupId: string,
  paymentCardIds: string[],
): Promise<TravelerMutationResult> {
  const result = setTravelerGroupPaymentCardIds(clientId, groupId, paymentCardIds);
  if (!result.ok) return result;
  revalidateClientPaths(clientId);
  return { ok: true };
}

export async function deleteTravelerGroupAction(
  clientId: string,
  groupId: string,
): Promise<TravelerMutationResult> {
  const result = deleteTravelerGroup(clientId, groupId);
  if (!result.ok) return result;
  revalidateClientPaths(clientId);
  return { ok: true };
}

function normalizeFlight(input: TravelerFlightBookingInfo): TravelerFlightBookingInfo {
  return {
    dateOfBirth: input.dateOfBirth?.trim() || undefined,
    gender: input.gender?.trim() || undefined,
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    passportNumber: input.passportNumber?.trim() || undefined,
    passportExpiry: input.passportExpiry?.trim() || undefined,
    nationality: input.nationality?.trim() || undefined,
    knownTravelerNumber: input.knownTravelerNumber?.trim() || undefined,
  };
}

export async function addTravelerToGroupAction(
  clientId: string,
  groupId: string,
  companionKind: CompanionKind | undefined,
  firstName: string,
  lastName: string,
  relationship: string,
  petNotes: string,
  flight: TravelerFlightBookingInfo,
  linkedClientId: string | null | undefined,
): Promise<TravelerMutationResult> {
  const result = addTravelerToGroup(clientId, groupId, {
    companionKind,
    firstName,
    lastName,
    relationship,
    petNotes,
    flight: normalizeFlight(flight),
    linkedClientId: linkedClientId?.trim() || null,
  });
  if (!result.ok) return result;
  revalidateClientPaths(clientId);
  return { ok: true };
}

export async function saveTravelerInGroupAction(
  clientId: string,
  groupId: string,
  travelerId: string,
  companionKind: CompanionKind | undefined,
  firstName: string,
  lastName: string,
  relationship: string,
  petNotes: string,
  flight: TravelerFlightBookingInfo,
  linkedClientId: string | null | undefined,
): Promise<TravelerMutationResult> {
  const result = updateTravelerInGroup(clientId, groupId, travelerId, {
    companionKind,
    firstName,
    lastName,
    relationship,
    petNotes,
    flight: normalizeFlight(flight),
    linkedClientId: linkedClientId?.trim() || null,
  });
  if (!result.ok) return result;
  revalidateClientPaths(clientId);
  return { ok: true };
}

export async function deleteTravelerFromGroupAction(
  clientId: string,
  groupId: string,
  travelerId: string,
): Promise<TravelerMutationResult> {
  const ok = deleteTravelerFromGroup(clientId, groupId, travelerId);
  if (!ok) {
    return { ok: false, error: "Could not remove traveler." };
  }
  revalidateClientPaths(clientId);
  return { ok: true };
}
