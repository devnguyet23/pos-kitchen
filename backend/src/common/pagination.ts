/**
 * Pagination utilities for high-scale queries
 * Supports both offset-based and cursor-based pagination
 */

export interface PaginationParams {
                    page?: number;
                    limit?: number;
                    cursor?: number;
}

export interface PaginationMeta {
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                    hasMore: boolean;
                    hasPrevious: boolean;
}

export interface PaginatedResult<T> {
                    data: T[];
                    pagination: PaginationMeta;
}

export interface CursorPaginationMeta {
                    nextCursor: number | null;
                    hasMore: boolean;
                    limit: number;
}

export interface CursorPaginatedResult<T> {
                    data: T[];
                    pagination: CursorPaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(params: PaginationParams): {
                    skip: number;
                    take: number;
                    page: number;
                    limit: number;
} {
                    const page = Math.max(1, params.page || 1);
                    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit || DEFAULT_PAGE_SIZE));
                    const skip = (page - 1) * limit;

                    return { skip, take: limit, page, limit };
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
                    total: number,
                    page: number,
                    limit: number,
): PaginationMeta {
                    const totalPages = Math.ceil(total / limit);

                    return {
                                        total,
                                        page,
                                        limit,
                                        totalPages,
                                        hasMore: page < totalPages,
                                        hasPrevious: page > 1,
                    };
}

/**
 * Build cursor pagination metadata
 */
export function buildCursorMeta<T extends { id: number }>(
                    data: T[],
                    limit: number,
): CursorPaginationMeta {
                    const hasMore = data.length === limit + 1;
                    const items = hasMore ? data.slice(0, -1) : data;
                    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

                    return {
                                        nextCursor,
                                        hasMore,
                                        limit,
                    };
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
                    data: T[],
                    total: number,
                    page: number,
                    limit: number,
): PaginatedResult<T> {
                    return {
                                        data,
                                        pagination: buildPaginationMeta(total, page, limit),
                    };
}

/**
 * Helper to create cursor-paginated response
 */
export function createCursorPaginatedResponse<T extends { id: number }>(
                    data: T[],
                    limit: number,
): CursorPaginatedResult<T> {
                    const meta = buildCursorMeta(data, limit);
                    const items = meta.hasMore ? data.slice(0, -1) : data;

                    return {
                                        data: items,
                                        pagination: meta,
                    };
}
