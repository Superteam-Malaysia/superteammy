"use client";

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer shrink-0 px-4 md:py-2.5 py-2 md:rounded-lg rounded-md md:text-sm text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
        isActive
          ? "bg-solana-purple text-white"
          : "bg-surface/50 text-muted hover:text-white hover:bg-surface border border-white/5"
      }`}
    >
      {label}
    </button>
  );
}

type BorneoDirectoryFiltersProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  filterOptions: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
};

export function BorneoDirectoryFilters({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filterOptions,
  activeFilter,
  onFilterChange,
}: BorneoDirectoryFiltersProps) {
  return (
    <div className="md:space-y-6 space-y-4">
      <div className="relative flex-1 min-w-0">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-5 md:py-3.5 py-2 md:rounded-xl rounded-md bg-surface/50 border border-white/5 text-white placeholder-muted-dark focus:outline-none focus:border-solana-purple/30 focus:ring-1 focus:ring-solana-purple/20 transition-all text-sm pr-10"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 md:w-5 md:h-5 w-4 h-4 text-muted-dark pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            isActive={activeFilter === filter}
            onClick={() => onFilterChange(filter)}
          />
        ))}
      </div>
    </div>
  );
}

export function DirectorySectionTabs({
  tab,
  onTabChange,
}: {
  tab: "teams" | "mentors";
  onTabChange: (tab: "teams" | "mentors") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Directory sections">
      <FilterChip label="Teams" isActive={tab === "teams"} onClick={() => onTabChange("teams")} />
      <FilterChip label="Mentors" isActive={tab === "mentors"} onClick={() => onTabChange("mentors")} />
    </div>
  );
}
