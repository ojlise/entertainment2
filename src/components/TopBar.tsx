import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface TopBarProps {
  watchlistCount: number;
  onOpenPicker: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  watchlistCount,
  onOpenPicker,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "#top-rated", label: "Top Rated" },
    { href: "#new-releases", label: "New Releases" },
    { href: "#collections", label: "Collections" },
    {
      href: "#watchlist",
      label: watchlistCount > 0 ? `Watchlist (${watchlistCount})` : "Watchlist",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F4F5F8]/95 dark:bg-[#0B0D12]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title */}
        <a
          href="#top"
          className="font-display font-extrabold text-xl tracking-tight text-[#14161C] dark:text-[#ECEEF4] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C81E66]"
        >
          Stream Guide
        </a>

        {/* Zone 2: 4 Single-line Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 hover:text-[#14161C] dark:hover:text-white underline-offset-4 hover:underline decoration-[#C81E66] dark:decoration-[#FF5C9A] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPicker}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#C81E66] hover:bg-[#AD1757] dark:bg-[#FF5C9A] dark:hover:bg-[#FF73AA] text-white dark:text-[#0B0D12] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Tonight&apos;s Pick
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#13161F] px-4 py-3 flex flex-col gap-1"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-2 text-sm font-medium text-neutral-800 dark:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
