"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const client = require("prom-client");
let MetricsService = class MetricsService {
    constructor() {
        this.registry = new client.Registry();
        client.collectDefaultMetrics({ register: this.registry });
        this.httpRequestDuration = new client.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
            registers: [this.registry],
        });
        this.httpRequestTotal = new client.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry],
        });
        this.activeConnections = new client.Gauge({
            name: 'active_connections',
            help: 'Number of active connections',
            registers: [this.registry],
        });
        this.orderTotal = new client.Counter({
            name: 'orders_total',
            help: 'Total number of orders created',
            labelNames: ['status', 'store_id'],
            registers: [this.registry],
        });
        this.cacheHitRatio = new client.Gauge({
            name: 'cache_hit_ratio',
            help: 'Cache hit ratio',
            registers: [this.registry],
        });
    }
    onModuleInit() {
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    getContentType() {
        return this.registry.contentType;
    }
    recordHttpRequest(method, route, statusCode, duration) {
        this.httpRequestDuration.observe({ method, route, status_code: String(statusCode) }, duration);
        this.httpRequestTotal.inc({ method, route, status_code: String(statusCode) });
    }
    recordOrder(status, storeId) {
        this.orderTotal.inc({ status, store_id: storeId });
    }
    updateCacheHitRatio(ratio) {
        this.cacheHitRatio.set(ratio);
    }
    updateActiveConnections(count) {
        this.activeConnections.set(count);
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map