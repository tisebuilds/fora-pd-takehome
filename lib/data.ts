import type {
  AssociatedTraveler,
  Client,
  ClientAddress,
  ClientEmail,
  ClientPhone,
  LoyaltyProgram,
  PhoneType,
  TravelerFlightBookingInfo,
  TravelerGroup,
} from "@/lib/types";

/**
 * Hardcoded seed data for the Porta scaffold — all names and numbers are fictional.
 * Brad Andrews matches the reference screenshots.
 */
const seedClients: Client[] = [
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
    flight: {
      gender: "Male",
      nationality: "US",
      passportNumber: "547891200",
      passportExpiry: "2032-06-01",
      knownTravelerNumber: "TT1122334",
    },
    bookingsCount: 1,
    commissionableValue: 692,
    commissions: 48,
    travelerGroups: [
      {
        id: "tg-brad-household",
        name: "Household",
        travelers: [
          {
            id: "at-brad-1",
            firstName: "Nicole",
            lastName: "Andrews",
            relationship: "Spouse",
            flight: {
              dateOfBirth: "1986-04-18",
              gender: "Female",
              email: "nicole.andrews@example.com",
              phone: "+1 917 555 0142",
              nationality: "US",
              passportNumber: "547891234",
              passportExpiry: "2031-11-08",
              knownTravelerNumber: "TT9876543",
            },
          },
        ],
      },
    ],
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
    travelerGroups: [
      {
        id: "tg-kb-family",
        name: "Family",
        travelers: [
          {
            id: "at-kb-1",
            firstName: "Jordan",
            lastName: "Barrett",
            relationship: "Spouse",
            flight: {
              dateOfBirth: "1989-04-12",
              nationality: "US",
              knownTravelerNumber: "TT1234567",
            },
          },
          {
            id: "at-kb-2",
            firstName: "Alex",
            lastName: "Barrett",
            relationship: "Child",
            flight: { dateOfBirth: "2014-08-01", nationality: "US" },
          },
        ],
      },
      {
        id: "tg-kb-work",
        name: "Work trips",
        travelers: [],
        includePrimaryClient: false,
      },
    ],
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

const SCALE_DEMO_FIRST = [
  "Alex",
  "Riley",
  "Morgan",
  "Casey",
  "Jamie",
  "Quinn",
  "Avery",
  "Reese",
  "Skyler",
  "Drew",
  "Blake",
  "Cameron",
  "Logan",
  "Harper",
  "Parker",
] as const;

const SCALE_DEMO_LAST = [
  "Chen",
  "Patel",
  "Okonkwo",
  "Nakamura",
  "Silva",
  "Kowalski",
  "Andersson",
  "Haddad",
  "Fernández",
  "Okafor",
  "Nguyen",
  "Ibrahim",
  "Costa",
  "Yamamoto",
  "Schmidt",
  "Olsen",
  "Park",
  "Reyes",
  "Khan",
  "Murphy",
] as const;

const SCALE_DEMO_CITIES = [
  "Seattle",
  "Boston",
  "Atlanta",
  "Portland",
  "Philadelphia",
  "Phoenix",
  "Nashville",
  "Minneapolis",
  "Toronto",
  "Vancouver",
  "Dublin",
  "Paris",
  "Barcelona",
  "Singapore",
  "Sydney",
] as const;

/** Lightweight profiles so the clients list stresses layout at scale (fictional data). */
function buildScaleDemoClients(count: number): Client[] {
  return Array.from({ length: count }, (_, i) => {
    const first = SCALE_DEMO_FIRST[i % SCALE_DEMO_FIRST.length]!;
    const last = SCALE_DEMO_LAST[(i * 7) % SCALE_DEMO_LAST.length]!;
    const city = SCALE_DEMO_CITIES[(i * 3) % SCALE_DEMO_CITIES.length]!;
    const id = `scale-demo-${String(i + 1).padStart(3, "0")}`;
    const bookingsCount = (i * 5 + 11) % 24;
    const commissionableValue = ((i * 1307 + 500) % 89000) + 400;
    const commissions = Math.round(commissionableValue * (0.04 + ((i % 10) + 1) * 0.004));

    return {
      id,
      firstName: first,
      lastName: last,
      location: city,
      emails: [{ type: "personal" as const, address: `${id.replace(/-/g, ".")}@example.com` }],
      phones: [
        {
          type: "mobile" as const,
          country: "US",
          dialCode: "+1",
          nationalNumber: String(2000000000 + ((i * 7919) % 800000000)),
        },
      ],
      notes: i % 6 === 0 ? "Demo profile — synthetic row for scale testing." : null,
      addresses: [
        {
          id: `addr-${id}`,
          line1: `${100 + (i % 90)} Market St`,
          city,
          state: "",
          zip: String(10000 + (i % 90000)).padStart(5, "0").slice(-5),
        },
      ],
      creditCards: [],
      loyaltyPrograms: [],
      importantDates: [
        {
          id: `id-${id}-bd`,
          label: "Birthday",
          month: ((i % 12) + 1) as number,
          day: ((i % 27) + 1) as number,
          year: 1972 + (i % 35),
        },
        { id: `id-${id}-an`, label: "Anniversary", month: null, day: null, year: null },
      ],
      bookingsCount,
      commissionableValue,
      commissions,
    } satisfies Client;
  });
}

/** Seed clients plus synthetic rows for list/detail scale demos. */
export const clients: Client[] = [...seedClients, ...buildScaleDemoClients(95)];

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

/** Appends a loyalty program to the in-memory seed client — used by loyalty program Server Actions. */
export function addLoyaltyProgram(
  clientId: string,
  data: Pick<LoyaltyProgram, "programName" | "accountNumber">,
): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return false;
  const id = `loy-${clientId}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  client.loyaltyPrograms.push({
    id,
    programName: data.programName.trim(),
    accountNumber: data.accountNumber.trim(),
  });
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

/** `includePrimaryClient` defaults to true when omitted. */
export function travelerGroupIncludesPrimary(group: TravelerGroup): boolean {
  return group.includePrimaryClient !== false;
}

/** Read-only view: legacy `associatedTravelers` is shown as one group until migrated. */
export function getTravelerGroupsForDisplay(client: Client): TravelerGroup[] {
  if (client.travelerGroups !== undefined) return client.travelerGroups;
  const flat = client.associatedTravelers ?? [];
  if (!flat.length) return [];
  return [
    {
      id: `tg-${client.id}-household`,
      name: "Household",
      travelers: flat,
      includePrimaryClient: true,
    },
  ];
}

/** Ensures `travelerGroups` exists on the client — call before mutating travelers in server actions. */
export function migrateToTravelerGroupsIfNeeded(client: Client): void {
  if (client.travelerGroups !== undefined) return;
  const flat = client.associatedTravelers ?? [];
  client.travelerGroups = flat.length
    ? [
        {
          id: `tg-${client.id}-household`,
          name: "Household",
          travelers: flat.map((t) => ({
            ...t,
            flight: t.flight ? { ...t.flight } : undefined,
          })),
          includePrimaryClient: true,
        },
      ]
    : [];
  delete client.associatedTravelers;
}

function compactFlightFields(flight: TravelerFlightBookingInfo): TravelerFlightBookingInfo | undefined {
  const next: TravelerFlightBookingInfo = {};
  (Object.keys(flight) as (keyof TravelerFlightBookingInfo)[]).forEach((key) => {
    const v = flight[key];
    if (v != null && String(v).trim()) next[key] = String(v).trim();
  });
  return Object.keys(next).length ? next : undefined;
}

export function addTravelerGroup(
  clientId: string,
  name: string,
  includePrimaryClient = true,
): { ok: true; groupId: string } | { ok: false; error: string } {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return { ok: false, error: "Client not found." };
  migrateToTravelerGroupsIfNeeded(client);
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Group name is required." };
  const groupId = `tg-${clientId}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  client.travelerGroups!.push({
    id: groupId,
    name: trimmed,
    travelers: [],
    ...(includePrimaryClient ? {} : { includePrimaryClient: false }),
  });
  return { ok: true, groupId };
}

export function setTravelerGroupIncludePrimary(
  clientId: string,
  groupId: string,
  includePrimaryClient: boolean,
): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client?.travelerGroups) return false;
  const group = client.travelerGroups.find((g) => g.id === groupId);
  if (!group) return false;
  if (includePrimaryClient) {
    delete group.includePrimaryClient;
  } else {
    group.includePrimaryClient = false;
  }
  return true;
}

export function renameTravelerGroup(clientId: string, groupId: string, name: string): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client?.travelerGroups) return false;
  const group = client.travelerGroups.find((g) => g.id === groupId);
  if (!group) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  group.name = trimmed;
  return true;
}

export function deleteTravelerGroup(
  clientId: string,
  groupId: string,
): { ok: true } | { ok: false; error: string } {
  const client = clients.find((c) => c.id === clientId);
  if (!client?.travelerGroups) return { ok: false, error: "Group not found." };
  const idx = client.travelerGroups.findIndex((g) => g.id === groupId);
  if (idx === -1) return { ok: false, error: "Group not found." };
  if (client.travelerGroups[idx]!.travelers.length > 0) {
    return { ok: false, error: "Remove travelers from this group before deleting it." };
  }
  client.travelerGroups.splice(idx, 1);
  return { ok: true };
}

export type TravelerUpsertPayload = Pick<
  AssociatedTraveler,
  "firstName" | "lastName" | "relationship" | "companionKind"
> & {
  flight?: TravelerFlightBookingInfo;
};

export function addTravelerToGroup(
  clientId: string,
  groupId: string,
  data: TravelerUpsertPayload,
): { ok: true; travelerId: string } | { ok: false; error: string } {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return { ok: false, error: "Client not found." };
  migrateToTravelerGroupsIfNeeded(client);
  const group = client.travelerGroups!.find((g) => g.id === groupId);
  if (!group) return { ok: false, error: "Group not found." };
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  if (!firstName || !lastName) {
    return {
      ok: false,
      error:
        data.companionKind === "pet"
          ? "Pet name and species are required."
          : "First and last name are required.",
    };
  }
  const travelerId = `at-${clientId}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  const flight = data.flight ? compactFlightFields(data.flight) : undefined;
  const companionKind = data.companionKind === "pet" ? "pet" : undefined;
  group.travelers.push({
    id: travelerId,
    ...(companionKind ? { companionKind } : {}),
    firstName,
    lastName,
    relationship: data.relationship?.trim() || undefined,
    flight,
  });
  return { ok: true, travelerId };
}

export function updateTravelerInGroup(
  clientId: string,
  groupId: string,
  travelerId: string,
  data: TravelerUpsertPayload,
): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client?.travelerGroups) return false;
  const group = client.travelerGroups.find((g) => g.id === groupId);
  if (!group) return false;
  const t = group.travelers.find((x) => x.id === travelerId);
  if (!t) return false;
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  if (!firstName || !lastName) return false;
  if (data.companionKind === "pet") {
    t.companionKind = "pet";
  } else {
    delete t.companionKind;
  }
  t.firstName = firstName;
  t.lastName = lastName;
  t.relationship = data.relationship?.trim() || undefined;
  t.flight = data.flight ? compactFlightFields(data.flight) : undefined;
  return true;
}

export function deleteTravelerFromGroup(clientId: string, groupId: string, travelerId: string): boolean {
  const client = clients.find((c) => c.id === clientId);
  if (!client?.travelerGroups) return false;
  const group = client.travelerGroups.find((g) => g.id === groupId);
  if (!group) return false;
  const idx = group.travelers.findIndex((x) => x.id === travelerId);
  if (idx === -1) return false;
  group.travelers.splice(idx, 1);
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
