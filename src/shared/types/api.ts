export interface ApiResponse<T> {
  data?: T;
  pagination?: Pagination;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  total: number;
}

export function extractPagination(
  payload: unknown,
  params: { page?: number; pageSize?: number } | undefined,
  itemsCount: number
): Pagination {
  const reqPage = Math.max(1, Number(params?.page ?? 1) || 1);
  const reqPageSize = Math.max(1, Number(params?.pageSize ?? (itemsCount || 25)) || 25);

  if (typeof payload === "object" && payload !== null) {
    const p = payload as Record<string, unknown>;
    let pagObj: Record<string, unknown> | undefined;

    if (typeof p.pagination === "object" && p.pagination !== null) {
      pagObj = p.pagination as Record<string, unknown>;
    } else if (typeof p.meta === "object" && p.meta !== null) {
      const meta = p.meta as Record<string, unknown>;
      if (typeof meta.pagination === "object" && meta.pagination !== null) {
        pagObj = meta.pagination as Record<string, unknown>;
      }
    }

    if (pagObj) {
      const totalItems = Number(pagObj.totalItems ?? pagObj.total ?? itemsCount);
      const totalPages = Number(pagObj.totalPages ?? Math.ceil(totalItems / reqPageSize));

      return {
        page: Number(pagObj.page ?? reqPage),
        pageSize: Number(pagObj.pageSize ?? reqPageSize),
        totalItems,
        totalPages,
        hasNext: Boolean(pagObj.hasNext ?? reqPage < totalPages),
        hasPrevious: Boolean(pagObj.hasPrevious ?? reqPage > 1),
        total: totalItems,
      };
    }
  }

  const fallbackTotal = (reqPage - 1) * reqPageSize + itemsCount;
  const totalPages = Math.ceil(fallbackTotal / reqPageSize);

  return {
    page: reqPage,
    pageSize: reqPageSize,
    totalItems: fallbackTotal,
    totalPages,
    hasNext: false,
    hasPrevious: reqPage > 1,
    total: fallbackTotal,
  };
}
