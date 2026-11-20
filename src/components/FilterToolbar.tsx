import React, { useState } from "react";
import {
  Check,
  Moon,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sun,
  X,
} from "lucide-react";
import {
  GENRES,
  GenreName,
  PLATFORMS,
  PLATFORM_COLORS,
  PlatformName,
} from "../data/catalog";
import { FilterState, SortMode } from "../utils/streamHelpers";

interface FilterToolbarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  scoreCounts: Record<number, number>;
  platformCounts: Record<PlatformName, number>;
  isDark: boolean;
  onToggleTheme: () => void;
}

const MIN_SCORES = [0, 70, 80, 90, 95];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onChange,
  onReset,
  scoreCounts,
  platformCounts,
  isDark,
  onToggleTheme,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.genre !== "" ||
    filters.platforms.length > 0 ||
    filters.query.trim() !== "" ||
    filters.minScore > 0 ||
    filters.recentOnly;

  const activeFilterCount =
    (filters.type !== "all" ? 1 : 0) +
    (filters.genre !== "" ? 1 : 0) +
    (filters.platforms.length > 0 ? 1 : 0) +
    (filters.minScore > 0 ? 1 : 0) +
    (filters.recentOnly ? 1 : 0);

  const togglePlatform = (p: PlatformName) => {
    const exists = filters.platforms.includes(p);
    const next = exists
      ? filters.platforms.filter((item) => item !== p)
      : [...filters.platforms, p];
    onChange({ ...filters, platforms: next });
  };

  const toggleGenre = (g: GenreName) => {
    onChange({ ...filters, genre: filters.genre === g ? "" : g });
  };

  return (
    <div
      id="workspace-filters"
      className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-2 pb-4"
    >
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-4 sm:p-5 space-y-4">
        {/* Row 1: Search, Type Switcher, Sort, Theme Switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type segmented control */}
          <div
            role="group"
            aria-label="Filter by format"
            className="inline-flex p-1 rounded-lg bg-neutral-100 dark:bg-[#0B0D12] border border-neutral-200 dark:border-neutral-800 shrink-0"
          >
            {(
              [
                { value: "all", label: "All" },
                { value: "movie", label: "Movies" },
                { value: "show", label: "Series" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={filters.type === opt.value}
                onClick={() => onChange({ ...filters, type: opt.value })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filters.type === opt.value
                    ? "bg-white dark:bg-[#1E2330] text-[#14161C] dark:text-white shadow-xs"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-[#14161C] dark:hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => onChange({ ...filters, query: e.target.value })}
              placeholder="Search titles, genres, or synopses..."
              aria-label="Search titles, genres, or synopses"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#0B0D12] text-[#14161C] dark:text-[#ECEEF4] placeholder:text-neutral-400 focus:border-[#C81E66] dark:focus:border-[#FF5C9A] focus:outline-none"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, query: "" })}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <select
            aria-label="Sort titles"
            value={filters.sort}
            onChange={(e) =>
              onChange({ ...filters, sort: e.target.value as SortMode })
            }
            className="hidden sm:block px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#0B0D12] text-[#14161C] dark:text-[#ECEEF4] cursor-pointer"
          >
            <option value="score">Sort: Highest Critic Score</option>
            <option value="low">Sort: Lowest Critic Score</option>
            <option value="title">Sort: Title A–Z</option>
            <option value="plat">Sort: Streaming Service</option>
          </select>

          {/* Mobile Filters Drawer Button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            aria-expanded={mobileFiltersOpen}
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#0B0D12] cursor-pointer whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>

          {/* Theme Switcher inside Workspace Toolbar */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#0B0D12] text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Expanded Filter Rows (Desktop always visible, Mobile collapsible) */}
        <div
          className={`${
            mobileFiltersOpen ? "block" : "hidden sm:block"
          } space-y-3 pt-3 border-t border-neutral-200/80 dark:border-neutral-800`}
        >
          {/* Mobile Sort */}
          <div className="sm:hidden flex items-center gap-2">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-500 w-16 shrink-0">
              Sort
            </span>
            <select
              aria-label="Sort titles mobile"
              value={filters.sort}
              onChange={(e) =>
                onChange({ ...filters, sort: e.target.value as SortMode })
              }
              className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#0B0D12]"
            >
              <option value="score">Highest Critic Score</option>
              <option value="low">Lowest Critic Score</option>
              <option value="title">Title A–Z</option>
              <option value="plat">Streaming Service</option>
            </select>
          </div>

          {/* Multi-Select Services ("My Services") */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <div className="sm:w-24 shrink-0 pt-1.5">
              <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                My Services
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              <button
                type="button"
                aria-pressed={filters.platforms.length === 0}
                onClick={() => onChange({ ...filters, platforms: [] })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filters.platforms.length === 0
                    ? "bg-[#14161C] dark:bg-[#ECEEF4] text-white dark:text-[#0B0D12] border-[#14161C] dark:border-[#ECEEF4]"
                    : "bg-neutral-50 dark:bg-[#0B0D12] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                All Services
              </button>
              {PLATFORMS.map((p) => {
                const active = filters.platforms.includes(p);
                const color = PLATFORM_COLORS[p];
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePlatform(p)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? "bg-[#C81E66]/10 dark:bg-[#FF5C9A]/15 text-[#C81E66] dark:text-[#FF7EB1] border-[#C81E66] dark:border-[#FF5C9A]"
                        : "bg-neutral-50 dark:bg-[#0B0D12] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                    }`}
                  >
                    <span
                      className="w-1 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <span>{p}</span>
                    <span className="font-mono-tabular text-[11px] opacity-65">
                      {platformCounts[p] || 0}
                    </span>
                    {active && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre Filter */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <div className="sm:w-24 shrink-0 pt-1.5">
              <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Genre
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              <button
                type="button"
                aria-pressed={filters.genre === ""}
                onClick={() => onChange({ ...filters, genre: "" })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filters.genre === ""
                    ? "bg-[#14161C] dark:bg-[#ECEEF4] text-white dark:text-[#0B0D12] border-[#14161C] dark:border-[#ECEEF4]"
                    : "bg-neutral-50 dark:bg-[#0B0D12] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                All Genres
              </button>
              {GENRES.map((g) => {
                const active = filters.genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? "bg-[#C81E66] dark:bg-[#FF5C9A] text-white dark:text-[#0B0D12] border-[#C81E66] dark:border-[#FF5C9A]"
                        : "bg-neutral-50 dark:bg-[#0B0D12] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimum Score & Freshness + Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="sm:w-24 shrink-0">
                <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Critic Score
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {MIN_SCORES.map((m) => {
                  const active = filters.minScore === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange({ ...filters, minScore: m })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? "bg-[#C81E66] dark:bg-[#FF5C9A] text-white dark:text-[#0B0D12] border-[#C81E66] dark:border-[#FF5C9A]"
                          : "bg-neutral-50 dark:bg-[#0B0D12] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                      }`}
                    >
                      <span>{m === 0 ? "Any Score" : `${m}%+`}</span>
                      <span className="font-mono-tabular text-[11px] opacity-75">
                        {scoreCounts[m] ?? 0}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  aria-pressed={filters.recentOnly}
                  onClick={() =>
                    onChange({ ...filters, recentOnly: !filters.recentOnly })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    filters.recentOnly
                      ? "bg-[#1D7A4A] dark:bg-[#4ADE80] text-white dark:text-[#0B0D12] border-[#1D7A4A] dark:border-[#4ADE80]"
                      : "bg-neutral-50 dark:bg-[#0B0D12] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                >
                  Added Last 3 Days
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C81E66] dark:text-[#FF5C9A] hover:underline cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
