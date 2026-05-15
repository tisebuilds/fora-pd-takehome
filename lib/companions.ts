import type { CompanionKind } from "@/lib/types";

/** Canonical companion relationship values (brief + extended set). Linked profiles use `linkedClientId`. */
export const COMPANION_RELATIONSHIPS = [
  "parent-child",
  "grandparent-grandchild",
  "spouse",
  "friend",
  "general-family",
  "sub-client",
  "linked-traveler",
  "other",
  "sibling",
  "partner-unmarried",
  "in-law",
  "pet",
  "caregiver-guardian",
  "colleague",
] as const;

export type CompanionRelationship = (typeof COMPANION_RELATIONSHIPS)[number];

export const COMPANION_RELATIONSHIP_LABELS: Record<CompanionRelationship, string> = {
  "parent-child": "Parent, child",
  "grandparent-grandchild": "Grandparent, grandchild",
  spouse: "Spouse",
  friend: "Friend",
  "general-family": "General family",
  "sub-client": "Sub-client",
  "linked-traveler": "Linked traveler",
  other: "Other",
  sibling: "Sibling",
  "partner-unmarried": "Partner, unmarried",
  "in-law": "In-law",
  pet: "Pet",
  "caregiver-guardian": "Caregiver, guardian",
  colleague: "Colleague",
};

const LEGACY_RELATIONSHIP_MAP: Record<string, CompanionRelationship> = {
  spouse: "spouse",
  child: "parent-child",
  parent: "parent-child",
  "parent-child": "parent-child",
  "parent / child": "parent-child",
  "parent, child": "parent-child",
  grandparent: "grandparent-grandchild",
  grandchild: "grandparent-grandchild",
  "grandparent-grandchild": "grandparent-grandchild",
  "grandparent / grandchild": "grandparent-grandchild",
  "grandparent, grandchild": "grandparent-grandchild",
  "spouse (grandpa)": "grandparent-grandchild",
  "spouse (grandma)": "grandparent-grandchild",
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
  pet: "pet",
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
