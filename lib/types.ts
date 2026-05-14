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
