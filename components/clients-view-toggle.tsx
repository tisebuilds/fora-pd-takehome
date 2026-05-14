"use client";

import { ChevronRight } from "lucide-react";

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

function SplitLayoutIllustration() {
  return (
    <div
      className="w-full max-w-[220px] rounded-lg bg-white p-2.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_.04)]"
      aria-hidden
    >
      <div className="flex gap-2">
        <div className="flex w-[34%] shrink-0 flex-col justify-between gap-1 py-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-1.5 rounded-[4px] bg-[#EBE2D5]" />
          ))}
        </div>
        <div className="flex min-h-[88px] min-w-0 flex-1 flex-col gap-1">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-1.5 w-3 shrink-0 rounded-[4px] bg-[#EBE2D5]" />
            ))}
          </div>
          <div className="h-2 shrink-0 rounded-[4px] bg-[#333333]" />
          <div className="h-px shrink-0 rounded-full bg-[#EBE2D5]" />
          <div className="min-h-[28px] flex-1 rounded-[4px] bg-[#EBE2D5]" />
          <div className="flex shrink-0 gap-1">
            <div className="h-2 flex-1 rounded-[4px] bg-[#EBE2D5]" />
            <div className="h-2 flex-1 rounded-[4px] bg-[#EBE2D5]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardListIllustration() {
  return (
    <div
      className="flex w-full max-w-[220px] flex-col gap-1.5 rounded-lg bg-white p-2.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_.04)]"
      aria-hidden
    >
      <div className="flex items-center gap-2">
        <div className="h-2 min-w-0 flex-1 rounded-[4px] bg-[#333333]" />
        <div className="h-2 w-5 shrink-0 rounded-[4px] bg-[#EBE2D5]" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-[4px] bg-[#F5F0E8] px-1.5 py-1.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_.03)]"
        >
          <div className="size-2.5 shrink-0 rounded-full bg-[#EBE2D5]" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="h-1.5 w-[72%] rounded-[4px] bg-[#333333]" />
            <div className="h-1 w-full rounded-[4px] bg-[#EBE2D5]" />
          </div>
          <div className="h-2 w-3.5 shrink-0 rounded-[4px] bg-[#EBE2D5]" />
        </div>
      ))}
    </div>
  );
}

const cardShell =
  "group flex w-full flex-col overflow-hidden rounded-2xl border border-[#E8E4DE] bg-white text-left shadow-[0_1px_2px_rgb(0_0_0_/_.04)] transition-[border-color,box-shadow] hover:border-[#D4CEC3] hover:shadow-[0_2px_8px_rgb(0_0_0_/_.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#333333]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2]";

/**
 * Full-screen entry step: reviewer must pick which clients prototype to enter
 * before seeing any list or detail UI.
 */
export function ClientsPrototypeEntrance({ onChoose }: EntranceProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-5 py-8 sm:px-8 sm:py-10">
      <div className="w-full max-w-[760px] shrink-0">
        <header className="text-center">
          <h1 className="font-sans text-[28px] font-bold leading-tight tracking-tight text-black sm:text-[32px]">
            Pick a layout
          </h1>
          <p className="mt-2 text-[15px] leading-snug text-[#6B6B6B]">
            Your choice is saved in this browser.
          </p>
        </header>

        <div className="mt-12 grid w-full gap-6 sm:grid-cols-2 sm:gap-8">
          <button type="button" onClick={() => onChoose("split")} className={cardShell}>
            <div className="flex min-h-[160px] items-center justify-center bg-[#F5F0E8] px-5 py-8 sm:min-h-[176px]">
              <SplitLayoutIllustration />
            </div>
            <div className="flex items-center gap-4 border-t border-[#EFEBE4] px-5 py-5">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-base font-bold text-black">Split view</p>
                <p className="mt-1 text-[14px] leading-snug text-[#6B6B6B]">
                  List with a persistent detail pane.
                </p>
              </div>
              <ChevronRight
                className="size-5 shrink-0 text-[#6B6B6B] transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
          </button>

          <button type="button" onClick={() => onChoose("cards")} className={cardShell}>
            <div className="flex min-h-[160px] items-center justify-center bg-[#F5F0E8] px-5 py-8 sm:min-h-[176px]">
              <CardListIllustration />
            </div>
            <div className="flex items-center gap-4 border-t border-[#EFEBE4] px-5 py-5">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-base font-bold text-black">Card list</p>
                <p className="mt-1 text-[14px] leading-snug text-[#6B6B6B]">
                  Stacked wide cards with inline stats.
                </p>
              </div>
              <ChevronRight
                className="size-5 shrink-0 text-[#6B6B6B] transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
