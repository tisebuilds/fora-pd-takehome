import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  bookingsCount: number;
  commissionableValue: number;
  commissions: number;
  bookingsHref?: string;
  className?: string;
};

export function StatsStrip({
  bookingsCount,
  commissionableValue,
  commissions,
  bookingsHref = "#",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-4 rounded-[16px] border border-fora-border bg-fora-accent px-5 py-4 text-sm shadow-none ring-0",
        className
      )}
    >
      <Link
        href={bookingsHref}
        className={cn(
          "group min-w-0 rounded-md no-underline outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-fora-link/40",
        )}
      >
        <p className="text-[11px] font-normal leading-tight text-fora-muted">Bookings</p>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-lg font-bold text-fora-navy transition-opacity group-hover:opacity-80">
            {bookingsCount}
          </span>
          <ArrowRight
            className="size-4 shrink-0 text-fora-navy opacity-0 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none -translate-x-1 group-hover:translate-x-0 group-hover:opacity-70"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </Link>
      <div className="min-w-0">
        <p className="text-[11px] font-normal leading-tight text-fora-muted">Commissionable value</p>
        <p className="mt-1 text-lg font-bold text-fora-navy">{formatCurrency(commissionableValue)}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-normal leading-tight text-fora-muted">Commissions</p>
        <p className="mt-1 text-lg font-bold text-fora-navy">{formatCurrency(commissions)}</p>
      </div>
    </div>
  );
}
