import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

/**
 * Proxy Middleware - Routes requests to appropriate microservices
 */
@Injectable()
export class ProxyMiddleware implements NestMiddleware {
                    private readonly logger = new Logger(ProxyMiddleware.name);

                    // Service URLs from environment
                    private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
                    private readonly posServiceUrl = process.env.POS_SERVICE_URL || 'http://localhost:3003';
                    private readonly reportServiceUrl = process.env.REPORT_SERVICE_URL || 'http://localhost:3004';

                    // Route mappings
                    private readonly routeMap: Record<string, string> = {
                                        // Auth Service routes
                                        '/auth': this.authServiceUrl,
                                        '/users': this.authServiceUrl,
                                        '/roles': this.authServiceUrl,
                                        '/permissions': this.authServiceUrl,

                                        // POS Service routes
                                        '/products': this.posServiceUrl,
                                        '/categories': this.posServiceUrl,
                                        '/modifiers': this.posServiceUrl,
                                        '/orders': this.posServiceUrl,
                                        '/invoices': this.posServiceUrl,
                                        '/tables': this.posServiceUrl,

                                        // Report Service routes
                                        '/reports': this.reportServiceUrl,

                                        // Chain/Store management (Auth Service for now)
                                        '/chains': this.authServiceUrl,
                                        '/stores': this.authServiceUrl,
                                        '/shifts': this.posServiceUrl,
                                        '/audit-logs': this.authServiceUrl,
                    };

                    // Proxy instances cache
                    private proxyCache: Map<string, ReturnType<typeof createProxyMiddleware>> = new Map();

                    use(req: Request, res: Response, next: NextFunction) {
                                        const path = req.path;
                                        const targetUrl = this.getTargetUrl(path);

                                        if (!targetUrl) {
                                                            this.logger.warn(`No route found for: ${path}`);
                                                            return res.status(404).json({
                                                                                success: false,
                                                                                error: 'Route not found',
                                                                                path,
                                                            });
                                        }

                                        // Get or create proxy for this target
                                        let proxy = this.proxyCache.get(targetUrl);
                                        if (!proxy) {
                                                            proxy = this.createProxy(targetUrl);
                                                            this.proxyCache.set(targetUrl, proxy);
                                        }

                                        // Add request tracking headers
                                        req.headers['x-request-id'] = req.headers['x-request-id'] || this.generateRequestId();
                                        req.headers['x-gateway-time'] = new Date().toISOString();

                                        this.logger.debug(`Routing ${req.method} ${path} -> ${targetUrl}`);

                                        return proxy(req, res, next);
                    }

                    private getTargetUrl(path: string): string | null {
                                        // Find matching route prefix
                                        for (const [prefix, url] of Object.entries(this.routeMap)) {
                                                            if (path.startsWith(prefix)) {
                                                                                return url;
                                                            }
                                        }
                                        return null;
                    }

                    private createProxy(target: string): ReturnType<typeof createProxyMiddleware> {
                                        const options: Options = {
                                                            target,
                                                            changeOrigin: true,
                                                            timeout: 30000,
                                                            proxyTimeout: 30000,
                                                            onError: (err, req, res) => {
                                                                                this.logger.error(`Proxy error for ${req.url}: ${err.message}`);
                                                                                (res as Response).status(503).json({
                                                                                                    success: false,
                                                                                                    error: 'Service unavailable',
                                                                                                    message: 'The requested service is currently unavailable',
                                                                                });
                                                            },
                                                            onProxyReq: (proxyReq, req) => {
                                                                                this.logger.debug(`Proxying ${req.method} ${req.url} to ${target}`);
                                                            },
                                                            onProxyRes: (proxyRes, req) => {
                                                                                this.logger.debug(`Response from ${target}: ${proxyRes.statusCode}`);
                                                            },
                                        };

                                        return createProxyMiddleware(options);
                    }

                    private generateRequestId(): string {
                                        return `gw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    }
}
