interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  items: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    nextPage: number | null;
    prevPage: number | null;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}

export async function paginate<T>(
  dbQuery: () => Promise<T[]>,
  countQuery: () => Promise<{ count: number }[]>,
  params: PaginationParams,
): Promise<PaginatedResult<T>> {
  const { page, limit } = params;

  // Ensure valid pagination parameters
  const currentPage = page > 0 ? page : 1;
  const size = limit > 0 ? limit : 10;

  // Get total items count
  const [totalItems] = await countQuery();
  const totalPages = Math.ceil(totalItems.count / size);

  // Get paginated items
  // const offset = (currentPage - 1) * size;
  const items = await dbQuery();
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const prevPage = hasPrevPage ? currentPage - 1 : null;
  const nextPage = hasNextPage ? currentPage + 1 : null;

  return {
    items,
    pagination: {
      totalItems: totalItems.count,
      totalPages,
      currentPage,
      limit: size,
      nextPage,
      prevPage,
      hasNextPage,
      hasPrevPage,
    },
  };
}
