import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare enum EventType {
    ORDER_CREATED = "order.created",
    ORDER_UPDATED = "order.updated",
    ORDER_COMPLETED = "order.completed",
    ORDER_CANCELLED = "order.cancelled",
    INVOICE_CREATED = "invoice.created",
    INVOICE_PAID = "invoice.paid",
    USER_CREATED = "user.created",
    USER_UPDATED = "user.updated",
    NOTIFICATION_SEND = "notification.send",
    EMAIL_SEND = "email.send",
    STOCK_LOW = "stock.low",
    STOCK_UPDATED = "stock.updated"
}
export interface EventPayload<T = unknown> {
    id: string;
    type: EventType;
    timestamp: Date;
    source: string;
    data: T;
    metadata?: Record<string, unknown>;
}
export declare class EventBusService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private connection;
    private channel;
    private readonly EXCHANGE_NAME;
    private readonly EXCHANGE_TYPE;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private reconnect;
    private disconnect;
    publish<T>(type: EventType, data: T, source?: string): Promise<void>;
    subscribe(pattern: string, queueName: string, handler: (event: EventPayload) => Promise<void>): Promise<void>;
    private getRabbitMQUrl;
    private generateEventId;
    healthCheck(): Promise<{
        connected: boolean;
        status: string;
    }>;
}
