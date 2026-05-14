"use server";

import { revalidatePath } from "next/cache";
import type { ClientAddress, ClientEmail } from "@/lib/types";
import {
  collectPhonesFromForm,
  getClientById,
  updateClientPersonalInfo,
} from "@/lib/data";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function buildEmails(personal: string, work: string, other: string): ClientEmail[] {
  const out: ClientEmail[] = [];
  const p = personal.trim();
  const w = work.trim();
  const o = other.trim();
  if (p) out.push({ type: "personal", address: p });
  if (w) out.push({ type: "work", address: w });
  if (o) out.push({ type: "other", address: o });
  return out;
}

export type SavePersonalInfoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveClientPersonalInfo(
  clientId: string,
  formData: FormData
): Promise<SavePersonalInfoResult> {
  const client = getClientById(clientId);
  if (!client) {
    return { ok: false, error: "Client not found." };
  }

  const firstName = str(formData, "firstName").trim();
  const lastName = str(formData, "lastName").trim();
  if (!firstName || !lastName) {
    return { ok: false, error: "First name and last name are required." };
  }

  const middleRaw = str(formData, "middleName").trim();
  const prefixKey = str(formData, "prefix").trim().toLowerCase();
  const pronounsKey = str(formData, "pronouns").trim().toLowerCase();

  const primary = client.addresses[0];
  const addressId = primary?.id ?? `addr-${clientId}-1`;

  const primaryAddress: ClientAddress = {
    id: addressId,
    label: str(formData, "addressLabel").trim() || undefined,
    country: str(formData, "country").trim() || undefined,
    line1: str(formData, "address1").trim(),
    line2: str(formData, "address2").trim() || undefined,
    city: str(formData, "city").trim(),
    state: str(formData, "state").trim(),
    zip: str(formData, "zip").trim(),
  };

  const ok = updateClientPersonalInfo(clientId, {
    firstName,
    lastName,
    middleName: middleRaw || undefined,
    nameEdit: {
      prefix: prefixKey,
      suffix: str(formData, "suffix").trim(),
      preferredName: str(formData, "preferredName").trim(),
      pronouns: pronounsKey,
    },
    emails: buildEmails(
      str(formData, "emailPersonal"),
      str(formData, "emailWork"),
      str(formData, "emailOther")
    ),
    phones: collectPhonesFromForm(client, formData),
    primaryAddress,
  });

  if (!ok) {
    return { ok: false, error: "Could not update client." };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/edit`);

  return { ok: true };
}
