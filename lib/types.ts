export type EmailType = "personal" | "work" | "other";
export type PhoneType = "mobile" | "home" | "work" | "other";
export type CardBrand = "visa" | "mastercard" | "amex";

export interface ClientEmail {
  type: EmailType;
  address: string;
}

export interface ClientPhone {
  type: PhoneType;
  /** ISO country code for flag display, e.g. US */
  country: string;
  /** E.164 prefix without national number spacing, e.g. +1 */
  dialCode: string;
  /** National number for display, may be empty */
  nationalNumber: string;
}

export interface ClientAddress {
  id: string;
  /** "Name this address" / address nickname */
  label?: string;
  country?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface CreditCard {
  id: string;
  brand: CardBrand;
  cardholderName: string;
  last4: string;
  expMonth: number;
  expYearTwoDigit: number;
  /** Billing postal code: prototype seed / fixtures only; production should use a vault. */
  billingZip?: string;
  /**
   * Fake card security code for UI prototypes (e.g. test PAN convention).
   * Never store or surface real CVV/CVC in apps; PCI forbids retaining CVV after authorization.
   */
  cvvDemo?: string;
}

export interface LoyaltyProgram {
  id: string;
  programName: string;
  accountNumber: string;
}

export interface ImportantDate {
  id: string;
  label: string;
  month: number | null;
  day: number | null;
  year: number | null;
}

/** Profile fields commonly needed when booking flights for a companion. */
export interface TravelerFlightBookingInfo {
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  knownTravelerNumber?: string;
}

/** Directory row for linking a person companion to another client profile (picker + prefill). */
export interface CompanionLinkableClient {
  id: string;
  displayName: string;
  location: string;
  firstName: string;
  lastName: string;
  flight: TravelerFlightBookingInfo;
}

/** Household or trip companions linked to a client profile. */
export type CompanionKind = "person" | "pet";

export interface AssociatedTraveler {
  id: string;
  /**
   * `pet` = animal companion (name in `firstName`, species label in `lastName`, e.g. Cat, Dog).
   * Omitted or `person` = human traveler (legal-style first + last name).
   */
  companionKind?: CompanionKind;
  firstName: string;
  lastName: string;
  relationship?: string;
  /** Care / travel notes for pets (carrier size, diet, etc.). Omit for human companions. */
  petNotes?: string;
  flight?: TravelerFlightBookingInfo;
  /**
   * When set on a human companion, points at another saved client profile in this workspace
   * (e.g. household member with their own file). Not used for pets.
   */
  linkedClientId?: string;
}

/** Named set of travelers (e.g. family vs work trip) for booking together. */
export interface TravelerGroup {
  id: string;
  name: string;
  travelers: AssociatedTraveler[];
  /**
   * When omitted or true, the client profile (primary) is listed first in this group on the companion tab.
   * `false` = companion-only group (e.g. pets, colleagues) without duplicating the primary row.
   */
  includePrimaryClient?: boolean;
  /**
   * `CreditCard.id` values on the same client profile, shown under this household on the Companions tab
   * (e.g. hotel folio / room payment).
   */
  paymentCardIds?: string[];
}

/** Timeline entry on the client Notes tab (written, uploaded audio, or in-browser meeting recording). */
export type ClientProfileNoteKind = "text" | "audio_upload" | "audio_meeting";

export interface ClientProfileNote {
  id: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  kind: ClientProfileNoteKind;
  /** Written note body */
  text?: string;
  /** Original filename for uploaded audio */
  audioFileName?: string;
  /**
   * In-memory playback URL from `URL.createObjectURL`; not persisted; cleared on refresh.
   * Seeded server data never includes this field.
   */
  audioObjectUrl?: string;
}

export interface Client {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  /** City / region shown under name on list */
  location: string;
  emails: ClientEmail[];
  phones: ClientPhone[];
  /** null = empty: legacy single blurb; shown as one timeline card when `profileNotes` is absent */
  notes: string | null;
  /** Optional seeded timeline; when present, replaces legacy `notes` for the Notes tab */
  profileNotes?: ClientProfileNote[];
  addresses: ClientAddress[];
  creditCards: CreditCard[];
  loyaltyPrograms: LoyaltyProgram[];
  importantDates: ImportantDate[];
  /**
   * Booking / ID fields for the primary traveler (gender, passport, KTN, etc.).
   * Shown on the Companion tab; contact fields fall back to profile emails/phones when omitted here.
   */
  flight?: TravelerFlightBookingInfo;
  /**
   * Legacy flat list, shown as a single group until the first traveler edit/add,
   * which migrates data to `travelerGroups` in the demo store.
   */
  associatedTravelers?: AssociatedTraveler[];
  /** Preferred: grouped companions for trips and joint bookings. */
  travelerGroups?: TravelerGroup[];
  bookingsCount: number;
  commissionableValue: number;
  commissions: number;
  /** Edit form: optional structured name fields */
  nameEdit?: {
    prefix?: string;
    suffix?: string;
    preferredName?: string;
    pronouns?: string;
  };
}
