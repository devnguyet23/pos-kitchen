"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = void 0;
exports.parsePaginationParams = parsePaginationParams;
exports.buildPaginationMeta = buildPaginationMeta;
exports.buildCursorMeta = buildCursorMeta;
exports.createPaginatedResponse = createPaginatedResponse;
exports.createCursorPaginatedResponse = createCursorPaginatedResponse;
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
function parsePaginationParams(params) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(exports.MAX_PAGE_SIZE, Math.max(1, params.limit || exports.DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;
    return { skip, take: limit, page, limit };
}
function buildPaginationMeta(total, page, limit) {
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
function buildCursorMeta(data, limit) {
    var _a;
    const hasMore = data.length === limit + 1;
    const items = hasMore ? data.slice(0, -1) : data;
    const nextCursor = hasMore ? (_a = items[items.length - 1]) === null || _a === void 0 ? void 0 : _a.id : null;
    return {
        nextCursor,
        hasMore,
        limit,
    };
}
function createPaginatedResponse(data, total, page, limit) {
    return {
        data,
        pagination: buildPaginationMeta(total, page, limit),
    };
}
function createCursorPaginatedResponse(data, limit) {
    const meta = buildCursorMeta(data, limit);
    const items = meta.hasMore ? data.slice(0, -1) : data;
    return {
        data: items,
        pagination: meta,
    };
}
//# sourceMappingURL=pagination.js.map