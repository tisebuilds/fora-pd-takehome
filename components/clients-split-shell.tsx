"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import type { Client } from "@/lib/types";
import { clientSearchBlob } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientSortMenu, type ClientSortKey } from "@/components/client-sort-menu";
import { ClientListRow } from "@/components/client-list-row";
import { ClientListCard } from "@/components/client-list-card";
import { ClientDetailDrawer } from "@/components/client-detail-drawer";
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
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  // `/clients/:id` → segments = ["clients", ":id"]; `/clients` → ["clients"]
  const explicitId =
    segments[0] === "clients" && segments.length >= 2 ? segments[1] : null;
  const hasSelection = Boolean(explicitId);

  /** On `/clients`, desktop shows the first client in the right pane — match that in the list. */
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
  const [drawerClient, setDrawerClient] = useState<Client | null>(null);

  useEffect(() => {
    const pref = getClientsLayoutPreference();
    if (pref) {
      setLayoutView(pref);
      setPrototypePhase("app");
    } else {
      setPrototypePhase("gate");
    }
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const pref = getClientsLayoutPreference();
      if (pref) {
        setLayoutView(pref);
        setPrototypePhase("app");
      } else {
        setPrototypePhase("gate");
        setDrawerClient(null);
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

  useEffect(() => {
    if (prototypePhase !== "app" || layoutView !== "cards" || !explicitId) return;
    const c = clients.find((x) => x.id === explicitId);
    if (!c) return;
    setDrawerClient(c);
    router.replace("/clients");
  }, [prototypePhase, layoutView, explicitId, clients, router]);

  /** Cards mode uses the same search string but ignores sort (original prototype). */
  const visibleCards = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((c) => clientSearchBlob(c).includes(needle));
  }, [clients, q]);

  if (prototypePhase === "checking") {
    return (
      <div className="flex h-[calc(100dvh-1rem)] min-h-0 flex-1 items-center justify-center text-sm text-fora-muted lg:h-dvh">
        Loading…
      </div>
    );
  }

  if (prototypePhase === "gate") {
    return (
      <div className="flex h-[calc(100dvh-1rem)] min-h-0 flex-col bg-fora-app lg:h-dvh">
        <ClientsPrototypeEntrance onChoose={handlePrototypeChosen} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-1rem)] min-h-0 flex-col lg:h-dvh">
      {/* Top bar — hidden on mobile when viewing a client detail */}
      <header
        className={cn(
          "shrink-0 bg-fora-app px-4 py-4 sm:px-6 lg:px-8",
          hasSelection && isSplit && "hidden lg:block"
        )}
      >
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
              variant="default"
              className="h-11 shrink-0 gap-1.5 rounded-lg px-6 text-[15px] font-medium"
            >
              <Plus className="size-4" strokeWidth={2} aria-hidden />
              Add client
            </Button>
          </div>
        </div>
      </header>

      {isSplit ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
          <aside
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-fora-border bg-white lg:flex-none lg:basis-[360px]",
              hasSelection && "hidden lg:flex"
            )}
          >
            <div className="shrink-0 border-b border-fora-border px-4 py-3">
              <div className="relative">
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
                  className="h-10 rounded-lg border-fora-border bg-fora-app pl-9 pr-3 text-[14px] shadow-none placeholder:text-fora-muted"
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[12px] text-fora-muted tabular-nums">
                  {visible.length} {visible.length === 1 ? "client" : "clients"}
                </p>
                <ClientSortMenu value={sort} onChange={setSort} variant="icon" />
              </div>
            </div>

            <ul className="w-full flex-none min-h-0 max-h-full divide-y divide-fora-border overflow-y-auto">
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

          <section
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-fora-border bg-white",
              !hasSelection && "hidden lg:flex"
            )}
          >
            {children}
          </section>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#F9F7F2] px-4 py-4 sm:px-6 lg:px-8">
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
                  className="h-11 rounded-lg border-[#E5E7EB] bg-white pl-11 pr-3 text-[15px] shadow-none"
                />
              </div>
            </div>
            <div className="mx-auto mt-6 flex w-full max-w-6xl flex-col gap-2">
              {visibleCards.length === 0 ? (
                <p className="text-sm text-fora-muted">No clients match your search.</p>
              ) : (
                visibleCards.map((c) => (
                  <ClientListCard key={c.id} client={c} onViewDetails={() => setDrawerClient(c)} />
                ))
              )}
            </div>
          </div>
          <ClientDetailDrawer client={drawerClient} onClose={() => setDrawerClient(null)} />
        </>
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
