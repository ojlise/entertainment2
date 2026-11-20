import { useEffect, useMemo, useState } from "react";
import {
  CatalogItem,
  NEW_TITLES,
  PLATFORMS,
  PlatformName,
  TOP_TITLES,
} from "./data/catalog";
import {
  CuratedCollection,
  FilterState,
  matchesFilters,
} from "./utils/streamHelpers";
import { TopBar } from "./components/TopBar";
import { HeroSpotlight } from "./components/HeroSpotlight";
import { FilterToolbar } from "./components/FilterToolbar";
import { CollectionsSection } from "./components/CollectionsSection";
import { TopRatedSection } from "./components/TopRatedSection";
import { NewReleasesSection } from "./components/NewReleasesSection";
import { WatchlistSection } from "./components/WatchlistSection";
import { DetailModal } from "./components/DetailModal";
import { TonightsPickModal } from "./components/TonightsPickModal";

const DEFAULT_FILTERS: FilterState = {
  type: "all",
  genre: "",
  platforms: [],
  query: "",
  sort: "score",
  minScore: 0,
  recentOnly: false,
};

const STORAGE_FILTERS_KEY = "streamguide.filters.v2";
const STORAGE_WATCHLIST_KEY = "streamguide.watchlist.v2";
const STORAGE_WATCHED_KEY = "streamguide.watched.v2";
const STORAGE_THEME_KEY = "streamguide.theme.v2";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = loadJson<Partial<FilterState>>(STORAGE_FILTERS_KEY, {});
    return {
      ...DEFAULT_FILTERS,
      ...saved,
      query: "",
    };
  });

  const [watchlistIds, setWatchlistIds] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_WATCHLIST_KEY, [])
  );
  const [watchedIds, setWatchedIds] = useState<string[]>(() =>
    loadJson<string[]>(STORAGE_WATCHED_KEY, [])
  );

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === "dark") return true;
      if (saved === "light") return false;
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    } catch {
      return false;
    }
  });

  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sync dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, isDark ? "dark" : "light");
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  // Persist filters (excluding transient search query)
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_FILTERS_KEY,
        JSON.stringify({ ...filters, query: "" })
      );
    } catch {
      // Ignore storage errors
    }
  }, [filters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify(watchlistIds));
    } catch {
      // Ignore storage errors
    }
  }, [watchlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WATCHED_KEY, JSON.stringify(watchedIds));
    } catch {
      // Ignore storage errors
    }
  }, [watchedIds]);

  const allItems = useMemo(() => [...TOP_TITLES, ...NEW_TITLES], []);

  const itemMap = useMemo(() => {
    const map = new Map<string, CatalogItem>();
    allItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [allItems]);

  const watchlistItems = useMemo(() => {
    return watchlistIds
      .map((id) => itemMap.get(id))
      .filter((x): x is CatalogItem => Boolean(x));
  }, [watchlistIds, itemMap]);

  // Pool matching non-score filters for live threshold counts
  const topScorePool = useMemo(
    () =>
      TOP_TITLES.filter((item) =>
        matchesFilters(item, { ...filters, minScore: 0 }, false)
      ),
    [filters]
  );

  const scoreCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    [0, 70, 80, 90, 95].forEach((threshold) => {
      counts[threshold] = topScorePool.filter(
        (item) => (item.score ?? 0) >= threshold
      ).length;
    });
    return counts;
  }, [topScorePool]);

  const platformCounts = useMemo(() => {
    const counts = {} as Record<PlatformName, number>;
    PLATFORMS.forEach((p) => {
      counts[p] = TOP_TITLES.filter((i) => i.platform === p).length;
    });
    return counts;
  }, []);

  const filteredTop = useMemo(() => {
    const list = TOP_TITLES.filter((item) => matchesFilters(item, filters, true));
    return [...list].sort((a, b) => {
      const sa = a.score ?? 0;
      const sb = b.score ?? 0;
      if (filters.sort === "low") return sa - sb || a.title.localeCompare(b.title);
      if (filters.sort === "title") return a.title.localeCompare(b.title);
      if (filters.sort === "plat") {
        return a.platform.localeCompare(b.platform) || sb - sa;
      }
      return sb - sa || a.title.localeCompare(b.title);
    });
  }, [filters]);

  const filteredNew = useMemo(
    () => NEW_TITLES.filter((item) => matchesFilters(item, filters, false)),
    [filters]
  );

  const highScoreCount = useMemo(
    () => TOP_TITLES.filter((item) => (item.score ?? 0) >= 95).length,
    []
  );

  const toggleWatchlist = (id: string) => {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
    );
  };

  const toggleWatched = (id: string) => {
    setWatchedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, sort: filters.sort });
  };

  const handleFilterAcclaimed = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      minScore: 95,
      sort: "score",
    });
    document.getElementById("top-rated")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplyCollection = (col: CuratedCollection) => {
    setFilters({
      ...DEFAULT_FILTERS,
      ...col.filter,
      sort: "score",
    });
    document.getElementById("top-rated")?.scrollIntoView({ behavior: "smooth" });
  };

  const featuredSpotlight = TOP_TITLES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F8] dark:bg-[#0B0D12] text-[#14161C] dark:text-[#ECEEF4]">
      <TopBar
        watchlistCount={watchlistIds.length}
        onOpenPicker={() => setPickerOpen(true)}
      />

      <main className="flex-1">
        <HeroSpotlight
          featuredItem={featuredSpotlight}
          totalTop={TOP_TITLES.length}
          totalNew={NEW_TITLES.length}
          highScoreCount={highScoreCount}
          watchlistCount={watchlistIds.length}
          watchedCount={watchedIds.length}
          onSelectFeatured={setSelectedItem}
          onOpenPicker={() => setPickerOpen(true)}
          onFilterAcclaimed={handleFilterAcclaimed}
        />

        <FilterToolbar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          scoreCounts={scoreCounts}
          platformCounts={platformCounts}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
        />

        <CollectionsSection onApplyCollection={handleApplyCollection} />

        <TopRatedSection
          items={filteredTop}
          totalCount={TOP_TITLES.length}
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onToggleWatchlist={toggleWatchlist}
          onSelectItem={setSelectedItem}
          onResetFilters={handleResetFilters}
        />

        <NewReleasesSection
          items={filteredNew}
          totalCount={NEW_TITLES.length}
          watchlistIds={watchlistIds}
          onToggleWatchlist={toggleWatchlist}
          onSelectItem={setSelectedItem}
          onResetFilters={handleResetFilters}
        />

        <WatchlistSection
          watchlistItems={watchlistItems}
          watchedIds={watchedIds}
          onToggleWatchlist={toggleWatchlist}
          onToggleWatched={toggleWatched}
          onClearWatchlist={() => setWatchlistIds([])}
          onSelectItem={setSelectedItem}
        />
      </main>

      <footer className="mt-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 space-y-2.5">
          <p className="max-w-[78ch]">
            Scores are Rotten Tomatoes critics percentages; entries marked{" "}
            <span className="font-mono-tabular font-semibold text-neutral-700 dark:text-neutral-200">
              †
            </span>{" "}
            reflect snapshot estimates and may shift as additional reviews arrive.
            New November releases display scores once critic consensus is published.
          </p>
          <p className="max-w-[78ch]">
            Posters from TMDB. This product uses the TMDB API but is not
            endorsed or certified by TMDB.
          </p>
          <p className="max-w-[78ch]">
            Streaming lineups shift regularly—confirm availability on the service
            before subscribing. Sources:{" "}
            <a
              href="https://www.hollywoodreporter.com/tv/tv-news/netflix-october-2026-new-releases-movies-tv-1236718064/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C81E66] dark:text-[#FF5C9A] hover:underline"
            >
              The Hollywood Reporter
            </a>
            ,{" "}
            <a
              href="https://variety.com/lists/best-movies-streaming-october-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C81E66] dark:text-[#FF5C9A] hover:underline"
            >
              Variety
            </a>
            ,{" "}
            <a
              href="https://www.tomsguide.com/entertainment/streaming/missed-it-in-theaters-heres-every-movie-finally-arriving-on-streaming-in-october-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C81E66] dark:text-[#FF5C9A] hover:underline"
            >
              Tom&apos;s Guide
            </a>
            ,{" "}
            <a
              href="https://whatsondisneyplus.com/new-on-disney-october-2026-video-released/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C81E66] dark:text-[#FF5C9A] hover:underline"
            >
              What&apos;s on Disney+
            </a>
            ,{" "}
            <a
              href="https://www.whats-on-netflix.com/what-to-watch/netflix-certified-fresh-movies-shows-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C81E66] dark:text-[#FF5C9A] hover:underline"
            >
              What&apos;s on Netflix
            </a>
            ,{" "}
            <a
              href="https://www.rottentomatoes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C81E66] dark:text-[#FF5C9A] hover:underline"
            >
              Rotten Tomatoes
            </a>
            .
          </p>
        </div>
      </footer>

      <DetailModal
        item={selectedItem}
        allItems={allItems}
        watchlistIds={watchlistIds}
        watchedIds={watchedIds}
        onClose={() => setSelectedItem(null)}
        onToggleWatchlist={toggleWatchlist}
        onToggleWatched={toggleWatched}
        onSelectItem={setSelectedItem}
      />

      <TonightsPickModal
        open={pickerOpen}
        topItems={TOP_TITLES}
        initialPlatforms={filters.platforms}
        watchlistIds={watchlistIds}
        watchedIds={watchedIds}
        onClose={() => setPickerOpen(false)}
        onToggleWatchlist={toggleWatchlist}
        onSelectItem={setSelectedItem}
      />
    </div>
  );
}
