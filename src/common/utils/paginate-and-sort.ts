import type { PaginatedResult } from '../../types';

export type SortOrder = 'asc' | 'desc';

export type SortOptions<T> = {
  sortBy?: string;
  order?: SortOrder;
  allowedSortKeys: ReadonlyArray<keyof T & string>;
  defaultSortBy: keyof T & string;
};

export type PaginateSortOptions<T> = SortOptions<T> & {
  page: number;
  limit: number;
};

export const normalizePageLimit = (
  page?: number,
  limit?: number,
): { page: number; limit: number } => ({
  page: page != null && page >= 1 ? page : 1,
  limit: limit != null && limit >= 1 ? Math.min(limit, 100) : 10,
});

const compareValues = (a: unknown, b: unknown, dir: number): number => {
  if (a === b) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a < b ? -dir : dir;
  }
  return (
    String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }) * dir
  );
};

export const sortItems = <T extends Record<string, unknown>>(
  items: Array<T>,
  options: SortOptions<T>,
): Array<T> => {
  const order: SortOrder = options.order === 'desc' ? 'desc' : 'asc';
  const dir = order === 'desc' ? -1 : 1;
  const key =
    options.sortBy != null &&
    options.allowedSortKeys.includes(options.sortBy as keyof T & string)
      ? (options.sortBy as keyof T & string)
      : options.defaultSortBy;

  return [...items].sort((left, right) =>
    compareValues(left[key], right[key], dir),
  );
};

/** Use when client sent `page` and/or `limit` (paginated list response). */
export const wantsPagination = (query: {
  page?: number;
  limit?: number;
}): boolean => query.page != null || query.limit != null;

/** Use when list should be sorted (pagination or explicit sort query). */
export const wantsSort = (query: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: SortOrder;
}): boolean =>
  wantsPagination(query) || query.sortBy != null || query.order != null;

export const paginateAndSort = <T extends Record<string, unknown>>(
  items: Array<T>,
  options: PaginateSortOptions<T>,
): PaginatedResult<T> => {
  const sorted = sortItems(items, options);
  const { page, limit } = normalizePageLimit(options.page, options.limit);
  const total = sorted.length;
  const start = (page - 1) * limit;
  const data = sorted.slice(start, start + limit);

  return { total, page, limit, data };
};

/**
 * Template tests expect a plain array when `page`/`limit` are omitted.
 * Paginated `{ total, page, limit, data }` when `page` and/or `limit` are sent.
 */
export const toListOrPaginated = <T extends Record<string, unknown>>(
  items: Array<T>,
  query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: SortOrder;
  },
  sortOpts: SortOptions<T>,
): Array<T> | PaginatedResult<T> => {
  const list = wantsSort(query) ? sortItems(items, sortOpts) : items;
  if (!wantsPagination(query)) {
    return list;
  }
  const { page, limit } = normalizePageLimit(query.page, query.limit);
  const total = list.length;
  const start = (page - 1) * limit;
  return { total, page, limit, data: list.slice(start, start + limit) };
};
