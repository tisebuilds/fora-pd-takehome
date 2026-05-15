import {
  Calendar,
  CreditCard,
  Globe,
  IdCard,
  Mail,
  Phone,
  Plane,
  UserRound,
} from "lucide-react";
import {
  isPassportCurrentlyValid,
  type CompanionProfileDetailField,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const ICON_CLASS = "size-[15px] shrink-0 text-[#B0B5BD]";

function FieldIcon({ kind }: { kind: CompanionProfileDetailField["kind"] }) {
  switch (kind) {
    case "dateOfBirth":
      return <Calendar className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    case "gender":
      return <UserRound className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    case "nationality":
      return <Globe className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    case "email":
      return <Mail className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    case "phone":
      return <Phone className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    case "passport":
      return <IdCard className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    case "knownTraveler":
      return <CreditCard className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    case "airlineLoyalty":
      return <Plane className={ICON_CLASS} strokeWidth={1.65} aria-hidden />;
    default:
      return null;
  }
}

function PassportValidityBadge({ expiry }: { expiry: string }) {
  const valid = isPassportCurrentlyValid(expiry);
  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight",
        valid ? "bg-[#E8F5EC] text-[#166534]" : "bg-[#FEF2F2] text-fora-danger",
      )}
    >
      <span className="truncate">{valid ? `Valid until ${expiry}` : `Expired ${expiry}`}</span>
    </span>
  );
}

export function CompanionProfileDetails({
  fields,
}: {
  fields: CompanionProfileDetailField[];
}) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <dl className="mt-3.5 space-y-2.5">
      {fields.map((field, i) => (
        <div
          key={`${field.kind}-${field.label}-${i}`}
          className="grid grid-cols-[20px_minmax(108px,34%)_1fr] items-center gap-x-3"
        >
          <dt className="sr-only">{field.label}</dt>
          <dd className="col-span-3 grid grid-cols-subgrid items-center">
            <span className="flex items-center justify-center" aria-hidden>
              <FieldIcon kind={field.kind} />
            </span>
            <span className="text-[13px] leading-snug text-fora-muted">{field.label}</span>
            <span className="min-w-0 text-[13px] leading-snug text-fora-navy">
              {field.kind === "passport" ? (
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{field.value}</span>
                  {field.passportExpiry ? (
                    <PassportValidityBadge expiry={field.passportExpiry} />
                  ) : null}
                </span>
              ) : (
                <>
                  <span className="font-medium">{field.value}</span>
                  {field.valueSuffix ? (
                    <span className="font-normal text-[#9CA3AF]"> ({field.valueSuffix})</span>
                  ) : null}
                </>
              )}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
