import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

/**
 * MetricsService - Prometheus metrics collection
 * Exposes application metrics for monitoring
 */
@Injectable()
export class MetricsService implements OnModuleInit {
                    private readonly registry: client.Registry;

                    // Custom metrics
                    private readonly httpRequestDuration: client.Histogram;
                    private readonly httpRequestTotal: client.Counter;
                    private readonly activeConnections: client.Gauge;
                    private readonly orderTotal: client.Counter;
                    private readonly cacheHitRatio: client.Gauge;

                    constructor() {
                                        this.registry = new client.Registry();

                                        // Add default metrics (CPU, memory, etc.)
                                        client.collectDefaultMetrics({ register: this.registry });

                                        // HTTP Request Duration Histogram
                                        this.httpRequestDuration = new client.Histogram({
                                                            name: 'http_request_duration_seconds',
                                                            help: 'Duration of HTTP requests in seconds',
                                                            labelNames: ['method', 'route', 'status_code'],
                                                            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
                                                            registers: [this.registry],
                                        });

                                        // HTTP Request Counter
                                        this.httpRequestTotal = new client.Counter({
                                                            name: 'http_requests_total',
                                                            help: 'Total number of HTTP requests',
                                                            labelNames: ['method', 'route', 'status_code'],
                                                            registers: [this.registry],
                                        });

                                        // Active Connections Gauge
                                        this.activeConnections = new client.Gauge({
                                                            name: 'active_connections',
                                                            help: 'Number of active connections',
                                                            registers: [this.registry],
                                        });

                                        // Order Counter
                                        this.orderTotal = new client.Counter({
                                                            name: 'orders_total',
                                                            help: 'Total number of orders created',
                                                            labelNames: ['status', 'store_id'],
                                                            registers: [this.registry],
                                        });

                                        // Cache Hit Ratio
                                        this.cacheHitRatio = new client.Gauge({
                                                            name: 'cache_hit_ratio',
                                                            help: 'Cache hit ratio',
                                                            registers: [this.registry],
                                        });
                    }

                    onModuleInit() {
                                        // Initialize any startup metrics
                    }

                    /**
                     * Get all metrics for Prometheus scraping
                     */
                    async getMetrics(): Promise<string> {
                                        return this.registry.metrics();
                    }

                    /**
                     * Get content type for metrics
                     */
                    getContentType(): string {
                                        return this.registry.contentType;
                    }

                    /**
                     * Record HTTP request metrics
                     */
                    recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
                                        this.httpRequestDuration.observe(
                                                            { method, route, status_code: String(statusCode) },
                                                            duration
                                        );
                                        this.httpRequestTotal.inc({ method, route, status_code: String(statusCode) });
                    }

                    /**
                     * Record order creation
                     */
                    recordOrder(status: string, storeId: string): void {
                                        this.orderTotal.inc({ status, store_id: storeId });
                    }

                    /**
                     * Update cache hit ratio
                     */
                    updateCacheHitRatio(ratio: number): void {
                                        this.cacheHitRatio.set(ratio);
                    }

                    /**
                     * Update active connections
                     */
                    updateActiveConnections(count: number): void {
                                        this.activeConnections.set(count);
                    }
}
