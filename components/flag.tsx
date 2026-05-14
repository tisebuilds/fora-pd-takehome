const FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
};

export function Flag({ code, className }: { code: string; className?: string }) {
  return (
    <span className={className} aria-hidden title={code}>
      {FLAGS[code] ?? "🏳️"}
    </span>
  );
}
