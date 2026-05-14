import type { Client, ClientAddress, ClientPhone } from "@/lib/types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function clientDisplayName(c: Pick<Client, "firstName" | "lastName">): string {
  return `${c.firstName} ${c.lastName}`;
}

export function clientInitials(c: Pick<Client, "firstName" | "lastName">): string {
  const a = c.firstName?.trim()?.[0];
  const b = c.lastName?.trim()?.[0];
  return `${a ? a.toUpperCase() : ""}${b ? b.toUpperCase() : ""}` || "?";
}

/** City + state from primary address, falling back to `location` (city-only). */
export function formatCityState(c: Pick<Client, "addresses" | "location">): string {
  const a = c.addresses[0];
  if (a) {
    const city = a.city?.trim();
    const state = a.state?.trim();
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
  }
  return c.location?.trim() || "";
}

export function formatPhoneDisplay(p: ClientPhone): string | null {
  if (!p.nationalNumber?.trim()) return null;
  const digits = p.nationalNumber.replace(/\D/g, "");
  if (!digits) return null;
  if (p.country === "US" && digits.length === 10) {
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 6);
    const c = digits.slice(6);
    return `${p.dialCode} ${a} ${b} ${c}`;
  }
  return `${p.dialCode} ${p.nationalNumber}`.trim();
}

export function formatAddressOneLine(a: ClientAddress): string {
  const street = [a.line1, a.line2].filter(Boolean).join(", ");
  const cityLine = [a.city, a.state].filter((s) => s && s.trim()).join(", ");
  return [street, cityLine, a.zip].filter(Boolean).join(", ");
}

export function formatImportantDate(
  month: number | null,
  day: number | null,
  year: number | null
): string | null {
  if (month == null || day == null || year == null) return null;
  const m = MONTHS[month - 1];
  return `${m} ${day}, ${year}`;
}

export function emailTypeLabel(t: string): string {
  return t.toUpperCase();
}

export function phoneTypeLabel(t: string): string {
  return t.toUpperCase();
}

export function cardExpiry(m: number, y2: number): string {
  const mm = String(m).padStart(2, "0");
  return `${mm}/${String(y2).padStart(2, "0")}`;
}

export function clientSearchBlob(c: Client): string {
  const addr = c.addresses[0];
  const cityState = addr ? [addr.city, addr.state].filter((s) => s && String(s).trim()).join(" ") : "";
  return [
    c.firstName,
    c.lastName,
    c.middleName,
    c.location,
    cityState,
    ...c.emails.map((e) => e.address),
    ...c.phones.map((p) => formatPhoneDisplay(p) ?? ""),
  ]
    .join(" ")
    .toLowerCase();
}
