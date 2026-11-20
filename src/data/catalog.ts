import catalogData from "./catalog.json";

export type MediaType = "movie" | "show";

export type PlatformName =
  | "Netflix"
  | "HBO Max"
  | "Prime Video"
  | "Hulu"
  | "Disney+"
  | "Apple TV"
  | "Peacock"
  | "Paramount+"
  | "MGM+";

export type GenreName =
  | "Drama"
  | "Comedy"
  | "Suspense"
  | "Horror"
  | "Sci-Fi"
  | "Action"
  | "Animation"
  | "Romance"
  | "Fantasy"
  | "Family";

export interface CatalogItem {
  id: string;
  rank?: number;
  title: string;
  sub: string;
  type: MediaType;
  platform: PlatformName;
  genres: GenreName[];
  score: number | null;
  isEstimate?: boolean;
  releaseDate?: string;
  added: string | null;
  description: string;
  source: "top" | "new";
}

export const LAST_UPDATED_ISO: string = catalogData.lastUpdatedIso;
export const LAST_UPDATED_LABEL: string = catalogData.lastUpdatedLabel;

export const PLATFORM_COLORS: Record<PlatformName, string> = {
  Netflix: "#e50914",
  "HBO Max": "#7b3fe4",
  "Prime Video": "#1a98ff",
  Hulu: "#1ce783",
  "Disney+": "#2a4bd7",
  "Apple TV": "#8e8e93",
  Peacock: "#f2b600",
  "Paramount+": "#0064ff",
  "MGM+": "#c9a227",
};

export const GENRES: GenreName[] = [
  "Drama",
  "Comedy",
  "Suspense",
  "Horror",
  "Sci-Fi",
  "Action",
  "Animation",
  "Romance",
  "Fantasy",
  "Family",
];

export const PLATFORMS: PlatformName[] = [
  "Netflix",
  "HBO Max",
  "Prime Video",
  "Hulu",
  "Disney+",
  "Apple TV",
  "Peacock",
  "Paramount+",
  "MGM+",
];

export const TOP_TITLES: CatalogItem[] = catalogData.topTitles as CatalogItem[];
export const NEW_TITLES: CatalogItem[] = catalogData.newTitles as CatalogItem[];
