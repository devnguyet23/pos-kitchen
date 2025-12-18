import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';

/**
 * Event types for the message queue
 */
export enum EventType {
                    // Order events
                    ORDER_CREATED = 'order.created',
                    ORDER_UPDATED = 'order.updated',
                    ORDER_COMPLETED = 'order.completed',
                    ORDER_CANCELLED = 'order.cancelled',

                    // Invoice events  
                    INVOICE_CREATED = 'invoice.created',
                    INVOICE_PAID = 'invoice.paid',

                    // User events
                    USER_CREATED = 'user.created',
                    USER_UPDATED = 'user.updated',

                    // Notification events
                    NOTIFICATION_SEND = 'notification.send',
                    EMAIL_SEND = 'email.send',

                    // Inventory events
                    STOCK_LOW = 'stock.low',
                    STOCK_UPDATED = 'stock.updated',
}

/**
 * Event payload interface
 */
export interface EventPayload<T = unknown> {
                    id: string;
                    type: EventType;
                    timestamp: Date;
                    source: string;
                    data: T;
                    metadata?: Record<string, unknown>;
}

/**
 * EventBus Service - RabbitMQ message queue integration
 * Handles publishing and consuming events across microservices
 */
@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
                    private readonly logger = new Logger(EventBusService.name);
                    private connection: any = null;
                    private channel: any = null;

                    // Exchange and queue configuration
                    private readonly EXCHANGE_NAME = 'pos_events';
                    private readonly EXCHANGE_TYPE = 'topic';

                    async onModuleInit() {
                                        await this.connect();
                    }

                    async onModuleDestroy() {
                                        await this.disconnect();
                    }

                    /**
                     * Connect to RabbitMQ
                     */
                    private async connect(): Promise<void> {
                                        try {
                                                            const url = this.getRabbitMQUrl();
                                                            this.connection = await amqplib.connect(url);
                                                            this.channel = await this.connection.createChannel();

                                                            // Setup exchange
                                                            await this.channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
                                                                                durable: true,
                                                            });

                                                            this.logger.log('✅ Connected to RabbitMQ');

                                                            // Handle connection errors
                                                            this.connection.on('error', (err) => {
                                                                                this.logger.error('RabbitMQ connection error:', err);
                                                                                this.reconnect();
                                                            });

                                                            this.connection.on('close', () => {
                                                                                this.logger.warn('RabbitMQ connection closed, reconnecting...');
                                                                                this.reconnect();
                                                            });
                                        } catch (error) {
                                                            this.logger.error('Failed to connect to RabbitMQ:', error);
                                                            // Retry connection after delay
                                                            setTimeout(() => this.connect(), 5000);
                                        }
                    }

                    /**
                     * Reconnect to RabbitMQ
                     */
                    private async reconnect(): Promise<void> {
                                        this.connection = null;
                                        this.channel = null;
                                        await this.connect();
                    }

                    /**
                     * Disconnect from RabbitMQ
                     */
                    private async disconnect(): Promise<void> {
                                        try {
                                                            if (this.channel) {
                                                                                await this.channel.close();
                                                            }
                                                            if (this.connection) {
                                                                                await this.connection.close();
                                                            }
                                                            this.logger.log('Disconnected from RabbitMQ');
                                        } catch (error) {
                                                            this.logger.error('Error disconnecting from RabbitMQ:', error);
                                        }
                    }

                    /**
                     * Publish an event to the message queue
                     */
                    async publish<T>(type: EventType, data: T, source = 'backend'): Promise<void> {
                                        if (!this.channel) {
                                                            this.logger.warn('RabbitMQ not connected, event not published');
                                                            return;
                                        }

                                        const event: EventPayload<T> = {
                                                            id: this.generateEventId(),
                                                            type,
                                                            timestamp: new Date(),
                                                            source,
                                                            data,
                                        };

                                        try {
                                                            const routingKey = type; // Use event type as routing key
                                                            const message = Buffer.from(JSON.stringify(event));

                                                            this.channel.publish(this.EXCHANGE_NAME, routingKey, message, {
                                                                                persistent: true,
                                                                                contentType: 'application/json',
                                                            });

                                                            this.logger.debug(`Published event: ${type}`);
                                        } catch (error) {
                                                            this.logger.error(`Failed to publish event ${type}:`, error);
                                        }
                    }

                    /**
                     * Subscribe to events with a specific routing pattern
                     */
                    async subscribe(
                                        pattern: string,
                                        queueName: string,
                                        handler: (event: EventPayload) => Promise<void>,
                    ): Promise<void> {
                                        if (!this.channel) {
                                                            this.logger.warn('RabbitMQ not connected, cannot subscribe');
                                                            return;
                                        }

                                        try {
                                                            // Create queue
                                                            const queue = await this.channel.assertQueue(queueName, {
                                                                                durable: true,
                                                                                arguments: {
                                                                                                    'x-dead-letter-exchange': `${this.EXCHANGE_NAME}.dlx`,
                                                                                },
                                                            });

                                                            // Bind queue to exchange with pattern
                                                            await this.channel.bindQueue(queue.queue, this.EXCHANGE_NAME, pattern);

                                                            // Consume messages
                                                            await this.channel.consume(queue.queue, async (msg) => {
                                                                                if (!msg) return;

                                                                                try {
                                                                                                    const event = JSON.parse(msg.content.toString()) as EventPayload;
                                                                                                    await handler(event);
                                                                                                    this.channel?.ack(msg);
                                                                                } catch (error) {
                                                                                                    this.logger.error(`Error processing message:`, error);
                                                                                                    // Reject and don't requeue (send to DLX)
                                                                                                    this.channel?.nack(msg, false, false);
                                                                                }
                                                            });

                                                            this.logger.log(`Subscribed to pattern: ${pattern} (queue: ${queueName})`);
                                        } catch (error) {
                                                            this.logger.error(`Failed to subscribe to ${pattern}:`, error);
                                        }
                    }

                    /**
                     * Get RabbitMQ connection URL
                     */
                    private getRabbitMQUrl(): string {
                                        const host = process.env.RABBITMQ_HOST || 'localhost';
                                        const port = process.env.RABBITMQ_PORT || '5672';
                                        const user = process.env.RABBITMQ_USER || 'pos_user';
                                        const pass = process.env.RABBITMQ_PASS || 'pos_password';
                                        const vhost = process.env.RABBITMQ_VHOST || 'pos_vhost';

                                        return `amqp://${user}:${pass}@${host}:${port}/${vhost}`;
                    }

                    /**
                     * Generate unique event ID
                     */
                    private generateEventId(): string {
                                        return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    }

                    /**
                     * Health check
                     */
                    async healthCheck(): Promise<{ connected: boolean; status: string }> {
                                        return {
                                                            connected: this.channel !== null,
                                                            status: this.channel ? 'connected' : 'disconnected',
                                        };
                    }
}
