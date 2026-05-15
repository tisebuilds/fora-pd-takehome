"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Plus, Search } from "lucide-react";
import type { Client } from "@/lib/types";
import { clientSearchBlob } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientSortMenu, type ClientSortKey } from "@/components/client-sort-menu";
import { ClientListRow } from "@/components/client-list-row";
import { ClientListCard, clientListTableGridClass } from "@/components/client-list-card";
import {
  CLIENTS_LAYOUT_CLEARED_EVENT,
  ClientsPrototypeEntrance,
  getClientsLayoutPreference,
  setClientsLayoutPreference,
  type ClientsLayoutView,
} from "@/components/clients-view-toggle";
import { cn } from "@/lib/utils";

type Props = {
  clients: Client[];
  children: ReactNode;
};

function compareClients(a: Client, b: Client, sort: ClientSortKey): number {
  switch (sort) {
    case "commissions-desc":
      return b.commissions - a.commissions;
    case "bookings-desc":
      return b.bookingsCount - a.bookingsCount;
    case "name-asc": {
      const an = `${a.lastName} ${a.firstName}`.toLowerCase();
      const bn = `${b.lastName} ${b.firstName}`.toLowerCase();
      return an.localeCompare(bn);
    }
  }
}

type PrototypePhase = "checking" | "gate" | "app";

export function ClientsSplitShell({ clients, children }: Props) {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  // `/clients/:id` → segments = ["clients", ":id"]; `/clients` → ["clients"]
  const explicitId =
    segments[0] === "clients" && segments.length >= 2 ? segments[1] : null;
  const hasSelection = Boolean(explicitId);

  /** On `/clients`, desktop shows the first client in the right pane; match that in the list. */
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const listActiveId =
    explicitId ?? (isLg && clients[0] ? clients[0].id : null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<ClientSortKey>("commissions-desc");

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const searched = needle
      ? clients.filter((c) => clientSearchBlob(c).includes(needle))
      : clients;
    return [...searched].sort((a, b) => compareClients(a, b, sort));
  }, [clients, q, sort]);

  const [prototypePhase, setPrototypePhase] = useState<PrototypePhase>("checking");
  const [layoutView, setLayoutView] = useState<ClientsLayoutView>("split");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- client-only: read layout preference from localStorage after mount (unavailable during SSR). */
    const pref = getClientsLayoutPreference();
    if (pref) {
      setLayoutView(pref);
      setPrototypePhase("app");
    } else {
      setPrototypePhase("gate");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const pref = getClientsLayoutPreference();
      if (pref) {
        setLayoutView(pref);
        setPrototypePhase("app");
      } else {
        setPrototypePhase("gate");
      }
    };
    window.addEventListener(CLIENTS_LAYOUT_CLEARED_EVENT, syncFromStorage);
    return () => window.removeEventListener(CLIENTS_LAYOUT_CLEARED_EVENT, syncFromStorage);
  }, []);

  const handlePrototypeChosen = (view: ClientsLayoutView) => {
    setClientsLayoutPreference(view);
    setLayoutView(view);
    setPrototypePhase("app");
  };

  const isSplit = layoutView === "split";

  /** Split + client detail on viewports below `lg`: list is hidden so the top bar would duplicate chrome; hide until desktop. */
  const hideClientsHeader =
    isSplit && hasSelection && !isLg;

  /** Cards with selection: unchanged (no top bar). Split otherwise shows bar unless mobile client detail. */
  const showClientsHeader = (!hasSelection || isSplit) && !hideClientsHeader;

  /** Cards mode uses the same search string but ignores sort (original prototype). */
  const visibleCards = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((c) => clientSearchBlob(c).includes(needle));
  }, [clients, q]);

  if (prototypePhase === "checking") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-sm text-fora-muted">
        Loading…
      </div>
    );
  }

  if (prototypePhase === "gate") {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-fora-app">
        <ClientsPrototypeEntrance onChoose={handlePrototypeChosen} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Top bar: split layout hides on mobile when a client is open (Back + detail only). Cards: hidden when a client is open. */}
      {showClientsHeader ? (
        <header className="shrink-0 bg-fora-app px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-row flex-wrap items-baseline gap-2">
              <h1 className="font-sans text-[34px] font-bold leading-tight tracking-tight text-fora-navy">
                Clients
              </h1>
              <p className="text-sm text-fora-muted tabular-nums">{clients.length}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0 gap-1.5 rounded-lg border-[#E0E0E0] bg-white px-6 text-[15px] font-medium text-[#666666] hover:border-[#E0E0E0] hover:bg-neutral-100 hover:text-[#666666] aria-expanded:border-[#E0E0E0] aria-expanded:bg-neutral-100 aria-expanded:text-[#666666] dark:border-[#E0E0E0] dark:bg-white dark:text-[#666666] dark:hover:border-[#E0E0E0] dark:hover:bg-neutral-100 dark:hover:text-[#666666] dark:aria-expanded:border-[#E0E0E0] dark:aria-expanded:bg-neutral-100 dark:aria-expanded:text-[#666666]"
              >
                <Plus className="size-4 text-[#666666]" strokeWidth={2} aria-hidden />
                Add client
              </Button>
            </div>
          </div>
        </header>
      ) : null}

      {isSplit ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:gap-0 lg:px-8">
          <aside
            className={cn(
              "flex max-h-full min-h-0 flex-col overflow-hidden rounded-[16px] border border-fora-border bg-white lg:max-h-none lg:flex-none lg:basis-[360px] lg:rounded-r-none lg:border-r-0",
              hasSelection && "hidden lg:flex"
            )}
          >
            <div className="shrink-0 border-b border-fora-border px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-[16px] -translate-y-1/2 text-fora-muted"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name, email, or city…"
                    aria-label="Search clients"
                    className="h-10 w-full rounded-lg border-0 bg-fora-app pl-9 pr-3 text-[14px] shadow-none placeholder:text-fora-muted focus-visible:border-0"
                  />
                </div>
                <ClientSortMenu
                  value={sort}
                  onChange={setSort}
                  variant="icon"
                  triggerClassName="h-10 w-10 shrink-0 rounded-lg bg-white text-fora-muted hover:bg-fora-app"
                />
              </div>
            </div>

            <ul className="min-h-0 w-full flex-1 divide-y divide-fora-border overflow-y-auto">
              {visible.length === 0 ? (
                <li className="px-4 py-10 text-center text-[14px] text-fora-muted">
                  No clients match your search.
                </li>
              ) : (
                visible.map((c) => (
                  <li key={c.id}>
                    <ClientListRow client={c} active={c.id === listActiveId} />
                  </li>
                ))
              )}
            </ul>
          </aside>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-3 lg:min-h-0 lg:gap-0",
              !hasSelection && "hidden lg:flex"
            )}
          >
            {hasSelection ? (
              <Link
                href="/clients"
                className="inline-flex shrink-0 items-center gap-1 text-sm text-fora-link no-underline hover:opacity-80 lg:hidden"
              >
                <ArrowLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                Back
              </Link>
            ) : null}
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-fora-border bg-white lg:rounded-l-none">
              {children}
            </section>
          </div>
        </div>
      ) : explicitId ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/clients"
            className="inline-flex shrink-0 items-center gap-1 text-sm text-fora-link no-underline hover:opacity-80"
          >
            <ArrowLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            Back
          </Link>
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-fora-border bg-white">
            {children}
          </section>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F9F9F9] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="relative w-full min-w-0">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-fora-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, phone, or location"
                aria-label="Search clients"
                className="h-11 rounded-lg border-[#E5E7EB] bg-white pl-11 pr-3 text-[15px] shadow-none"
              />
            </div>
          </div>
          <div className="mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
            {visibleCards.length === 0 ? (
              <p className="px-4 py-6 text-sm text-fora-muted">No clients match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px] divide-y divide-[#E5E7EB]">
                  <div
                    role="row"
                    className={cn(
                      clientListTableGridClass,
                      "bg-[#F5F5F4] px-4 py-2.5 text-[10px] font-medium uppercase tracking-wide text-[#6B7280]"
                    )}
                  >
                    <div className="col-span-2">Client</div>
                    <div className="min-w-0">Email</div>
                    <div className="text-right tabular-nums">Bookings</div>
                    <div aria-hidden className="min-h-0 min-w-0" />
                  </div>
                  {visibleCards.map((c) => (
                    <ClientListCard key={c.id} client={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Empty-state right pane shown on `/clients` (desktop) when no specific client is selected.
 *  On mobile this is hidden behind `!hasSelection && "hidden lg:flex"` on the parent. */
export function ClientsDetailEmptyState() {
  return (
    <div className="flex h-full flex-1 items-center justify-center px-6 py-10 text-center text-[14px] text-fora-muted">
      Select a client from the list to view their profile, or{" "}
      <Link href="#" className="ml-1 text-fora-link hover:opacity-80">
        add a new one
      </Link>
      .
    </div>
  );
}
