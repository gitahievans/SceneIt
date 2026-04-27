"use client";

type DiscoveryControlsProps = {
  sortBy: string;
  setSortBy: (value: string) => void;
  ratingMin: string;
  setRatingMin: (value: string) => void;
  ratingMax: string;
  setRatingMax: (value: string) => void;
  runtimeMin: string;
  setRuntimeMin: (value: string) => void;
  runtimeMax: string;
  setRuntimeMax: (value: string) => void;
  yearMin: string;
  setYearMin: (value: string) => void;
  yearMax: string;
  setYearMax: (value: string) => void;
};

export default function DiscoveryControls({
  sortBy,
  setSortBy,
  ratingMin,
  setRatingMin,
  ratingMax,
  setRatingMax,
  runtimeMin,
  setRuntimeMin,
  runtimeMax,
  setRuntimeMax,
  yearMin,
  setYearMin,
  yearMax,
  setYearMax,
}: DiscoveryControlsProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 lg:grid-cols-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Sort
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="popularity.desc">Most popular</option>
          <option value="vote_average.desc">Highest rated</option>
          <option value="primary_release_date.desc">Newest</option>
          <option value="primary_release_date.asc">Oldest</option>
        </select>
      </label>

      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Rating
        <div className="mt-1 grid grid-cols-2 gap-2">
          <input
            value={ratingMin}
            onChange={(event) => setRatingMin(event.target.value)}
            placeholder="Min"
            type="number"
            min="0"
            max="10"
            step="0.1"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <input
            value={ratingMax}
            onChange={(event) => setRatingMax(event.target.value)}
            placeholder="Max"
            type="number"
            min="0"
            max="10"
            step="0.1"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Runtime
        <div className="mt-1 grid grid-cols-2 gap-2">
          <input
            value={runtimeMin}
            onChange={(event) => setRuntimeMin(event.target.value)}
            placeholder="Min"
            type="number"
            min="1"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <input
            value={runtimeMax}
            onChange={(event) => setRuntimeMax(event.target.value)}
            placeholder="Max"
            type="number"
            min="1"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Year
        <div className="mt-1 grid grid-cols-2 gap-2">
          <input
            value={yearMin}
            onChange={(event) => setYearMin(event.target.value)}
            placeholder="From"
            type="number"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <input
            value={yearMax}
            onChange={(event) => setYearMax(event.target.value)}
            placeholder="To"
            type="number"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
