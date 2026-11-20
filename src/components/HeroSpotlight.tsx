import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  CatalogItem,
  LAST_UPDATED_LABEL,
  PLATFORM_COLORS,
} from "../data/catalog";
import heroCinemaImg from "../assets/images/hero_cinema_editorial_1795144398277.jpg";

interface HeroSpotlightProps {
  featuredItem: CatalogItem;
  totalTop: number;
  totalNew: number;
  highScoreCount: number;
  watchlistCount: number;
  watchedCount: number;
  onSelectFeatured: (item: CatalogItem) => void;
  onOpenPicker: () => void;
  onFilterAcclaimed: () => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  featuredItem,
  totalTop,
  totalNew,
  highScoreCount,
  watchlistCount,
  watchedCount,
  onSelectFeatured,
  onOpenPicker,
  onFilterAcclaimed,
}) => {
  const platColor = PLATFORM_COLORS[featuredItem.platform] || "#C81E66";
  const editionMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <section id="top" className="pt-8 pb-6 sm:pt-12 sm:pb-8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* 2-Column Split-Screen Editorial Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Editorial Headline & Primary Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <p className="font-mono-tabular text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {editionMonth} Edition · Updated {LAST_UPDATED_LABEL}
              </p>

              <h1 className="mt-3 font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] leading-[0.98] tracking-tight text-[#14161C] dark:text-[#ECEEF4] text-balance max-w-2xl">
                Know what is actually worth streaming tonight.
              </h1>

              <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-[58ch]">
                An independent, critic-ranked index of the sharpest movies and
                series across nine major US streaming services, paired with a
                daily calendar of what premieres this month.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenPicker}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#14161C] hover:bg-neutral-800 dark:bg-[#ECEEF4] dark:hover:bg-white text-white dark:text-[#0B0D12] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Pick Something for Tonight
              </button>

              <button
                type="button"
                onClick={onFilterAcclaimed}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:border-[#C81E66] dark:hover:border-[#FF5C9A] text-sm font-semibold text-[#14161C] dark:text-[#ECEEF4] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Explore 95%+ Acclaimed
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Bespoke Editorial Cinema Still + Spotlight Overlay */}
          <div className="lg:col-span-5 flex">
            <button
              type="button"
              onClick={() => onSelectFeatured(featuredItem)}
              className="group relative w-full min-h-[280px] lg:min-h-[340px] rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-left cursor-pointer"
            >
              <img
                src={heroCinemaImg}
                alt="Intimate private cinema screening room at twilight"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15"
              />

              <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-[11px] uppercase tracking-widest text-white/85">
                    #01 Ranked Spotlight
                  </span>
                  <span className="font-mono-tabular text-xs font-semibold text-white bg-black/55 px-2.5 py-1 rounded">
                    {featuredItem.score}% Critics
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                    <span
                      className="inline-block w-3 h-0.5 rounded-full"
                      style={{ backgroundColor: platColor }}
                    />
                    <span>{featuredItem.platform}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredItem.sub}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredItem.genres.join(", ")}</span>
                  </div>

                  <h2 className="mt-1.5 font-display font-bold text-2xl text-white tracking-tight">
                    {featuredItem.title}
                  </h2>

                  <p className="mt-1.5 text-sm text-white/80 line-clamp-2 max-w-[44ch]">
                    {featuredItem.description}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF7EB1] group-hover:translate-x-0.5 transition-transform">
                    Inspect details &amp; trailer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Full-Width 4-Column Operational Metrics Strip */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#13161F] divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 dark:divide-neutral-800">
          <a
            href="#top-rated"
            className="p-4 sm:p-5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="font-mono-tabular text-2xl sm:text-3xl font-semibold text-[#14161C] dark:text-white">
              {totalTop}
            </div>
            <div className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Top-Rated Titles · 9 US Streamers
            </div>
          </a>

          <a
            href="#new-releases"
            className="p-4 sm:p-5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="font-mono-tabular text-2xl sm:text-3xl font-semibold text-[#14161C] dark:text-white">
              {totalNew}
            </div>
            <div className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              November Releases · Dated Schedule
            </div>
          </a>

          <button
            type="button"
            onClick={onFilterAcclaimed}
            className="p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="font-mono-tabular text-2xl sm:text-3xl font-semibold text-[#C81E66] dark:text-[#FF5C9A]">
              {highScoreCount}
            </div>
            <div className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Certified 95%+ Picks · Click to filter
            </div>
          </button>

          <a
            href="#watchlist"
            className="p-4 sm:p-5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="font-mono-tabular text-2xl sm:text-3xl font-semibold text-[#14161C] dark:text-white">
              {watchlistCount}
            </div>
            <div className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              In Your Watchlist · {watchedCount} watched
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
