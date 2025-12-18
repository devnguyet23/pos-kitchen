"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = exports.EventType = void 0;
const common_1 = require("@nestjs/common");
const amqplib = require("amqplib");
var EventType;
(function (EventType) {
    EventType["ORDER_CREATED"] = "order.created";
    EventType["ORDER_UPDATED"] = "order.updated";
    EventType["ORDER_COMPLETED"] = "order.completed";
    EventType["ORDER_CANCELLED"] = "order.cancelled";
    EventType["INVOICE_CREATED"] = "invoice.created";
    EventType["INVOICE_PAID"] = "invoice.paid";
    EventType["USER_CREATED"] = "user.created";
    EventType["USER_UPDATED"] = "user.updated";
    EventType["NOTIFICATION_SEND"] = "notification.send";
    EventType["EMAIL_SEND"] = "email.send";
    EventType["STOCK_LOW"] = "stock.low";
    EventType["STOCK_UPDATED"] = "stock.updated";
})(EventType || (exports.EventType = EventType = {}));
let EventBusService = EventBusService_1 = class EventBusService {
    constructor() {
        this.logger = new common_1.Logger(EventBusService_1.name);
        this.connection = null;
        this.channel = null;
        this.EXCHANGE_NAME = 'pos_events';
        this.EXCHANGE_TYPE = 'topic';
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            const url = this.getRabbitMQUrl();
            this.connection = await amqplib.connect(url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
                durable: true,
            });
            this.logger.log('✅ Connected to RabbitMQ');
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error:', err);
                this.reconnect();
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed, reconnecting...');
                this.reconnect();
            });
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ:', error);
            setTimeout(() => this.connect(), 5000);
        }
    }
    async reconnect() {
        this.connection = null;
        this.channel = null;
        await this.connect();
    }
    async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.log('Disconnected from RabbitMQ');
        }
        catch (error) {
            this.logger.error('Error disconnecting from RabbitMQ:', error);
        }
    }
    async publish(type, data, source = 'backend') {
        if (!this.channel) {
            this.logger.warn('RabbitMQ not connected, event not published');
            return;
        }
        const event = {
            id: this.generateEventId(),
            type,
            timestamp: new Date(),
            source,
            data,
        };
        try {
            const routingKey = type;
            const message = Buffer.from(JSON.stringify(event));
            this.channel.publish(this.EXCHANGE_NAME, routingKey, message, {
                persistent: true,
                contentType: 'application/json',
            });
            this.logger.debug(`Published event: ${type}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish event ${type}:`, error);
        }
    }
    async subscribe(pattern, queueName, handler) {
        if (!this.channel) {
            this.logger.warn('RabbitMQ not connected, cannot subscribe');
            return;
        }
        try {
            const queue = await this.channel.assertQueue(queueName, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': `${this.EXCHANGE_NAME}.dlx`,
                },
            });
            await this.channel.bindQueue(queue.queue, this.EXCHANGE_NAME, pattern);
            await this.channel.consume(queue.queue, async (msg) => {
                var _a, _b;
                if (!msg)
                    return;
                try {
                    const event = JSON.parse(msg.content.toString());
                    await handler(event);
                    (_a = this.channel) === null || _a === void 0 ? void 0 : _a.ack(msg);
                }
                catch (error) {
                    this.logger.error(`Error processing message:`, error);
                    (_b = this.channel) === null || _b === void 0 ? void 0 : _b.nack(msg, false, false);
                }
            });
            this.logger.log(`Subscribed to pattern: ${pattern} (queue: ${queueName})`);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to ${pattern}:`, error);
        }
    }
    getRabbitMQUrl() {
        const host = process.env.RABBITMQ_HOST || 'localhost';
        const port = process.env.RABBITMQ_PORT || '5672';
        const user = process.env.RABBITMQ_USER || 'pos_user';
        const pass = process.env.RABBITMQ_PASS || 'pos_password';
        const vhost = process.env.RABBITMQ_VHOST || 'pos_vhost';
        return `amqp://${user}:${pass}@${host}:${port}/${vhost}`;
    }
    generateEventId() {
        return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async healthCheck() {
        return {
            connected: this.channel !== null,
            status: this.channel ? 'connected' : 'disconnected',
        };
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)()
], EventBusService);
//# sourceMappingURL=event-bus.service.js.map