import { cn } from "@subboost/ui/lib/utils";

type ArtisticNavSize = "sm" | "md";

const artisticNavItemSizeClassNames: Record<ArtisticNavSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
};

const artisticNavItemBaseClassName =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50";

const artisticNavItemActiveClassName =
  "border-white/10 bg-white/10 text-white shadow-[0_10px_30px_rgba(15,23,42,0.22)]";

const artisticNavItemInactiveClassName = "text-white/60 hover:bg-white/5 hover:text-white";

export const artisticNavContainerClassName =
  "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm";

export const artisticTabsListClassName = cn(artisticNavContainerClassName, "h-auto");

export const artisticTabsTriggerClassName = cn(
  "group",
  artisticNavItemBaseClassName,
  artisticNavItemSizeClassNames.md,
  artisticNavItemInactiveClassName,
  "data-[state=active]:border-white/10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-[0_10px_30px_rgba(15,23,42,0.22)]"
);

export const artisticTabsIconClassName =
  "h-3.5 w-3.5 text-white/45 transition-colors group-data-[state=active]:text-indigo-300";

export function getArtisticNavButtonClassName({
  active,
  size = "sm",
  className,
}: {
  active: boolean;
  size?: ArtisticNavSize;
  className?: string;
}) {
  return cn(
    artisticNavItemBaseClassName,
    artisticNavItemSizeClassNames[size],
    active ? artisticNavItemActiveClassName : artisticNavItemInactiveClassName,
    className
  );
}

export function getArtisticNavIconClassName(active: boolean, className?: string) {
  return cn("h-3.5 w-3.5 transition-colors", active ? "text-indigo-300" : "text-white/45", className);
}
