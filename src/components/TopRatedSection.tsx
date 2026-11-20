import React, { useState } from "react";
import {
  Bookmark,
  Check,
  ExternalLink,
  LayoutGrid,
  List,
  Play,
} from "lucide-react";
import { CatalogItem, PLATFORM_COLORS } from "../data/catalog";
import {
  getReviewUrl,
  getTrailerUrl,
  getTypeLabel,
  isAddedRecently,
} from "../utils/streamHelpers";
import { PosterArt } from "./PosterArt";

interface TopRatedSectionProps {
  items: CatalogItem[];
  totalCount: number;
  watchlistIds: string[];
  watchedIds: string[];
  onToggleWatchlist: (id: string) => void;
  onSelectItem: (item: CatalogItem) => void;
  onResetFilters: () => void;
}

const INITIAL_VISIBLE = 24;

export const TopRatedSection: React.FC<TopRatedSectionProps> = ({
  items,
  totalCount,
  watchlistIds,
  watchedIds,
  onToggleWatchlist,
  onSelectItem,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "ledger">("grid");
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const hasMore = items.length > INITIAL_VISIBLE;

  return (
    <section
      id="top-rated"
      className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#14161C] dark:text-[#ECEEF4]">
            Top Rated Right Now
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Ranked by Rotten Tomatoes critics consensus. Click any title for
            similar picks and trailer links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono-tabular text-xs text-neutral-500 dark:text-neutral-400">
            {items.length} of {totalCount} titles
          </span>

          <div
            role="group"
            aria-label="Top rated layout"
            className="inline-flex p-1 rounded-lg bg-neutral-200/70 dark:bg-[#13161F] border border-neutral-200 dark:border-neutral-800"
          >
            <button
              type="button"
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#1E2330] text-[#14161C] dark:text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-[#14161C] dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "ledger"}
              onClick={() => setViewMode("ledger")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === "ledger"
                  ? "bg-white dark:bg-[#1E2330] text-[#14161C] dark:text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-[#14161C] dark:hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-10 text-center">
          <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">
            No top-rated titles match your current filters.
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Try widening your service selection or lowering the minimum score.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[#C81E66] dark:bg-[#FF5C9A] text-white dark:text-[#0B0D12] cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Editorial Grid View */
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((item, idx) => {
            const saved = watchlistIds.includes(item.id);
            const watched = watchedIds.includes(item.id);
            const fresh = isAddedRecently(item);
            const platColor = PLATFORM_COLORS[item.platform] || "#64748B";
            const scoreVal = item.score ?? 0;

            return (
              <article
                key={item.id}
                className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-4 flex flex-col justify-between transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div className="flex gap-4">
                  {/* Clickable Poster */}
                  <button
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="block w-20 shrink-0 cursor-pointer focus-visible:outline-2 rounded-lg"
                    aria-label={`View details for ${item.title}`}
                  >
                    <PosterArt item={item} size="md" />
                  </button>

                  {/* Metadata & Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        <span className="font-mono-tabular text-neutral-400 dark:text-neutral-500">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className="w-1 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: platColor }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.platform}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleWatchlist(item.id)}
                        aria-label={
                          saved
                            ? `Remove ${item.title} from watchlist`
                            : `Save ${item.title} to watchlist`
                        }
                        aria-pressed={saved}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                          saved
                            ? "text-[#C81E66] dark:text-[#FF5C9A] bg-[#C81E66]/10 dark:bg-[#FF5C9A]/15"
                            : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <Bookmark
                          className="w-4 h-4"
                          fill={saved ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="mt-1 text-left w-full cursor-pointer"
                    >
                      <h3 className="font-display font-bold text-lg leading-snug text-[#14161C] dark:text-white group-hover:text-[#C81E66] dark:group-hover:text-[#FF5C9A] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </button>

                    {/* Unboxed Typographic Metadata */}
                    <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {getTypeLabel(item)}
                      {item.sub ? ` · ${item.sub}` : ""}
                      {` · ${item.genres.join(", ")}`}
                      {fresh ? " · Added recently" : ""}
                    </div>

                    {/* Score Meter */}
                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#C81E66] dark:bg-[#FF5C9A]"
                          style={{ width: `${scoreVal}%` }}
                        />
                      </div>
                      <span className="font-mono-tabular text-xs font-semibold text-[#14161C] dark:text-white shrink-0">
                        {scoreVal}%{item.isEstimate ? "†" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Synopsis & Actions */}
                <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col justify-between gap-3 flex-1">
                  <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <a
                        href={getTrailerUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-200 hover:text-[#C81E66] dark:hover:text-[#FF5C9A] transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Trailer
                      </a>
                      <a
                        href={getReviewUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-200 hover:text-[#C81E66] dark:hover:text-[#FF5C9A] transition-colors"
                      >
                        Reviews
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="font-semibold text-[#C81E66] dark:text-[#FF5C9A] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      {watched && <Check className="w-3.5 h-3.5" />}
                      {watched ? "Watched · Details" : "Details"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Compact Ledger View */
        <ul className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
          {visibleItems.map((item, idx) => {
            const saved = watchlistIds.includes(item.id);
            const platColor = PLATFORM_COLORS[item.platform] || "#64748B";
            const scoreVal = item.score ?? 0;

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
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-mono-tabular text-xs font-medium text-neutral-400">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectItem(item)}
                        className="font-display font-bold text-base sm:text-lg text-[#14161C] dark:text-white hover:text-[#C81E66] dark:hover:text-[#FF5C9A] text-left cursor-pointer"
                      >
                        {item.title}
                      </button>
                      {isAddedRecently(item) && (
                        <span className="font-mono-tabular text-[11px] font-semibold text-[#B45309] dark:text-[#FBBF24]">
                          New entry
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {getTypeLabel(item)}
                      {item.sub ? ` · ${item.sub}` : ""} ·{" "}
                      {item.genres.join(", ")}
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
                        {saved ? "In Watchlist" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Platform & Score */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pl-18 sm:pl-0">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14161C] dark:text-neutral-200">
                    <span
                      className="w-1 h-3.5 rounded-full"
                      style={{ backgroundColor: platColor }}
                      aria-hidden="true"
                    />
                    {item.platform}
                  </div>
                  <div className="flex items-center gap-2 font-mono-tabular text-xs font-semibold">
                    <div className="w-20 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#C81E66] dark:bg-[#FF5C9A]"
                        style={{ width: `${scoreVal}%` }}
                      />
                    </div>
                    <span>
                      {scoreVal}%{item.isEstimate ? "†" : ""}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Expand / Collapse All */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#13161F] text-[#14161C] dark:text-white hover:border-[#C81E66] dark:hover:border-[#FF5C9A] transition-colors cursor-pointer"
          >
            {showAll
              ? `Show top ${INITIAL_VISIBLE} titles`
              : `Show all ${items.length} matching titles`}
          </button>
        </div>
      )}
    </section>
  );
};
