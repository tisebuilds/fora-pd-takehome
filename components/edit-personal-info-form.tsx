"use client";

import { useCallback, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveClientPersonalInfo } from "@/app/clients/[id]/edit/actions";
import type { Client, PhoneType } from "@/lib/types";
import { formatPhoneDisplay } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Shared field chrome for this form — ~6px radius, light gray border */
const FORM_CONTROL =
  "h-9 w-full min-w-0 rounded-[6px] border border-[#E5E7EB] bg-white text-sm text-gray-900 shadow-none outline-none transition-colors file:text-sm placeholder:text-gray-400 focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200/80";

const FORM_SELECT_TRIGGER = cn(
  FORM_CONTROL,
  "flex items-center justify-between gap-2 px-2.5 py-0 pr-2 text-left font-normal",
  "data-placeholder:text-gray-400"
);

function emailByType(client: Client, type: "personal" | "work" | "other") {
  return client.emails.find((e) => e.type === type)?.address ?? "";
}

function phoneFieldValue(client: Client, type: PhoneType): string {
  const p = client.phones.find((x) => x.type === type);
  if (!p) return "+1";
  const formatted = formatPhoneDisplay(p);
  if (formatted) return formatted;
  return p.dialCode;
}

type Props = {
  client: Client;
};

function FieldShell({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-normal text-gray-500">
        {label}
        {required ? <span className="text-gray-900"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grid grid-cols-[120px_1fr] items-start gap-x-8 gap-y-0",
        className
      )}
    >
      <p className="pt-0.5 text-sm font-normal text-gray-500">{title}</p>
      <div>{children}</div>
    </section>
  );
}

function FlagDial({ country }: { country: string }) {
  const flag = country === "GB" ? "🇬🇧" : "🇺🇸";
  return (
    <div
      className={cn(
        "flex h-9 shrink-0 items-center gap-1 rounded-[6px] border border-[#E5E7EB] bg-white px-2 text-sm"
      )}
    >
      <span aria-hidden>{flag}</span>
      <span className="text-gray-400">▾</span>
    </div>
  );
}

export function EditPersonalInfoForm({ client }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const primaryAddress = client.addresses[0];
  const prefixDefault = client.nameEdit?.prefix?.trim() || undefined;
  const pronounsDefault = client.nameEdit?.pronouns?.trim() || undefined;
  const countryDefault = primaryAddress?.country?.trim() || undefined;

  const fallbackHref = `/clients/${client.id}`;

  const navigateBackOrFallback = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }, [router, fallbackHref]);

  const handleCancel = useCallback(() => {
    navigateBackOrFallback();
  }, [navigateBackOrFallback]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveClientPersonalInfo(client.id, formData);
      if (result.ok) {
        navigateBackOrFallback();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-[960px]">
      <Link href={`/clients/${client.id}`} className="text-sm text-fora-link no-underline hover:opacity-80">
        ← Go back
      </Link>

      <form
        className="mt-8 w-full rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-sm md:p-8"
        onSubmit={handleSubmit}
      >
        <div className="divide-y divide-[#E5E7EB]">
          <Section title="Name" className="pb-10">
            <div className="flex max-w-none flex-col gap-5">
              <FieldShell label="Prefix">
                <Select name="prefix" defaultValue={prefixDefault}>
                  <SelectTrigger className={cn(FORM_SELECT_TRIGGER, "w-full")} size="default">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr.</SelectItem>
                    <SelectItem value="mrs">Mrs.</SelectItem>
                    <SelectItem value="ms">Ms.</SelectItem>
                    <SelectItem value="dr">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </FieldShell>
              <FieldShell label="First name" required>
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  defaultValue={client.firstName}
                  name="firstName"
                />
              </FieldShell>
              <FieldShell label="Middle name">
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  placeholder="Enter name"
                  name="middleName"
                />
              </FieldShell>
              <FieldShell label="Last name" required>
                <Input className={cn(FORM_CONTROL, "px-2.5")} defaultValue={client.lastName} name="lastName" />
              </FieldShell>
              <FieldShell label="Suffix">
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  placeholder="Enter suffix"
                  defaultValue={client.nameEdit?.suffix}
                  name="suffix"
                />
              </FieldShell>
              <FieldShell label="Preferred name">
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  placeholder="Enter name"
                  defaultValue={client.nameEdit?.preferredName}
                  name="preferredName"
                />
              </FieldShell>
              <FieldShell label="Pronouns">
                <Select name="pronouns" defaultValue={pronounsDefault}>
                  <SelectTrigger className={cn(FORM_SELECT_TRIGGER, "w-full")} size="default">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="she">She/her</SelectItem>
                    <SelectItem value="he">He/him</SelectItem>
                    <SelectItem value="they">They/them</SelectItem>
                  </SelectContent>
                </Select>
              </FieldShell>
            </div>
          </Section>

          <Section title="Email" className="py-10">
            <div className="flex max-w-none flex-col gap-5">
              <FieldShell label="Personal email">
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  defaultValue={emailByType(client, "personal")}
                  name="emailPersonal"
                />
              </FieldShell>
              <FieldShell label="Work email">
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  placeholder="Enter email"
                  defaultValue={emailByType(client, "work") || undefined}
                  name="emailWork"
                />
              </FieldShell>
              <FieldShell label="Other email">
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  placeholder="Enter email"
                  defaultValue={emailByType(client, "other") || undefined}
                  name="emailOther"
                />
              </FieldShell>
            </div>
          </Section>

          <Section title="Phone number" className="py-10">
            <div className="flex max-w-none flex-col gap-5">
              {(
                [
                  ["Mobile phone", "mobile"],
                  ["Home phone", "home"],
                  ["Work phone", "work"],
                  ["Other phone", "other"],
                ] as const
              ).map(([label, type]) => (
                <FieldShell key={type} label={label}>
                  <div className="flex gap-2">
                    <FlagDial country={client.phones.find((p) => p.type === type)?.country ?? "US"} />
                    <Input
                      className={cn(FORM_CONTROL, "flex-1 px-2.5")}
                      defaultValue={phoneFieldValue(client, type)}
                      name={`phone-${type}`}
                    />
                  </div>
                </FieldShell>
              ))}
            </div>
          </Section>

          <Section title="Address" className="pt-10">
            <div className="flex max-w-none flex-col gap-5">
              <FieldShell label="Address name">
                <Input
                  className={cn(FORM_CONTROL, "px-2.5")}
                  placeholder="Example: Summer house"
                  defaultValue={primaryAddress?.label || undefined}
                  name="addressLabel"
                />
              </FieldShell>
              <FieldShell label="Country">
                <Select name="country" defaultValue={countryDefault}>
                  <SelectTrigger className={cn(FORM_SELECT_TRIGGER, "w-full")} size="default">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </FieldShell>
              <FieldShell label="Address">
                <Input className={cn(FORM_CONTROL, "px-2.5")} defaultValue={primaryAddress?.line1} name="address1" />
              </FieldShell>
              <FieldShell label="Apt number, suite, floor, etc.">
                <Input className={cn(FORM_CONTROL, "px-2.5")} defaultValue={primaryAddress?.line2} name="address2" />
              </FieldShell>
              <FieldShell label="City">
                <Input className={cn(FORM_CONTROL, "px-2.5")} defaultValue={primaryAddress?.city} name="city" />
              </FieldShell>
              <FieldShell label="State">
                <Input className={cn(FORM_CONTROL, "px-2.5")} defaultValue={primaryAddress?.state} name="state" />
              </FieldShell>
              <FieldShell label="Zip code">
                <Input className={cn(FORM_CONTROL, "px-2.5")} defaultValue={primaryAddress?.zip} name="zip" />
              </FieldShell>
            </div>
            <button type="button" className="mt-6 text-sm text-fora-link hover:underline">
              Add another address
            </button>
          </Section>
        </div>

        <div className="mt-10 flex justify-end gap-4 border-t border-[#E5E7EB] pt-10">
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-full px-4 text-gray-600 hover:text-gray-900"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-full bg-black px-6 text-white hover:bg-gray-800"
          >
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
