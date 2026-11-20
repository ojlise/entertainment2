import postersData from "./posters.json";

export interface PosterMeta {
  poster: string;
  backdrop?: string;
}

export const POSTER_MAP: Record<string, PosterMeta> =
  postersData as Record<string, PosterMeta>;
