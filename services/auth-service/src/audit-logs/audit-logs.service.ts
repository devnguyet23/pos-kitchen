import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
                    constructor(private prisma: PrismaService) { }

                    async create(data: {
                                        userId: number;
                                        action: string;
                                        model: string;
                                        modelId?: number;
                                        oldValues?: any;
                                        newValues?: any;
                                        ipAddress?: string;
                                        userAgent?: string;
                                        requestUrl?: string;
                                        requestMethod?: string;
                                        responseStatus?: number;
                                        executionTime?: number;
                    }) {
                                        return this.prisma.auditLog.create({
                                                            data: {
                                                                                ...data,
                                                                                oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : null,
                                                                                newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : null,
                                                            },
                                        });
                    }

                    async findAll(params: {
                                        skip?: number;
                                        take?: number;
                                        userId?: number;
                                        action?: string;
                                        model?: string;
                                        startDate?: Date;
                                        endDate?: Date;
                    }) {
                                        const { skip = 0, take = 20, userId, action, model, startDate, endDate } = params;

                                        const where: any = {};

                                        if (userId) where.userId = userId;
                                        if (action) where.action = action;
                                        if (model) where.model = model;
                                        if (startDate || endDate) {
                                                            where.createdAt = {};
                                                            if (startDate) where.createdAt.gte = startDate;
                                                            if (endDate) where.createdAt.lte = endDate;
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
}
