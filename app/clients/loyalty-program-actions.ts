"use server";

import { revalidatePath } from "next/cache";
import { deleteLoyaltyProgram, updateLoyaltyProgram } from "@/lib/data";

export type LoyaltyProgramMutationResult = { ok: true } | { ok: false; error: string };

function revalidateClientPaths(clientId: string) {
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/edit`);
}

export async function saveLoyaltyProgramAction(
  clientId: string,
  programId: string,
  programName: string,
  accountNumber: string,
): Promise<LoyaltyProgramMutationResult> {
  const name = programName.trim();
  const acct = accountNumber.trim();
  if (!name || !acct) {
    return { ok: false, error: "Program name and account number are required." };
  }
  const ok = updateLoyaltyProgram(clientId, programId, { programName: name, accountNumber: acct });
  if (!ok) {
    return { ok: false, error: "Could not update loyalty program." };
  }
  revalidateClientPaths(clientId);
  return { ok: true };
}

export async function deleteLoyaltyProgramAction(
  clientId: string,
  programId: string,
): Promise<LoyaltyProgramMutationResult> {
  const ok = deleteLoyaltyProgram(clientId, programId);
  if (!ok) {
    return { ok: false, error: "Could not remove loyalty program." };
  }
  revalidateClientPaths(clientId);
  return { ok: true };
}
