/**
 * Shared Service Communication Types
 */

// Service names for inter-service communication
export enum ServiceName {
                    GATEWAY = 'gateway',
                    AUTH = 'auth-service',
                    POS = 'pos-service',
                    REPORT = 'report-service',
                    NOTIFICATION = 'notification-service',
}

// Service URLs (from environment)
export interface ServiceConfig {
                    name: ServiceName;
                    url: string;
                    healthEndpoint: string;
}

// Inter-service request headers
export interface ServiceRequestHeaders {
                    'x-request-id': string;
                    'x-service-name': string;
                    'x-user-id'?: string;
                    'x-chain-id'?: string;
                    'x-store-id'?: string;
                    authorization?: string;
}

// Event types for async communication
export enum EventType {
                    // User events
                    USER_CREATED = 'user.created',
                    USER_UPDATED = 'user.updated',
                    USER_DELETED = 'user.deleted',

                    // Order events
                    ORDER_CREATED = 'order.created',
                    ORDER_UPDATED = 'order.updated',
                    ORDER_COMPLETED = 'order.completed',
                    ORDER_CANCELLED = 'order.cancelled',

                    // Invoice events
                    INVOICE_CREATED = 'invoice.created',
                    INVOICE_PAID = 'invoice.paid',

                    // Inventory events
                    STOCK_LOW = 'stock.low',
                    STOCK_UPDATED = 'stock.updated',
}

export interface ServiceEvent<T = unknown> {
                    id: string;
                    type: EventType;
                    source: ServiceName;
                    timestamp: Date;
                    data: T;
                    metadata?: Record<string, unknown>;
}
