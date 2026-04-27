"use client";

type DiscoveryControlsProps = {
  sortBy: string;
  setSortBy: (value: string) => void;
  minRating: string;
  setMinRating: (value: string) => void;
  maxRuntime: string;
  setMaxRuntime: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
};

export default function DiscoveryControls({
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
  maxRuntime,
  setMaxRuntime,
  year,
  setYear,
}: DiscoveryControlsProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 md:grid-cols-4">
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

      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Min rating
        <input
          value={minRating}
          onChange={(event) => setMinRating(event.target.value)}
          placeholder="7"
          type="number"
          min="0"
          max="10"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </label>

      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Max runtime
        <input
          value={maxRuntime}
          onChange={(event) => setMaxRuntime(event.target.value)}
          placeholder="120"
          type="number"
          min="1"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </label>

      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Year
        <input
          value={year}
          onChange={(event) => setYear(event.target.value)}
          placeholder="2024"
          type="number"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </label>
    </div>
  );
}
