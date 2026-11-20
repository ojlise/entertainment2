import React, { useMemo, useState } from "react";
import {
  Bookmark,
  Calendar as CalendarIcon,
  ExternalLink,
  List,
  Play,
} from "lucide-react";
import { CatalogItem, PLATFORM_COLORS } from "../data/catalog";
import {
  diffDaysFromToday,
  formatReleaseDate,
  getReleaseStatusLabel,
  getReviewUrl,
  getTrailerUrl,
  getTypeLabel,
  isAddedRecently,
} from "../utils/streamHelpers";
import { PosterArt } from "./PosterArt";

interface NewReleasesSectionProps {
  items: CatalogItem[];
  totalCount: number;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onSelectItem: (item: CatalogItem) => void;
  onResetFilters: () => void;
}

const NOV_2026_DAYS = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return `2026-11-${String(day).padStart(2, "0")}`;
});

export const NewReleasesSection: React.FC<NewReleasesSectionProps> = ({
  items,
  totalCount,
  watchlistIds,
  onToggleWatchlist,
  onSelectItem,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const filteredByDay = useMemo(() => {
    if (!selectedDay) return items;
    return items.filter((item) => item.releaseDate === selectedDay);
  }, [items, selectedDay]);

  const upcoming = useMemo(
    () =>
      filteredByDay
        .filter((item) => item.releaseDate && diffDaysFromToday(item.releaseDate) >= 0)
        .sort((a, b) => (a.releaseDate || "").localeCompare(b.releaseDate || "")),
    [filteredByDay]
  );

  const alreadyOut = useMemo(
    () =>
      filteredByDay
        .filter((item) => item.releaseDate && diffDaysFromToday(item.releaseDate) < 0)
        .sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || "")),
    [filteredByDay]
  );

  const countsByDate = useMemo(() => {
    const map: Record<string, CatalogItem[]> = {};
    items.forEach((item) => {
      if (item.releaseDate) {
        if (!map[item.releaseDate]) map[item.releaseDate] = [];
        map[item.releaseDate].push(item);
      }
    });
    return map;
  }, [items]);

  const renderReleaseRow = (item: CatalogItem) => {
    const saved = watchlistIds.includes(item.id);
    const platColor = PLATFORM_COLORS[item.platform] || "#64748B";
    const dateInfo = item.releaseDate
      ? formatReleaseDate(item.releaseDate)
      : null;
    const status = item.releaseDate
      ? getReleaseStatusLabel(item.releaseDate)
      : null;

    return (
      <li
        key={item.id}
        className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onSelectItem(item)}
            className="shrink-0 cursor-pointer"
            aria-label={`View details for ${item.title}`}
          >
            <PosterArt item={item} size="sm" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <button
                type="button"
                onClick={() => onSelectItem(item)}
                className="font-display font-bold text-base sm:text-lg text-[#14161C] dark:text-white hover:text-[#C81E66] dark:hover:text-[#FF5C9A] text-left cursor-pointer"
              >
                {item.title}
              </button>
              {isAddedRecently(item) && (
                <span className="font-mono-tabular text-[11px] font-semibold text-[#B45309] dark:text-[#FBBF24]">
                  Added to guide
                </span>
              )}
            </div>

            <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {getTypeLabel(item)}
              {item.sub ? ` · ${item.sub}` : ""}
              {dateInfo ? ` · ${dateInfo.full}` : ""}
              {` · ${item.genres.join(", ")}`}
            </div>

            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300 max-w-[70ch]">
              {item.description}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs">
              <a
                href={getTrailerUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-200 hover:text-[#C81E66] dark:hover:text-[#FF5C9A]"
              >
                <Play className="w-3 h-3 fill-current" />
                Trailer
              </a>
              <a
                href={getReviewUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-200 hover:text-[#C81E66] dark:hover:text-[#FF5C9A]"
              >
                Reviews
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => onToggleWatchlist(item.id)}
                className={`inline-flex items-center gap-1 font-medium cursor-pointer ${
                  saved
                    ? "text-[#C81E66] dark:text-[#FF5C9A]"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-[#14161C] dark:hover:text-white"
                }`}
              >
                <Bookmark
                  className="w-3 h-3"
                  fill={saved ? "currentColor" : "none"}
                />
                {saved ? "In Watchlist" : "Remind / Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Platform & Date Status */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pl-18 sm:pl-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14161C] dark:text-neutral-200">
            <span
              className="w-1 h-3.5 rounded-full"
              style={{ backgroundColor: platColor }}
              aria-hidden="true"
            />
            {item.platform}
          </div>

          <div className="flex items-center gap-2 font-mono-tabular text-xs">
            {item.score !== null && (
              <span className="font-semibold text-[#14161C] dark:text-white">
                {item.score}%
              </span>
            )}
            {status && (
              <span
                className={`font-medium ${
                  status.tone === "today"
                    ? "text-[#C81E66] dark:text-[#FF5C9A] font-semibold"
                    : status.tone === "released"
                    ? "text-[#1D7A4A] dark:text-[#4ADE80]"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {status.label}
              </span>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <section
      id="new-releases"
      className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#14161C] dark:text-[#ECEEF4]">
            New This Month — November 2026
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Premieres and catalog arrivals across major US services. Switch to
            Calendar view to inspect releases by day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono-tabular text-xs text-neutral-500 dark:text-neutral-400">
            {filteredByDay.length} of {totalCount} releases
          </span>

          <div
            role="group"
            aria-label="New releases view mode"
            className="inline-flex p-1 rounded-lg bg-neutral-200/70 dark:bg-[#13161F] border border-neutral-200 dark:border-neutral-800"
          >
            <button
              type="button"
              aria-pressed={viewMode === "timeline"}
              onClick={() => {
                setViewMode("timeline");
                setSelectedDay(null);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-[#1E2330] text-[#14161C] dark:text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-[#14161C] dark:hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Timeline
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-[#1E2330] text-[#14161C] dark:text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-[#14161C] dark:hover:text-white"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Interactive November 2026 Calendar Grid */}
      {viewMode === "calendar" && (
        <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-display font-bold text-base text-[#14161C] dark:text-white">
              November 2026 Release Schedule
            </h3>
            {selectedDay && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-xs font-semibold text-[#C81E66] dark:text-[#FF5C9A] hover:underline cursor-pointer"
              >
                Show all days in November
              </button>
            )}
          </div>

          {/* Weekday Headers (Nov 1, 2026 is Sunday) */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-400 pb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {NOV_2026_DAYS.map((iso, idx) => {
              const dayItems = countsByDate[iso] || [];
              const diff = diffDaysFromToday(iso);
              const isToday = diff === 0;
              const isSelected = selectedDay === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={dayItems.length === 0}
                  onClick={() =>
                    setSelectedDay(isSelected ? null : iso)
                  }
                  className={`min-h-[68px] sm:min-h-[82px] p-2 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                    isSelected
                      ? "border-[#C81E66] dark:border-[#FF5C9A] bg-[#C81E66]/8 dark:bg-[#FF5C9A]/12 cursor-pointer"
                      : isToday
                      ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-white/[0.04] cursor-pointer"
                      : dayItems.length > 0
                      ? "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer"
                      : "border-neutral-100 dark:border-neutral-800/50 opacity-45 cursor-default"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`font-mono-tabular text-xs font-semibold ${
                        isToday
                          ? "text-[#C81E66] dark:text-[#FF5C9A]"
                          : "text-neutral-700 dark:text-neutral-200"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline font-mono-tabular text-[10px] font-semibold text-[#C81E66] dark:text-[#FF5C9A]">
                        Today
                      </span>
                    )}
                  </div>

                  {dayItems.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="font-mono-tabular text-[11px] font-medium text-neutral-700 dark:text-neutral-200">
                        {dayItems.length}{" "}
                        <span className="hidden sm:inline">
                          {dayItems.length === 1 ? "drop" : "drops"}
                        </span>
                      </div>
                      <div className="hidden md:block text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                        {dayItems[0].title}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Release Lists */}
      {filteredByDay.length === 0 ? (
        <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-10 text-center">
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">
            No November releases match your active filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDay(null);
              onResetFilters();
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[#C81E66] dark:bg-[#FF5C9A] text-white dark:text-[#0B0D12] cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h3 className="font-mono-tabular text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
                Today &amp; Coming Up · {upcoming.length}
              </h3>
              <ul className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
                {upcoming.map(renderReleaseRow)}
              </ul>
            </div>
          )}

          {alreadyOut.length > 0 && (
            <div>
              <h3 className="font-mono-tabular text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
                Already Out This Month · {alreadyOut.length}
              </h3>
              <ul className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
                {alreadyOut.map(renderReleaseRow)}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
