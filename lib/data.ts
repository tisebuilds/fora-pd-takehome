import type {
  Client,
  ClientAddress,
  ClientEmail,
  ClientPhone,
  LoyaltyProgram,
  PhoneType,
} from "@/lib/types";

/**
 * Hardcoded seed data for the Porta scaffold — all names and numbers are fictional.
 * Brad Andrews matches the reference screenshots.
 */
export const clients: Client[] = [
  {
    id: "brad-andrews",
    firstName: "Brad",
    lastName: "Andrews",
    location: "New York",
    emails: [{ type: "personal", address: "bradandrews@gmail.com" }],
    phones: [
      {
        type: "mobile",
        country: "US",
        dialCode: "+1",
        nationalNumber: "2124579321",
      },
    ],
    notes: "Son has a gluten allergy",
    addresses: [
      {
        id: "addr-brad-1",
        label: "",
        country: "",
        line1: "407 Park Ave S",
        line2: "Apt 6C",
        city: "New York",
        state: "NY",
        zip: "10016",
      },
    ],
    creditCards: [
      {
        id: "cc-brad-1",
        brand: "visa",
        cardholderName: "Carmen Sandiego",
        last4: "0943",
        expMonth: 10,
        expYearTwoDigit: 27,
        billingZip: "10016",
        cvvDemo: "123",
      },
    ],
    loyaltyPrograms: [
      {
        id: "loy-brad-1",
        programName: "United Airlines (Mileage Plus)",
        accountNumber: "NR98713",
      },
      {
        id: "loy-brad-2",
        programName: "World of Hyatt",
        accountNumber: "1231234234234",
      },
    ],
    importantDates: [
      { id: "id-brad-1", label: "Birthday", month: 10, day: 3, year: 1984 },
      { id: "id-brad-2", label: "Anniversary", month: 6, day: 22, year: 2015 },
    ],
    bookingsCount: 1,
    commissionableValue: 692,
    commissions: 48,
    nameEdit: {
      prefix: "",
      suffix: "",
      preferredName: "",
      pronouns: "",
    },
  },
  {
    id: "nicole-andrews",
    firstName: "Nicole",
    lastName: "Andrews",
    location: "New York",
    emails: [{ type: "personal", address: "nicole.andrews@example.com" }],
    phones: [
      {
        type: "mobile",
        country: "US",
        dialCode: "+1",
        nationalNumber: "9175550142",
      },
    ],
    notes: "Prefers morning flights when possible.",
    addresses: [
      {
        id: "addr-nicole-1",
        line1: "407 Park Ave S",
        line2: "Apt 6C",
        city: "New York",
        state: "NY",
        zip: "10016",
      },
    ],
    creditCards: [],
    loyaltyPrograms: [],
    importantDates: [
      { id: "id-nicole-1", label: "Birthday", month: 4, day: 18, year: 1986 },
      { id: "id-nicole-2", label: "Anniversary", month: 6, day: 22, year: 2015 },
    ],
    bookingsCount: 0,
    commissionableValue: 0,
    commissions: 0,
  },
  {
    id: "steven-armstrong",
    firstName: "Steven",
    lastName: "Armstrong",
    location: "San Francisco",
    emails: [{ type: "work", address: "steven.armstrong@northbaylabs.example" }],
    phones: [],
    notes: null,
    addresses: [
      {
        id: "addr-sa-1",
        line1: "450 Townsend St",
        city: "San Francisco",
        state: "CA",
        zip: "94107",
      },
    ],
    creditCards: [],
    loyaltyPrograms: [],
    importantDates: [
      { id: "id-sa-1", label: "Birthday", month: 2, day: 2, year: 1979 },
      { id: "id-sa-2", label: "Anniversary", month: null, day: null, year: null },
    ],
    bookingsCount: 3,
    commissionableValue: 12400,
    commissions: 890,
  },
  {
    id: "kimberly-barrett",
    firstName: "Kimberly",
    lastName: "Barrett",
    location: "Chicago",
    emails: [],
    phones: [
      {
        type: "work",
        country: "US",
        dialCode: "+1",
        nationalNumber: "3125550199",
      },
    ],
    notes: "Corporate road warrior — weekday stays only.",
    addresses: [
      {
        id: "addr-kb-1",
        line1: "233 S Wacker Dr",
        line2: "Suite 8400",
        city: "Chicago",
        state: "IL",
        zip: "60606",
      },
    ],
    creditCards: [],
    loyaltyPrograms: [{ id: "loy-kb-1", programName: "Marriott Bonvoy", accountNumber: "9988776655" }],
    importantDates: [
      { id: "id-kb-1", label: "Birthday", month: 11, day: 30, year: 1991 },
      { id: "id-kb-2", label: "Anniversary", month: null, day: null, year: null },
    ],
    bookingsCount: 12,
    commissionableValue: 48200,
    commissions: 3100,
  },
  {
    id: "nellie-bly",
    firstName: "Nellie",
    lastName: "Bly",
    location: "London",
    emails: [
      { type: "personal", address: "nellie.bly.travels@example.com" },
      { type: "work", address: "assignments@globalpost.example" },
    ],
    phones: [
      {
        type: "mobile",
        country: "GB",
        dialCode: "+44",
        nationalNumber: "7700900123",
      },
    ],
    notes: null,
    addresses: [
      {
        id: "addr-nb-1",
        line1: "15 Bermondsey St",
        city: "London",
        state: "",
        zip: "SE1 3PJ",
      },
    ],
    creditCards: [],
    loyaltyPrograms: [],
    importantDates: [
      { id: "id-nb-1", label: "Birthday", month: 5, day: 5, year: 1988 },
      { id: "id-nb-2", label: "Anniversary", month: null, day: null, year: null },
    ],
    bookingsCount: 7,
    commissionableValue: 22100,
    commissions: 1540,
  },
  {
    id: "liz-bronstan",
    firstName: "Liz",
    lastName: "Bronstan",
    location: "Austin",
    emails: [{ type: "personal", address: "liz.bronstan@example.com" }],
    phones: [
      {
        type: "mobile",
        country: "US",
        dialCode: "+1",
        nationalNumber: "5125550160",
      },
    ],
    notes: null,
    addresses: [
      {
        id: "addr-lb-1",
        line1: "200 Congress Ave",
        city: "Austin",
        state: "TX",
        zip: "78701",
      },
    ],
    creditCards: [],
    loyaltyPrograms: [
      { id: "loy-lb-1", programName: "Delta SkyMiles", accountNumber: "DL88221144" },
    ],
    importantDates: [
      { id: "id-lb-1", label: "Birthday", month: 8, day: 14, year: 1994 },
      { id: "id-lb-2", label: "Anniversary", month: 9, day: 9, year: 2020 },
    ],
    bookingsCount: 2,
    commissionableValue: 3100,
    commissions: 210,
  },
  {
    id: "susan-miller",
    firstName: "Susan",
    lastName: "Miller",
    location: "Miami",
    emails: [{ type: "personal", address: "susan.miller@example.com" }],
    phones: [
      {
        type: "home",
        country: "US",
        dialCode: "+1",
        nationalNumber: "3055550104",
      },
    ],
    notes: "Honeymoon registry — Maldives in March.",
    addresses: [
      {
        id: "addr-sm-1",
        line1: "1200 Brickell Ave",
        line2: "PH 45",
        city: "Miami",
        state: "FL",
        zip: "33131",
      },
    ],
    creditCards: [
      {
        id: "cc-sm-1",
        brand: "mastercard",
        cardholderName: "Susan Miller",
        last4: "4411",
        expMonth: 4,
        expYearTwoDigit: 28,
        billingZip: "33131",
        cvvDemo: "456",
      },
    ],
    loyaltyPrograms: [],
    importantDates: [
      { id: "id-sm-1", label: "Birthday", month: 1, day: 9, year: 1990 },
      { id: "id-sm-2", label: "Anniversary", month: 3, day: 1, year: 2026 },
    ],
    bookingsCount: 4,
    commissionableValue: 18900,
    commissions: 1320,
  },
  {
    id: "jordan-reeves",
    firstName: "Jordan",
    lastName: "Reeves",
    location: "Denver",
    emails: [{ type: "work", address: "jordan.reeves@ridgepeak.example" }],
    phones: [],
    notes: null,
    addresses: [
      {
        id: "addr-jr-1",
        line1: "1700 Broadway",
        city: "Denver",
        state: "CO",
        zip: "80290",
      },
    ],
    creditCards: [
      {
        id: "cc-jr-1",
        brand: "amex",
        cardholderName: "Jordan Reeves",
        last4: "1002",
        expMonth: 12,
        expYearTwoDigit: 29,
        billingZip: "80290",
        cvvDemo: "1234",
      },
    ],
    loyaltyPrograms: [{ id: "loy-jr-1", programName: "United MileagePlus", accountNumber: "MP778812" }],
    importantDates: [
      { id: "id-jr-1", label: "Birthday", month: 7, day: 21, year: 1983 },
      { id: "id-jr-2", label: "Anniversary", month: null, day: null, year: null },
    ],
    bookingsCount: 9,
    commissionableValue: 35600,
    commissions: 2490,
  },
];

export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export type PersonalInfoSaveInput = {
  firstName: string;
  lastName: string;
  middleName?: string;
  nameEdit: Client["nameEdit"];
  emails: ClientEmail[];
  phones: ClientPhone[];
  primaryAddress: ClientAddress;
};

const PHONE_TYPES: PhoneType[] = ["mobile", "home", "work", "other"];

/** Mutates the in-memory seed client — used by the edit form Server Action. */
export function updateClientPersonalInfo(
  clientId: string,
  input: PersonalInfoSaveInput
): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return false;

  client.firstName = input.firstName;
  client.lastName = input.lastName;
  if (input.middleName?.trim()) {
    client.middleName = input.middleName.trim();
  } else {
    delete client.middleName;
  }
  client.nameEdit = input.nameEdit;
  client.emails = input.emails;
  client.phones = input.phones;

  const city = input.primaryAddress.city?.trim();
  if (city) {
    client.location = city;
  }

  const first = client.addresses[0];
  if (first) {
    first.label = input.primaryAddress.label;
    first.country = input.primaryAddress.country;
    first.line1 = input.primaryAddress.line1;
    first.line2 = input.primaryAddress.line2;
    first.city = input.primaryAddress.city;
    first.state = input.primaryAddress.state;
    first.zip = input.primaryAddress.zip;
  } else {
    client.addresses[0] = { ...input.primaryAddress };
  }

  return true;
}

/** Mutates the in-memory seed client — used by loyalty program Server Actions. */
export function updateLoyaltyProgram(
  clientId: string,
  programId: string,
  patch: Pick<LoyaltyProgram, "programName" | "accountNumber">,
): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return false;
  const program = client.loyaltyPrograms.find((p) => p.id === programId);
  if (!program) return false;
  program.programName = patch.programName.trim();
  program.accountNumber = patch.accountNumber.trim();
  return true;
}

/** Mutates the in-memory seed client — used by loyalty program Server Actions. */
export function deleteLoyaltyProgram(clientId: string, programId: string): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return false;
  const idx = client.loyaltyPrograms.findIndex((p) => p.id === programId);
  if (idx === -1) return false;
  client.loyaltyPrograms.splice(idx, 1);
  return true;
}

export function collectPhonesFromForm(client: Client, formData: FormData): ClientPhone[] {
  const next: ClientPhone[] = [];
  for (const type of PHONE_TYPES) {
    const raw = String(formData.get(`phone-${type}`) ?? "");
    const existing = client.phones.find((p) => p.type === type);
    const parsed = parsePhoneField(raw, existing, type);
    if (parsed.nationalNumber.replace(/\D/g, "").length > 0) {
      next.push(parsed);
    }
  }
  return next;
}

function parsePhoneField(
  raw: string,
  existing: ClientPhone | undefined,
  type: PhoneType
): ClientPhone {
  const trimmed = raw.trim();
  const country = existing?.country ?? "US";
  let dialCode = existing?.dialCode ?? "+1";
  let nationalNumber = "";

  if (!trimmed || trimmed === "+1") {
    return { type, country, dialCode, nationalNumber: "" };
  }

  if (trimmed.startsWith("+44")) {
    dialCode = "+44";
    nationalNumber = trimmed.replace(/^\+44\s*/, "").replace(/\D/g, "");
  } else if (trimmed.startsWith("+1")) {
    dialCode = "+1";
    nationalNumber = trimmed.slice(2).replace(/\D/g, "");
  } else {
    const digits = trimmed.replace(/\D/g, "");
    if (country === "GB" || existing?.dialCode === "+44") {
      dialCode = "+44";
      nationalNumber = digits;
    } else {
      dialCode = "+1";
      nationalNumber = digits.length > 10 ? digits.slice(-10) : digits;
    }
  }

  return { type, country, dialCode, nationalNumber };
}
