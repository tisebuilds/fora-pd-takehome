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
  /** Billing postal code — prototype seed / fixtures only; production should use a vault. */
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
  flight?: TravelerFlightBookingInfo;
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
   * `CreditCard.id` values on the same client profile — shown under this household on the Companions tab
   * (e.g. hotel folio / room payment).
   */
  paymentCardIds?: string[];
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
  /** null = empty notes state (show add-notes affordance) */
  notes: string | null;
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
   * Legacy flat list — shown as a single group until the first traveler edit/add,
   * which migrates data to `travelerGroups` in the demo store.
   */
  associatedTravelers?: AssociatedTraveler[];
  /** Preferred — grouped companions for trips and joint bookings. */
  travelerGroups?: TravelerGroup[];
  bookingsCount: number;
  commissionableValue: number;
  commissions: number;
  /** Edit form — optional structured name fields */
  nameEdit?: {
    prefix?: string;
    suffix?: string;
    preferredName?: string;
    pronouns?: string;
  };
}
