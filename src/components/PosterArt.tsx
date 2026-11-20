import React, { useEffect, useState } from "react";
import { CatalogItem, PLATFORM_COLORS } from "../data/catalog";
import { POSTER_MAP } from "../data/posters";

interface PosterArtProps {
  item: CatalogItem;
  size?: "sm" | "md" | "lg";
}

function hashTitle(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const PosterArt: React.FC<PosterArtProps> = ({ item, size = "md" }) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [item.id]);

  const posterMeta = POSTER_MAP[item.id];
  const posterPath = posterMeta?.poster;
  const widthToken = size === "lg" ? "w500" : size === "md" ? "w342" : "w185";
  const imageUrl =
    posterPath && !imgFailed
      ? `https://image.tmdb.org/t/p/${widthToken}${posterPath}`
      : null;

  const color = PLATFORM_COLORS[item.platform] || "#64748B";
  const hash = hashTitle(item.title + item.platform);
  const angle = 135 + (hash % 50);
  const primaryGenre = item.genres[0] || "Drama";

  const sizeClasses =
    size === "sm"
      ? "w-14 aspect-[2/3] rounded-md text-[10px]"
      : size === "lg"
      ? "w-full aspect-[2/3] rounded-xl text-lg"
      : "w-full aspect-[2/3] rounded-lg text-xs";

  const paddingClasses =
    size === "sm" ? "p-1.5" : size === "lg" ? "p-4" : "p-2.5";

  return (
    <div
      className={`relative overflow-hidden select-none flex flex-col justify-between text-white shrink-0 border border-black/10 dark:border-white/10 ${sizeClasses} ${
        imageUrl ? "bg-neutral-900" : paddingClasses
      }`}
      style={
        imageUrl
          ? undefined
          : {
              background: `linear-gradient(${angle}deg, color-mix(in srgb, ${color} 68%, #0c0e14), color-mix(in srgb, ${color} 26%, #090b10))`,
            }
      }
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${item.title} poster`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          {/* Fallback geometric film motif when poster art is unavailable */}
          <svg
            viewBox="0 0 120 180"
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {primaryGenre === "Sci-Fi" && (
              <g fill="none" stroke="white" strokeWidth="1.2">
                <circle cx="88" cy="48" r="46" opacity="0.6" />
                <circle cx="88" cy="48" r="28" opacity="0.4" />
                <line x1="12" y1="125" x2="108" y2="125" opacity="0.35" />
              </g>
            )}
            {(primaryGenre === "Suspense" ||
              primaryGenre === "Action" ||
              primaryGenre === "Horror") && (
              <g fill="none" stroke="white" strokeWidth="1.2">
                <line x1="-10" y1="145" x2="130" y2="35" opacity="0.55" />
                <line x1="-10" y1="165" x2="130" y2="55" opacity="0.3" />
                <rect x="70" y="18" width="32" height="32" opacity="0.25" />
              </g>
            )}
            {(primaryGenre === "Animation" ||
              primaryGenre === "Fantasy" ||
              primaryGenre === "Family") && (
              <g fill="none" stroke="white" strokeWidth="1.2">
                <path d="M-10,90 Q45,30 130,85" opacity="0.55" />
                <path d="M-10,115 Q55,55 130,110" opacity="0.35" />
                <circle cx="34" cy="42" r="14" opacity="0.4" />
              </g>
            )}
            {(primaryGenre === "Drama" ||
              primaryGenre === "Comedy" ||
              primaryGenre === "Romance") && (
              <g fill="none" stroke="white" strokeWidth="1.2">
                <rect x="16" y="16" width="88" height="148" rx="2" opacity="0.35" />
                <line x1="16" y1="122" x2="104" y2="122" opacity="0.3" />
                <circle cx="86" cy="42" r="18" opacity="0.3" />
              </g>
            )}
          </svg>

          <div className="relative z-10 flex items-center justify-between gap-1">
            <span
              className="h-1 w-5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {size !== "sm" && (
              <span className="font-mono-tabular text-[10px] tracking-wider text-white/80 uppercase truncate">
                {item.sub || (item.type === "movie" ? "Film" : "Series")}
              </span>
            )}
          </div>

          <div className="relative z-10 mt-auto">
            {size === "lg" && (
              <div className="font-mono-tabular text-[11px] uppercase tracking-widest text-white/80 mb-1.5">
                {item.platform} · {primaryGenre}
              </div>
            )}
            <div
              className={`font-display font-bold leading-[1.08] tracking-tight text-white drop-shadow-sm ${
                size === "sm"
                  ? "line-clamp-3 text-[10px]"
                  : size === "lg"
                  ? "text-xl leading-tight"
                  : "line-clamp-3 text-[13px]"
              }`}
            >
              {item.title}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
