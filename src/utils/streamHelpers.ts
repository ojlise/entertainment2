import { CatalogItem, GenreName, PlatformName } from "../data/catalog";
import scifiHorizonImg from "../assets/images/collection_scifi_horizon_1795144396869.jpg";
import prestigeDramaImg from "../assets/images/collection_prestige_drama_1795144397570.jpg";
import animationCraftImg from "../assets/images/collection_animation_craft_1795144397454.jpg";

export type SortMode = "score" | "low" | "title" | "plat";

export interface FilterState {
  type: "all" | "movie" | "show";
  genre: GenreName | "";
  platforms: PlatformName[];
  query: string;
  sort: SortMode;
  minScore: number;
  recentOnly: boolean;
}

export interface CuratedCollection {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  filter: Partial<FilterState>;
  countLabel: string;
}

export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: "scifi-worlds",
    kicker: "Speculative & Suspense",
    title: "High-Stakes Worlds",
    subtitle: "Subterranean mysteries, orbital ambition, and acclaimed sci-fi series.",
    image: scifiHorizonImg,
    imageAlt: "Atmospheric brutalist subterranean observatory lit by warm tungsten lamps",
    filter: { genre: "Sci-Fi", minScore: 80, platforms: [], type: "all" },
    countLabel: "Sci-Fi 80%+",
  },
  {
    id: "prestige-drama",
    kicker: "Critics Consensus",
    title: "Prestige Drama Canon",
    subtitle: "90%+ acclaimed films and limited series driven by unforgettable performances.",
    image: prestigeDramaImg,
    imageAlt: "Historic theater stage illuminated by dramatic side window light",
    filter: { genre: "Drama", minScore: 90, platforms: [], type: "all" },
    countLabel: "Drama 90%+",
  },
  {
    id: "animation-craft",
    kicker: "Handcrafted & Bold",
    title: "Masterwork Animation",
    subtitle: "Visually inventive animated features and adult series across top streamers.",
    image: animationCraftImg,
    imageAlt: "Animator wooden drafting desk with cel sheets and gouache swatches",
    filter: { genre: "Animation", minScore: 0, platforms: [], type: "all" },
    countLabel: "All Animation",
  },
];

export function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function diffDaysFromToday(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = getTodayStart();
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function formatReleaseDate(isoDate: string): {
  weekday: string;
  month: string;
  day: number;
  full: string;
} {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    weekday: dt.toLocaleDateString("en-US", { weekday: "short" }),
    month: dt.toLocaleDateString("en-US", { month: "short" }),
    day: d,
    full: dt.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  };
}

export function isAddedRecently(item: CatalogItem): boolean {
  if (!item.added) return false;
  const [y, m, d] = item.added.split("-").map(Number);
  const addedDate = new Date(y, m - 1, d);
  const today = getTodayStart();
  const days = Math.round((today.getTime() - addedDate.getTime()) / 86400000);
  return days >= 0 && days <= 3;
}

export function getTrailerUrl(item: CatalogItem): string {
  let q = item.title;
  if (item.type === "show" && item.sub && /season/i.test(item.sub)) {
    q += " " + item.sub;
  }
  if (item.type === "movie") {
    q += " " + (/^\d{4}$/.test(item.sub || "") ? item.sub : "2026");
  }
  return (
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(q + " official trailer")
  );
}

export function getReviewUrl(item: CatalogItem): string {
  return (
    "https://www.rottentomatoes.com/search?search=" +
    encodeURIComponent(item.title)
  );
}

export function getTypeLabel(item: CatalogItem): string {
  return item.type === "movie" ? "Movie" : "Series";
}

export function matchesFilters(
  item: CatalogItem,
  filters: FilterState,
  includeMinScore: boolean
): boolean {
  if (filters.type !== "all" && item.type !== filters.type) return false;
  if (filters.genre && !item.genres.includes(filters.genre)) return false;
  if (
    filters.platforms.length > 0 &&
    !filters.platforms.includes(item.platform)
  ) {
    return false;
  }
  if (filters.recentOnly && !isAddedRecently(item)) return false;
  if (includeMinScore && filters.minScore > 0) {
    if (item.score === null || item.score < filters.minScore) return false;
  }
  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    const haystack = [
      item.title,
      item.sub,
      item.platform,
      item.description,
      ...item.genres,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export function getReleaseStatusLabel(isoDate: string): {
  label: string;
  tone: "today" | "upcoming" | "released";
} {
  const diff = diffDaysFromToday(isoDate);
  if (diff === 0) return { label: "Premieres Today", tone: "today" };
  if (diff === 1) return { label: "Tomorrow", tone: "upcoming" };
  if (diff > 1) return { label: `In ${diff} days`, tone: "upcoming" };
  return { label: "Streaming Now", tone: "released" };
}
