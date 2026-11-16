import Link from "next/link";

export default function PaginationLinks({ page, totalPages, path }: { page: number; totalPages: number; path: string }) {
  const href = (value: number) => value === 1 ? path : `${path}?page=${value}`;
  const linkClassName = "inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-800">
      {page > 1 ? <Link rel="prev" href={href(page - 1)} className={linkClassName}>Previous</Link> : <span />}
      <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
      {page < totalPages ? <Link rel="next" href={href(page + 1)} className={linkClassName}>Next</Link> : <span />}
    </nav>
  );
}
