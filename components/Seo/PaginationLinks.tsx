import Link from "next/link";

export default function PaginationLinks({ page, totalPages, path }: { page: number; totalPages: number; path: string }) {
  const href = (value: number) => value === 1 ? path : `${path}?page=${value}`;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-800">
      {page > 1 ? <Link rel="prev" href={href(page - 1)} className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700">Previous</Link> : <span />}
      <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
      {page < totalPages ? <Link rel="next" href={href(page + 1)} className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700">Next</Link> : <span />}
    </nav>
  );
}
