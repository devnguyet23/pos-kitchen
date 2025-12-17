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
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare function parsePaginationParams(params: PaginationParams): {
    skip: number;
    take: number;
    page: number;
    limit: number;
};
export declare function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta;
export declare function buildCursorMeta<T extends {
    id: number;
}>(data: T[], limit: number): CursorPaginationMeta;
export declare function createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
export declare function createCursorPaginatedResponse<T extends {
    id: number;
}>(data: T[], limit: number): CursorPaginatedResult<T>;
