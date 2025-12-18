/**
 * Shared API Response Types for POS Microservices
 */

export interface PaginationMeta {
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                    hasMore: boolean;
                    hasPrevious: boolean;
}

export interface ApiResponse<T = unknown> {
                    success: boolean;
                    data?: T;
                    error?: string;
                    message?: string;
                    pagination?: PaginationMeta;
                    timestamp?: string;
}

export interface ApiError {
                    statusCode: number;
                    message: string;
                    error?: string;
                    details?: Record<string, unknown>;
}

export interface PaginatedRequest {
                    page?: number;
                    limit?: number;
                    sortBy?: string;
                    sortOrder?: 'asc' | 'desc';
                    search?: string;
}

export interface HealthCheckResponse {
                    status: 'ok' | 'error';
                    service: string;
                    version: string;
                    uptime: number;
                    timestamp: string;
                    dependencies?: {
                                        database?: 'connected' | 'disconnected';
                                        redis?: 'connected' | 'disconnected';
                    };
}
