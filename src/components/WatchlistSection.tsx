import React, { useState } from "react";
import { Bookmark, Check, Copy, Trash2 } from "lucide-react";
import { CatalogItem, PLATFORM_COLORS } from "../data/catalog";
import { getTypeLabel } from "../utils/streamHelpers";
import { PosterArt } from "./PosterArt";

interface WatchlistSectionProps {
  watchlistItems: CatalogItem[];
  watchedIds: string[];
  onToggleWatchlist: (id: string) => void;
  onToggleWatched: (id: string) => void;
  onClearWatchlist: () => void;
  onSelectItem: (item: CatalogItem) => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  watchlistItems,
  watchedIds,
  onToggleWatchlist,
  onToggleWatched,
  onClearWatchlist,
  onSelectItem,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyList = async () => {
    const lines = watchlistItems.map((item) => {
      const done = watchedIds.includes(item.id) ? "[Watched] " : "";
      const score = item.score !== null ? ` (${item.score}%)` : "";
      return `${done}${item.title}${score} — ${item.platform}`;
    });
    const text = `Stream Guide Watchlist:\n${lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback not required
    }
  };

  return (
    <section
      id="watchlist"
      className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#14161C] dark:text-[#ECEEF4]">
            Your Watchlist
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Saved locally in your browser so your weekend queue stays ready.
          </p>
        </div>

        {watchlistItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#13161F] text-[#14161C] dark:text-white hover:border-[#C81E66] dark:hover:border-[#FF5C9A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1D7A4A] dark:text-[#4ADE80]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy List
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClearWatchlist}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        )}
      </div>

      {watchlistItems.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-[#13161F]/60 p-8 sm:p-10 text-center">
          <Bookmark className="w-6 h-6 mx-auto text-neutral-400" />
          <h3 className="mt-3 font-display font-bold text-lg text-[#14161C] dark:text-white">
            Your watchlist is empty
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            Click the bookmark icon on any top-rated title or upcoming November
            premiere to build your personal queue.
          </p>
          <a
            href="#top-rated"
            className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-[#14161C] dark:bg-[#ECEEF4] text-white dark:text-[#0B0D12]"
          >
            Browse Top Rated
          </a>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlistItems.map((item) => {
            const watched = watchedIds.includes(item.id);
            const platColor = PLATFORM_COLORS[item.platform] || "#64748B";

            return (
              <div
                key={item.id}
                className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-4 flex gap-3.5 transition-opacity ${
                  watched ? "opacity-70" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectItem(item)}
                  className="shrink-0 cursor-pointer"
                  aria-label={`View details for ${item.title}`}
                >
                  <PosterArt item={item} size="sm" />
                </button>

                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                        <span
                          className="w-1 h-3 rounded-full"
                          style={{ backgroundColor: platColor }}
                          aria-hidden="true"
                        />
                        {item.platform}
                      </span>
                      {item.score !== null && (
                        <span className="font-mono-tabular font-semibold text-[#14161C] dark:text-white">
                          {item.score}%
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="mt-1 text-left w-full cursor-pointer"
                    >
                      <h3
                        className={`font-display font-bold text-base leading-snug hover:text-[#C81E66] dark:hover:text-[#FF5C9A] ${
                          watched
                            ? "line-through text-neutral-500 dark:text-neutral-400"
                            : "text-[#14161C] dark:text-white"
                        }`}
                      >
                        {item.title}
                      </h3>
                    </button>

                    <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {getTypeLabel(item)}
                      {item.sub ? ` · ${item.sub}` : ""}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onToggleWatched(item.id)}
                      className={`inline-flex items-center gap-1 font-medium cursor-pointer ${
                        watched
                          ? "text-[#1D7A4A] dark:text-[#4ADE80]"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-[#14161C] dark:hover:text-white"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {watched ? "Watched" : "Mark watched"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleWatchlist(item.id)}
                      className="text-neutral-400 hover:text-red-600 dark:hover:text-red-400 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
