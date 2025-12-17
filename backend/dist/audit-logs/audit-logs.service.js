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
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditLogsService = class AuditLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.auditLog.create({
            data: Object.assign(Object.assign({}, data), { oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : null, newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : null }),
        });
    }
    async findAll(params) {
        const { skip = 0, take = 20, userId, action, model, startDate, endDate } = params;
        const where = {};
        if (userId)
            where.userId = userId;
        if (action)
            where.action = action;
        if (model)
            where.model = model;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, username: true, fullName: true } },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            data,
            total,
            page: Math.floor(skip / take) + 1,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }
    async getActions() {
        const logs = await this.prisma.auditLog.findMany({
            select: { action: true },
            distinct: ['action'],
        });
        return logs.map(l => l.action);
    }
    async getModels() {
        const logs = await this.prisma.auditLog.findMany({
            select: { model: true },
            distinct: ['model'],
        });
        return logs.map(l => l.model);
    }
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map