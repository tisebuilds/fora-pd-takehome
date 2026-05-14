"use client";

import { cn } from "@/lib/utils";

export type ClientsLayoutView = "split" | "cards";

const STORAGE_KEY = "fora-clients-layout-view";

/** Dispatched after layout preference is cleared so `ClientsSplitShell` can show the gate on `/clients`. */
export const CLIENTS_LAYOUT_CLEARED_EVENT = "fora-clients-layout-cleared";

/** `null` = user has not chosen a prototype yet (show entry gate). */
export function getClientsLayoutPreference(): ClientsLayoutView | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "split" || raw === "cards") return raw;
  return null;
}

export function setClientsLayoutPreference(view: ClientsLayoutView) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, view);
}

export function clearClientsLayoutPreference() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

type EntranceProps = {
  onChoose: (view: ClientsLayoutView) => void;
};

/**
 * Full-screen entry step: reviewer must pick which clients prototype to enter
 * before seeing any list or detail UI.
 */
export function ClientsPrototypeEntrance({ onChoose }: EntranceProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fora-muted">
        Prototype
      </p>
      <h1 className="mt-3 text-center font-sans text-[28px] font-bold leading-tight tracking-tight text-fora-navy sm:text-[34px]">
        Choose a clients experience
      </h1>
      <p className="mt-3 max-w-[460px] text-center text-[15px] leading-relaxed text-fora-muted">
        Two layout explorations are available. Select one to enter that prototype; your choice is
        remembered in this browser until you clear it.
      </p>

      <div className="mt-12 grid w-full max-w-[720px] gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChoose("split")}
          className={cn(
            "flex flex-col items-start rounded-[16px] border border-fora-border bg-white p-8 text-left shadow-sm transition-colors",
            "hover:border-fora-navy/30 hover:bg-fora-app/50 focus-visible:ring-2 focus-visible:ring-fora-link focus-visible:ring-offset-2"
          )}
        >
          <span className="text-[13px] font-semibold uppercase tracking-wide text-fora-link">
            Split view
          </span>
          <span className="mt-2 font-sans text-xl font-bold text-fora-navy">List + detail pane</span>
          <span className="mt-3 text-[14px] leading-snug text-fora-muted">
            Filter chips, compact rows, and a persistent detail column (desktop) or list-then-detail
            on small screens.
          </span>
          <span className="mt-6 text-[13px] font-medium text-fora-link">Enter prototype →</span>
        </button>

        <button
          type="button"
          onClick={() => onChoose("cards")}
          className={cn(
            "flex flex-col items-start rounded-[16px] border border-fora-border bg-white p-8 text-left shadow-sm transition-colors",
            "hover:border-fora-navy/30 hover:bg-fora-app/50 focus-visible:ring-2 focus-visible:ring-fora-link focus-visible:ring-offset-2"
          )}
        >
          <span className="text-[13px] font-semibold uppercase tracking-wide text-fora-link">
            Card list
          </span>
          <span className="mt-2 font-sans text-xl font-bold text-fora-navy">Original large cards</span>
          <span className="mt-3 text-[14px] leading-snug text-fora-muted">
            Vertical stack of wide cards with inline stats and credit-card column, matching the first
            scaffold.
          </span>
          <span className="mt-6 text-[13px] font-medium text-fora-link">Enter prototype →</span>
        </button>
      </div>
    </div>
  );
}
