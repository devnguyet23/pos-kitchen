"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProxyMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyMiddleware = void 0;
const common_1 = require("@nestjs/common");
const http_proxy_middleware_1 = require("http-proxy-middleware");
let ProxyMiddleware = ProxyMiddleware_1 = class ProxyMiddleware {
    constructor() {
        this.logger = new common_1.Logger(ProxyMiddleware_1.name);
        this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
        this.posServiceUrl = process.env.POS_SERVICE_URL || 'http://localhost:3003';
        this.reportServiceUrl = process.env.REPORT_SERVICE_URL || 'http://localhost:3004';
        this.routeMap = {
            '/auth': this.authServiceUrl,
            '/users': this.authServiceUrl,
            '/roles': this.authServiceUrl,
            '/permissions': this.authServiceUrl,
            '/products': this.posServiceUrl,
            '/categories': this.posServiceUrl,
            '/modifiers': this.posServiceUrl,
            '/orders': this.posServiceUrl,
            '/invoices': this.posServiceUrl,
            '/tables': this.posServiceUrl,
            '/reports': this.reportServiceUrl,
            '/chains': this.authServiceUrl,
            '/stores': this.authServiceUrl,
            '/shifts': this.posServiceUrl,
            '/audit-logs': this.authServiceUrl,
        };
        this.proxyCache = new Map();
    }
    use(req, res, next) {
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
        let proxy = this.proxyCache.get(targetUrl);
        if (!proxy) {
            proxy = this.createProxy(targetUrl);
            this.proxyCache.set(targetUrl, proxy);
        }
        req.headers['x-request-id'] = req.headers['x-request-id'] || this.generateRequestId();
        req.headers['x-gateway-time'] = new Date().toISOString();
        this.logger.debug(`Routing ${req.method} ${path} -> ${targetUrl}`);
        return proxy(req, res, next);
    }
    getTargetUrl(path) {
        for (const [prefix, url] of Object.entries(this.routeMap)) {
            if (path.startsWith(prefix)) {
                return url;
            }
        }
        return null;
    }
    createProxy(target) {
        const options = {
            target,
            changeOrigin: true,
            timeout: 30000,
            proxyTimeout: 30000,
            onError: (err, req, res) => {
                this.logger.error(`Proxy error for ${req.url}: ${err.message}`);
                res.status(503).json({
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
        return (0, http_proxy_middleware_1.createProxyMiddleware)(options);
    }
    generateRequestId() {
        return `gw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.ProxyMiddleware = ProxyMiddleware;
exports.ProxyMiddleware = ProxyMiddleware = ProxyMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], ProxyMiddleware);
//# sourceMappingURL=proxy.middleware.js.map