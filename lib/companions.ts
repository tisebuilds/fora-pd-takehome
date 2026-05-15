import type { CompanionKind } from "@/lib/types";

/** Canonical companion relationship values (brief + extended set). Linked profiles use `linkedClientId`. */
export const COMPANION_RELATIONSHIPS = [
  "parent",
  "child",
  "grandparent",
  "grandchild",
  "spouse",
  "friend",
  "general-family",
  "sub-client",
  "linked-traveler",
  "other",
  "sibling",
  "partner-unmarried",
  "in-law",
  "caregiver-guardian",
  "colleague",
] as const;

export type CompanionRelationship = (typeof COMPANION_RELATIONSHIPS)[number];

export const COMPANION_RELATIONSHIP_LABELS: Record<CompanionRelationship, string> = {
  parent: "Parent",
  child: "Child",
  grandparent: "Grandparent",
  grandchild: "Grandchild",
  spouse: "Spouse",
  friend: "Friend",
  "general-family": "General family",
  "sub-client": "Sub-client",
  "linked-traveler": "Linked traveler",
  other: "Other",
  sibling: "Sibling",
  "partner-unmarried": "Partner",
  "in-law": "In-law",
  "caregiver-guardian": "Caregiver / guardian",
  colleague: "Colleague",
};

export type CompanionRelationshipGroupId = "family" | "personal" | "business";

export type CompanionRelationshipGroup = {
  id: CompanionRelationshipGroupId;
  label: string;
  relationships: readonly CompanionRelationship[];
};

/** UI grouping for the relationship picker (each canonical value appears exactly once). */
export const COMPANION_RELATIONSHIP_GROUPS: readonly CompanionRelationshipGroup[] = [
  {
    id: "family",
    label: "Family",
    relationships: [
      "spouse",
      "partner-unmarried",
      "child",
      "parent",
      "sibling",
      "grandparent",
      "grandchild",
      "in-law",
      "general-family",
    ],
  },
  {
    id: "personal",
    label: "Personal",
    relationships: ["friend", "caregiver-guardian", "colleague"],
  },
  {
    id: "business",
    label: "Business",
    relationships: ["sub-client", "linked-traveler", "other"],
  },
];

if (process.env.NODE_ENV !== "production") {
  const fromGroups = COMPANION_RELATIONSHIP_GROUPS.flatMap((g) => [...g.relationships]);
  const sortedExpected = [...COMPANION_RELATIONSHIPS].sort().join("\0");
  const sortedFromGroups = [...fromGroups].sort().join("\0");
  if (sortedExpected !== sortedFromGroups) {
    throw new Error(
      "COMPANION_RELATIONSHIP_GROUPS must list each COMPANION_RELATIONSHIPS value exactly once (no duplicates or omissions).",
    );
  }
}

export function companionRelationshipGroupId(
  relationship: CompanionRelationship,
): CompanionRelationshipGroupId {
  for (const g of COMPANION_RELATIONSHIP_GROUPS) {
    if (g.relationships.includes(relationship)) return g.id;
  }
  throw new Error(`No relationship group for: ${relationship}`);
}

const LEGACY_RELATIONSHIP_MAP: Record<string, CompanionRelationship> = {
  spouse: "spouse",
  child: "child",
  parent: "parent",
  grandparent: "grandparent",
  grandchild: "grandchild",
  "spouse (grandpa)": "grandparent",
  "spouse (grandma)": "grandparent",
  friend: "friend",
  colleague: "colleague",
  coworker: "colleague",
  "co-worker": "colleague",
  sibling: "sibling",
  sister: "sibling",
  brother: "sibling",
  "general family": "general-family",
  "general-family": "general-family",
  "family dog": "general-family",
  family: "general-family",
  "sub-client": "sub-client",
  subclient: "sub-client",
  "linked traveler": "linked-traveler",
  "linked-traveler": "linked-traveler",
  "linked profile": "linked-traveler",
  other: "other",
  misc: "other",
  "partner, unmarried": "partner-unmarried",
  "partner-unmarried": "partner-unmarried",
  "unmarried partner": "partner-unmarried",
  domestic: "partner-unmarried",
  "domestic partner": "partner-unmarried",
  "in-law": "in-law",
  inlaw: "in-law",
  "mother-in-law": "in-law",
  "father-in-law": "in-law",
  /** Removed from picker; map old saves to a neutral family bucket. */
  pet: "general-family",
  "caregiver, guardian": "caregiver-guardian",
  "caregiver-guardian": "caregiver-guardian",
  caregiver: "caregiver-guardian",
  guardian: "caregiver-guardian",
};

export function isCompanionRelationship(value: string): value is CompanionRelationship {
  return (COMPANION_RELATIONSHIPS as readonly string[]).includes(value);
}

export function companionRelationshipLabel(
  relationship: CompanionRelationship | undefined,
): string | null {
  if (!relationship) return null;
  return COMPANION_RELATIONSHIP_LABELS[relationship];
}

/**
 * Pet companions store species / type in `lastName` (Dog, Cat, or custom “other”).
 * Known presets keep canonical casing; custom types are title-cased. Falls back to “Pet” only when
 * type is missing (e.g. incomplete “other” edge case).
 */
export function petSpeciesDisplayLabel(lastName: string | undefined): string {
  const raw = lastName?.trim() ?? "";
  const lower = raw.toLowerCase();
  if (lower === "dog") return "Dog";
  if (lower === "cat") return "Cat";
  if (raw.length > 0) {
    return raw
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  return "Pet";
}

/** Maps legacy free-text seed values to canonical relationships. */
export function parseCompanionRelationship(raw: string | undefined): CompanionRelationship | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  if (isCompanionRelationship(trimmed)) return trimmed;
  const mapped = LEGACY_RELATIONSHIP_MAP[trimmed.toLowerCase()];
  return mapped;
}

export function resolveTravelerRelationship(
  companionKind: CompanionKind | undefined,
  raw: CompanionRelationship | "" | undefined,
): { ok: true; relationship?: CompanionRelationship } | { ok: false; error: string } {
  const value = typeof raw === "string" && raw.length > 0 ? raw : undefined;
  if (companionKind === "pet") {
    if (!value) return { ok: true, relationship: undefined };
    if (isCompanionRelationship(value)) return { ok: true, relationship: value };
    return { ok: false, error: "Invalid relationship." };
  }
  if (!value || !isCompanionRelationship(value)) {
    return { ok: false, error: "Please choose a relationship." };
  }
  return { ok: true, relationship: value };
}
