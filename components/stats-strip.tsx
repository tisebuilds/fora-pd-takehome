import Link from "next/link";
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
        "grid grid-cols-3 gap-4 rounded-[16px] bg-fora-accent px-5 py-4 text-sm",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-normal leading-tight text-fora-muted">Bookings</p>
        <Link
          href={bookingsHref}
          className="mt-1 inline-block text-lg font-bold text-fora-link no-underline hover:opacity-80"
        >
          {bookingsCount}
        </Link>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-normal leading-tight text-fora-muted">Commissionable value</p>
        <p className="mt-1 text-lg font-bold text-fora-navy">{formatCurrency(commissionableValue)}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-normal leading-tight text-fora-muted">Commissions</p>
        <p className="mt-1 text-lg font-bold text-fora-success">{formatCurrency(commissions)}</p>
      </div>
    </div>
  );
}
