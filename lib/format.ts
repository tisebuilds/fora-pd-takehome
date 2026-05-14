import type { Client, ClientAddress, ClientPhone, TravelerFlightBookingInfo } from "@/lib/types";

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

function calendarDayDiff(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}

/** Next calendar date repeating `month`/`day` annually, on or after `from` (local). */
function nextAnnualOccurrenceOnOrAfter(
  month: number,
  day: number,
  from: Date = new Date(),
): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const y = from.getFullYear();
  let candidate = new Date(y, month - 1, day);
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (candidate < fromMidnight) {
    candidate = new Date(y + 1, month - 1, day);
  }
  return candidate;
}

/**
 * Phrase for time until the next annual occurrence (e.g. "in 3 months").
 * For recurring profile dates (birthday / anniversary).
 * Returns null when the event is about four months away or farther (no countdown badge).
 */
export function formatAnnualEventCountdown(
  month: number | null,
  day: number | null,
  from: Date = new Date(),
): string | null {
  if (month == null || day == null) return null;
  const next = nextAnnualOccurrenceOnOrAfter(month, day, from);
  if (!next) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const days = calendarDayDiff(today, next);
  if (days < 0) return null;
  /** Hide UI badge when the next occurrence is this many days out or more (~4 months). */
  const COUNTDOWN_BADGE_MAX_DAYS = 120;
  if (days >= COUNTDOWN_BADGE_MAX_DAYS) return null;
  if (days === 0) return "Today";
  if (days === 1) return "in 1 day";
  if (days < 7) return `in ${days} days`;
  if (days < 56) {
    const w = Math.floor(days / 7);
    return w === 1 ? "in 1 week" : `in ${w} weeks`;
  }
  if (days < 365) {
    const mo = Math.max(1, Math.floor(days / 30));
    return mo === 1 ? "in 1 month" : `in ${mo} months`;
  }
  const yr = Math.floor(days / 365);
  return yr === 1 ? "in 1 year" : `in ${yr} years`;
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

/** Expiry for inline table-style rows, e.g. `10 / 27`. */
export function cardExpirySpaced(m: number, y2: number): string {
  const mm = String(m).padStart(2, "0");
  return `${mm} / ${String(y2).padStart(2, "0")}`;
}

/** Single-line facts shown on household / companion cards for flight booking. */
export type FlightBookingCardRow = { label: string; value: string };

const AIRLINE_LOYALTY_NAME_RE =
  /\b(airlines?|airline|mileage|miles|plus|skymiles|aadvantage|delta|united|american|southwest|jetblue|alaska|spirit|frontier|british|lufthansa|emirates|qatar|iberia|hawaiian)\b/i;

function isLikelyAirlineLoyalty(programName: string): boolean {
  return AIRLINE_LOYALTY_NAME_RE.test(programName);
}

/** Structured rows from a companion / household member `flight` block. */
export function companionFlightBookingCardRows(
  flight: TravelerFlightBookingInfo | undefined,
): FlightBookingCardRow[] {
  if (!flight) return [];
  const rows: FlightBookingCardRow[] = [];
  const add = (label: string, v: string | undefined) => {
    const t = v?.trim();
    if (t) rows.push({ label, value: t });
  };
  add("DOB", flight.dateOfBirth);
  add("Gender", flight.gender);
  add("Email", flight.email);
  add("Phone", flight.phone);
  add("Nationality", flight.nationality);
  add("Passport", flight.passportNumber);
  add("Passport expires", flight.passportExpiry);
  add("Known Traveler #", flight.knownTravelerNumber);
  return rows;
}

/**
 * Rows for the primary client on a household card: `client.flight` booking IDs plus profile
 * fallbacks (birthday from important dates, email/phone when not overridden in `flight`).
 * Airline loyalty rows come from loyalty programs that look like airline schemes.
 */
export function primaryClientFlightBookingCardRows(client: Client): FlightBookingCardRow[] {
  const rows: FlightBookingCardRow[] = [];
  const f = client.flight;
  const add = (label: string, v: string | undefined) => {
    const t = v?.trim();
    if (t) rows.push({ label, value: t });
  };

  const birthday = client.importantDates.find((d) => /^birthday$/i.test(d.label.trim()));
  const dobFromImportant =
    birthday != null ? formatImportantDate(birthday.month, birthday.day, birthday.year) : null;
  add("DOB", f?.dateOfBirth?.trim() || dobFromImportant || undefined);

  add("Gender", f?.gender);

  const emailFromFlight = f?.email?.trim();
  const emailFromProfile = (client.emails.find((e) => e.type === "personal") ?? client.emails[0])
    ?.address?.trim();
  add("Email", emailFromFlight || emailFromProfile);

  const phoneFromFlight = f?.phone?.trim();
  const phone = client.phones.find((p) => p.type === "mobile") ?? client.phones[0];
  const phoneFromProfile = phone ? formatPhoneDisplay(phone) : null;
  add("Phone", phoneFromFlight || phoneFromProfile || undefined);

  add("Nationality", f?.nationality);
  add("Passport", f?.passportNumber);
  add("Passport expires", f?.passportExpiry);
  add("Known Traveler #", f?.knownTravelerNumber);

  const airlinePrograms = client.loyaltyPrograms.filter((lp) =>
    isLikelyAirlineLoyalty(lp.programName),
  );
  for (const lp of airlinePrograms) {
    const name = lp.programName.trim();
    const num = lp.accountNumber.trim();
    if (!name && !num) continue;
    rows.push({
      label: "Airline loyalty",
      value: num ? `${name} · ${num}` : name,
    });
  }

  return rows;
}

export function clientSearchBlob(c: Client): string {
  const addr = c.addresses[0];
  const cityState = addr ? [addr.city, addr.state].filter((s) => s && String(s).trim()).join(" ") : "";
  const fl = c.flight;
  const flightBlob = fl
    ? [
        fl.dateOfBirth,
        fl.gender,
        fl.email,
        fl.phone,
        fl.passportNumber,
        fl.passportExpiry,
        fl.nationality,
        fl.knownTravelerNumber,
      ]
        .filter((s): s is string => typeof s === "string" && s.trim() !== "")
        .join(" ")
    : "";
  return [
    c.firstName,
    c.lastName,
    c.middleName,
    c.location,
    cityState,
    ...c.emails.map((e) => e.address),
    ...c.phones.map((p) => formatPhoneDisplay(p) ?? ""),
    flightBlob,
  ]
    .join(" ")
    .toLowerCase();
}
