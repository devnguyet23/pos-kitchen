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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let HealthController = class HealthController {
    constructor() {
        this.services = [
            { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3002' },
            { name: 'pos-service', url: process.env.POS_SERVICE_URL || 'http://localhost:3003' },
            { name: 'report-service', url: process.env.REPORT_SERVICE_URL || 'http://localhost:3004' },
        ];
    }
    async getHealth() {
        const serviceHealth = await Promise.all(this.services.map(service => this.checkService(service.name, service.url)));
        const allHealthy = serviceHealth.every(s => s.status === 'up');
        return {
            status: allHealthy ? 'healthy' : 'degraded',
            service: 'gateway',
            version: '1.0.0',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            services: serviceHealth,
        };
    }
    getLiveness() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    async getReadiness() {
        const authHealth = await this.checkService('auth-service', process.env.AUTH_SERVICE_URL || 'http://localhost:3002');
        return {
            status: authHealth.status === 'up' ? 'ready' : 'not_ready',
            timestamp: new Date().toISOString(),
        };
    }
    async checkService(name, url) {
        const start = Date.now();
        try {
            await axios_1.default.get(`${url}/health`, { timeout: 5000 });
            return {
                name,
                status: 'up',
                responseTime: Date.now() - start,
            };
        }
        catch (error) {
            return {
                name,
                status: 'down',
                responseTime: Date.now() - start,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getLiveness", null);
__decorate([
    (0, common_1.Get)('ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReadiness", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health')
], HealthController);
//# sourceMappingURL=health.controller.js.map