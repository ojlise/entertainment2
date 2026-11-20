import React, { useEffect, useMemo } from "react";
import { Bookmark, Check, ExternalLink, Play, X } from "lucide-react";
import { CatalogItem, PLATFORM_COLORS } from "../data/catalog";
import {
  formatReleaseDate,
  getReleaseStatusLabel,
  getReviewUrl,
  getTrailerUrl,
  getTypeLabel,
} from "../utils/streamHelpers";
import { PosterArt } from "./PosterArt";

interface DetailModalProps {
  item: CatalogItem | null;
  allItems: CatalogItem[];
  watchlistIds: string[];
  watchedIds: string[];
  onClose: () => void;
  onToggleWatchlist: (id: string) => void;
  onToggleWatched: (id: string) => void;
  onSelectItem: (item: CatalogItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  allItems,
  watchlistIds,
  watchedIds,
  onClose,
  onToggleWatchlist,
  onToggleWatched,
  onSelectItem,
}) => {
  useEffect(() => {
    if (!item) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [item, onClose]);

  const recommendations = useMemo(() => {
    if (!item) return [];
    const seenTitles = new Set<string>([item.title.toLowerCase()]);
    return allItems
      .filter((other) => {
        if (seenTitles.has(other.title.toLowerCase())) return false;
        const sharedGenres = other.genres.filter((g) =>
          item.genres.includes(g)
        ).length;
        return sharedGenres > 0;
      })
      .map((other) => {
        const sharedGenres = other.genres.filter((g) =>
          item.genres.includes(g)
        ).length;
        const samePlatform = other.platform === item.platform ? 1 : 0;
        const scoreBoost = (other.score ?? 70) / 100;
        return {
          other,
          rankScore: sharedGenres * 2 + samePlatform + scoreBoost,
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore)
      .reduce<CatalogItem[]>((acc, entry) => {
        const key = entry.other.title.toLowerCase();
        if (!seenTitles.has(key) && acc.length < 3) {
          seenTitles.add(key);
          acc.push(entry.other);
        }
        return acc;
      }, []);
  }, [item, allItems]);

  if (!item) return null;

  const saved = watchlistIds.includes(item.id);
  const watched = watchedIds.includes(item.id);
  const platColor = PLATFORM_COLORS[item.platform] || "#64748B";
  const releaseInfo = item.releaseDate
    ? formatReleaseDate(item.releaseDate)
    : null;
  const releaseStatus = item.releaseDate
    ? getReleaseStatusLabel(item.releaseDate)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-5 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close title details"
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Content Grid */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-36 sm:w-44 shrink-0 mx-auto sm:mx-0">
            <PosterArt item={item} size="lg" />
          </div>

          <div className="flex-1 min-w-0 pr-6 sm:pr-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span
                className="w-1.5 h-3.5 rounded-full"
                style={{ backgroundColor: platColor }}
                aria-hidden="true"
              />
              <span>{item.platform}</span>
              <span aria-hidden="true">·</span>
              <span>{getTypeLabel(item)}</span>
              {item.sub && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{item.sub}</span>
                </>
              )}
            </div>

            <h2
              id="detail-modal-title"
              className="mt-2 font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#14161C] dark:text-white"
            >
              {item.title}
            </h2>

            <div className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              {item.genres.join(" · ")}
              {releaseInfo && ` · Drops ${releaseInfo.full}`}
              {releaseStatus && ` (${releaseStatus.label})`}
            </div>

            {/* Score Display */}
            {item.score !== null && (
              <div className="mt-4 p-3 rounded-lg bg-neutral-50 dark:bg-[#0B0D12] border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    Rotten Tomatoes Critics Consensus
                  </span>
                  <span className="font-mono-tabular font-bold text-sm text-[#14161C] dark:text-white">
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C81E66] dark:bg-[#FF5C9A]"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                {item.isEstimate && (
                  <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    † Snapshot estimate from recent 2026 review tracking.
                  </p>
                )}
              </div>
            )}

            <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {item.description}
            </p>

            {/* Primary Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onToggleWatchlist(item.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  saved
                    ? "bg-[#C81E66] dark:bg-[#FF5C9A] text-white dark:text-[#0B0D12]"
                    : "bg-[#14161C] dark:bg-[#ECEEF4] text-white dark:text-[#0B0D12]"
                }`}
              >
                <Bookmark
                  className="w-3.5 h-3.5"
                  fill={saved ? "currentColor" : "none"}
                />
                {saved ? "Saved in Watchlist" : "Add to Watchlist"}
              </button>

              <button
                type="button"
                onClick={() => onToggleWatched(item.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  watched
                    ? "border-[#1D7A4A] text-[#1D7A4A] dark:border-[#4ADE80] dark:text-[#4ADE80]"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {watched ? "Watched" : "Mark Watched"}
              </button>

              <a
                href={getTrailerUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-[#C81E66] dark:hover:border-[#FF5C9A] whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Trailer
              </a>

              <a
                href={getReviewUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-[#C81E66] dark:hover:border-[#FF5C9A] whitespace-nowrap shrink-0"
              >
                Reviews
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Similar Titles Recommendation Strip */}
        {recommendations.length > 0 && (
          <div className="mt-7 pt-5 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="font-mono-tabular text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
              More Like This
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendations.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => onSelectItem(rec)}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#C81E66] dark:hover:border-[#FF5C9A] text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <span>{rec.platform}</span>
                    {rec.score !== null && (
                      <span className="font-mono-tabular font-semibold text-[#14161C] dark:text-white">
                        {rec.score}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-display font-bold text-sm text-[#14161C] dark:text-white line-clamp-1">
                    {rec.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {rec.genres.join(", ")}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
