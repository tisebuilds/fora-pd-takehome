"use client";

import { useRouter } from "next/navigation";
import { LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearClientsLayoutPreference,
  CLIENTS_LAYOUT_CLEARED_EVENT,
} from "@/components/clients-view-toggle";

export function ChoosePrototypeNavButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();

  const handleClick = () => {
    clearClientsLayoutPreference();
    router.push("/clients");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CLIENTS_LAYOUT_CLEARED_EVENT));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={collapsed ? "Choose prototype…" : undefined}
      className={cn(
        "w-full rounded-[4px] text-[13px] font-normal text-fora-link outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        collapsed ? "flex justify-center px-0 py-2.5" : "px-0 py-2 pr-7 pl-8 text-left"
      )}
    >
      {collapsed ? (
        <>
          <LayoutTemplate className="size-[18px] shrink-0" strokeWidth={1.25} aria-hidden />
          <span className="sr-only">Choose prototype…</span>
        </>
      ) : (
        "Choose prototype…"
      )}
    </button>
  );
}
