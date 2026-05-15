"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChoosePrototypeNavButton } from "./choose-prototype-nav-button";
import { Icon, type IconName } from "./icons";

type NavLeaf = {
  label: string;
  href?: string;
  icon: IconName;
  external?: boolean;
  /** When false, row matches other nav rows but is not a link (prototype placeholder). */
  interactive?: boolean;
};

const groups: NavLeaf[][] = [
  [
    { label: "Home", icon: "home", interactive: false },
    { label: "Bookings", icon: "bookings" },
    { label: "Clients", href: "/clients", icon: "clients" },
    { label: "Partners", icon: "partners" },
    { label: "Marketing", icon: "marketing" },
  ],
  [
    { label: "Training", icon: "training" },
    { label: "Resources", icon: "resources" },
  ],
  [
    { label: "Fora Email", icon: "mail", external: true, interactive: false },
    { label: "Forum", icon: "forum", external: true, interactive: false },
  ],
  [
    { label: "Help", icon: "help" },
    { label: "What's New", icon: "spark" },
  ],
];

function isItemActive(pathname: string | null, item: NavLeaf): boolean {
  if (item.interactive === false || item.external || !item.href) return false;
  if (item.href === "/") return pathname === "/";
  return pathname?.startsWith(item.href) ?? false;
}

export type AppSidebarUser = {
  name: string;
  imageUrl?: string | null;
  /** Optional line under the name (e.g. location) when provided by session/profile. */
  secondary?: string;
};

export type AppSidebarProps = {
  user?: AppSidebarUser;
};

/** Public-domain portrait (historical subject matches demo name). */
const NELLIE_AVATAR_SRC =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Nellie_Bly_by_H._J._Myers.jpg/96px-Nellie_Bly_by_H._J._Myers.jpg";

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Force-collapse on <lg viewports so the sidebar stays visible (as a 64px rail)
  // but never eats into the split-view content. User can still expand on desktop.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      if (mql.matches) setCollapsed(true);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const resolvedUser = (() => {
    if (!user) {
      return { name: "Nellie Bly", imageUrl: NELLIE_AVATAR_SRC as string | null, secondary: undefined as string | undefined };
    }
    return {
      name: user.name?.trim() || "Nellie Bly",
      imageUrl: user.imageUrl ?? null,
      secondary: user.secondary,
    };
  })();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-full max-h-full min-h-0 shrink-0 flex-col self-start overflow-hidden border-r border-rule bg-paper antialiased transition-[width] duration-200 ease-out",
        collapsed ? "w-[64px]" : "w-[270px]"
      )}
    >
      <div
        className={cn(
          "mb-4 flex shrink-0 items-center pb-6",
          collapsed ? "flex-col gap-3 px-2 pt-7" : "justify-between px-6 pt-7"
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand navigation"
            title="Expand navigation"
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-1.5 text-ink/55 outline-none transition-colors duration-200 hover:bg-ink/[0.06] hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <span className="sr-only">Fora</span>
            <Image
              src="/fora-mark.svg"
              alt=""
              width={14}
              height={18}
              priority
              unoptimized
              aria-hidden
            />
          </button>
        ) : (
          <Link href="/" aria-label="Fora" className="inline-flex shrink-0 items-center">
            <Image
              src="/ForaLogoImage.png"
              alt="Fora"
              width={1282}
              height={454}
              priority
              className="h-[22px] w-auto max-w-[160px] object-contain object-left"
            />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="app-sidebar-nav"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className={cn(
            "cursor-pointer rounded-sm text-ink/55 outline-none transition-colors duration-200 hover:bg-ink/[0.06] hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
            collapsed ? "flex size-9 items-center justify-center" : "p-1.5"
          )}
        >
          <Icon name="collapse" className={cn("h-4 w-4 transition-transform duration-200 ease-out", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav id="app-sidebar-nav" className={cn("flex min-h-0 flex-1 flex-col", collapsed && "px-1.5")}>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {groups.map((group, gi) => (
            <Fragment key={gi}>
              {gi > 0 && (
                <div
                  className={cn("h-px shrink-0 bg-rule", collapsed ? "mx-2 my-3" : "mx-8 my-3.5")}
                  role="separator"
                  aria-orientation="horizontal"
                />
              )}
              <ul className="flex flex-col">
                {group.map((item) => {
                  const isActive = isItemActive(pathname, item);
                  const activeInset =
                    !collapsed && isActive && item.href && !item.external;
                  return (
                    <li key={item.label} className={cn(activeInset && "px-[1.2rem]")}>
                      <NavItem item={item} isActive={isActive} collapsed={collapsed} />
                    </li>
                  );
                })}
              </ul>
            </Fragment>
          ))}
        </div>
      </nav>

      <UserChip
        name={resolvedUser.name}
        secondary={resolvedUser.secondary}
        imageUrl={resolvedUser.imageUrl}
        collapsed={collapsed}
      />
      <div
        className={cn(
          "flex shrink-0 items-center justify-start border-t border-rule bg-white py-2.5 pb-4",
          collapsed ? "px-1.5" : "px-6"
        )}
      >
        <ChoosePrototypeNavButton collapsed={collapsed} />
      </div>
    </aside>
  );
}

function NavItem({ item, isActive, collapsed }: { item: NavLeaf; isActive: boolean; collapsed: boolean }) {
  /** Inactive rows: icon column aligns with `pl-8`; active row uses narrower outer inset (80% of 1.5rem) + inner calc to match. */
  const expandedInset = "gap-3.5 pl-8 pr-7";

  const base = cn(
    "relative flex w-full items-center rounded-sm py-[11px] text-[13.5px] leading-none transition-[color] duration-200 ease-out",
    collapsed
      ? "justify-center px-0"
      : isActive && item.href && !item.external
        ? "gap-0 px-0"
        : expandedInset,
    isActive && "duration-[160ms]",
    "text-ink-soft",
    isActive && "bg-paper-lift font-medium text-ink"
  );

  const iconClass = (activeIcon: boolean) =>
    cn(
      "h-[18px] w-[18px] shrink-0 transition-[color] duration-200 ease-out",
      activeIcon ? "text-ink" : "text-ink-soft",
      isActive && "duration-[160ms]"
    );

  if (item.interactive === false) {
    return (
      <span
        className={cn(base, "cursor-default select-none")}
        title={collapsed ? item.label : undefined}
      >
        <Icon name={item.icon} className={iconClass(false)} />
        <span className={cn(collapsed && "sr-only")}>{item.label}</span>
        {!collapsed && item.external ? (
          <Icon name="external" className="ml-auto h-[11px] w-[11px] shrink-0 text-ink-soft" aria-hidden />
        ) : null}
      </span>
    );
  }

  if (item.external && item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.label}, opens in a new tab`}
        className={base}
        title={collapsed ? item.label : undefined}
      >
        <Icon name={item.icon} className={iconClass(false)} />
        <span className={cn(collapsed && "sr-only")}>{item.label}</span>
        {!collapsed ? <Icon name="external" className="ml-auto h-[11px] w-[11px] shrink-0 text-ink-soft" aria-hidden /> : null}
      </a>
    );
  }

  if (item.href) {
    const rowInner = (
      <>
        <Icon
          name={item.icon}
          className={iconClass(isActive)}
          strokeWidth={isActive ? 1.5 : 1}
        />
        <span className={cn(collapsed && "sr-only")}>{item.label}</span>
      </>
    );
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={base}
        title={collapsed ? item.label : undefined}
      >
        {isActive && !collapsed ? (
          <span className="flex min-w-0 flex-1 items-center gap-3.5 pl-[calc(2rem-1.2rem)] pr-[calc(1.75rem-1.2rem)]">
            {rowInner}
          </span>
        ) : (
          rowInner
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn(base, "cursor-default text-left")}
      title={collapsed ? item.label : undefined}
    >
      <Icon name={item.icon} className={iconClass(false)} />
      <span className={cn(collapsed && "sr-only")}>{item.label}</span>
    </button>
  );
}

function userInitial(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const first = t[0];
  return first ? first.toUpperCase() : "?";
}

function UserChip({
  name,
  secondary,
  imageUrl,
  collapsed,
}: {
  name: string;
  secondary?: string;
  imageUrl?: string | null;
  collapsed: boolean;
}) {
  const [imageBroken, setImageBroken] = useState(false);
  const showImage = Boolean(imageUrl) && !imageBroken;

  return (
    <div
      className={cn(
        "mt-auto flex shrink-0 items-center gap-3 border-t border-rule",
        collapsed ? "justify-center px-1.5 py-4" : "px-6 py-4"
      )}
    >
      {showImage ? (
        <div className="relative flex h-[30px] w-[30px] shrink-0 overflow-hidden rounded-md border border-rule bg-white" title={collapsed ? name : undefined}>
          <Image
            src={imageUrl as string}
            alt=""
            width={30}
            height={30}
            className="size-full object-cover object-[50%_22%]"
            sizes="30px"
            onError={() => setImageBroken(true)}
          />
        </div>
      ) : (
        <span
          aria-hidden
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md border border-rule bg-white font-serif text-[16px] italic text-ink"
          title={collapsed ? name : undefined}
        >
          {userInitial(name)}
        </span>
      )}
      {collapsed ? <span className="sr-only">{name}</span> : null}
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] text-ink">{name}</span>
          {secondary ? (
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.18em] text-ink-faint">{secondary}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
