import React from "react";
import { ArrowUpRight } from "lucide-react";
import { CURATED_COLLECTIONS, CuratedCollection } from "../utils/streamHelpers";

interface CollectionsSectionProps {
  onApplyCollection: (col: CuratedCollection) => void;
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  onApplyCollection,
}) => {
  return (
    <section
      id="collections"
      className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-[#14161C] dark:text-[#ECEEF4]">
            Curated Collections
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Select a thematic lens to filter the catalog immediately.
          </p>
        </div>
        <span className="font-mono-tabular text-xs text-neutral-500 dark:text-neutral-400">
          3 Editorial Guides
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {CURATED_COLLECTIONS.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => onApplyCollection(col)}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] text-left transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
              <img
                src={col.image}
                alt={col.imageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <span className="font-mono-tabular uppercase tracking-wider">
                  {col.kicker}
                </span>
                <span className="font-mono-tabular font-semibold">
                  {col.countLabel}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-lg text-[#14161C] dark:text-white group-hover:text-[#C81E66] dark:group-hover:text-[#FF5C9A] transition-colors">
                    {col.title}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#C81E66] dark:group-hover:text-[#FF5C9A] shrink-0 transition-colors" />
                </div>
                <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {col.subtitle}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
