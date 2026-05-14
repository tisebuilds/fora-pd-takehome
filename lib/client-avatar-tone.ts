/**
 * Deterministic pastel avatar tones for client rows (split list).
 * Seeded by `client.id` so color stays stable across sort/filter.
 */
const AVATAR_TONE_CLASSES = [
  "bg-[#EDE4F7] text-[#5B21B6]",
  "bg-[#D8F3E8] text-[#0F766E]",
  "bg-[#E0F2FE] text-[#0369A1]",
  "bg-[#FFE7D5] text-[#9A3412]",
  "bg-[#ECFCCB] text-[#3F6212]",
  "bg-[#FFE4E6] text-[#BE123C]",
  "bg-[#E0E7FF] text-[#3730A3]",
  "bg-[#FEF3C7] text-[#92400E]",
  "bg-[#FAE8FF] text-[#86198F]",
  "bg-[#CFFAFE] text-[#0E7490]",
  "bg-[#FCE7F3] text-[#9D174D]",
  "bg-[#DCFCE7] text-[#166534]",
  "bg-[#E8EEFF] text-[#1E3A8A]",
  "bg-[#FEF9C3] text-[#854D0E]",
  "bg-[#FEE2E2] text-[#991B1B]",
  "bg-[#F3E8FF] text-[#6B21A8]",
] as const;

function fnv1a32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function clientAvatarToneClasses(clientId: string): string {
  const h = fnv1a32(clientId);
  const idx = h % AVATAR_TONE_CLASSES.length;
  return AVATAR_TONE_CLASSES[idx];
}
