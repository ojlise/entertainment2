import React, { useEffect, useMemo, useState } from "react";
import { Bookmark, RefreshCw, Sparkles, X } from "lucide-react";
import {
  CatalogItem,
  GENRES,
  GenreName,
  PLATFORMS,
  PLATFORM_COLORS,
  PlatformName,
} from "../data/catalog";
import { getTypeLabel } from "../utils/streamHelpers";
import { PosterArt } from "./PosterArt";

interface TonightsPickModalProps {
  open: boolean;
  topItems: CatalogItem[];
  initialPlatforms: PlatformName[];
  watchlistIds: string[];
  watchedIds: string[];
  onClose: () => void;
  onToggleWatchlist: (id: string) => void;
  onSelectItem: (item: CatalogItem) => void;
}

export const TonightsPickModal: React.FC<TonightsPickModalProps> = ({
  open,
  topItems,
  initialPlatforms,
  watchlistIds,
  watchedIds,
  onClose,
  onToggleWatchlist,
  onSelectItem,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] =
    useState<PlatformName[]>(initialPlatforms);
  const [genre, setGenre] = useState<GenreName | "">("");
  const [format, setFormat] = useState<"all" | "movie" | "show">("all");
  const [excludeWatched, setExcludeWatched] = useState(true);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (open) {
      setSelectedPlatforms(initialPlatforms);
    }
  }, [open, initialPlatforms]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const candidates = useMemo(() => {
    return topItems
      .filter((item) => {
        if (format !== "all" && item.type !== format) return false;
        if (genre && !item.genres.includes(genre)) return false;
        if (
          selectedPlatforms.length > 0 &&
          !selectedPlatforms.includes(item.platform)
        ) {
          return false;
        }
        if (excludeWatched && watchedIds.includes(item.id)) return false;
        return true;
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [topItems, format, genre, selectedPlatforms, excludeWatched, watchedIds]);

  const picks = useMemo(() => {
    if (candidates.length <= 3) return candidates;
    // Rotate through top tier candidates deterministically based on shuffle seed
    const poolSize = Math.min(candidates.length, 15);
    const pool = candidates.slice(0, poolSize);
    const start = (seed * 3) % pool.length;
    const chosen: CatalogItem[] = [];
    for (let i = 0; i < 3; i++) {
      chosen.push(pool[(start + i) % pool.length]);
    }
    return chosen;
  }, [candidates, seed]);

  if (!open) return null;

  const togglePlat = (p: PlatformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
    setSeed(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] p-5 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Tonight's Pick"
          className="absolute top-4 right-4 p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pr-8">
          <div className="inline-flex items-center gap-1.5 font-mono-tabular text-xs uppercase tracking-widest text-[#C81E66] dark:text-[#FF5C9A]">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Decision Helper
          </div>
          <h2
            id="picker-modal-title"
            className="mt-1 font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#14161C] dark:text-white"
          >
            What Should You Watch Tonight?
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Select your subscribed services and mood to narrow 116 top-rated
            titles down to three immediate picks.
          </p>
        </div>

        {/* Picker Controls */}
        <div className="mt-5 space-y-4 p-4 rounded-xl bg-neutral-50 dark:bg-[#0B0D12] border border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
              Your Services (leave unselected for all)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const active = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePlat(p)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? "bg-[#C81E66]/10 dark:bg-[#FF5C9A]/15 text-[#C81E66] dark:text-[#FF7EB1] border-[#C81E66] dark:border-[#FF5C9A]"
                        : "bg-white dark:bg-[#13161F] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <span
                      className="w-1 h-2.5 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLORS[p] }}
                      aria-hidden="true"
                    />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value as "all" | "movie" | "show");
                  setSeed(0);
                }}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#13161F]"
              >
                <option value="all">Movies &amp; Series</option>
                <option value="movie">Movies Only (2h commitment)</option>
                <option value="show">Series Only</option>
              </select>
            </div>

            <div>
              <label className="block font-mono-tabular text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                Genre / Mood
              </label>
              <select
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value as GenreName | "");
                  setSeed(0);
                }}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#13161F]"
              >
                <option value="">Any Genre</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeWatched}
                  onChange={(e) => setExcludeWatched(e.target.checked)}
                  className="rounded accent-[#C81E66]"
                />
                Skip titles marked watched
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-mono-tabular text-xs text-neutral-500 dark:text-neutral-400">
              {candidates.length} matching high-rated titles
            </span>
            {candidates.length > 3 && (
              <button
                type="button"
                onClick={() => setSeed((s) => s + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:border-[#C81E66] dark:hover:border-[#FF5C9A] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Shuffle Picks
              </button>
            )}
          </div>

          {picks.length === 0 ? (
            <div className="p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500">
              No titles match this combination. Try selecting another service or
              clearing the genre filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {picks.map((item) => {
                const saved = watchlistIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0B0D12] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectItem(item);
                        }}
                        className="block w-full cursor-pointer"
                      >
                        <PosterArt item={item} size="md" />
                      </button>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                          {item.platform}
                        </span>
                        <span className="font-mono-tabular font-bold text-[#C81E66] dark:text-[#FF5C9A]">
                          {item.score}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectItem(item);
                        }}
                        className="mt-1 text-left w-full cursor-pointer"
                      >
                        <h3 className="font-display font-bold text-base text-[#14161C] dark:text-white hover:text-[#C81E66] dark:hover:text-[#FF5C9A]">
                          {item.title}
                        </h3>
                      </button>

                      <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {getTypeLabel(item)}
                        {item.sub ? ` · ${item.sub}` : ""}
                      </div>

                      <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleWatchlist(item.id)}
                      className={`mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        saved
                          ? "bg-[#C81E66] dark:bg-[#FF5C9A] text-white dark:text-[#0B0D12] border-transparent"
                          : "border-neutral-300 dark:border-neutral-700 hover:border-[#C81E66] dark:hover:border-[#FF5C9A]"
                      }`}
                    >
                      <Bookmark
                        className="w-3.5 h-3.5"
                        fill={saved ? "currentColor" : "none"}
                      />
                      {saved ? "Saved to Watchlist" : "Save for Tonight"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
